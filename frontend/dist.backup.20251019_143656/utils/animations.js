/**
 * Утилиты для анимаций в стиле трендов 2025
 * Включает Framer Motion и React Spring анимации
 */
import { useSpring } from '@react-spring/web';
// Framer Motion варианты анимаций
export const fadeInUp = {
    initial: {
        opacity: 0,
        y: 60,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -60,
        scale: 0.95,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
export const slideInLeft = {
    initial: {
        opacity: 0,
        x: -100,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        opacity: 0,
        x: -100,
        scale: 0.9,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
export const slideInRight = {
    initial: {
        opacity: 0,
        x: 100,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        opacity: 0,
        x: 100,
        scale: 0.9,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
export const scaleIn = {
    initial: {
        opacity: 0,
        scale: 0.8,
        rotate: -10,
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
        rotate: 10,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
// Glassmorphism анимации
export const glassmorphismHover = {
    initial: {
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderColor: 'rgba(139, 69, 19, 0.2)',
        boxShadow: '0 8px 32px rgba(139, 69, 19, 0.1)',
    },
    hover: {
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(139, 69, 19, 0.15)',
        borderColor: 'rgba(160, 82, 45, 0.3)',
        boxShadow: '0 16px 48px rgba(139, 69, 19, 0.2)',
        y: -4,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
// Neumorphism анимации
export const neumorphismHover = {
    initial: {
        boxShadow: `
      8px 8px 16px rgba(93, 47, 10, 0.4),
      -8px -8px 16px rgba(160, 82, 45, 0.3)
    `,
    },
    hover: {
        boxShadow: `
      12px 12px 24px rgba(93, 47, 10, 0.5),
      -12px -12px 24px rgba(160, 82, 45, 0.4)
    `,
        y: -2,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    tap: {
        boxShadow: `
      inset 4px 4px 8px rgba(93, 47, 10, 0.5),
      inset -4px -4px 8px rgba(160, 82, 45, 0.4)
    `,
        y: 0,
        transition: {
            duration: 0.1,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
// Анимация появления с задержкой для списков
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};
export const staggerItem = {
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
};
// Анимация загрузки с частицами
export const particleFloat = {
    initial: {
        opacity: 0,
        scale: 0,
        y: 0,
    },
    animate: {
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [-20, -40, -60],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
// Анимация градиента
export const gradientShift = {
    initial: {
        backgroundPosition: '0% 50%',
    },
    animate: {
        backgroundPosition: '100% 50%',
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};
// Переходы
export const smoothTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
};
export const fastTransition = {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
};
export const slowTransition = {
    duration: 0.6,
    ease: [0.4, 0, 0.2, 1],
};
// React Spring хуки
export const useMochaGlow = (isHovered) => {
    return useSpring({
        boxShadow: isHovered
            ? '0 0 30px rgba(139, 69, 19, 0.5), 0 0 60px rgba(160, 82, 45, 0.3)'
            : '0 0 20px rgba(139, 69, 19, 0.3), 0 0 40px rgba(160, 82, 45, 0.2)',
        config: { tension: 300, friction: 30 },
    });
};
export const useNeonPulse = (isActive) => {
    return useSpring({
        boxShadow: isActive
            ? '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(217, 70, 239, 0.4)'
            : '0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(217, 70, 239, 0.2)',
        filter: isActive ? 'brightness(1.2)' : 'brightness(1)',
        config: { tension: 400, friction: 25 },
    });
};
export const useGlassShimmer = () => {
    return useSpring({
        from: { backgroundPosition: '-200% 0' },
        to: { backgroundPosition: '200% 0' },
        config: { duration: 4000 },
        loop: true,
    });
};
// Утилиты для создания кастомных анимаций
export const createCustomVariants = (initial, animate, exit) => {
    const result = {
        initial,
        animate: {
            ...animate,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                ...(animate && typeof animate === 'object' && 'transition' in animate ? animate.transition : {}),
            },
        },
    };
    if (exit) {
        result.exit = {
            ...exit,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                ...(exit && typeof exit === 'object' && 'transition' in exit ? exit.transition : {}),
            },
        };
    }
    return result;
};
// Анимация для модальных окон
export const modalBackdrop = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
export const modalContent = {
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
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};
//# sourceMappingURL=animations.js.map