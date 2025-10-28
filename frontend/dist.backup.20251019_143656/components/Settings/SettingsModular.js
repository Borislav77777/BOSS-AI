import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Модульная версия Settings компонента
 */
import { cn } from '@/utils';
import React from 'react';
import { useSettingsState } from './hooks/useSettingsState';
import { ServiceSettingsProvider } from './ServiceSettings';
import { SettingsContent } from './SettingsLayout/SettingsContent';
export const SettingsModular = ({ className }) => {
    const { settingsState } = useSettingsState();
    return (_jsx(ServiceSettingsProvider, { children: _jsxs("div", { className: cn("settings-container h-full flex flex-col", className), children: [_jsxs("div", { className: "platform-service-header-standard", children: [_jsxs("div", { className: "platform-service-header-content", children: [_jsx("div", { className: "platform-service-icon", children: "\u2699\uFE0F" }), _jsx("div", { className: "platform-service-content", children: _jsx("h3", { className: "platform-service-title", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }) })] }), _jsx("div", { className: "platform-service-status" })] }), _jsx("div", { className: "settings-content-container flex-1 min-h-0 overflow-y-auto border border-border rounded-lg bg-card-bg", children: _jsx("div", { className: "p-4", children: _jsx(SettingsContent, { selectedCategory: settingsState.selectedCategory, showAdvanced: settingsState.showAdvanced, searchQuery: "" }) }) })] }) }));
};
//# sourceMappingURL=SettingsModular.js.map