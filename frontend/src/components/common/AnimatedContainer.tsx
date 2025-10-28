/**
 * Анимированный контейнер с трендами 2025
 * Поддерживает stagger анимации для списков и групп элементов
 */

import { cn } from '@/utils/cn';
import { motion, MotionProps, Variants } from 'framer-motion';
import React, { memo } from 'react';

export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'fade' | 'slide' | 'scale' | 'stagger';
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    stagger?: number;
    children: React.ReactNode;
}

const getVariants = (variant: string, direction: string, stagger?: number): Variants => {
    const baseVariants: Record<string, Variants> = {
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

const getChildVariants = (variant: string, direction: string): Variants => {
    const baseChildVariants: Record<string, Variants> = {
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

export const AnimatedContainer: React.FC<AnimatedContainerProps> = memo(({
    variant = 'fade',
    direction = 'up',
    delay = 0,
    duration = 0.5,
    stagger = 0.1,
    children,
    className,
    ...props
}) => {
    const containerVariants = getVariants(variant, direction, stagger);
    const childVariants = getChildVariants(variant, direction);

    const motionProps: MotionProps = {
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
        return (
            <motion.div
                {...motionProps}
                className={cn('relative', className)}
                {...(props as Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd' | 'onDragEnd'>)}
            >
                {React.Children.map(children, (child, index) => (
                    <motion.div
                        key={index}
                        variants={childVariants}
                        className="relative"
                    >
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            {...motionProps}
            className={cn('relative', className)}
            {...(props as Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd' | 'onDragEnd'>)}
        >
            {children}
        </motion.div>
    );
});
