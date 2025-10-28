import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import React from 'react';
export const ServiceChatButtons = ({ buttons, position, onButtonClick, className }) => {
    const filteredButtons = buttons.filter(button => button.position === position && button.isEnabled);
    if (filteredButtons.length === 0) {
        return null;
    }
    return (_jsx("div", { className: cn("flex flex-wrap gap-2 p-2", position === 'top' ? "border-b border-border" : "border-t border-border", className), children: filteredButtons.map(button => (_jsxs("button", { onClick: () => onButtonClick(button), className: cn("flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium", "transition-all duration-200 hover:scale-105", "bg-surface border border-border text-text", "hover:bg-surface-hover hover:border-primary/50", "focus:outline-none focus:ring-2 focus:ring-primary/50"), title: button.label, children: [_jsx("span", { className: "text-lg", children: button.icon }), _jsx("span", { children: button.label })] }, button.id))) }));
};
//# sourceMappingURL=ServiceChatButtons.js.map