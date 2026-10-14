import { useEffect, useRef, useState } from "react";

const COLORS = ["#171c22", "#e9573f", "#f2b84b", "#2d82ed", "#4caf78", "#a768d7"];

function DrawingBoard() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const historyRef = useRef([]);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [eraser, setEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const previous = canvas.width ? canvas.toDataURL() : null;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = bounds.width * ratio;
      canvas.height = bounds.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = "#fffdf9";
      context.fillRect(0, 0, bounds.width, bounds.height);
      if (previous) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, bounds.width, bounds.height);
        image.src = previous;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const pointFor = (event) => {
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    drawingRef.current = true;
    canvas.setPointerCapture?.(event.pointerId);
    historyRef.current.push(canvas.toDataURL());
    const point = pointFor(event);
    const context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const point = pointFor(event);
    const context = canvasRef.current.getContext("2d");
    context.lineTo(point.x, point.y);
    context.strokeStyle = eraser ? "#fffdf9" : color;
    context.lineWidth = eraser ? brushSize * 2.5 : brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current.getContext("2d").closePath();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    historyRef.current.push(canvas.toDataURL());
    context.fillStyle = "#fffdf9";
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    const image = new Image();
    image.onload = () => canvasRef.current.getContext("2d").drawImage(image, 0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    image.src = previous;
  };

  return (
    <section className="drawing-section">
      <div className="drawing-tools">
        <div className="color-tools"><span>Color</span>{COLORS.map((swatch) => <button key={swatch} type="button" className={`color-swatch ${color === swatch && !eraser ? "selected" : ""}`} style={{ background: swatch }} onClick={() => { setColor(swatch); setEraser(false); }} aria-label={`Use ${swatch}`} />)}</div>
        <label className="brush-tool">Brush <input type="range" min="2" max="32" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /> <b>{brushSize}px</b></label>
        <div className="board-actions"><button type="button" className={eraser ? "tool-active" : ""} onClick={() => setEraser(!eraser)}>Eraser</button><button type="button" onClick={undo}>Undo</button><button type="button" onClick={clear}>Clear</button></div>
      </div>
      <canvas ref={canvasRef} className="drawing-canvas" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} onPointerLeave={stopDrawing} aria-label="Drawing canvas" />
      <div className="board-footer"><span>● You are drawing</span><span>Multiplayer sync will connect here next</span></div>
    </section>
  );
}

export default DrawingBoard;
