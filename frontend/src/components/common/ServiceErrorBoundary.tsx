/**
 * Специализированный Error Boundary для сервисов
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

interface Props {
    children: ReactNode;
    serviceName: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}

/**
 * Error Boundary специально для сервисов
 * Предоставляет контекстную информацию об ошибке сервиса
 */
export class ServiceErrorBoundary extends Component<Props> {
    private handleError = (error: Error, errorInfo: ErrorInfo) => {
        // Логируем ошибку с контекстом сервиса
        console.error(`Service Error in ${this.props.serviceName}:`, error, errorInfo);

        // Вызываем пользовательский обработчик
        this.props.onError?.(error, errorInfo);
    };

    render() {
        const { children, serviceName, className } = this.props;

        return (
            <EnhancedErrorBoundary
                errorBoundaryName={`Service: ${serviceName}`}
                onError={this.handleError}
                className={cn("service-error-boundary", className)}
                showNotification={true}
                autoRetry={true}
                retryDelay={3000}
                fallback={
                    <div className={cn(
                        "p-4 rounded-lg border border-red-200 bg-red-50",
                        className
                    )}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-red-400"
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
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800">
                                    Ошибка сервиса: {serviceName}
                                </h3>
                                <p className="text-sm text-red-600 mt-1">
                                    Сервис временно недоступен. Попытка восстановления...
                                </p>
                            </div>
                        </div>
                    </div>
                }
            >
                {children}
            </EnhancedErrorBoundary>
        );
    }
}

export default ServiceErrorBoundary;
