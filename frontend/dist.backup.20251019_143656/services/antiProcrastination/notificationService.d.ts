/**
 * Сервис уведомлений для Anti-Procrastination OS
 */
declare class NotificationService {
    private permissionGranted;
    constructor();
    /**
     * Проверка разрешения на уведомления
     */
    checkPermission(): Promise<boolean>;
    /**
     * Отправка уведомления
     */
    send(title: string, options?: NotificationOptions): Promise<Notification | null>;
    /**
     * Уведомление о начале блока
     */
    notifyBlockStart(blockTitle: string, duration: number): void;
    /**
     * Уведомление о завершении блока
     */
    notifyBlockComplete(blockTitle: string, actualDuration?: number): void;
    /**
     * Уведомление о перерыве
     */
    notifyBreak(duration: number): void;
    /**
     * Уведомление о мотивации
     */
    notifyMotivation(message: string): void;
    /**
     * Уведомление о достижении
     */
    notifyAchievement(title: string, description: string): void;
    /**
     * Воспроизведение звука
     */
    private playSound;
    /**
     * Отображение toast уведомления
     */
    showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number): void;
    /**
     * Получение цвета toast по типу
     */
    private getToastColor;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map