import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент управления чатом (сервисы, модели, кнопки)
 */
import React from 'react';
import { ChatButtons } from '../ChatButtons';
import { ModelSelector } from '../ModelSelector';
import { ServiceSelector } from '../ServiceSelector';
export const ChatControls = ({ onServiceSelect, onModelSelect, onButtonClick, selectedService, selectedModel, availableServices, availableModels }) => {
    return (_jsxs("div", { className: "flex flex-col space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-text", children: "\u0421\u0435\u0440\u0432\u0438\u0441" }), _jsx(ServiceSelector, { services: availableServices, selectedService: selectedService || '', onServiceChange: onServiceSelect })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-text", children: "\u041C\u043E\u0434\u0435\u043B\u044C" }), _jsx(ModelSelector, { models: availableModels, selectedModel: selectedModel || '', onModelChange: onModelSelect })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-text", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" }), _jsx(ChatButtons, { onClick: onButtonClick })] })] }));
};
//# sourceMappingURL=ChatControls.js.map