import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для отображения сетки булевых настроек
 */
import { SettingItem } from '@/components/common/SettingItem';
import React from 'react';
export const BooleanSettingsGrid = ({ items, onSettingChange }) => {
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: items.map((item) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(item.icon, { className: "w-4 h-4 text-text-secondary dark:text-white" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("div", { className: "text-sm font-medium text-text", children: item.label }) }), _jsx("div", { className: "flex-shrink-0", children: _jsx(SettingItem, { item: {
                            id: item.key,
                            name: '',
                            description: '',
                            type: 'boolean',
                            value: item.value || false,
                            onChange: (value) => onSettingChange(item.key, value)
                        }, onChange: onSettingChange, className: "!p-0" }) })] }, item.key))) }));
};
//# sourceMappingURL=BooleanSettingsGrid.js.map