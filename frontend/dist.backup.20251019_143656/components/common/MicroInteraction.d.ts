/**
 * Компонент для микро-взаимодействий в стиле трендов 2025
 * Включает hover эффекты, ripple, tooltip и другие микро-анимации
 */
import React from 'react';
export interface MicroInteractionProps {
    children: React.ReactNode;
    variant?: 'ripple' | 'glow' | 'bounce' | 'scale' | 'rotate' | 'shimmer' | 'pulse' | 'float';
    intensity?: 'subtle' | 'medium' | 'strong';
    duration?: number;
    delay?: number;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    onHover?: (isHovered: boolean) => void;
    tooltip?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}
export declare const MicroInteraction: React.FC<MicroInteractionProps>;
export declare const useMicroInteraction: (_variant?: MicroInteractionProps["variant"], intensity?: MicroInteractionProps["intensity"]) => {
    trigger: () => void;
    animationProps: {
        animate: {
            scale: number;
            transition: {
                duration: number;
                ease: "easeInOut";
            };
        } | {
            scale?: undefined;
            transition?: undefined;
        };
    };
    isActive: any;
};
//# sourceMappingURL=MicroInteraction.d.ts.map