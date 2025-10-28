import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Settings as SettingsIcon } from 'lucide-react';
import React from 'react';
/**
 * Эталонный блок "Все настройки" - используется как образец дизайна
 * для всех элементов интерфейса с закругленными краями и liquid glass эффектом
 */
export const ReferenceBlock = ({ className, onClick, isActive = false }) => {
    return (_jsxs("button", { onClick: onClick, className: cn("w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left", "liquid-glass-block", // Применяем liquid glass эффект
        isActive
            ? "bg-primary text-background shadow-md"
            : "hover:bg-surface/50 text-text", className), children: [_jsx(SettingsIcon, { className: "w-5 h-5 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium text-sm", children: "\u0412\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("div", { className: "text-xs opacity-70", children: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" })] })] }));
};
ReferenceBlock.displayName = 'ReferenceBlock';
//# sourceMappingURL=ReferenceBlock.js.map