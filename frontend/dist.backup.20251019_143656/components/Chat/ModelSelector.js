import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { ChevronDown, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
export const ModelSelector = ({ selectedModel, onModelChange, models, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedModelData = models.find(model => model.id === selectedModel) || models[0];
    const handleModelSelect = (modelId) => {
        onModelChange(modelId);
        setIsOpen(false);
    };
    return (_jsxs("div", { className: cn("relative", className), children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: cn("w-full flex items-center justify-between px-3 py-2 rounded-lg", "bg-surface/50 border border-border/50 hover:bg-surface/70", "transition-all duration-200 text-sm"), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-primary" }), _jsx("span", { className: "font-medium", children: selectedModelData?.name })] }), _jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180") })] }), isOpen && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50", children: models.map((model) => (_jsxs("button", { onClick: () => handleModelSelect(model.id), className: cn("w-full flex items-start justify-between px-3 py-2 text-left", "hover:bg-surface/50 transition-colors duration-200", "first:rounded-t-lg last:rounded-b-lg", selectedModel === model.id && "bg-primary/10"), children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium text-sm", children: model.name }), model.isDefault && (_jsx("span", { className: "px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded", children: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E" }))] }), _jsx("p", { className: "text-xs text-text-secondary mt-0.5", children: model.description })] }), _jsx("div", { className: "ml-2", children: _jsxs("span", { className: cn("text-xs px-1.5 py-0.5 rounded", model.cost === 'low' && "bg-green-500/20 text-green-500", model.cost === 'medium' && "bg-yellow-500/20 text-yellow-500", model.cost === 'high' && "bg-red-500/20 text-red-500"), children: [model.cost === 'low' && 'Эконом', model.cost === 'medium' && 'Средне', model.cost === 'high' && 'Дорого'] }) })] }, model.id))) }))] }));
};
//# sourceMappingURL=ModelSelector.js.map