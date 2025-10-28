import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для группировки связанных настроек
 */
import { cn } from '@/utils';
import React from 'react';
export const CompactSettingsGroup = ({ title, description, children, className }) => (_jsxs("div", { className: cn("p-4 settings-card", className), children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-semibold text-text-primary", children: title }), description && (_jsx("p", { className: "text-xs text-text-secondary mt-1", children: description }))] }), _jsx("div", { className: "space-y-3", children: children })] }));
//# sourceMappingURL=CompactSettingsGroup.js.map