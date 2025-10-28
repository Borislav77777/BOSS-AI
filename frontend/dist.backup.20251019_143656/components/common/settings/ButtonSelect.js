import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
/**
 * Компонент выбора с кнопками вместо выпадающего списка
 * Решает проблему с z-index и позиционированием
 */
export const ButtonSelect = memo(({ value, options, onChange, placeholder, className }) => {
    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const handleSelect = useCallback((option) => {
        onChange(option.value);
    }, [onChange]);
    const ariaLabel = selectedOption?.label || placeholder || 'Выберите опцию';
    return (_jsxs("div", { className: cn("space-y-2", className), children: [_jsx("label", { className: "block text-sm font-medium setting-label", children: placeholder || 'Выберите опцию' }), _jsx("div", { className: "flex flex-wrap gap-2", role: "radiogroup", "aria-label": ariaLabel, children: options.map((option) => {
                    const isSelected = String(option.value) === String(value);
                    return (_jsx("button", { type: "button", role: "radio", onClick: () => handleSelect(option), className: cn("px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200", "border focus:outline-none focus:ring-2 focus:border-transparent", "hover:scale-105 active:scale-95", isSelected
                            ? "bg-primary text-background border-primary shadow-lg"
                            : "bg-input-bg text-input-text border-input-border hover:bg-surface-hover"), "aria-checked": isSelected, "aria-label": `${ariaLabel}: ${option.label}`, tabIndex: isSelected ? 0 : -1, children: option.label }, String(option.value)));
                }) })] }));
});
ButtonSelect.displayName = 'ButtonSelect';
//# sourceMappingURL=ButtonSelect.js.map