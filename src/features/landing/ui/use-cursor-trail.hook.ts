import { useEffect, useRef } from "react";

const HIDDEN_STROKE_PATTERNS = ["---------", "=========", ":::::::::", "........."];
const CLICK_WAVE_PATTERNS = [">>>>>>>>?", "<<<<<<<<<", "000000000", "+++++++++"];

const LEN_STROKE = HIDDEN_STROKE_PATTERNS.length;
const LEN_WAVE = CLICK_WAVE_PATTERNS.length;

export const useCursorTrail = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const clickWaveRef = useRef({ x: -1000, y: -1000, radius: 0, maxRadius: 420, active: false, speed: 8 });
    const isMouseOverRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let isLoopRunning = false;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let spacingX = width < 768 ? 48 : 34;
        let spacingY = width < 768 ? 20 : 13;
        let hoverRadius = width < 768 ? 90 : 150;

        let cols = Math.ceil(width / spacingX) + 1;
        let rows = Math.ceil(height / spacingY) + 1;
        let totalParticles = cols * rows;

        let opacities = new Float32Array(totalParticles);

        function renderFrame() {
            ctx.clearRect(0, 0, width, height);

            const mouse = mouseRef.current;
            const wave = clickWaveRef.current;

            if (wave.active) {
                wave.radius += wave.speed;
                if (wave.radius > wave.maxRadius) {
                    wave.active = false;
                }
            }

            const waveThickness = 60;
            let hasActiveElements = false;

            for (let i = 0; i < totalParticles; i++) {
                const r = Math.floor(i / cols);
                const c = i % cols;

                const x = c * spacingX + spacingX / 2;
                const y = r * spacingY + spacingY / 2;

                const dxMouse = x - mouse.x;
                const dyMouse = y - mouse.y;
                const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;

                let targetOpacity = 0;
                if (isMouseOverRef.current && distMouseSq < hoverRadius * hoverRadius) {
                    const distMouse = Math.sqrt(distMouseSq);
                    targetOpacity = 1 - distMouse / hoverRadius;
                }

                opacities[i] += (targetOpacity - opacities[i]) * 0.1;

                let isWaveActiveForCell = false;
                let waveDist = 0;

                if (wave.active) {
                    const dxWave = x - wave.x;
                    const dyWave = y - wave.y;
                    const distWaveSq = dxWave * dxWave + dyWave * dyWave;
                    waveDist = Math.sqrt(distWaveSq);

                    if (waveDist > wave.radius - waveThickness && waveDist < wave.radius + waveThickness) {
                        isWaveActiveForCell = true;
                    }
                }

                if (opacities[i] < 0.01 && !isWaveActiveForCell) {
                    opacities[i] = 0;
                    continue;
                }

                hasActiveElements = true;

                const patternIndex = (r + c) % LEN_STROKE;
                let symbol = HIDDEN_STROKE_PATTERNS[patternIndex];
                let currentOpacity = opacities[i];

                if (isWaveActiveForCell) {
                    const wavePatternIndex = (r - c + LEN_WAVE * 10) % LEN_WAVE;
                    symbol = CLICK_WAVE_PATTERNS[wavePatternIndex];

                    const waveFactor = 1 - Math.abs(waveDist - wave.radius) / waveThickness;
                    currentOpacity = Math.max(currentOpacity, waveFactor);
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity.toFixed(2)})`;
                ctx.fillText(symbol, x, y);
            }

            return hasActiveElements;
        }

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            spacingX = width < 768 ? 48 : 34;
            spacingY = width < 768 ? 20 : 13;
            hoverRadius = width < 768 ? 90 : 150;

            cols = Math.ceil(width / spacingX) + 1;
            rows = Math.ceil(height / spacingY) + 1;
            totalParticles = cols * rows;

            opacities = new Float32Array(totalParticles);

            ctx.font = "12px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (!isLoopRunning) renderFrame();
        };

        const startLoopIfNeeded = () => {
            if (!isLoopRunning) {
                isLoopRunning = true;
                render();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            isMouseOverRef.current = true;
            startLoopIfNeeded();
        };

        const handleMouseEnter = () => {
            isMouseOverRef.current = true;
            startLoopIfNeeded();
        };

        const handleMouseLeave = () => {
            isMouseOverRef.current = false;
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            clickWaveRef.current.x = e.clientX - rect.left;
            clickWaveRef.current.y = e.clientY - rect.top;
            clickWaveRef.current.radius = 0;
            clickWaveRef.current.active = true;
            startLoopIfNeeded();
        };

        // Вызываем resize только после того, как все функции объявлены
        resize();
        window.addEventListener("resize", resize);

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseenter", handleMouseEnter);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        canvas.addEventListener("click", handleClick);

        const render = () => {
            const shouldContinue = renderFrame();

            if (!isMouseOverRef.current && !shouldContinue) {
                isLoopRunning = false;
                ctx.clearRect(0, 0, width, height);
                return;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseenter", handleMouseEnter);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            canvas.removeEventListener("click", handleClick);
        };
    }, [canvasRef]);
};
