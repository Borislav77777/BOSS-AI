import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Унифицированная карточка платформы
 * Объединяет все варианты карточек в один переиспользуемый компонент
 * Использует платформенные CSS переменные для единообразия
 */
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import React, { memo } from 'react';
const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
};
const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};
const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
};
const variantClasses = {
    default: 'platform-card',
    glass: 'platform-card-glass',
    solid: 'platform-card-solid',
    elevated: 'platform-card-elevated',
    outlined: 'platform-card-outlined',
};
export const UnifiedCard = memo(({ variant = 'default', size = 'md', hover = true, clickable = false, rounded = 'lg', shadow = 'md', children, className, ...props }) => {
    const baseClasses = cn('platform-card-base', variantClasses[variant], sizeClasses[size], roundedClasses[rounded], shadowClasses[shadow], hover && 'platform-card-hover', clickable && 'platform-card-clickable', className);
    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
        ...(hover && {
            whileHover: {
                y: -2,
                scale: 1.01,
                transition: { duration: 0.2 }
            }
        }),
        ...(clickable && {
            whileTap: {
                scale: 0.98,
                transition: { duration: 0.1 }
            }
        })
    };
    return (_jsx(motion.div, { className: baseClasses, ...motionProps, ...props, children: children }));
});
UnifiedCard.displayName = 'UnifiedCard';
//# sourceMappingURL=UnifiedCard.js.map