import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Bot, Brain, ChevronDown, FileText, Mic, Settings } from 'lucide-react';
import React, { useState } from 'react';
// Карта иконок для сервисов
const serviceIconMap = {
    'ai-assistant': Brain,
    'chatgpt-service': Bot,
    'real-speech-service': Mic,
    'settings': Settings,
    'file-manager': FileText,
};
export const ServiceSelector = ({ selectedService, onServiceChange, services, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedServiceData = services.find(service => service.id === selectedService) || services[0];
    const Icon = serviceIconMap[selectedServiceData?.icon] || Brain;
    const handleServiceSelect = (serviceId) => {
        onServiceChange(serviceId);
        setIsOpen(false);
    };
    return (_jsxs("div", { className: cn("relative", className), children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: cn("flex items-center gap-2 px-2 py-1.5 rounded-md", "bg-surface/30 border border-border/30 hover:bg-surface/50", "transition-all duration-200 text-xs"), children: [_jsx(Icon, { className: "w-3 h-3 text-primary" }), _jsx("div", { className: "text-xs", children: _jsx("div", { className: "font-medium truncate max-w-20", children: selectedServiceData?.name }) }), _jsx(ChevronDown, { className: cn("w-2 h-2 text-text-secondary transition-transform duration-200", isOpen && "rotate-180") })] }), isOpen && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50", children: services.map((service) => {
                    const ServiceIcon = serviceIconMap[service.icon] || Brain;
                    return (_jsxs("button", { onClick: () => handleServiceSelect(service.id), className: cn("w-full flex items-start justify-between px-3 py-2 text-left", "hover:bg-surface/50 transition-colors duration-200", "first:rounded-t-lg last:rounded-b-lg", selectedService === service.id && "bg-primary/10"), children: [_jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx(ServiceIcon, { className: "w-4 h-4 text-primary" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: service.name }), _jsx("div", { className: "text-xs text-text-secondary", children: service.description })] })] }), service.isActive && (_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mt-1" }))] }, service.id));
                }) }))] }));
};
//# sourceMappingURL=ServiceSelector.js.map