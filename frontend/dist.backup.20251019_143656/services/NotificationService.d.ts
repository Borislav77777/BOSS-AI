/**
 * Сервис для показа уведомлений пользователю
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    actions?: NotificationAction[];
    metadata?: Record<string, any>;
}
export interface NotificationAction {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}
declare class NotificationService {
    private notifications;
    private listeners;
    private nextId;
    /**
     * Показывает уведомление
     */
    show(type: NotificationType, title: string, message: string, options?: {
        duration?: number;
        actions?: NotificationAction[];
        metadata?: Record<string, any>;
    }): string;
    /**
     * Показывает уведомление об успехе
     */
    success(title: string, message: string, options?: Partial<Notification>): string;
    /**
     * Показывает уведомление об ошибке
     */
    error(title: string, message: string, options?: Partial<Notification>): string;
    /**
     * Показывает предупреждение
     */
    warning(title: string, message: string, options?: Partial<Notification>): string;
    /**
     * Показывает информационное уведомление
     */
    info(title: string, message: string, options?: Partial<Notification>): string;
    /**
     * Скрывает уведомление
     */
    hide(id: string): void;
    /**
     * Скрывает все уведомления
     */
    hideAll(): void;
    /**
     * Получает все активные уведомления
     */
    getNotifications(): Notification[];
    /**
     * Подписывается на изменения уведомлений
     */
    subscribe(listener: (notifications: Notification[]) => void): () => void;
    /**
     * Показывает уведомление об ошибке из Error Boundary
     */
    showErrorBoundaryNotification(error: Error, errorInfo?: {
        componentStack?: string;
        errorBoundary?: string;
    }): string;
    private getDefaultDuration;
    private determineErrorType;
    private getErrorTitle;
    private getErrorMessage;
    private showErrorDetails;
    private notifyListeners;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=NotificationService.d.ts.map