import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Анимированный контейнер с трендами 2025
 * Поддерживает stagger анимации для списков и групп элементов
 */
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import React, { memo } from 'react';
const getVariants = (variant, direction, stagger) => {
    const baseVariants = {
        fade: {
            initial: {
                opacity: 0,
            },
            animate: {
                opacity: 1,
                transition: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
            exit: {
                opacity: 0,
                transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        slide: {
            initial: {
                opacity: 0,
                x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
            },
            animate: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
            exit: {
                opacity: 0,
                x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
                transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        scale: {
            initial: {
                opacity: 0,
                scale: 0.8,
                rotate: -5,
            },
            animate: {
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
            exit: {
                opacity: 0,
                scale: 0.8,
                rotate: 5,
                transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        stagger: {
            initial: {},
            animate: {
                transition: {
                    staggerChildren: stagger || 0.1,
                    delayChildren: 0.1,
                },
            },
        },
    };
    return baseVariants[variant] || baseVariants.fade;
};
const getChildVariants = (variant, direction) => {
    const baseChildVariants = {
        fade: {
            initial: {
                opacity: 0,
            },
            animate: {
                opacity: 1,
                transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        slide: {
            initial: {
                opacity: 0,
                x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
                y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
            },
            animate: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        scale: {
            initial: {
                opacity: 0,
                scale: 0.9,
                y: 20,
            },
            animate: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
        stagger: {
            initial: {
                opacity: 0,
                y: 20,
                scale: 0.95,
            },
            animate: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                },
            },
        },
    };
    return baseChildVariants[variant] || baseChildVariants.fade;
};
export const AnimatedContainer = memo(({ variant = 'fade', direction = 'up', delay = 0, duration = 0.5, stagger = 0.1, children, className, ...props }) => {
    const containerVariants = getVariants(variant, direction, stagger);
    const childVariants = getChildVariants(variant, direction);
    const motionProps = {
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
        variants: containerVariants,
        transition: {
            duration,
            delay,
            ease: [0.4, 0, 0.2, 1],
        },
    };
    // Если это stagger контейнер, оборачиваем детей в анимированные элементы
    if (variant === 'stagger') {
        return (_jsx(motion.div, { ...motionProps, className: cn('relative', className), ...props, children: React.Children.map(children, (child, index) => (_jsx(motion.div, { variants: childVariants, className: "relative", children: child }, index))) }));
    }
    return (_jsx(motion.div, { ...motionProps, className: cn('relative', className), ...props, children: children }));
});
//# sourceMappingURL=AnimatedContainer.js.map