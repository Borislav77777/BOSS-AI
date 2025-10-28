import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Кнопка настроек промпта в чате
 */
import React from 'react';
import { formatGPTSettings } from '../../types/gpt-settings';
export const PromptSettingsButton = ({ promptId: _promptId, promptTitle, settings, onRemove, onOpenPrompt, className = '' }) => {
    const settingsText = formatGPTSettings(settings);
    return (_jsxs("div", { className: `prompt-settings-button ${className}`, children: [_jsxs("button", { className: "prompt-settings-button-content", onClick: onOpenPrompt, title: `Открыть промпт: ${promptTitle}`, children: [_jsx("div", { className: "prompt-settings-button-icon", children: _jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14,2 14,8 20,8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), _jsx("polyline", { points: "10,9 9,9 8,9" })] }) }), _jsxs("div", { className: "prompt-settings-button-text", children: [_jsx("div", { className: "prompt-settings-button-title", children: promptTitle }), _jsx("div", { className: "prompt-settings-button-settings", children: settingsText })] })] }), _jsx("button", { className: "prompt-settings-button-remove", onClick: onRemove, title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0440\u043E\u043C\u043F\u0442\u0430", children: _jsxs("svg", { className: "w-3 h-3", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }) })] }));
};
export default PromptSettingsButton;
//# sourceMappingURL=PromptSettingsButton.js.map