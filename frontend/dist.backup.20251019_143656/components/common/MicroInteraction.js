import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для микро-взаимодействий в стиле трендов 2025
 * Включает hover эффекты, ripple, tooltip и другие микро-анимации
 */
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useRef, useState } from 'react';
const intensityMap = {
    subtle: { scale: 1.02, duration: 0.2 },
    medium: { scale: 1.05, duration: 0.3 },
    strong: { scale: 1.1, duration: 0.4 },
};
export const MicroInteraction = memo(({ children, variant = 'ripple', intensity = 'medium', duration = 0.3, delay: _delay = 0, disabled = false, className, onClick, onHover, tooltip, tooltipPosition = 'top', }) => {
    const [ripples, setRipples] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const elementRef = useRef(null);
    const rippleIdRef = useRef(0);
    const intensityConfig = intensityMap[intensity];
    const handleMouseEnter = () => {
        if (disabled)
            return;
        onHover?.(true);
    };
    const handleMouseLeave = () => {
        if (disabled)
            return;
        onHover?.(false);
    };
    const handleMouseDown = (e) => {
        if (disabled)
            return;
        if (variant === 'ripple' && elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newRipple = {
                id: rippleIdRef.current++,
                x,
                y,
            };
            setRipples(prev => [...prev, newRipple]);
            // Удаляем ripple через анимацию
            setTimeout(() => {
                setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
            }, 600);
        }
    };
    const handleMouseUp = () => {
        if (disabled)
            return;
    };
    const handleClick = () => {
        if (disabled)
            return;
        onClick?.();
    };
    const getVariantAnimation = () => {
        const baseConfig = {
            duration: duration,
            ease: "easeInOut",
        };
        switch (variant) {
            case 'ripple':
                return {
                    whileHover: {
                        scale: intensityConfig.scale,
                        transition: baseConfig,
                    },
                    whileTap: {
                        scale: 0.98,
                        transition: { duration: 0.1 },
                    },
                };
            case 'glow':
                return {
                    whileHover: {
                        scale: intensityConfig.scale,
                        boxShadow: '0 0 20px rgba(139, 69, 19, 0.4), 0 0 40px rgba(160, 82, 45, 0.2)',
                        transition: baseConfig,
                    },
                };
            case 'bounce':
                return {
                    whileHover: {
                        y: -4,
                        scale: intensityConfig.scale,
                        transition: {
                            duration: duration,
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                        },
                    },
                };
            case 'scale':
                return {
                    whileHover: {
                        scale: intensityConfig.scale,
                        transition: baseConfig,
                    },
                    whileTap: {
                        scale: 0.95,
                        transition: { duration: 0.1 },
                    },
                };
            case 'rotate':
                return {
                    whileHover: {
                        rotate: 5,
                        scale: intensityConfig.scale,
                        transition: baseConfig,
                    },
                };
            case 'shimmer':
                return {
                    whileHover: {
                        scale: intensityConfig.scale,
                        backgroundPosition: ['0% 0%', '100% 0%'],
                        transition: {
                            duration: duration,
                            ease: "easeInOut",
                        },
                    },
                };
            case 'pulse':
                return {
                    animate: {
                        scale: [1, intensityConfig.scale, 1],
                        transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    },
                };
            case 'float':
                return {
                    animate: {
                        y: [0, -8, 0],
                        transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    },
                    whileHover: {
                        y: -12,
                        scale: intensityConfig.scale,
                        transition: baseConfig,
                    },
                };
            default:
                return {};
        }
    };
    const getTooltipPosition = () => {
        const positions = {
            top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
            left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
            right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        };
        return positions[tooltipPosition];
    };
    return (_jsxs("div", { ref: elementRef, className: cn('relative inline-block', className), onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onMouseDown: handleMouseDown, onMouseUp: handleMouseUp, onClick: handleClick, onMouseOver: () => tooltip && setShowTooltip(true), onMouseOut: () => tooltip && setShowTooltip(false), children: [_jsxs(motion.div, { ...getVariantAnimation(), className: cn('relative overflow-hidden', {
                    'cursor-pointer': !disabled,
                    'cursor-not-allowed opacity-50': disabled,
                }), style: {
                    backgroundImage: variant === 'shimmer'
                        ? 'linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.2), transparent)'
                        : undefined,
                    backgroundSize: variant === 'shimmer' ? '200% 100%' : undefined,
                }, children: [children, variant === 'ripple' && (_jsx("div", { className: "absolute inset-0 pointer-events-none", children: ripples.map((ripple) => (_jsx(motion.div, { className: "absolute rounded-full bg-white/30", style: {
                                left: ripple.x - 10,
                                top: ripple.y - 10,
                                width: 20,
                                height: 20,
                            }, initial: { scale: 0, opacity: 1 }, animate: { scale: 4, opacity: 0 }, transition: { duration: 0.6, ease: 'easeOut' } }, ripple.id))) }))] }), _jsx(AnimatePresence, { children: showTooltip && tooltip && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, transition: { duration: 0.2 }, className: cn('absolute z-[9999999] px-2 py-1 text-xs text-white bg-neutral-800 rounded shadow-lg whitespace-nowrap', getTooltipPosition()), children: [tooltip, _jsx("div", { className: cn('absolute w-2 h-2 bg-neutral-800 transform rotate-45', {
                                'top-full left-1/2 -translate-x-1/2 -mt-1': tooltipPosition === 'top',
                                'bottom-full left-1/2 -translate-x-1/2 -mb-1': tooltipPosition === 'bottom',
                                'right-full top-1/2 -translate-y-1/2 -mr-1': tooltipPosition === 'left',
                                'left-full top-1/2 -translate-y-1/2 -ml-1': tooltipPosition === 'right',
                            }) })] })) })] }));
});
// Хук для создания кастомных микро-взаимодействий
export const useMicroInteraction = (_variant = 'ripple', intensity = 'medium') => {
    const [isActive, setIsActive] = useState(false);
    const trigger = () => {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 300);
    };
    const animationProps = {
        animate: isActive ? {
            scale: intensityMap[intensity].scale,
            transition: { duration: 0.3, ease: "easeInOut" }
        } : {},
    };
    return {
        trigger,
        animationProps,
        isActive,
    };
};
//# sourceMappingURL=MicroInteraction.js.map