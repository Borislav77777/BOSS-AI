import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Улучшенный Error Boundary с детальным логированием и восстановлением
 */
import { ERRORS } from '@/constants/errors';
import { errorLoggingService } from '@/services/ErrorLoggingService';
import { notificationService } from '@/services/NotificationService';
import { Component } from 'react';
import { cn } from '../../utils/cn';
/**
 * Улучшенный Error Boundary с расширенными возможностями
 */
export class EnhancedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.scheduleRetry = () => {
            const { retryDelay = 2000 } = this.props;
            this.setState({ isRetrying: true });
            this.retryTimeout = setTimeout(() => {
                this.handleRetry();
            }, retryDelay);
        };
        this.handleRetry = () => {
            this.setState(prevState => ({
                hasError: false,
                error: undefined,
                errorInfo: undefined,
                retryCount: prevState.retryCount + 1,
                isRetrying: false,
            }));
        };
        this.handleReload = () => {
            window.location.reload();
        };
        this.handleReportError = () => {
            const { error } = this.state;
            if (!error)
                return;
            // Экспортируем ошибки для отправки в поддержку
            const errorData = errorLoggingService.exportErrors();
            // Создаем ссылку для скачивания отчета об ошибках
            const blob = new Blob([errorData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `error-report-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            notificationService.success('Отчет об ошибке', 'Отчет об ошибке сохранен. Отправьте его в службу поддержки.');
        };
        this.state = {
            hasError: false,
            retryCount: 0,
            isRetrying: false,
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        const { errorBoundaryName, onError } = this.props;
        // Логируем ошибку через сервис
        errorLoggingService.logError(error, {
            componentStack: errorInfo.componentStack || '',
            errorBoundary: errorBoundaryName ?? 'Unknown',
        });
        // Показываем уведомление пользователю
        if (this.props.showNotification !== false) {
            notificationService.showErrorBoundaryNotification(error, {
                componentStack: errorInfo.componentStack || '',
                errorBoundary: errorBoundaryName ?? 'Unknown',
            });
        }
        // Сохраняем информацию об ошибке в состоянии
        this.setState({ error, errorInfo });
        // Вызываем пользовательский обработчик ошибки
        onError?.(error, errorInfo);
        // Автоматический retry если включен
        if (this.props.autoRetry && this.state.retryCount < 3) {
            this.scheduleRetry();
        }
    }
    componentWillUnmount() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
    }
    render() {
        const { hasError, error, errorInfo, isRetrying } = this.state;
        const { fallback, className, errorBoundaryName } = this.props;
        if (hasError) {
            // Если есть пользовательский fallback, используем его
            if (fallback) {
                return fallback;
            }
            // Стандартный fallback UI
            return (_jsx("div", { className: cn("min-h-screen flex items-center justify-center p-4", className), children: _jsxs("div", { className: "max-w-lg w-full p-6 rounded-lg border text-center", children: [_jsx("div", { className: "mb-4", children: _jsx("svg", { className: "w-16 h-16 mx-auto mb-4 error-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("h2", { className: "text-xl font-bold mb-2 error-title-text", children: "\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430" }), errorBoundaryName && (_jsxs("p", { className: "text-sm text-text mb-4", children: ["\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442: ", errorBoundaryName] })), _jsx("p", { className: "text-sm mb-4 error-message-text", children: error?.message || ERRORS.MESSAGES.GENERIC }), isRetrying && (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-current" }), _jsx("span", { className: "text-sm", children: "\u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F..." })] }) })), import.meta.env.DEV && error && (_jsxs("details", { className: "mb-4 text-left", children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium mb-2 error-title-text", children: "\u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u0448\u0438\u0431\u043A\u0438 (\u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438)" }), _jsxs("div", { className: "p-3 rounded bg-red-50 border border-red-200 text-xs font-mono overflow-auto max-h-32", children: [_jsxs("div", { className: "mb-2", children: [_jsx("strong", { children: "\u041E\u0448\u0438\u0431\u043A\u0430:" }), " ", error.message] }), error.stack && (_jsxs("div", { className: "mb-2", children: [_jsx("strong", { children: "\u0421\u0442\u0435\u043A:" }), _jsx("pre", { className: "whitespace-pre-wrap", children: error.stack })] })), errorInfo?.componentStack && (_jsxs("div", { children: [_jsx("strong", { children: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442:" }), _jsx("pre", { className: "whitespace-pre-wrap", children: errorInfo.componentStack })] }))] })] })), _jsxs("div", { className: "flex flex-wrap gap-2 justify-center", children: [_jsx("button", { onClick: this.handleRetry, disabled: isRetrying, className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-primary disabled:opacity-50", children: isRetrying ? 'Восстановление...' : 'Попробовать снова' }), _jsx("button", { onClick: this.handleReload, className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-secondary", children: "\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443" }), _jsx("button", { onClick: this.handleReportError, className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-secondary", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043E\u0442\u0447\u0435\u0442" })] })] }) }));
        }
        return this.props.children;
    }
}
export default EnhancedErrorBoundary;
//# sourceMappingURL=EnhancedErrorBoundary.js.map