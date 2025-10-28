/**
 * Специализированный Error Boundary для чата
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
 * Error Boundary специально для компонентов чата
 * Предоставляет контекстную информацию об ошибке чата
 */
export class ChatErrorBoundary extends Component<Props> {
    private handleError = (error: Error, errorInfo: ErrorInfo) => {
        // Логируем ошибку с контекстом чата
        console.error('Chat Error:', error, errorInfo);

        // Вызываем пользовательский обработчик
        this.props.onError?.(error, errorInfo);
    };

    render() {
        const { children, className } = this.props;

        return (
            <EnhancedErrorBoundary
                errorBoundaryName="Chat"
                onError={this.handleError}
                className={cn("chat-error-boundary", className)}
                showNotification={true}
                autoRetry={true}
                retryDelay={2000}
                fallback={
                    <div className={cn(
                        "p-4 rounded-lg border border-black bg-black",
                        className
                    )}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-white">
                                    Ошибка чата
                                </h3>
                                <p className="text-sm text-white mt-1">
                                    Не удалось загрузить чат. Попытка восстановления...
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

export default ChatErrorBoundary;
