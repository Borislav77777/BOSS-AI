/**
 * Улучшенный Error Boundary с детальным логированием и восстановлением
 */

import { ERRORS } from '@/constants/errors';
import { errorLoggingService } from '@/services/ErrorLoggingService';
import { notificationService } from '@/services/NotificationService';
import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
    errorBoundaryName?: string;
    showNotification?: boolean;
    autoRetry?: boolean;
    retryDelay?: number;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    retryCount: number;
    isRetrying: boolean;
}

/**
 * Улучшенный Error Boundary с расширенными возможностями
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
    private retryTimeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            retryCount: 0,
            isRetrying: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

    private scheduleRetry = () => {
        const { retryDelay = 2000 } = this.props;

        this.setState({ isRetrying: true });

        this.retryTimeout = setTimeout(() => {
            this.handleRetry();
        }, retryDelay);
    };

    private handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            retryCount: prevState.retryCount + 1,
            isRetrying: false,
        }));
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleReportError = () => {
        const { error } = this.state;
        if (!error) return;

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

        notificationService.success(
            'Отчет об ошибке',
            'Отчет об ошибке сохранен. Отправьте его в службу поддержки.'
        );
    };

    render() {
        const { hasError, error, errorInfo, isRetrying } = this.state;
        const { fallback, className, errorBoundaryName } = this.props;

        if (hasError) {
            // Если есть пользовательский fallback, используем его
            if (fallback) {
                return fallback;
            }

            // Стандартный fallback UI
            return (
                <div className={cn(
                    "min-h-screen flex items-center justify-center p-4",
                    className
                )}>
                    <div className="max-w-lg w-full p-6 rounded-lg border text-center">
                        <div className="mb-4">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 error-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold mb-2 error-title-text">
                            Произошла ошибка
                        </h2>

                        {errorBoundaryName && (
                            <p className="text-sm text-text mb-4">
                                Компонент: {errorBoundaryName}
                            </p>
                        )}

                        <p className="text-sm mb-4 error-message-text">
                            {error?.message || ERRORS.MESSAGES.GENERIC}
                        </p>

                        {isRetrying && (
                            <div className="mb-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    <span className="text-sm">Попытка восстановления...</span>
                                </div>
                            </div>
                        )}

                        {/* Показываем детали ошибки только в development режиме */}
                        {import.meta.env.DEV && error && (
                            <details className="mb-4 text-left">
                                <summary className="cursor-pointer text-sm font-medium mb-2 error-title-text">
                                    Детали ошибки (только для разработки)
                                </summary>
                                <div className="p-3 rounded bg-red-50 border border-red-200 text-xs font-mono overflow-auto max-h-32">
                                    <div className="mb-2">
                                        <strong>Ошибка:</strong> {error.message}
                                    </div>
                                    {error.stack && (
                                        <div className="mb-2">
                                            <strong>Стек:</strong>
                                            <pre className="whitespace-pre-wrap">{error.stack}</pre>
                                        </div>
                                    )}
                                    {errorInfo?.componentStack && (
                                        <div>
                                            <strong>Компонент:</strong>
                                            <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={this.handleRetry}
                                disabled={isRetrying}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-primary disabled:opacity-50"
                            >
                                {isRetrying ? 'Восстановление...' : 'Попробовать снова'}
                            </button>

                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-secondary"
                            >
                                Перезагрузить страницу
                            </button>

                            <button
                                onClick={this.handleReportError}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 error-button-secondary"
                            >
                                Сохранить отчет
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default EnhancedErrorBoundary;
