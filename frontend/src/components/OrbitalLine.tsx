import { motion } from 'framer-motion';
import React from 'react';

interface OrbitalLineProps {
    from: { x: number; y: number };
    to: { x: number; y: number };
    color?: string;
    opacity?: number;
    strokeWidth?: number;
    animated?: boolean;
    delay?: number;
    duration?: number;
    gradient?: boolean;
}

export const OrbitalLine: React.FC<OrbitalLineProps> = ({
    from,
    to,
    color = '#00FFFF',
    opacity = 0.3,
    strokeWidth = 1,
    animated = true,
    delay = 0,
    duration = 0.8,
    gradient = true,
}) => {
    const centerX = 0;
    const centerY = 0;

    const startX = centerX + from.x;
    const startY = centerY + from.y;
    const endX = centerX + to.x;
    const endY = centerY + to.y;

    const lineProps = {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        stroke: gradient ? 'url(#orbitalGradient)' : color,
        strokeWidth,
        opacity,
        strokeLinecap: 'round',
        fill: 'none',
    };

    if (animated) {
        return (
            <motion.line
                {...lineProps}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity }}
                transition={{
                    duration,
                    delay,
                    ease: 'easeInOut',
                }}
            />
        );
    }

    return <line {...lineProps} />;
};

// Компонент для градиента линий
export const OrbitalGradient: React.FC = () => (
    <defs>
        <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.07" />
            <stop offset="50%" stopColor="#00FFFF" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.07" />
        </linearGradient>
    </defs>
);
