import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для отображения сообщений чата
 */
import React from 'react';
import { MessageBubble } from './MessageBubble';
export const ChatMessages = ({ messages, isProcessing, onRetryMessage, onDeleteMessage }) => {
    if (!messages || messages.length === 0) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("h3", { className: "text-lg font-medium text-text mb-2", children: "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u043E\u0431\u0449\u0435\u043D\u0438\u0435" }), _jsx("p", { className: "text-text-secondary", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0432\u0432\u043E\u0434" })] }) }));
    }
    return (_jsx("div", { className: "flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar", children: _jsxs("div", { className: "p-6 space-y-4", children: [messages.map((message, index) => (_jsx(MessageBubble, { message: message, onRetry: () => onRetryMessage(message.id), onDelete: () => onDeleteMessage(message.id) }, message.id || index))), isProcessing && (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsxs("div", { className: "flex items-center space-x-2 text-text-secondary", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" }), _jsx("span", { className: "text-sm", children: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430..." })] }) }))] }) }));
};
//# sourceMappingURL=ChatMessages.js.map