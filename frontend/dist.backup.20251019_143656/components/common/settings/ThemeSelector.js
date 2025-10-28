import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
/**
 * Простой селектор тем - только светлая и темная
 * Минималистичный дизайн без лишних функций
 */
export const ThemeSelector = memo(({ theme, onThemeChange, className = '' }) => {
    const handleThemeSelect = useCallback((selectedTheme) => {
        onThemeChange(selectedTheme);
    }, [onThemeChange]);
    return (_jsxs("div", { className: cn("space-y-4", className), children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-text mb-1", children: "\u0422\u0435\u043C\u0430" }), _jsx("p", { className: "text-sm text-text-secondary", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0432\u0435\u0442\u043B\u0443\u044E \u0438\u043B\u0438 \u0442\u0435\u043C\u043D\u0443\u044E \u0442\u0435\u043C\u0443" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleThemeSelect('light'), className: cn("flex-1 p-3 rounded-lg border-2 transition-all duration-200", "bg-card text-text border-primary", theme === 'light'
                            ? "ring-2 ring-primary shadow-lg"
                            : "hover:bg-surface"), children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 bg-black rounded" }), _jsx("span", { className: "font-medium", children: "\u0421\u0432\u0435\u0442\u043B\u0430\u044F" })] }) }), _jsx("button", { onClick: () => handleThemeSelect('dark'), className: cn("flex-1 p-3 rounded-lg border-2 transition-all duration-200", "bg-black text-white border-black", theme === 'dark'
                            ? "ring-2 ring-white shadow-lg"
                            : "hover:bg-gray-800"), children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 bg-white rounded" }), _jsx("span", { className: "font-medium", children: "\u0422\u0435\u043C\u043D\u0430\u044F" })] }) })] }), _jsx("div", { className: "text-center text-xs text-text-secondary", children: theme === 'light' ? 'Белый фон, черный текст' : 'Черный фон, белый текст' })] }));
});
ThemeSelector.displayName = 'ThemeSelector';
//# sourceMappingURL=ThemeSelector.js.map