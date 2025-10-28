import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Унифицированная кнопка платформы
 * Объединяет UnifiedButton и AnimatedButton в один переиспользуемый компонент
 * Поддерживает все варианты: primary, secondary, outline, ghost, danger, success, glass, neumorphism, neon
 * Использует платформенные CSS переменные для единообразия
 */
import { useMochaGlow, useNeonPulse } from '@/utils/animations';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import React, { memo } from 'react';
// Размеры кнопок с использованием CSS переменных
const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
};
// Радиусы кнопок с использованием CSS переменных
const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};
// Базовые варианты кнопок (используют CSS классы)
const basicVariantClasses = {
    primary: 'platform-button-primary',
    secondary: 'platform-button-secondary',
    outline: 'platform-button-outline',
    ghost: 'platform-button-ghost',
    danger: 'platform-button-danger',
    success: 'platform-button-success',
};
// Анимированные варианты кнопок (используют inline стили)
const animatedButtonVariants = {
    glass: {
        initial: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px var(--glass-bg)',
        },
        hover: {
            background: 'var(--button-secondary-hover)',
            backdropFilter: 'blur(25px)',
            borderColor: 'var(--primary)',
            boxShadow: '0 16px 48px var(--glass-border)',
            y: -4,
        },
    },
    neumorphism: {
        initial: {
            background: 'var(--primary)',
            color: 'var(--background)',
            boxShadow: '8px 8px 16px var(--neumorphism-dark), -8px -8px 16px var(--neumorphism-light)',
        },
        hover: {
            y: -2,
            boxShadow: '12px 12px 24px var(--neumorphism-dark), -12px -12px 24px var(--neumorphism-light)',
        },
        tap: {
            y: 0,
            boxShadow: 'inset 4px 4px 8px var(--neumorphism-dark), inset -4px -4px 8px var(--neumorphism-light)',
        },
    },
    neon: {
        initial: {
            background: 'var(--primary)',
            color: 'var(--background)',
            boxShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)',
        },
        hover: {
            boxShadow: '0 0 20px var(--primary), 0 0 40px var(--primary)',
            filter: 'brightness(1.2)',
            y: -2,
        },
    },
};
export const UnifiedButton = memo(({ variant = 'primary', size = 'md', rounded = 'md', loading = false, isLoading = false, icon, leftIcon, rightIcon, iconPosition = 'left', animationType = 'none', children, className, disabled, ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);
    // Совместимость с AnimatedButton
    const isActuallyLoading = loading || isLoading;
    const actualIcon = icon || leftIcon;
    const actualRightIcon = rightIcon;
    // Анимации
    const mochaGlow = useMochaGlow(isHovered);
    const neonPulse = useNeonPulse(isActive);
    // Определяем, является ли вариант анимированным
    const isAnimatedVariant = variant in animatedButtonVariants;
    const animatedStyle = isAnimatedVariant ? animatedButtonVariants[variant] : null;
    const baseClasses = cn('platform-button-base', !isAnimatedVariant && basicVariantClasses[variant], sizeClasses[size], roundedClasses[rounded], isActuallyLoading && 'platform-button-loading', disabled && 'platform-button-disabled', className);
    const getAnimationStyle = () => {
        switch (animationType) {
            case 'mocha-glow':
                return mochaGlow;
            case 'neon-pulse':
                return neonPulse;
            default:
                return {};
        }
    };
    const motionProps = isAnimatedVariant ? {
        initial: 'initial',
        whileHover: 'hover',
        whileTap: 'tap',
        variants: animatedStyle || {},
        onHoverStart: () => setIsHovered(true),
        onHoverEnd: () => setIsHovered(false),
        onTapStart: () => setIsActive(true),
        onTap: () => setIsActive(false),
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    } : {
        whileHover: !disabled && !isActuallyLoading ? {
            scale: 1.02,
            transition: { duration: 0.2 }
        } : {},
        whileTap: !disabled && !isActuallyLoading ? {
            scale: 0.98,
            transition: { duration: 0.1 }
        } : {}
    };
    return (_jsxs(motion.button, { className: baseClasses, disabled: disabled || isActuallyLoading, ...motionProps, style: getAnimationStyle(), ...props, children: [animationType === 'glass-shimmer' && (_jsx(motion.div, { className: "absolute inset-0 rounded-lg opacity-20", style: {
                    background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)',
                    backgroundSize: '200% 100%',
                }, animate: {
                    backgroundPosition: ['-200% 0', '200% 0'],
                }, transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                } })), isActuallyLoading && (_jsx(motion.div, { className: "platform-button-spinner", animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: 'linear' } })), !isActuallyLoading && actualIcon && iconPosition === 'left' && (_jsx(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 }, className: "platform-button-icon-left", children: actualIcon })), _jsx(motion.span, { className: cn('platform-button-content', isActuallyLoading && 'opacity-0'), initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 }, children: children }), !isActuallyLoading && actualRightIcon && iconPosition === 'right' && (_jsx(motion.div, { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 }, className: "platform-button-icon-right", children: actualRightIcon })), isAnimatedVariant && (_jsx(motion.div, { className: "absolute inset-0 rounded-lg overflow-hidden", initial: { scale: 0, opacity: 0 }, whileTap: {
                    scale: 1,
                    opacity: [0, 0.3, 0],
                }, transition: {
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                }, style: {
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                } }))] }));
});
UnifiedButton.displayName = 'UnifiedButton';
// Экспорт алиаса для совместимости
export const AnimatedButton = UnifiedButton;
//# sourceMappingURL=UnifiedButton.js.map