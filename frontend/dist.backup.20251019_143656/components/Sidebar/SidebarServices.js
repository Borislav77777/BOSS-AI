import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import React, { memo, useCallback } from 'react';
import { SidebarTool } from './SidebarTool';
/**
 * Компонент секции сервисов в сайдбаре
 */
export const SidebarServices = memo(({ services, expandedServices, onToggleExpansion, onToolClick, iconMap, isCollapsed, className = '' }) => {
    const handleServiceClick = useCallback((serviceId) => {
        onToggleExpansion(serviceId);
    }, [onToggleExpansion]);
    if (services.length === 0) {
        return null;
    }
    return (_jsx("div", { className: cn('space-y-0.5', className), children: services.map((service) => {
            const isExpanded = expandedServices.has(service.config.id);
            const ServiceIcon = iconMap[service.config.icon] || iconMap.Folder;
            return (_jsxs("div", { className: "animate-interface-stagger", children: [_jsxs("button", { onClick: () => handleServiceClick(service.config.id), className: cn('w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group', 'hover:bg-surface-hover hover:shadow-sm text-white hover:text-white', isCollapsed ? 'justify-center' : 'justify-between'), title: isCollapsed ? service.config.name : undefined, children: [_jsxs("div", { className: cn('flex items-center', isCollapsed ? 'justify-center' : 'justify-start'), children: [_jsx(ServiceIcon, { className: cn('transition-all duration-200', isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3', 'text-icon-muted group-hover:text-icon-primary') }), !isCollapsed && (_jsx("span", { className: "text-sm font-medium truncate", children: service.config.name }))] }), !isCollapsed && (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mr-2", children: service.config.tools.length }), isExpanded ? (_jsx("svg", { className: "w-4 h-4 text-icon-muted", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })) : (_jsx("svg", { className: "w-4 h-4 text-icon-muted", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }))] }))] }), isExpanded && !isCollapsed && (_jsx("div", { className: "mt-1 ml-3 mr-4 pr-2 pt-1 pb-1 space-y-0.5 animate-interface-slide-up overflow-visible", children: service.config.tools.map((tool) => (_jsx(SidebarTool, { tool: tool, serviceId: service.config.id, onToolClick: onToolClick, iconMap: iconMap, isCollapsed: isCollapsed }, tool.id))) }))] }, service.config.id));
        }) }));
});
SidebarServices.displayName = 'SidebarServices';
//# sourceMappingURL=SidebarServices.js.map