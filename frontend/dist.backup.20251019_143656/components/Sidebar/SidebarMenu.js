import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import React, { memo } from 'react';
/**
 * Компонент основного меню сайдбара
 */
export const SidebarMenu = memo(({ items, activeItem, isCollapsed, className = '' }) => {
    return (_jsx("ul", { className: cn('space-y-1', className), children: items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (_jsx("li", { className: "animate-interface-stagger", children: _jsxs("button", { onClick: item.action, className: cn('w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group', 'hover:bg-surface-hover hover:shadow-sm', isActive ? 'bg-primary text-button-primary-text shadow-lg' : 'text-white hover:text-white', isCollapsed ? 'justify-center' : 'justify-start'), title: isCollapsed ? item.name : undefined, style: {
                        animationDelay: `${index * 0.1}s`
                    }, children: [_jsx(Icon, { className: cn('transition-all duration-200', isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3', isActive ? 'text-button-primary-text' : 'text-white group-hover:text-white') }), !isCollapsed && (_jsx("span", { className: "text-sm font-medium truncate", children: item.name }))] }) }, item.id));
        }) }));
});
SidebarMenu.displayName = 'SidebarMenu';
//# sourceMappingURL=SidebarMenu.js.map