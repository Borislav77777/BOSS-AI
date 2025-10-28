/**
 * Унифицированная кнопка платформы
 * Объединяет UnifiedButton и AnimatedButton в один переиспользуемый компонент
 * Поддерживает все варианты: primary, secondary, outline, ghost, danger, success, glass, neumorphism, neon
 * Использует платформенные CSS переменные для единообразия
 */
import React from 'react';
export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass' | 'neumorphism' | 'neon';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    loading?: boolean;
    isLoading?: boolean;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    animationType?: 'mocha-glow' | 'neon-pulse' | 'glass-shimmer' | 'none';
    children: React.ReactNode;
}
export declare const UnifiedButton: React.FC<UnifiedButtonProps>;
export declare const AnimatedButton: React.FC<UnifiedButtonProps>;
//# sourceMappingURL=UnifiedButton.d.ts.map