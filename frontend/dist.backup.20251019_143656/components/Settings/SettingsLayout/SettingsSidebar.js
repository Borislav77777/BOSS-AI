import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент боковой панели настроек
 */
import { cn } from '@/utils';
import { Bell, Eye, MessageSquare, Monitor, Palette, Settings as SettingsIcon } from 'lucide-react';
import React from 'react';
const categoryIcons = {
    appearance: Palette,
    behavior: Bell,
    layout: Monitor,
    system: SettingsIcon,
    advanced: Eye,
    chat: MessageSquare,
    services: SettingsIcon
};
export const SettingsSidebar = ({ categories, selectedCategory, onCategorySelect }) => {
    return (_jsx("div", { className: "w-64 bg-surface border-r border-border", children: _jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), _jsxs("nav", { className: "space-y-1", children: [_jsxs("button", { onClick: () => onCategorySelect(null), className: cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left", "transition-all duration-200", selectedCategory === null
                                ? "bg-primary text-background"
                                : "text-text-secondary hover:bg-surface-hover hover:text-text"), children: [_jsx(SettingsIcon, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "\u0412\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" })] }), categories.map((category) => {
                            const Icon = categoryIcons[category.id] || SettingsIcon;
                            return (_jsxs("button", { onClick: () => onCategorySelect(category.id), className: cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left", "transition-all duration-200", selectedCategory === category.id
                                    ? "bg-primary text-button-primary-text shadow-[0_2px_8px_var(--success-hover)]"
                                    : "text-text-secondary hover:bg-surface-hover hover:text-text hover:shadow-[0_2px_8px_var(--success-hover)]"), children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("div", { className: "text-sm font-medium truncate", children: category.name }) })] }, category.id));
                        })] })] }) }));
};
//# sourceMappingURL=SettingsSidebar.js.map