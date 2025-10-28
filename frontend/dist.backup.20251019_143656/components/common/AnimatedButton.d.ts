/**
 * Анимированная кнопка с трендами 2025
 * Поддерживает Glassmorphism, Neumorphism и современные анимации
 */
import React from 'react';
export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'neumorphism' | 'neon';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    animationType?: 'mocha-glow' | 'neon-pulse' | 'glass-shimmer' | 'none';
    children: React.ReactNode;
}
export declare const AnimatedButton: React.FC<AnimatedButtonProps>;
//# sourceMappingURL=AnimatedButton.d.ts.map