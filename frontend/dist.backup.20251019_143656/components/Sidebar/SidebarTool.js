import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import React, { memo } from 'react';
/**
 * Компонент инструмента сервиса в сайдбаре
 */
export const SidebarTool = memo(({ tool, serviceId, onToolClick, iconMap, isCollapsed, className = '' }) => {
    const ToolIconCmp = iconMap[tool.icon] || iconMap.Folder;
    const handleClick = () => {
        onToolClick(serviceId, tool.id);
    };
    return (_jsxs("button", { onClick: handleClick, className: cn('w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 group', 'hover:bg-surface-hover hover:shadow-sm text-white hover:text-white', isCollapsed ? 'justify-center' : 'justify-start', className), title: isCollapsed ? tool.name : undefined, children: [_jsx(ToolIconCmp, { className: cn('transition-all duration-200', isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2', 'text-icon-muted group-hover:text-icon-primary') }), !isCollapsed && (_jsx("span", { className: "text-xs font-medium truncate", children: tool.name }))] }, tool.id));
});
SidebarTool.displayName = 'SidebarTool';
//# sourceMappingURL=SidebarTool.js.map