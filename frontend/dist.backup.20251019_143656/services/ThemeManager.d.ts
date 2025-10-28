/**
 * Централизованный менеджер тем
 * Управляет всеми темами, цветовыми схемами и их применением
 */
import { ServiceTheme, ThemeChange, ThemeChangeListener, ThemeManagerConfig, ThemeMetadata } from '@/types/Theme';
export declare class ThemeManager {
    private static instance;
    private state;
    private config;
    private changeQueue;
    private isProcessing;
    private processingTimeout;
    private constructor();
    static getInstance(): ThemeManager;
    /**
     * Инициализация стандартных тем
     */
    private initializeDefaultThemes;
    /**
     * Установка темы
     */
    setTheme(theme: string): void;
    /**
     * Получение текущей темы
     */
    getCurrentTheme(): string;
    /**
     * Регистрация темы сервиса
     */
    registerServiceTheme(serviceId: string, theme: ServiceTheme): void;
    /**
     * Удаление темы сервиса
     */
    unregisterServiceTheme(serviceId: string): void;
    /**
     * Получение темы сервиса
     */
    getServiceTheme(serviceId: string): ServiceTheme | undefined;
    /**
     * Получение всех зарегистрированных тем
     */
    getAllThemes(): ThemeMetadata[];
    /**
     * Применение темы
     */
    private applyTheme;
    /**
     * Применение переменных темы
     */
    private applyThemeVariables;
    /**
     * Батчинг изменений темы
     */
    queueThemeChange(change: ThemeChange): void;
    /**
     * Обработка изменений в батче
     */
    private processChanges;
    /**
     * Группировка изменений
     */
    private groupChanges;
    /**
     * Батчевое применение изменений
     */
    private batchApplyChanges;
    /**
     * Применение отдельного изменения
     */
    private applyThemeChange;
    /**
     * Подписка на изменения темы
     */
    subscribe(listener: ThemeChangeListener): () => void;
    /**
     * Уведомление слушателей
     */
    private notifyListeners;
    /**
     * Обновление конфигурации
     */
    updateConfig(newConfig: Partial<ThemeManagerConfig>): void;
    /**
     * Получение конфигурации
     */
    getConfig(): ThemeManagerConfig;
    /**
     * Сброс к настройкам по умолчанию
     */
    reset(): void;
    /**
     * Получение статистики
     */
    getStats(): {
        currentTheme: string;
        registeredThemes: number;
        pendingChanges: number;
        listeners: number;
        isProcessing: boolean;
    };
}
export declare const themeManager: ThemeManager;
//# sourceMappingURL=ThemeManager.d.ts.map