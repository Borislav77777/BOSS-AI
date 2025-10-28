/**
 * Специализированный Error Boundary для настроек
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

interface Props {
    children: ReactNode;
    settingName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}

/**
 * Error Boundary специально для компонентов настроек
 * Предоставляет контекстную информацию об ошибке настройки
 */
export class SettingsErrorBoundary extends Component<Props> {
    private handleError = (error: Error, errorInfo: ErrorInfo) => {
        // Логируем ошибку с контекстом настройки
        console.error(`Settings Error${this.props.settingName ? ` in ${this.props.settingName}` : ''}:`, error, errorInfo);

        // Вызываем пользовательский обработчик
        this.props.onError?.(error, errorInfo);
    };

    render() {
        const { children, settingName, className } = this.props;

        return (
            <EnhancedErrorBoundary
                errorBoundaryName={`Settings${settingName ? `: ${settingName}` : ''}`}
                onError={this.handleError}
                className={cn("settings-error-boundary", className)}
                showNotification={true}
                autoRetry={false} // Настройки не должны автоматически перезагружаться
                fallback={
                    <div className={cn(
                        "p-3 rounded-lg border border-yellow-200 bg-yellow-50",
                        className
                    )}>
                        <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-yellow-400"
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
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Ошибка настройки{settingName ? `: ${settingName}` : ''}
                                </h3>
                                <p className="text-sm text-yellow-600 mt-1">
                                    Не удалось загрузить настройку. Проверьте корректность данных.
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

export default SettingsErrorBoundary;
