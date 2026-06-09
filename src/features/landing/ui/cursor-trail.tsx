import React, { useRef } from "react";
import { useCursorTrail } from "./use-cursor-trail.hook";

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useCursorTrail(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", // Изменили с fixed на absolute
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 1,
      }}
    />
  );

};
