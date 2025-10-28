import { useEffect, useState } from 'react';

interface AnimationVariants {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit?: Record<string, any>;
}

const getVariants = (variant: string, direction: string): AnimationVariants => {
    const baseVariants: Record<string, AnimationVariants> = {
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
    };

    return baseVariants[variant] || baseVariants.fade;
};

/**
 * Хук для создания кастомных анимаций
 */
export const useCustomAnimation = (
    variant: string,
    direction: string,
    delay: number = 0,
    duration: number = 0.5
) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    const variants = getVariants(variant, direction);

    return {
        isVisible,
        variants,
        motionProps: {
            initial: 'initial',
            animate: isVisible ? 'animate' : 'initial',
            variants,
            transition: {
                duration,
                ease: [0.4, 0, 0.2, 1],
            },
        },
    };
};
