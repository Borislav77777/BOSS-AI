import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Унифицированный компонент сервиса
 * Облегчает добавление новых сервисов в платформу
 * Использует платформенные стили и компоненты
 */
import { cn } from '@/utils/cn';
import React, { memo } from 'react';
import { UnifiedButton, UnifiedCard } from './';
const statusClasses = {
    active: 'platform-service-active',
    inactive: 'platform-service-inactive',
    loading: 'platform-service-loading',
    error: 'platform-service-error',
};
const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};
export const UnifiedService = memo(({ id: _id, title, description, icon, status = 'inactive', variant = 'default', size = 'md', hover = true, actions = [], onToggle, onConfigure, className, children, }) => {
    const isActive = status === 'active';
    const isLoading = status === 'loading';
    const hasError = status === 'error';
    const handleToggle = () => {
        if (onToggle && !isLoading) {
            onToggle(!isActive);
        }
    };
    const handleConfigure = () => {
        if (onConfigure && !isLoading) {
            onConfigure();
        }
    };
    return (_jsxs(UnifiedCard, { variant: variant, size: size, hover: hover, clickable: !!onToggle, className: cn('platform-service', statusClasses[status], sizeClasses[size], className), onClick: handleToggle, children: [_jsx("div", { className: "platform-service-header-standard", children: _jsxs("div", { className: "platform-service-header-content", children: [_jsx("div", { className: "platform-service-icon", children: icon }), _jsxs("div", { className: "platform-service-content", children: [_jsx("h3", { className: "platform-service-title", children: title }), description && (_jsx("p", { className: "platform-service-description", children: description }))] }), _jsxs("div", { className: "platform-service-status", children: [isLoading && (_jsx("div", { className: "platform-service-spinner" })), hasError && (_jsx("div", { className: "platform-service-error-icon", children: "\u26A0\uFE0F" })), isActive && !isLoading && !hasError && (_jsx("div", { className: "platform-service-active-icon", children: "\u2713" }))] })] }) }), children && (_jsx("div", { className: "platform-service-body", children: children })), (actions.length > 0 || onConfigure) && (_jsxs("div", { className: "platform-service-actions", children: [actions.map((action) => (_jsx(UnifiedButton, { variant: action.variant || 'secondary', size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            action.onClick();
                        }, disabled: action.disabled || isLoading, children: action.label }, action.id))), onConfigure && (_jsx(UnifiedButton, { variant: "outline", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            handleConfigure();
                        }, disabled: isLoading, children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C" }))] }))] }));
});
UnifiedService.displayName = 'UnifiedService';
//# sourceMappingURL=UnifiedService.js.map