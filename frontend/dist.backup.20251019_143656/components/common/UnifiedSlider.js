import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Унифицированный ползунок платформы
 * Объединяет все типы ползунков: default, rainbow, hue, brightness, fontSize
 * Использует платформенные CSS переменные для единообразия
 */
import { cn } from '@/utils/cn';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// Размеры ползунков
const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};
// Размеры для вертикальных ползунков
const verticalSizeClasses = {
    sm: 'w-1',
    md: 'w-2',
    lg: 'w-3',
};
// Маппинг значений размера шрифта
const fontSizeMap = {
    'small': { value: 1, label: 'Маленький', size: '0.875rem' },
    'medium': { value: 2, label: 'Средний', size: '1rem' },
    'large': { value: 3, label: 'Большой', size: '1.125rem' }
};
export const UnifiedSlider = memo(({ variant = 'default', size = 'md', orientation = 'horizontal', showValue = true, showLabels = false, labels = [], value = 0, onChange, onValueChange, min = 0, max = 100, step = 1, className, ...props }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const sliderRef = useRef(null);
    // Используем внутреннее значение или внешнее
    const currentValue = value !== undefined ? value : internalValue;
    const actualOnChange = onChange || onValueChange;
    // Обновляем градиент при изменении значения
    const updateSliderFill = useCallback((val) => {
        const percent = ((val - Number(min)) / (Number(max) - Number(min))) * 100;
        if (sliderRef.current) {
            sliderRef.current.style.setProperty('--percent', `${percent}%`);
        }
    }, [min, max]);
    useEffect(() => {
        updateSliderFill(currentValue);
    }, [currentValue, updateSliderFill]);
    // Обработчик изменения значения
    const handleChange = useCallback((newValue) => {
        setInternalValue(newValue);
        actualOnChange?.(newValue);
    }, [actualOnChange]);
    // Обработчик взаимодействия с ползунком
    const handleSliderInteraction = useCallback((e) => {
        if (!sliderRef.current)
            return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        let percentage;
        if (orientation === 'horizontal') {
            const relativeX = x - rect.left;
            percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        }
        else {
            const relativeY = y - rect.top;
            percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
        }
        const newValue = Number(min) + (percentage / 100) * (Number(max) - Number(min));
        const steppedValue = Math.round(newValue / Number(step)) * Number(step);
        const clampedValue = Math.max(Number(min), Math.min(Number(max), steppedValue));
        handleChange(clampedValue);
    }, [min, max, step, orientation, handleChange]);
    // Специальная логика для fontSize варианта
    const handleFontSizeChange = useCallback((newValue) => {
        const sizeKey = Object.keys(fontSizeMap).find(key => fontSizeMap[key].value === newValue);
        if (sizeKey) {
            handleChange(fontSizeMap[sizeKey].value);
        }
    }, [handleChange]);
    // Получаем текущий размер шрифта для fontSize варианта
    const getCurrentFontSize = () => {
        if (variant !== 'fontSize')
            return null;
        const sizeKey = Object.keys(fontSizeMap).find(key => fontSizeMap[key].value === currentValue);
        return sizeKey ? fontSizeMap[sizeKey] : fontSizeMap.medium;
    };
    const currentFontSize = getCurrentFontSize();
    // Классы для разных вариантов
    const getVariantClasses = () => {
        switch (variant) {
            case 'rainbow':
                return 'rainbow-slider';
            case 'hue':
                return 'theme-selector-hue-strip';
            case 'brightness':
                return 'theme-selector-brightness-strip';
            case 'fontSize':
                return 'font-size-slider';
            default:
                return 'platform-slider';
        }
    };
    const sliderClasses = cn('appearance-none outline-none cursor-pointer transition-all duration-200', orientation === 'horizontal' ? sizeClasses[size] : verticalSizeClasses[size], orientation === 'vertical' && 'writing-mode: bt-lr; -webkit-appearance: slider-vertical', getVariantClasses(), className);
    return (_jsxs("div", { className: "space-y-4", children: [variant === 'fontSize' && currentFontSize && (_jsxs("div", { className: "p-4 rounded-lg border font-size-preview", "data-font-size": currentFontSize.size, children: [_jsx("div", { className: "text-sm text-muted-foreground mb-2", children: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440:" }), _jsxs("div", { className: "font-medium", children: ["\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430: ", currentFontSize.label] }), _jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A H1, \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442 \u0438 \u043C\u0435\u043B\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442" })] })), showLabels && labels.length > 0 && (_jsx("div", { className: cn("flex text-sm text-muted-foreground", orientation === 'vertical' ? "flex-col h-32 justify-between" : "justify-between"), children: labels.map((label, index) => (_jsx("span", { children: label }, index))) })), _jsxs("div", { className: "relative", children: [variant === 'fontSize' && (_jsx("div", { className: "w-full h-2 bg-black dark:bg-black rounded-full relative", children: _jsx("div", { className: "absolute top-0 h-2 bg-primary rounded-full transition-all duration-200", "data-width": ((currentValue - 1) / 2) * 100 }) })), _jsx("input", { ref: sliderRef, type: "range", min: min, max: max, step: step, value: currentValue, onChange: (e) => {
                            const newValue = Number(e.target.value);
                            if (variant === 'fontSize') {
                                handleFontSizeChange(newValue);
                            }
                            else {
                                handleChange(newValue);
                            }
                        }, onMouseDown: () => setIsDragging(true), onMouseUp: () => setIsDragging(false), onTouchStart: () => setIsDragging(true), onTouchEnd: () => setIsDragging(false), className: sliderClasses, "data-percent": ((currentValue - Number(min)) / (Number(max) - Number(min))) * 100, ...props }), variant === 'fontSize' && (_jsx("div", { className: "absolute inset-0 cursor-pointer", onMouseDown: handleSliderInteraction, onMouseMove: (e) => {
                            if (isDragging) {
                                handleSliderInteraction(e);
                            }
                        }, onMouseUp: () => setIsDragging(false), onMouseLeave: () => setIsDragging(false), onTouchStart: handleSliderInteraction, onTouchMove: handleSliderInteraction, onTouchEnd: () => setIsDragging(false) })), variant === 'fontSize' && (_jsx("div", { className: cn("font-size-slider-thumb", isDragging ? "scale-110 shadow-xl" : "hover:scale-105"), "data-position": (currentValue - 1) / 2 }))] }), showValue && (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: variant === 'fontSize' && currentFontSize
                            ? currentFontSize.label
                            : `${currentValue}${variant === 'hue' ? '°' : variant === 'brightness' ? '%' : ''}` }), variant === 'rainbow' && (_jsxs("div", { className: "text-xs text-muted-foreground", children: ["HSL: ", Math.round((currentValue / 100) * 360), ", 100%, 50%"] }))] }))] }));
});
UnifiedSlider.displayName = 'UnifiedSlider';
// Экспорт алиасов для совместимости
export const FontSizeSlider = (props) => (_jsx(UnifiedSlider, { ...props, variant: "fontSize" }));
export const RainbowSlider = (props) => (_jsx(UnifiedSlider, { ...props, variant: "rainbow" }));
export const HueSlider = (props) => (_jsx(UnifiedSlider, { ...props, variant: "hue" }));
export const BrightnessSlider = (props) => (_jsx(UnifiedSlider, { ...props, variant: "brightness" }));
//# sourceMappingURL=UnifiedSlider.js.map