import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Специализированный Error Boundary для сервисов
 */
import { Component } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
/**
 * Error Boundary специально для сервисов
 * Предоставляет контекстную информацию об ошибке сервиса
 */
export class ServiceErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.handleError = (error, errorInfo) => {
            // Логируем ошибку с контекстом сервиса
            console.error(`Service Error in ${this.props.serviceName}:`, error, errorInfo);
            // Вызываем пользовательский обработчик
            this.props.onError?.(error, errorInfo);
        };
    }
    render() {
        const { children, serviceName, className } = this.props;
        return (_jsx(EnhancedErrorBoundary, { errorBoundaryName: `Service: ${serviceName}`, onError: this.handleError, className: cn("service-error-boundary", className), showNotification: true, autoRetry: true, retryDelay: 3000, fallback: _jsx("div", { className: cn("p-4 rounded-lg border border-red-200 bg-red-50", className), children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-sm font-medium text-red-800", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0438\u0441\u0430: ", serviceName] }), _jsx("p", { className: "text-sm text-red-600 mt-1", children: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F..." })] })] }) }), children: children }));
    }
}
export default ServiceErrorBoundary;
//# sourceMappingURL=ServiceErrorBoundary.js.map