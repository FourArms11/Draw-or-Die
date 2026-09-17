import { useEffect, useRef } from "react";

function DrawingBoard() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = bounds.width * pixelRatio;
      canvas.height = bounds.height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = "#ffffff";
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
    context.strokeStyle = "#222222";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current.getContext("2d").closePath();
  };

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
      aria-label="Drawing canvas"
    />
  );
}

export default DrawingBoard;
