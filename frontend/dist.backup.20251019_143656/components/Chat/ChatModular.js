import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Модульная версия Chat компонента
 */
import { cn } from '@/utils';
import React from 'react';
import { ChatControls } from './ChatControls/ChatControls';
import { ChatInput } from './ChatInput/ChatInput';
import { ChatMessages } from './ChatMessages/ChatMessages';
import { useChat } from './hooks/useChat';
const GPT_MODELS = [
    {
        id: 'gpt-5-nano',
        name: 'GPT-5 Nano',
        description: 'Быстрая и экономичная модель GPT-5',
        cost: 'low',
        isDefault: true
    },
    {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini',
        description: 'Компактная версия GPT-5',
        cost: 'medium'
    },
    {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Самая мощная модель GPT-5',
        cost: 'high'
    }
];
export const ChatModular = ({ className, onInputResize }) => {
    const { chatState, chatActions } = useChat();
    return (_jsxs("div", { className: cn("h-full flex flex-col bg-background", className), children: [_jsx("div", { className: "flex-shrink-0 p-4 border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-text", children: "\u0427\u0430\u0442" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-sm text-text-secondary", children: "\u041E\u043D\u043B\u0430\u0439\u043D" })] })] }) }), _jsxs("div", { className: "flex-1 flex min-h-0", children: [_jsx("div", { className: "flex-1 flex flex-col min-h-0", children: _jsx(ChatMessages, { messages: chatState.messages, isProcessing: chatState.isProcessing, onRetryMessage: chatActions.retryMessage, onDeleteMessage: chatActions.deleteMessage }) }), _jsx("div", { className: "w-80 border-l border-border bg-surface/50 p-4", children: _jsx(ChatControls, { onServiceSelect: chatActions.selectService, onModelSelect: chatActions.selectModel, onButtonClick: () => { }, selectedService: chatState.selectedService, selectedModel: chatState.selectedModel, availableServices: [], availableModels: GPT_MODELS }) })] }), _jsx("div", { className: "flex-shrink-0", children: _jsx(ChatInput, { onInputResize: onInputResize, onSendMessage: chatActions.sendMessage, onVoiceRecord: chatActions.startVoiceRecord, onVoiceStop: chatActions.stopVoiceRecord, onFileUpload: chatActions.uploadFile, isRecording: chatState.isRecording, isProcessing: chatState.isProcessing }) })] }));
};
//# sourceMappingURL=ChatModular.js.map