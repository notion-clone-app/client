import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/css";

const DEFAULT_SYMBOLS = ["·", " ", "·", "+", " ", " "] as const;
const DEFAULT_CLICK_SYMBOLS = ["+", "×", "•", "◦", " "] as const;

type Ripple = {
  x: number;
  y: number;
  radius: number;
};

type InteractiveTrailProps = {
  className?: string;
  color?: string;
  spacing?: number;
  hoverRadius?: number;
  mobileHoverRadius?: number;
  clickRadius?: number;
  symbols?: readonly string[];
  clickSymbols?: readonly string[];
};

/**
 * A section-scoped canvas effect. The closest parent is the interaction surface,
 * so the canvas never intercepts links or buttons placed above it.
 */
export function InteractiveTrail({
  className,
  color = "currentColor",
  spacing = 20,
  hoverRadius = 120,
  mobileHoverRadius = 60,
  clickRadius = 420,
  symbols = DEFAULT_SYMBOLS,
  clickSymbols = DEFAULT_CLICK_SYMBOLS,
}: InteractiveTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !surface || !context) return;
    const canvasElement = canvas;
    const drawingContext = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let opacities = new Float32Array();
    let ripple: Ripple | null = null;
    let frameId: number | null = null;
    let isVisible = true;
    let isPointerInside = false;
    const pointer = { x: -1_000, y: -1_000 };

    const requestRender = () => {
      if (frameId === null && isVisible) frameId = requestAnimationFrame(render);
    };

    const resize = () => {
      const rect = surface.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvasElement.width = Math.max(1, Math.round(width * pixelRatio));
      canvasElement.height = Math.max(1, Math.round(height * pixelRatio));
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawingContext.font = "14px monospace";
      drawingContext.textAlign = "center";
      drawingContext.textBaseline = "middle";
      columns = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      opacities = new Float32Array(columns * rows);
      requestRender();
    };

    const getPoint = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const point = getPoint(event);
      pointer.x = point.x;
      pointer.y = point.y;
      isPointerInside = true;
      requestRender();
    };

    const handlePointerEnter = (event: PointerEvent) => {
      const point = getPoint(event);
      pointer.x = point.x;
      pointer.y = point.y;
      isPointerInside = true;
      requestRender();
    };

    const handlePointerLeave = () => {
      pointer.x = -1_000;
      pointer.y = -1_000;
      isPointerInside = false;
      requestRender();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const point = getPoint(event);
      ripple = { ...point, radius: 0 };
      requestRender();
    };

    function render() {
      frameId = null;
      drawingContext.clearRect(0, 0, width, height);
      drawingContext.fillStyle =
        color === "currentColor" ? getComputedStyle(canvasElement).color : color;

      if (ripple) {
        ripple.radius += 8;
        if (ripple.radius > clickRadius) ripple = null;
      }

      let shouldContinue = ripple !== null;
      const rippleThickness = 60;
      const effectiveHoverRadius = width < 768 ? mobileHoverRadius : hoverRadius;

      for (let index = 0; index < opacities.length; index++) {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const x = column * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        const pointerDistance = Math.hypot(x - pointer.x, y - pointer.y);
        const targetOpacity =
          isPointerInside && pointerDistance < effectiveHoverRadius
            ? 1 - pointerDistance / effectiveHoverRadius
            : 0;
        const opacity = opacities[index] ?? 0;
        const nextOpacity = opacity + (targetOpacity - opacity) * 0.05;
        opacities[index] = nextOpacity;

        let rippleOpacity = 0;
        if (ripple) {
          const distance = Math.hypot(x - ripple.x, y - ripple.y);
          const distanceFromWave = Math.abs(distance - ripple.radius);
          if (distanceFromWave < rippleThickness) {
            rippleOpacity = Math.max(rippleOpacity, 1 - distanceFromWave / rippleThickness);
          }
        }

        const finalOpacity = Math.max(nextOpacity, rippleOpacity);
        if (finalOpacity < 0.01) continue;

        const isRipple = rippleOpacity > nextOpacity;
        const pattern = isRipple ? clickSymbols : symbols;
        const symbolIndex = isRipple
          ? (row - column + pattern.length * 10) % pattern.length
          : (row + column) % pattern.length;
        const symbol = pattern[symbolIndex] ?? "";

        drawingContext.globalAlpha = finalOpacity;
        drawingContext.fillText(symbol, x, y);

        if (Math.abs(targetOpacity - nextOpacity) > 0.01) shouldContinue = true;
      }

      drawingContext.globalAlpha = 1;
      if (shouldContinue) requestRender();
    }

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible) requestRender();
      else if (frameId !== null) cancelAnimationFrame(frameId);
      if (!isVisible) frameId = null;
    });

    resizeObserver.observe(surface);
    intersectionObserver.observe(surface);
    surface.addEventListener("pointermove", handlePointerMove);
    surface.addEventListener("pointerenter", handlePointerEnter);
    surface.addEventListener("pointerleave", handlePointerLeave);
    surface.addEventListener("pointerdown", handlePointerDown);
    resize();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      surface.removeEventListener("pointermove", handlePointerMove);
      surface.removeEventListener("pointerenter", handlePointerEnter);
      surface.removeEventListener("pointerleave", handlePointerLeave);
      surface.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [clickRadius, clickSymbols, color, hoverRadius, mobileHoverRadius, spacing, symbols]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
