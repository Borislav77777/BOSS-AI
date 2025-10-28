import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Специализированный Error Boundary для чата
 */
import { Component } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
/**
 * Error Boundary специально для компонентов чата
 * Предоставляет контекстную информацию об ошибке чата
 */
export class ChatErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.handleError = (error, errorInfo) => {
            // Логируем ошибку с контекстом чата
            console.error('Chat Error:', error, errorInfo);
            // Вызываем пользовательский обработчик
            this.props.onError?.(error, errorInfo);
        };
    }
    render() {
        const { children, className } = this.props;
        return (_jsx(EnhancedErrorBoundary, { errorBoundaryName: "Chat", onError: this.handleError, className: cn("chat-error-boundary", className), showNotification: true, autoRetry: true, retryDelay: 2000, fallback: _jsx("div", { className: cn("p-4 rounded-lg border border-black bg-black", className), children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-white", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0430\u0442\u0430" }), _jsx("p", { className: "text-sm text-white mt-1", children: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F..." })] })] }) }), children: children }));
    }
}
export default ChatErrorBoundary;
//# sourceMappingURL=ChatErrorBoundary.js.map