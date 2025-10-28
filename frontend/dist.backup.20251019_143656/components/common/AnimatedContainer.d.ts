/**
 * Анимированный контейнер с трендами 2025
 * Поддерживает stagger анимации для списков и групп элементов
 */
import React from 'react';
export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'fade' | 'slide' | 'scale' | 'stagger';
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    stagger?: number;
    children: React.ReactNode;
}
export declare const AnimatedContainer: React.FC<AnimatedContainerProps>;
//# sourceMappingURL=AnimatedContainer.d.ts.map