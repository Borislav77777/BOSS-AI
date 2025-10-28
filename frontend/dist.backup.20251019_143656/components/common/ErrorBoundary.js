import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { errorHandlingService } from '@/services/ErrorHandlingService';
import React, { Component } from 'react';
/**
 * Глобальный Error Boundary для обработки ошибок React
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        // Создаем контекст ошибки
        const context = {
            component: 'ErrorBoundary',
            action: 'componentDidCatch',
            metadata: {
                componentStack: errorInfo.componentStack,
                errorBoundary: true
            }
        };
        // Обрабатываем ошибку через централизованный сервис
        errorHandlingService.handleError(error, context);
        // Обновляем состояние
        this.setState({
            error,
            errorInfo
        });
        // Вызываем пользовательский обработчик
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Показываем пользовательский fallback или стандартный
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "error-boundary", children: _jsxs("div", { className: "error-boundary__container", children: [_jsx("div", { className: "error-boundary__icon", children: "\u26A0\uFE0F" }), _jsx("h2", { className: "error-boundary__title", children: "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A" }), _jsx("p", { className: "error-boundary__message", children: "\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438. \u041C\u044B \u0443\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u043C \u043D\u0430\u0434 \u0435\u0451 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C." }), _jsxs("div", { className: "error-boundary__actions", children: [_jsx("button", { className: "error-boundary__button error-boundary__button--primary", onClick: () => window.location.reload(), children: "\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443" }), _jsx("button", { className: "error-boundary__button error-boundary__button--secondary", onClick: () => this.setState({ hasError: false, error: undefined, errorInfo: undefined }), children: "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430" })] }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("details", { className: "error-boundary__details", children: [_jsx("summary", { children: "\u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u0448\u0438\u0431\u043A\u0438 (\u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438)" }), _jsx("pre", { className: "error-boundary__stack", children: this.state.error.stack }), this.state.errorInfo && (_jsx("pre", { className: "error-boundary__component-stack", children: this.state.errorInfo.componentStack }))] }))] }) }));
        }
        return this.props.children;
    }
}
/**
 * HOC для оборачивания компонентов в Error Boundary
 */
export function withErrorBoundary(Component, fallback, onError) {
    const WrappedComponent = (props) => (_jsx(ErrorBoundary, { fallback: fallback, onError: onError, children: _jsx(Component, { ...props }) }));
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
/**
 * Хук для обработки ошибок в функциональных компонентах
 */
export function useErrorHandler() {
    const handleError = React.useCallback((error, context) => {
        errorHandlingService.handleError(error, context);
    }, []);
    const handleAsyncError = React.useCallback((error, context) => {
        errorHandlingService.handleError(error, {
            ...context,
            action: 'async'
        });
    }, []);
    return {
        handleError,
        handleAsyncError
    };
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map