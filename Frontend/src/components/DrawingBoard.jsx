import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../sockets/socket";

const COLORS = [
  "#171c22", // Black
  "#d7192c", // Red accent
  "#f2b84b", // Yellow
  "#2d82ed", // Blue
  "#4caf78", // Green
  "#a768d7", // Purple
  "#ffffff", // White
];

function DrawingBoard({ isDrawer = true, drawerName = "Drawer" }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const queueRef = useRef([]);
  const strokesRef = useRef([]); // Local cache of all strokes in current round
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(6);
  const [eraser, setEraser] = useState(false);

  // Paint a single stroke onto the canvas context given canvas dimensions
  const paintStroke = useCallback((ctx, s, width, height) => {
    if (!ctx || !s) return;
    const X = s.x * width;
    const Y = s.y * height;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (s.type === "start") {
      ctx.beginPath();
      ctx.moveTo(X, Y);
      ctx.lineTo(X + 0.01, Y);
      ctx.stroke();
    } else if (s.type === "move") {
      ctx.lineTo(X, Y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X, Y);
    } else if (s.type === "end") {
      ctx.closePath();
    }
  }, []);

  const redrawAllStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.fillStyle = "#fffdf9";
    ctx.fillRect(0, 0, width, height);

    for (const s of strokesRef.current) {
      paintStroke(ctx, s, width, height);
    }
  }, [paintStroke]);

  // Canvas size and DPR initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = bounds.width * ratio;
      canvas.height = bounds.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redrawAllStrokes();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawAllStrokes]);

  // Socket event listeners for multiplayer drawing sync
  useEffect(() => {
    const handleDrawUpdate = (batch) => {
      if (!Array.isArray(batch)) return;
      strokesRef.current.push(...batch);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      batch.forEach((s) => paintStroke(ctx, s, width, height));
    };

    const handleDrawBatch = (fullBatch) => {
      if (!Array.isArray(fullBatch)) return;
      strokesRef.current = [...fullBatch];
      redrawAllStrokes();
    };

    const handleClearCanvas = () => {
      strokesRef.current = [];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fffdf9";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    socket.on("draw_update", handleDrawUpdate);
    socket.on("draw_batch", handleDrawBatch);
    socket.on("clear_canvas", handleClearCanvas);

    return () => {
      socket.off("draw_update", handleDrawUpdate);
      socket.off("draw_batch", handleDrawBatch);
      socket.off("clear_canvas", handleClearCanvas);
    };
  }, [paintStroke, redrawAllStrokes]);

  // Flush queued strokes to server in batches per animation frame
  useEffect(() => {
    let animId;
    const flushQueue = () => {
      if (queueRef.current.length > 0 && isDrawer) {
        socket.emit("draw", queueRef.current);
        queueRef.current = [];
      }
      animId = requestAnimationFrame(flushQueue);
    };
    animId = requestAnimationFrame(flushQueue);

    return () => cancelAnimationFrame(animId);
  }, [isDrawer]);

  // Normalize point coordinates to [0, 1] relative to canvas bounds
  const getNormalizedPoint = (event, type) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const activeColor = eraser ? "#fffdf9" : color;
    const activeSize = eraser ? brushSize * 2.5 : brushSize;

    return {
      x,
      y,
      type,
      color: activeColor,
      brushSize: activeSize,
    };
  };

  const emitAndPaint = (stroke) => {
    strokesRef.current.push(stroke);
    queueRef.current.push(stroke);
    const canvas = canvasRef.current;
    if (canvas) {
      paintStroke(canvas.getContext("2d"), stroke, canvas.clientWidth, canvas.clientHeight);
    }
  };

  const handlePointerDown = (event) => {
    if (!isDrawer) return;
    drawingRef.current = true;
    const canvas = canvasRef.current;
    canvas.setPointerCapture?.(event.pointerId);

    const stroke = getNormalizedPoint(event, "start");
    emitAndPaint(stroke);
  };

  const handlePointerMove = (event) => {
    if (!isDrawer || !drawingRef.current) return;
    const stroke = getNormalizedPoint(event, "move");
    emitAndPaint(stroke);
  };

  const handlePointerUp = (event) => {
    if (!isDrawer || !drawingRef.current) return;
    drawingRef.current = false;
    const stroke = getNormalizedPoint(event, "end");
    emitAndPaint(stroke);
  };

  const handleClear = () => {
    if (!isDrawer) return;
    socket.emit("clear_canvas");
    strokesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fffdf9";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
  };

  const handleUndo = () => {
    if (!isDrawer) return;
    socket.emit("undo");
  };

  return (
    <section className="drawing-section">
      {isDrawer ? (
        <div className="drawing-tools">
          <div className="color-tools">
            <span>Color</span>
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`color-swatch ${color === swatch && !eraser ? "selected" : ""}`}
                style={{ background: swatch, border: swatch === "#ffffff" ? "1px solid #56606d" : "none" }}
                onClick={() => {
                  setColor(swatch);
                  setEraser(false);
                }}
                aria-label={`Use color ${swatch}`}
              />
            ))}
          </div>

          <label className="brush-tool">
            Brush{" "}
            <input
              type="range"
              min="2"
              max="32"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />{" "}
            <b>{brushSize}px</b>
          </label>

          <div className="board-actions">
            <button
              type="button"
              className={eraser ? "tool-active" : ""}
              onClick={() => setEraser(!eraser)}
            >
              Eraser
            </button>
            <button type="button" onClick={handleUndo}>
              Undo
            </button>
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="drawing-tools drawer-info-bar">
          <span className="drawer-indicator">
            🖌️ <b>{drawerName}</b> is drawing...
          </span>
          <span className="drawer-hint-text">Watch closely and submit your guess!</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`drawing-canvas ${!isDrawer ? "canvas-readonly" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Drawing canvas"
      />

      <div className="board-footer">
        <span>{isDrawer ? "● You are drawing" : `● Guessing phase`}</span>
        <span>Draw or Die multiplayer sync active</span>
      </div>
    </section>
  );
}

export default DrawingBoard;
