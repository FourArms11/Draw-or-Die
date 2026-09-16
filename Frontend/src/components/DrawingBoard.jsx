import { useEffect, useRef, useState } from "react";

const COLORS = ["#171717", "#df583e", "#457fba", "#2a7653", "#f0a202"];

function DrawingBoard() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = bounds.width * pixelRatio;
      canvas.height = bounds.height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = "#fffdf8";
      context.fillRect(0, 0, bounds.width, bounds.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getPoint = (event) => {
    const bounds = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  };

  const startDrawing = (event) => {
    drawingRef.current = true;
    const point = getPoint(event);
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const point = getPoint(event);
    const context = canvasRef.current.getContext("2d");
    context.lineTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current.getContext("2d").closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const bounds = canvas.getBoundingClientRect();
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, bounds.width, bounds.height);
  };

  return (
    <section className="drawing-section" aria-labelledby="drawing-board-title">
      <div className="drawing-heading">
        <div>
          <p className="eyebrow">CANVAS PRACTICE</p>
          <h2 id="drawing-board-title">Try drawing something</h2>
        </div>
        <button className="button button-ghost" type="button" onClick={clearCanvas}>Clear board</button>
      </div>
      <div className="drawing-tools" aria-label="Drawing tools">
        <div className="color-tools">
          <span>Color</span>
          {COLORS.map((option) => (
            <button
              className={`color-swatch${color === option ? " selected" : ""}`}
              key={option}
              type="button"
              style={{ backgroundColor: option }}
              onClick={() => setColor(option)}
              aria-label={`Use ${option} brush`}
              aria-pressed={color === option}
            />
          ))}
        </div>
        <label className="brush-tool">
          Brush size
          <input
            type="range"
            min="2"
            max="24"
            value={brushSize}
            onChange={(event) => setBrushSize(Number(event.target.value))}
          />
          <span>{brushSize}px</span>
        </label>
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        aria-label="Drawing canvas"
      />
    </section>
  );
}

export default DrawingBoard;
