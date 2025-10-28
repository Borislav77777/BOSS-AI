/**
 * Специализированный Error Boundary для рабочего пространства
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

interface Props {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}

/**
 * Error Boundary специально для компонентов рабочего пространства
 * Предоставляет контекстную информацию об ошибке рабочего пространства
 */
export class WorkspaceErrorBoundary extends Component<Props> {
    private handleError = (error: Error, errorInfo: ErrorInfo) => {
        // Логируем ошибку с контекстом рабочего пространства
        console.error('Workspace Error:', error, errorInfo);

        // Вызываем пользовательский обработчик
        this.props.onError?.(error, errorInfo);
    };

    render() {
        const { children, className } = this.props;

        return (
            <EnhancedErrorBoundary
                errorBoundaryName="Workspace"
                onError={this.handleError}
                className={cn("workspace-error-boundary", className)}
                showNotification={true}
                autoRetry={true}
                retryDelay={2500}
                fallback={
                    <div className={cn(
                        "p-4 rounded-lg border border-green-200 bg-green-50",
                        className
                    )}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-green-800">
                                    Ошибка рабочего пространства
                                </h3>
                                <p className="text-sm text-green-600 mt-1">
                                    Не удалось загрузить рабочее пространство. Попытка восстановления...
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

export default WorkspaceErrorBoundary;
