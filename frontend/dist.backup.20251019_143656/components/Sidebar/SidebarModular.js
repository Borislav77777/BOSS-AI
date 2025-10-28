import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/utils';
import { Folder } from 'lucide-react';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { SidebarMenu } from './SidebarMenu';
import { SidebarToggle } from './SidebarToggle';
/**
 * Модульный сайдбар с разбиением на подкомпоненты
 */
export const SidebarModular = memo(({ className }) => {
    const { state, toggleSidebar, switchSection } = usePlatform();
    const [activeItem, setActiveItem] = useState('workspace');
    const isCollapsed = state.layout.sidebarCollapsed;
    // Инициализация CSS переменной при загрузке
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width');
        if (el && !el.style.getPropertyValue('--sidebar-width')) {
            const targetWidth = isCollapsed ? 60 : state.layout.sidebarWidth;
            el.style.setProperty('--sidebar-width', `${targetWidth}px`);
        }
    }, [isCollapsed, state.layout.sidebarWidth]);
    // Обновление CSS переменной при сворачивании/разворачивании
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width');
        if (el) {
            const targetWidth = isCollapsed ? 60 : state.layout.sidebarWidth;
            el.style.setProperty('--sidebar-width', `${targetWidth}px`);
        }
    }, [isCollapsed, state.layout.sidebarWidth]);
    // Мемоизированные пункты меню
    const menuItems = useMemo(() => [
        {
            id: 'workspace',
            name: 'Рабочее пространство',
            icon: Folder,
            action: () => {
                setActiveItem('workspace');
                switchSection('workspace');
            },
        },
    ], [switchSection]);
    // Обработчики
    return (_jsxs("div", { className: cn('sidebar-container relative flex flex-col h-full transition-all duration-300 ease-in-out', 'bg-surface border-r border-border', isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded', className), children: [_jsx(SidebarToggle, { isCollapsed: isCollapsed, onToggle: toggleSidebar }), !isCollapsed && (_jsxs("div", { className: "p-4 border-b border-border", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center", children: _jsx("span", { className: "font-bold text-sm text-primary", children: "B" }) }), _jsxs("h2", { className: "text-lg font-semibold text-white", children: [_jsx("span", { className: "font-bold", children: "oss" }), " ", _jsx("span", { className: "font-bold", children: "Ai" })] })] }), _jsx("p", { className: "text-xs text-white mt-1", children: "BARSUKOV OS v2.1.0" })] })), _jsx("div", { className: "flex-1 p-4 space-y-6", children: _jsx(SidebarMenu, { items: menuItems, activeItem: activeItem, isCollapsed: isCollapsed }) }), !isCollapsed && (_jsx("div", { className: "p-4 border-t border-border", children: _jsx("div", { className: "text-xs text-white text-center", children: "\u00A9 2024 Boss Ai" }) }))] }));
});
SidebarModular.displayName = 'SidebarModular';
//# sourceMappingURL=SidebarModular.js.map