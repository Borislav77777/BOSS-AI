import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент пузырька сообщения
 */
import { cn, formatTime } from '@/utils';
import { Copy, RotateCcw, Trash2 } from 'lucide-react';
import React from 'react';
export const MessageBubble = ({ message, onRetry, onDelete }) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';
    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
    };
    return (_jsx("div", { className: cn("flex", isUser ? "justify-end" : "justify-start"), children: _jsxs("div", { className: cn("max-w-[80%] rounded-2xl px-4 py-3 shadow-sm", isUser && "bg-primary text-background", isAssistant && "bg-surface border border-border", isSystem && "bg-surface-hover border border-border"), children: [_jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: message.content }) }), _jsxs("div", { className: cn("flex items-center justify-between mt-2 text-xs", isUser ? "text-background/70" : "text-text-secondary"), children: [_jsx("span", { children: formatTime(message.timestamp) }), _jsxs("div", { className: "flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: handleCopy, className: "p-1 rounded hover:bg-surface-hover transition-colors", title: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Copy, { className: "w-3 h-3" }) }), isAssistant && (_jsx("button", { onClick: onRetry, className: "p-1 rounded hover:bg-surface-hover transition-colors", title: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C", children: _jsx(RotateCcw, { className: "w-3 h-3" }) })), _jsx("button", { onClick: onDelete, className: "p-1 rounded hover:bg-surface-hover transition-colors text-red-500", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: _jsx(Trash2, { className: "w-3 h-3" }) })] })] })] }) }));
};
//# sourceMappingURL=MessageBubble.js.map