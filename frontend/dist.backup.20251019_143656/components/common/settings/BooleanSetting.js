import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo } from 'react';
/**
 * Компонент для булевых настроек (чекбоксы)
 * Выделен из SettingItem для лучшей модульности
 */
export const BooleanSetting = memo(({ name, description, value, onChange }) => {
    return (_jsxs("label", { className: "flex items-center space-x-3 cursor-pointer group", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "checkbox", checked: value, onChange: (e) => onChange(e.target.checked), className: "sr-only", "aria-label": name }), _jsx("div", { className: `w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${value ? 'boolean-checkbox-checked' : 'boolean-checkbox-unchecked'}`, children: value && (_jsx("svg", { className: "w-3 h-3 boolean-checkbox-icon", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-text-primary", children: name }), description && (_jsx("div", { className: "text-xs text-text-secondary mt-1", children: description }))] })] }));
});
//# sourceMappingURL=BooleanSetting.js.map