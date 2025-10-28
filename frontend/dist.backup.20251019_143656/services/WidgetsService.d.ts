/**
 * 🎛️ WIDGETS SERVICE - Система управления виджетами
 *
 * Централизованное управление всеми виджетами платформы
 * Поддержка перемещения, изменения размера и сворачивания
 */
export interface Widget {
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    serviceId?: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    isMinimized: boolean;
    isVisible: boolean;
    isDraggable: boolean;
    isResizable: boolean;
    zIndex: number;
    settings: Record<string, unknown>;
    component: React.ComponentType<any>;
}
export interface WidgetType {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    defaultSize: {
        width: number;
        height: number;
    };
    minSize: {
        width: number;
        height: number;
    };
    maxSize: {
        width: number;
        height: number;
    };
    component: React.ComponentType<any>;
    settings: WidgetSetting[];
}
export interface WidgetSetting {
    id: string;
    name: string;
    type: 'boolean' | 'string' | 'number' | 'select';
    defaultValue: unknown;
    options?: {
        value: string;
        label: string;
    }[];
    description: string;
}
declare class WidgetsService {
    private widgets;
    private widgetTypes;
    private nextZIndex;
    private isEnabled;
    constructor();
    /**
     * Инициализация стандартных виджетов
     */
    private initializeDefaultWidgets;
    /**
     * Регистрация типа виджета
     */
    registerWidgetType(widgetType: WidgetType): void;
    /**
     * Создание виджета
     */
    createWidget(typeId: string, options?: Partial<Widget>): Widget;
    /**
     * Инициализация настроек виджета
     */
    private initializeWidgetSettings;
    /**
     * Получение виджета по ID
     */
    getWidget(widgetId: string): Widget | undefined;
    /**
     * Получение всех виджетов
     */
    getAllWidgets(): Widget[];
    /**
     * Получение видимых виджетов
     */
    getVisibleWidgets(): Widget[];
    /**
     * Получение типов виджетов
     */
    getWidgetTypes(): WidgetType[];
    /**
     * Получение типов виджетов по категории
     */
    getWidgetTypesByCategory(category: string): WidgetType[];
    /**
     * Обновление виджета
     */
    updateWidget(widgetId: string, updates: Partial<Widget>): void;
    /**
     * Перемещение виджета
     */
    moveWidget(widgetId: string, position: {
        x: number;
        y: number;
    }): void;
    /**
     * Изменение размера виджета
     */
    resizeWidget(widgetId: string, size: {
        width: number;
        height: number;
    }): void;
    /**
     * Сворачивание/разворачивание виджета
     */
    toggleMinimize(widgetId: string): void;
    /**
     * Показ/скрытие виджета
     */
    toggleVisibility(widgetId: string): void;
    /**
     * Поднятие виджета на передний план
     */
    bringToFront(widgetId: string): void;
    /**
     * Удаление виджета
     */
    removeWidget(widgetId: string): void;
    /**
     * Очистка всех виджетов
     */
    clearAllWidgets(): void;
    /**
     * Включение/отключение системы виджетов
     */
    setEnabled(enabled: boolean): void;
    /**
     * Проверка, включена ли система виджетов
     */
    isWidgetsEnabled(): boolean;
    /**
     * Экспорт конфигурации виджетов
     */
    exportConfig(): string;
    /**
     * Импорт конфигурации виджетов
     */
    importConfig(config: string): void;
}
export declare const widgetsService: WidgetsService;
export {};
//# sourceMappingURL=WidgetsService.d.ts.map