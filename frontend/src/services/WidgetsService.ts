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
  position: { x: number; y: number };
  size: { width: number; height: number };
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
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  component: React.ComponentType<any>;
  settings: WidgetSetting[];
}

export interface WidgetSetting {
  id: string;
  name: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  defaultValue: unknown;
  options?: { value: string; label: string }[];
  description: string;
}

class WidgetsService {
  private widgets: Map<string, Widget> = new Map();
  private widgetTypes: Map<string, WidgetType> = new Map();
  private nextZIndex = 1000;
  private isEnabled = true;

  constructor() {
    this.initializeDefaultWidgets();
  }

  /**
   * Инициализация стандартных виджетов
   */
  private initializeDefaultWidgets() {
    // Виджет времени
    this.registerWidgetType({
      id: 'time-widget',
      name: 'Часы',
      description: 'Отображает текущее время и дату',
      icon: 'Clock',
      category: 'utility',
      defaultSize: { width: 200, height: 120 },
      minSize: { width: 150, height: 80 },
      maxSize: { width: 300, height: 200 },
      component: () => null, // Будет установлен при регистрации
      settings: [
        {
          id: 'show-seconds',
          name: 'Показывать секунды',
          type: 'boolean',
          defaultValue: true,
          description: 'Отображать секунды в часах'
        },
        {
          id: 'show-date',
          name: 'Показывать дату',
          type: 'boolean',
          defaultValue: true,
          description: 'Отображать дату под временем'
        },
        {
          id: 'format24h',
          name: '24-часовой формат',
          type: 'boolean',
          defaultValue: true,
          description: 'Использовать 24-часовой формат времени'
        }
      ]
    });

    // Виджет голосового ввода
    this.registerWidgetType({
      id: 'voice-widget',
      name: 'Голосовой ввод',
      description: 'Быстрый доступ к голосовому вводу',
      icon: 'Mic',
      category: 'input',
      defaultSize: { width: 180, height: 100 },
      minSize: { width: 120, height: 60 },
      maxSize: { width: 250, height: 150 },
      component: () => null, // Будет установлен при регистрации
      settings: [
        {
          id: 'auto-start',
          name: 'Автозапуск',
          type: 'boolean',
          defaultValue: false,
          description: 'Автоматически начинать запись при открытии'
        },
        {
          id: 'show-transcription',
          name: 'Показывать транскрипцию',
          type: 'boolean',
          defaultValue: true,
          description: 'Отображать транскрибированный текст'
        }
      ]
    });
  }

  /**
   * Регистрация типа виджета
   */
  registerWidgetType(widgetType: WidgetType): void {
    this.widgetTypes.set(widgetType.id, widgetType);
  }

  /**
   * Создание виджета
   */
  createWidget(typeId: string, options: Partial<Widget> = {}): Widget {
    const widgetType = this.widgetTypes.get(typeId);
    if (!widgetType) {
      throw new Error(`Widget type ${typeId} not found`);
    }

    const widget: Widget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: typeId,
      title: widgetType.name,
      description: widgetType.description,
      icon: widgetType.icon,
      serviceId: options.serviceId,
      position: options.position || { x: 100, y: 100 },
      size: options.size || { ...widgetType.defaultSize },
      isMinimized: false,
      isVisible: true,
      isDraggable: true,
      isResizable: true,
      zIndex: this.nextZIndex++,
      settings: this.initializeWidgetSettings(widgetType.settings),
      component: widgetType.component,
      ...options
    };

    this.widgets.set(widget.id, widget);
    return widget;
  }

  /**
   * Инициализация настроек виджета
   */
  private initializeWidgetSettings(settings: WidgetSetting[]): Record<string, unknown> {
    const widgetSettings: Record<string, unknown> = {};
    settings.forEach(setting => {
      widgetSettings[setting.id] = setting.defaultValue;
    });
    return widgetSettings;
  }

  /**
   * Получение виджета по ID
   */
  getWidget(widgetId: string): Widget | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * Получение всех виджетов
   */
  getAllWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Получение видимых виджетов
   */
  getVisibleWidgets(): Widget[] {
    return Array.from(this.widgets.values()).filter(w => w.isVisible);
  }

  /**
   * Получение типов виджетов
   */
  getWidgetTypes(): WidgetType[] {
    return Array.from(this.widgetTypes.values());
  }

  /**
   * Получение типов виджетов по категории
   */
  getWidgetTypesByCategory(category: string): WidgetType[] {
    return Array.from(this.widgetTypes.values()).filter(t => t.category === category);
  }

  /**
   * Обновление виджета
   */
  updateWidget(widgetId: string, updates: Partial<Widget>): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      Object.assign(widget, updates);
    }
  }

  /**
   * Перемещение виджета
   */
  moveWidget(widgetId: string, position: { x: number; y: number }): void {
    this.updateWidget(widgetId, { position });
  }

  /**
   * Изменение размера виджета
   */
  resizeWidget(widgetId: string, size: { width: number; height: number }): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      const widgetType = this.widgetTypes.get(widget.type);
      if (widgetType) {
        // Ограничиваем размеры
        const newSize = {
          width: Math.max(widgetType.minSize.width, Math.min(widgetType.maxSize.width, size.width)),
          height: Math.max(widgetType.minSize.height, Math.min(widgetType.maxSize.height, size.height))
        };
        this.updateWidget(widgetId, { size: newSize });
      }
    }
  }

  /**
   * Сворачивание/разворачивание виджета
   */
  toggleMinimize(widgetId: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      this.updateWidget(widgetId, { isMinimized: !widget.isMinimized });
    }
  }

  /**
   * Показ/скрытие виджета
   */
  toggleVisibility(widgetId: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      this.updateWidget(widgetId, { isVisible: !widget.isVisible });
    }
  }

  /**
   * Поднятие виджета на передний план
   */
  bringToFront(widgetId: string): void {
    this.updateWidget(widgetId, { zIndex: this.nextZIndex++ });
  }

  /**
   * Удаление виджета
   */
  removeWidget(widgetId: string): void {
    this.widgets.delete(widgetId);
  }

  /**
   * Очистка всех виджетов
   */
  clearAllWidgets(): void {
    this.widgets.clear();
  }

  /**
   * Включение/отключение системы виджетов
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Проверка, включена ли система виджетов
   */
  isWidgetsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Экспорт конфигурации виджетов
   */
  exportConfig(): string {
    const config = {
      widgets: Array.from(this.widgets.values()).map(w => ({
        id: w.id,
        type: w.type,
        title: w.title,
        position: w.position,
        size: w.size,
        isMinimized: w.isMinimized,
        isVisible: w.isVisible,
        settings: w.settings
      })),
      widgetTypes: Array.from(this.widgetTypes.values())
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Импорт конфигурации виджетов
   */
  importConfig(config: string): void {
    try {
      const data = JSON.parse(config);

      if (data.widgets) {
        for (const widgetData of data.widgets) {
          const widgetType = this.widgetTypes.get(widgetData.type);
          if (widgetType) {
            this.createWidget(widgetData.type, widgetData);
          }
        }
      }
    } catch (error) {
      console.error('Error importing widgets config:', error);
    }
  }
}

// Создаем единственный экземпляр сервиса
export const widgetsService = new WidgetsService();
