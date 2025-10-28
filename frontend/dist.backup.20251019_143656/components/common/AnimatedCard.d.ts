/**
 * Анимированная карточка с трендами 2025
 * Поддерживает Glassmorphism, Neumorphism и современные анимации
 */
import React from 'react';
export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'neumorphism' | 'solid' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    hover?: boolean;
    animationType?: 'mocha-glow' | 'glass-shimmer' | 'float' | 'none';
    children: React.ReactNode;
}
export declare const AnimatedCard: React.FC<AnimatedCardProps>;
//# sourceMappingURL=AnimatedCard.d.ts.map