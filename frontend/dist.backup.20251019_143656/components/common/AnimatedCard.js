import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Анимированная карточка с трендами 2025
 * Поддерживает Glassmorphism, Neumorphism и современные анимации
 */
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import React, { memo } from 'react';
const cardVariants = {
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
            y: -8,
            scale: 1.02,
        },
    },
    neumorphism: {
        initial: {
            background: 'var(--primary)',
            boxShadow: '8px 8px 16px var(--neumorphism-dark), -8px -8px 16px var(--neumorphism-light)',
        },
        hover: {
            y: -4,
            boxShadow: '12px 12px 24px var(--neumorphism-dark), -12px -12px 24px var(--neumorphism-light)',
            scale: 1.01,
        },
    },
    solid: {
        initial: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 16px var(--glass-bg)',
        },
        hover: {
            background: 'var(--surface-hover)',
            borderColor: 'var(--primary)',
            boxShadow: '0 8px 24px var(--glass-border)',
            y: -4,
            scale: 1.01,
        },
    },
    gradient: {
        initial: {
            background: 'linear-gradient(135deg, var(--glass-bg), var(--neumorphism-light))',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px var(--glass-bg)',
        },
        hover: {
            background: 'linear-gradient(135deg, var(--button-secondary-hover), var(--neumorphism-light))',
            borderColor: 'var(--primary)',
            boxShadow: '0 16px 48px var(--glass-border)',
            y: -6,
            scale: 1.02,
        },
    },
};
const sizeVariants = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};
export const AnimatedCard = memo(({ variant = 'glass', size = 'md', hover = true, animationType = 'none', children, className, ...props }) => {
    const cardStyle = cardVariants[variant];
    const sizeClass = sizeVariants[size];
    const motionProps = {
        initial: 'initial',
        whileHover: hover ? 'hover' : undefined,
        variants: cardStyle,
        animate: animationType === 'float' ? {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        } : undefined,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    };
    const getAnimationStyle = () => {
        switch (animationType) {
            case 'mocha-glow':
                return {};
            case 'float':
                return {};
            default:
                return {};
        }
    };
    return (_jsxs(motion.div, { ...motionProps, className: cn('relative rounded-xl overflow-hidden transition-all duration-300', sizeClass, className), style: getAnimationStyle(), ...props, children: [animationType === 'glass-shimmer' && (_jsx(motion.div, { className: "absolute inset-0 opacity-20", style: {
                    background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)',
                    backgroundSize: '200% 100%',
                }, animate: {
                    backgroundPosition: ['-200% 0', '200% 0'],
                }, transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                } })), variant === 'gradient' && (_jsx(motion.div, { className: "absolute inset-0 opacity-0", whileHover: { opacity: 0.1 }, style: {
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                } })), _jsx("div", { className: "relative z-10", children: children }), _jsx(motion.div, { className: "absolute inset-0 rounded-xl overflow-hidden pointer-events-none", initial: { scale: 0, opacity: 0 }, whileTap: {
                    scale: 1,
                    opacity: [0, 0.1, 0],
                }, transition: {
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                }, style: {
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                } })] }));
});
AnimatedCard.displayName = 'AnimatedCard';
//# sourceMappingURL=AnimatedCard.js.map