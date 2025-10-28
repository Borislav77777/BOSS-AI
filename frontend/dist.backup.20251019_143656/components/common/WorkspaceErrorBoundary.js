import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Специализированный Error Boundary для рабочего пространства
 */
import { Component } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
/**
 * Error Boundary специально для компонентов рабочего пространства
 * Предоставляет контекстную информацию об ошибке рабочего пространства
 */
export class WorkspaceErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.handleError = (error, errorInfo) => {
            // Логируем ошибку с контекстом рабочего пространства
            console.error('Workspace Error:', error, errorInfo);
            // Вызываем пользовательский обработчик
            this.props.onError?.(error, errorInfo);
        };
    }
    render() {
        const { children, className } = this.props;
        return (_jsx(EnhancedErrorBoundary, { errorBoundaryName: "Workspace", onError: this.handleError, className: cn("workspace-error-boundary", className), showNotification: true, autoRetry: true, retryDelay: 2500, fallback: _jsx("div", { className: cn("p-4 rounded-lg border border-green-200 bg-green-50", className), children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-green-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-green-800", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0430" }), _jsx("p", { className: "text-sm text-green-600 mt-1", children: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0440\u0430\u0431\u043E\u0447\u0435\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E. \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F..." })] })] }) }), children: children }));
    }
}
export default WorkspaceErrorBoundary;
//# sourceMappingURL=WorkspaceErrorBoundary.js.map