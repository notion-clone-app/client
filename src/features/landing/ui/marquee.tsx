import React, { type ReactNode } from 'react';
import './marquee.css'

interface SingleMarqueeProps {
    items: ReactNode[];
    speedInSeconds?: number;
    pauseOnHover?: boolean;
    direction?: 'left' | 'right'; // Новый пропс для направления
}

export const Marquee: React.FC<SingleMarqueeProps> = ({
    items,
    speedInSeconds = 25,
    pauseOnHover = true,
    direction = 'left',
}) => {
    if (!items || items.length === 0) return null;

    // Динамически выбираем класс анимации на основе пропса
    const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

    // Алгоритм размножения элементов для защиты от пустых зон на широких экранах
    const getMultiplier = (count: number) => {
        if (count < 5) return 8;
        if (count < 10) return 4;
        return 2;
    };

    const multiplier = getMultiplier(items.length);
    const baseExtendedRow = Array(multiplier).fill(items).flat();
    const finalInfiniteRow = [...baseExtendedRow, ...baseExtendedRow];

    return (
        <div
            className={`relative w-full overflow-hidden py-6 ${pauseOnHover ? 'marquee-parent' : ''}`}
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-backround to-transparent z-10" />

            <div className="flex w-max items-center">
                <div
                    className={`flex gap-8 px-4 will-change-transform ${animationClass}`}
                    style={{ animationDuration: `${speedInSeconds}s` }}
                >
                    {finalInfiniteRow.map((item, index) => (
                        <div
                            key={`marquee-item-${index}`}
                            className="flex items-center justify-center"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
