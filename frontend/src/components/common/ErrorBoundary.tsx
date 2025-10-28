import { ErrorContext, errorHandlingService } from '@/services/ErrorHandlingService';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Глобальный Error Boundary для обработки ошибок React
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Создаем контекст ошибки
        const context: ErrorContext = {
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

    render(): ReactNode {
        if (this.state.hasError) {
            // Показываем пользовательский fallback или стандартный
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-boundary__container">
                        <div className="error-boundary__icon">⚠️</div>
                        <h2 className="error-boundary__title">Что-то пошло не так</h2>
                        <p className="error-boundary__message">
                            Произошла ошибка в приложении. Мы уже работаем над её исправлением.
                        </p>
                        <div className="error-boundary__actions">
                            <button
                                className="error-boundary__button error-boundary__button--primary"
                                onClick={() => window.location.reload()}
                            >
                                Перезагрузить страницу
                            </button>
                            <button
                                className="error-boundary__button error-boundary__button--secondary"
                                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                            >
                                Попробовать снова
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="error-boundary__details">
                                <summary>Детали ошибки (только для разработки)</summary>
                                <pre className="error-boundary__stack">
                                    {this.state.error.stack}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="error-boundary__component-stack">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC для оборачивания компонентов в Error Boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

/**
 * Хук для обработки ошибок в функциональных компонентах
 */
export function useErrorHandler() {
    const handleError = React.useCallback((error: Error, context?: ErrorContext) => {
        errorHandlingService.handleError(error, context);
    }, []);

    const handleAsyncError = React.useCallback((error: Error, context?: ErrorContext) => {
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
