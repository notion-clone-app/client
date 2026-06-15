import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    alpha: number;
    angle: number;
    speed: number;
    vx: number; // Скорость по X для физики взрыва
    vy: number; // Скорость по Y для физики взрыва
}

export const HeroParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Расширенный объект мыши для отслеживания движения
        const mouse = {
            x: -1000,
            y: -1000,
            lastX: -1000,
            lastY: -1000,
            vx: 0,
            vy: 0,
            radius: 140
        };

        const isDarkMode = (): boolean => {
            return document.documentElement.classList.contains('dark') ||
                document.body.classList.contains('dark');
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 8500);

            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2 + 0.8,
                    alpha: Math.random() * 0.5 + 0.15,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.3 + 0.1,
                    vx: 0,
                    vy: 0
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particleColor = isDarkMode() ? '255, 255, 255' : '0, 0, 0';

            // Постепенное затухание скорости движения мыши
            mouse.vx *= 0.95;
            mouse.vy *= 0.95;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // 1. Постоянная левитация (Базовое движение)
                p.angle += p.speed * 0.05;
                p.baseX += Math.cos(p.angle) * p.speed;
                p.baseY += Math.sin(p.angle) * p.speed;

                if (p.baseX < 0) p.baseX = canvas.width;
                if (p.baseX > canvas.width) p.baseX = 0;
                if (p.baseY < 0) p.baseY = canvas.height;
                if (p.baseY > canvas.height) p.baseY = 0;

                // Физика затухания взрывной скорости частиц
                p.vx *= 0.92;
                p.vy *= 0.92;
                p.baseX += p.vx;
                p.baseY += p.vy;

                // 2. Взаимодействие с движением мыши
                const dx = mouse.x - p.baseX;
                const dy = mouse.y - p.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let targetX = p.baseX;
                let targetY = p.baseY;

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;

                    // Статичное отталкивание
                    const pushX = (dx / distance) * force * mouse.radius * 0.5;
                    const pushY = (dy / distance) * force * mouse.radius * 0.5;

                    // Динамический "вихрь" от движения курсора
                    const trailX = mouse.vx * force * 1.5;
                    const trailY = mouse.vy * force * 1.5;

                    targetX = p.baseX - pushX + trailX;
                    targetY = p.baseY - pushY + trailY;
                }

                // Плавное следование за целевой позицией
                p.x += (targetX - p.x) * 0.08;
                p.y += (targetY - p.y) * 0.08;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(animate);
        };


        // Слушатель движения мыши с расчетом скорости
        const handleMouseMove = (e: MouseEvent) => {
            if (mouse.lastX !== -1000) {
                mouse.vx = e.clientX - mouse.lastX;
                mouse.vy = e.clientY - mouse.lastY;
            }
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.lastX = e.clientX;
            mouse.lastY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
            mouse.lastX = -1000;
            mouse.lastY = -1000;
            mouse.vx = 0;
            mouse.vy = 0;
        };

        // Эффект взрыва при клике
        const handleWindowClick = (e: MouseEvent) => {
            const clickX = e.clientX;
            const clickY = e.clientY;
            const blastRadius = 300; // Радиус поражения взрыва
            const blastForce = 12;   // Сила импульса

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.baseX - clickX;
                const dy = p.baseY - clickY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < blastRadius) {
                    // Чем ближе к эпицентру, тем сильнее толчок
                    const force = (blastRadius - distance) / blastRadius;
                    const angle = Math.atan2(dy, dx);

                    // Задаем мгновенное ускорение частицам
                    p.vx += Math.cos(angle) * force * blastForce;
                    p.vy += Math.sin(angle) * force * blastForce;
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleWindowClick);
        document.addEventListener('mouseleave', handleMouseLeave);

        resizeCanvas();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleWindowClick);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        />
    );
};
