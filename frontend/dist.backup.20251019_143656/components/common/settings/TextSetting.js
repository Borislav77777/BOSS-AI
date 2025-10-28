import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo } from 'react';
/**
 * Компонент для текстовых настроек (input)
 * Выделен из SettingItem для лучшей модульности
 */
export const TextSetting = memo(({ name, value, placeholder, onChange }) => {
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-setting-label", children: name }), _jsx("input", { type: "text", value: value, onChange: (e) => onChange(e.target.value), className: "w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-setting-input", "aria-label": name, placeholder: placeholder || `Введите ${name.toLowerCase()}` })] }));
});
//# sourceMappingURL=TextSetting.js.map