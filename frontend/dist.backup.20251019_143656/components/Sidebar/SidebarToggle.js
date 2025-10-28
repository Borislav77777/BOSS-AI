import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';
/**
 * Компонент кнопки сворачивания/разворачивания сайдбара
 */
export const SidebarToggle = memo(({ isCollapsed, onToggle, className = '' }) => {
    return (_jsx("button", { onClick: onToggle, className: cn('absolute -right-3 top-1/2 transform -translate-y-1/2 z-10', 'w-6 h-6 rounded-full border-2 transition-all duration-200', 'bg-surface border-border hover:border-primary hover:bg-surface-hover', 'flex items-center justify-center shadow-lg hover:shadow-xl', 'text-icon-muted hover:text-primary', className), title: isCollapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар', children: isCollapsed ? (_jsx(ChevronRight, { className: "w-4 h-4" })) : (_jsx(ChevronLeft, { className: "w-4 h-4" })) }));
});
SidebarToggle.displayName = 'SidebarToggle';
//# sourceMappingURL=SidebarToggle.js.map