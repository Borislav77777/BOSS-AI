import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo, useCallback, useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';
/**
 * Ползунок для выбора размера шрифта
 * Показывает предварительный просмотр размера шрифта
 */
export const FontSizeSlider = memo(({ value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    // Маппинг значений размера шрифта - статический объект для оптимизации
    const fontSizeMap = useMemo(() => ({
        'small': { value: 1, label: 'Маленький', size: '0.875rem' },
        'medium': { value: 2, label: 'Средний', size: '1rem' },
        'large': { value: 3, label: 'Большой', size: '1.125rem' }
    }), []); // Пустой массив зависимостей для стабильности
    const currentSize = fontSizeMap[value] || fontSizeMap.medium;
    // Обработчик изменения ползунка
    const handleSliderChange = useCallback((newValue) => {
        const sizeKey = Object.keys(fontSizeMap).find(key => fontSizeMap[key].value === newValue);
        if (sizeKey) {
            onChange(sizeKey);
        }
    }, [onChange, fontSizeMap]);
    // Обработчик взаимодействия с ползунком
    const handleSliderInteraction = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const relativeX = x - rect.left;
        const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        // Преобразуем процент в значение (1, 2, или 3)
        let newValue;
        if (percentage < 33) {
            newValue = 1;
        }
        else if (percentage < 66) {
            newValue = 2;
        }
        else {
            newValue = 3;
        }
        handleSliderChange(newValue);
    }, [handleSliderChange]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 rounded-lg border font-size-preview", style: { '--font-size-preview': currentSize.size }, children: [_jsx("div", { className: "text-sm text-muted-foreground mb-2", children: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440:" }), _jsxs("div", { className: "font-medium", children: ["\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430: ", currentSize.label] }), _jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A H1, \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442 \u0438 \u043C\u0435\u043B\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [_jsx("span", { children: "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439" }), _jsx("span", { children: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439" }), _jsx("span", { children: "\u0411\u043E\u043B\u044C\u0448\u043E\u0439" })] }), _jsx("div", { className: "relative", children: _jsxs("div", { className: "w-full h-2 bg-black dark:bg-black rounded-full relative", children: [_jsx("div", { className: "absolute top-0 h-2 bg-primary rounded-full transition-all duration-200", style: {
                                        left: '0%',
                                        width: `${((currentSize.value - 1) / 2) * 100}%`
                                    } }), _jsx("div", { className: cn("font-size-slider-thumb", isDragging ? "scale-110 shadow-xl" : "hover:scale-105"), style: {
                                        '--font-size-position': (currentSize.value - 1) / 2
                                    }, onMouseDown: (e) => {
                                        setIsDragging(true);
                                        handleSliderInteraction(e);
                                    }, onTouchStart: (e) => {
                                        setIsDragging(true);
                                        handleSliderInteraction(e);
                                    } }), _jsx("div", { className: "absolute inset-0 cursor-pointer", onMouseDown: handleSliderInteraction, onMouseMove: (e) => {
                                        if (isDragging) {
                                            handleSliderInteraction(e);
                                        }
                                    }, onMouseUp: () => setIsDragging(false), onMouseLeave: () => setIsDragging(false), onTouchStart: handleSliderInteraction, onTouchMove: handleSliderInteraction, onTouchEnd: () => setIsDragging(false) })] }) })] })] }));
});
FontSizeSlider.displayName = 'FontSizeSlider';
//# sourceMappingURL=FontSizeSlider.js.map