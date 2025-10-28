/**
 * Анимированная кнопка с трендами 2025
 * Поддерживает Glassmorphism, Neumorphism и современные анимации
 */

import { useMochaGlow, useNeonPulse } from '@/utils/animations';
import { cn } from '@/utils/cn';
import { motion, MotionProps } from 'framer-motion';
import React, { memo } from 'react';

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'neumorphism' | 'neon';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    animationType?: 'mocha-glow' | 'neon-pulse' | 'glass-shimmer' | 'none';
    children: React.ReactNode;
}

const buttonVariants = {
    primary: {
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
    secondary: {
        initial: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
        },
        hover: {
            background: 'var(--button-secondary-hover)',
            y: -1,
            boxShadow: '0 8px 24px var(--glass-border)',
        },
    },
    ghost: {
        initial: {
            background: 'transparent',
            color: 'var(--primary)',
        },
        hover: {
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            y: -1,
        },
    },
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

const sizeVariants = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = memo(({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    animationType = 'none',
    children,
    className,
    disabled,
    ...props
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const mochaGlow = useMochaGlow(isHovered);
    const neonPulse = useNeonPulse(isActive);

    const buttonStyle = buttonVariants[variant];
    const sizeClass = sizeVariants[size];

    const motionProps: MotionProps = {
        initial: 'initial',
        whileHover: 'hover',
        whileTap: 'tap',
        variants: buttonStyle,
        onHoverStart: () => setIsHovered(true),
        onHoverEnd: () => setIsHovered(false),
        onTapStart: () => setIsActive(true),
        onTap: () => setIsActive(false),
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    };

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

    return (
        <motion.button
            {...motionProps}
            className={cn(
                'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900',
                sizeClass,
                {
                    'opacity-50 cursor-not-allowed': disabled || isLoading,
                    'cursor-pointer': !disabled && !isLoading,
                },
                className
            )}
            disabled={disabled || isLoading}
            style={getAnimationStyle()}
            {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd'>)}
        >
            {/* Glassmorphism shimmer эффект */}
            {animationType === 'glass-shimmer' && (
                <motion.div
                    className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                        background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                    animate={{
                        backgroundPosition: ['-200% 0', '200% 0'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            )}

            {/* Loading spinner */}
            {isLoading && (
                <motion.div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            )}

            {/* Left icon */}
            {leftIcon && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {leftIcon}
                </motion.div>
            )}

            {/* Button text */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {children}
            </motion.span>

            {/* Right icon */}
            {rightIcon && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {rightIcon}
                </motion.div>
            )}

            {/* Ripple effect */}
            <motion.div
                className="absolute inset-0 rounded-lg overflow-hidden"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{
                    scale: 1,
                    opacity: [0, 0.3, 0],
                }}
                transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                }}
            />
        </motion.button>
    );
});

AnimatedButton.displayName = 'AnimatedButton';
