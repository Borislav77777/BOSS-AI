import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Специализированный Error Boundary для настроек
 */
import { Component } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
/**
 * Error Boundary специально для компонентов настроек
 * Предоставляет контекстную информацию об ошибке настройки
 */
export class SettingsErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.handleError = (error, errorInfo) => {
            // Логируем ошибку с контекстом настройки
            console.error(`Settings Error${this.props.settingName ? ` in ${this.props.settingName}` : ''}:`, error, errorInfo);
            // Вызываем пользовательский обработчик
            this.props.onError?.(error, errorInfo);
        };
    }
    render() {
        const { children, settingName, className } = this.props;
        return (_jsx(EnhancedErrorBoundary, { errorBoundaryName: `Settings${settingName ? `: ${settingName}` : ''}`, onError: this.handleError, className: cn("settings-error-boundary", className), showNotification: true, autoRetry: false, fallback: _jsx("div", { className: cn("p-3 rounded-lg border border-yellow-200 bg-yellow-50", className), children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-4 h-4 text-yellow-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-sm font-medium text-yellow-800", children: ["\u041E\u0448\u0438\u0431\u043A\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", settingName ? `: ${settingName}` : ''] }), _jsx("p", { className: "text-sm text-yellow-600 mt-1", children: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0443. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0445." })] })] }) }), children: children }));
    }
}
export default SettingsErrorBoundary;
//# sourceMappingURL=SettingsErrorBoundary.js.map