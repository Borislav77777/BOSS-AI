import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import React from 'react';
export const ServiceWorkspaceItem = ({ item, isSelected = false, onSelect, onDoubleClick, onContextMenu, className }) => {
    const handleClick = () => {
        onSelect?.(item);
    };
    const handleDoubleClick = () => {
        onDoubleClick?.(item);
    };
    const handleContextMenu = (event) => {
        event.preventDefault();
        onContextMenu?.(item, event);
    };
    const getItemIcon = () => {
        // TODO: Реализовать отображение иконок сервисов
        switch (item.type) {
            case 'service':
                return '🔧';
            case 'document':
                return '📄';
            case 'folder':
                return '📁';
            case 'widget':
                return '⚡';
            default:
                return '📄';
        }
    };
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    return (_jsx("div", { className: cn("p-3 rounded-lg border cursor-pointer transition-all duration-200", "hover:bg-surface-hover hover:border-primary/50", isSelected
            ? "bg-primary/10 border-primary/50 shadow-sm"
            : "bg-surface border-border", className), onClick: handleClick, onDoubleClick: handleDoubleClick, onContextMenu: handleContextMenu, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg", children: getItemIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium text-text truncate", children: item.name }), _jsx("span", { className: "text-xs text-text-secondary", children: item.metadata.serviceId })] }), item.description && (_jsx("p", { className: "text-xs text-text-secondary mt-1 line-clamp-2", children: item.description })), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("div", { className: "flex items-center space-x-2", children: item.metadata.tags.map(tag => (_jsx("span", { className: "px-2 py-1 text-xs bg-primary/10 text-primary rounded-full", children: tag }, tag))) }), _jsx("span", { className: "text-xs text-text-secondary", children: formatDate(item.metadata.updatedAt) })] }), item.metadata.size && (_jsx("div", { className: "mt-1", children: _jsxs("span", { className: "text-xs text-text-secondary", children: [(item.metadata.size / 1024).toFixed(1), " KB"] }) }))] })] }) }));
};
//# sourceMappingURL=ServiceWorkspaceItem.js.map