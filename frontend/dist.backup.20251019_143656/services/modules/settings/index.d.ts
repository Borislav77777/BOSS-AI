/**
 * Settings Service Module
 *
 * Обработчик для сервиса настроек
 * Обрабатывает команды настроек локально
 */
declare const _default: {
    /**
     * Инициализация сервиса
     */
    initialize(): Promise<void>;
    /**
     * Выполнение инструмента сервиса
     */
    execute(toolId: string, params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    } | {
        success: boolean;
        message: string;
        data: {
            action: string;
            currentTheme: string;
            newTheme: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Открытие настроек
     */
    openPreferences(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Переключение темы
     */
    toggleTheme(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            currentTheme: string;
            newTheme: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Открытие настроек внешнего вида
     */
    openAppearance(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Открытие настроек интерфейса
     */
    openInterface(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Открытие настроек чата
     */
    openChatSettings(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Открытие настроек уведомлений
     */
    openNotifications(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            action: string;
            section: string;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Очистка ресурсов
     */
    cleanup(): Promise<void>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map