import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo, useCallback, useEffect, useRef } from 'react';
/**
 * Компонент для числовых настроек (слайдеры)
 * Выделен из SettingItem для лучшей модульности
 */
export const NumberSetting = memo(({ name, value, min = 0, max = 100, step = 1, onChange }) => {
    const sliderRef = useRef(null);
    const updateSliderFill = useCallback((val) => {
        const percent = ((val - min) / (max - min)) * 100;
        if (sliderRef.current) {
            sliderRef.current.style.setProperty('--percent', `${percent}%`);
        }
    }, [min, max]);
    useEffect(() => {
        updateSliderFill(Number(value));
    }, [value, min, max, updateSliderFill]);
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "block text-sm font-medium number-setting-label", children: name }), _jsx("span", { className: "px-2 py-0.5 rounded-md text-xs shadow-sm number-setting-value", "aria-live": "polite", children: String(value) })] }), _jsx("input", { ref: sliderRef, type: "range", value: Number(value), min: min, max: max, step: step, onChange: (e) => {
                    const v = Number(e.target.value);
                    updateSliderFill(v);
                    onChange(v);
                }, className: "slider-brand w-full h-2 appearance-none rounded-lg outline-none cursor-pointer border focus:ring-2 number-setting-slider", "aria-label": name }), _jsxs("div", { className: "flex justify-between text-xs number-setting-range", children: [_jsx("span", { children: min }), _jsx("span", { children: max })] })] }));
});
//# sourceMappingURL=NumberSetting.js.map