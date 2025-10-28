import { SettingsCategory, SettingValue, UserPreferences } from '@/types';
import { accentColorService } from '../accent-color/AccentColorService';
import { simpleThemeService } from './SimpleThemeService';

export class SettingsService {
  private static instance: SettingsService;
  private settings: Record<string, SettingValue> = {};
  private listeners: Map<string, Set<(value: unknown) => void>> = new Map();

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // Версия настроек для миграции
  private static readonly SETTINGS_VERSION = '1.0.0';

  // Загрузка настроек из localStorage с миграцией
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('barsukov-settings');
      const savedVersion = localStorage.getItem('barsukov-settings-version');

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        // Проверяем версию и выполняем миграцию если нужно
        if (savedVersion !== SettingsService.SETTINGS_VERSION) {
          console.log('Выполняется миграция настроек...');
          this.migrateSettings(parsedSettings, savedVersion);
        }

        // Объединяем сохраненные настройки с настройками по умолчанию
        // чтобы новые настройки всегда были доступны
        this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
        this.saveSettings();
      } else {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      this.settings = this.getDefaultSettings();
      this.saveSettings();
    }
  }

  // Миграция настроек при обновлении
  private migrateSettings(settings: Record<string, SettingValue>, oldVersion: string | null): void {
    // Миграция с версии без версионирования
    if (!oldVersion) {
      // Добавляем новые настройки если их нет
      const defaultSettings = this.getDefaultSettings();
      Object.keys(defaultSettings).forEach(key => {
        if (!(key in settings)) {
          settings[key] = defaultSettings[key];
        }
      });
    }

    // Сохраняем новую версию
    localStorage.setItem('barsukov-settings-version', SettingsService.SETTINGS_VERSION);
  }

  // Сохранение настроек в localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('barsukov-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  }

  // Получение настроек по умолчанию
  private getDefaultSettings(): Record<string, SettingValue> {
    return {
      // Базовые темы
      theme: 'dark',
      customColor: '#000000', // Только для custom темы

      // Акценты
      accentsEnabled: false, // Включены ли акцентные цвета
      accentColor: '#000000', // Цвет акцентов (если включены)

      // Настройки текста
      useColoredText: false, // Использовать цветной текст
      textColor: '#000000', // Цвет текста (если включен)

      // Общие настройки
      sidebarCollapsed: false,
      sidebarWidth: 280,
      notifications: true,
      animations: true,
      chatWidth: 350,
      chatInputHeight: 300, // Минимум 200px
      workspaceLayout: 'grid',
      autoSave: true,
      showTimestamps: true,
      enableVoice: true,
      enableFileUpload: true,
      maxMessages: 100,
      autoScroll: true,
      brightnessOverlay: true, // Наложение яркости на индикаторы кастомной темы
      hideChatFunctionButtons: false, // Скрыть кнопки функций в чате
    };
  }

  // Получение значения настройки
  public getSetting(key: string): SettingValue {
    return this.settings[key];
  }

  // Валидация значения настройки
  private validateSetting(key: string, value: SettingValue): boolean {
    const validators: Record<string, (value: SettingValue) => boolean> = {
      theme: (v) => ['dark', 'light', 'custom'].includes(v as string),
      customColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v as string),
      accentColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v as string),
      textColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v as string),
      sidebarWidth: (v) => typeof v === 'number' && v >= 200 && v <= 500,
      chatWidth: (v) => typeof v === 'number' && v >= 250 && v <= 2000,
      chatInputHeight: (v) => typeof v === 'number' && v >= 256 && v <= 1200,
      maxMessages: (v) => typeof v === 'number' && v >= 50 && v <= 1000,
      workspaceLayout: (v) => ['grid', 'list', 'compact'].includes(v as string),
    };

    const validator = validators[key];
    if (!validator) return true; // Если валидатора нет, считаем валидным

    return validator(value);
  }

  // Установка значения настройки с валидацией
  public async setSetting(key: string, value: SettingValue): Promise<void> {
    // Валидируем значение
    if (!this.validateSetting(key, value)) {
      throw new Error(`Некорректное значение для настройки ${key}: ${value}`);
    }

    this.settings[key] = value;
    this.saveSettings();
    this.notifyListeners(key, value);

    // ПРОСТАЯ логика применения темы
    if (key === 'theme') {
      const theme = this.settings.theme || 'dark';

      // 1. РАЗДЕЛЕНИЕ НА ЦВЕТА ПРИ ВЫБОРЕ ТЕМЫ
      // 2. ОБЪЕДИНЕНИЕ В ПЕРЕМЕННУЮ
      simpleThemeService.applyTheme(theme as 'dark' | 'light' | 'custom');
    }

    // Применяем кастомный цвет для custom темы
    if (key === 'customColor' && this.settings.theme === 'custom') {
      const customColor = this.settings.customColor as string;
      simpleThemeService.setCustomColor(customColor);
    }

    // Применяем настройки яркости через AccentColorService
    if (key === 'brightnessOverlay') {
      accentColorService.setBrightnessOverlay(value as boolean);
    }

  }

  // Получение всех настроек
  public getAllSettings(): Record<string, SettingValue> {
    return { ...this.settings };
  }

  // Сброс настроек к значениям по умолчанию
  public resetSettings(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.notifyAllListeners();
  }

  // Подписка на изменения настройки
  public subscribe(key: string, callback: (value: SettingValue) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback as (value: unknown) => void);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(key)?.delete(callback as (value: unknown) => void);
    };
  }

  // Уведомление слушателей
  private notifyListeners(key: string, value: SettingValue): void {
    this.listeners.get(key)?.forEach(callback => callback(value));
  }

  // Уведомление всех слушателей
  private notifyAllListeners(): void {
    this.listeners.forEach((callbacks, key) => {
      callbacks.forEach(callback => callback(this.settings[key]));
    });
  }

  // Получение настроек пользователя
  public getUserPreferences(): UserPreferences {
    return {
      theme: (this.getSetting('theme') as 'light' | 'dark') || 'dark',
      sidebarCollapsed: (this.getSetting('sidebarCollapsed') as boolean) || false,
      notifications: (this.getSetting('notifications') as boolean) || true,
      animations: (this.getSetting('animations') as boolean) || true,
      sounds: (this.getSetting('sounds') as boolean) || true,
    };
  }

  // Обновление настроек пользователя
  public updateUserPreferences(preferences: Partial<UserPreferences>): void {
    Object.entries(preferences).forEach(([key, value]: [string, SettingValue]) => {
      this.setSetting(key, value);
    });
  }

  // Получение категорий настроек
  public getSettingsCategories(): SettingsCategory[] {
    return [
      {
        id: 'appearance',
        name: 'Внешний вид',
        description: 'Тема и шрифты',
        icon: 'appearance',
        items: [
          {
            id: 'theme',
            name: 'Тема',
            description: 'Схема',
            type: 'theme-buttons',
            value: this.getSetting('theme') as SettingValue,
            onChange: (value) => this.setSetting('theme', value),
          },
          {
            id: 'animations',
            name: 'Анимации',
            description: 'Плавно',
            type: 'boolean',
            value: this.getSetting('animations') as SettingValue,
            onChange: (value) => this.setSetting('animations', value),
          },
          {
            id: 'autoSave',
            name: 'Автосохранение',
            description: 'Авто',
            type: 'boolean',
            value: this.getSetting('autoSave') as SettingValue,
            onChange: (value) => this.setSetting('autoSave', value),
          },
          {
            id: 'customColor',
            name: 'Кастомный цвет',
            description: 'Свой',
            type: 'color',
            value: this.getSetting('customColor') as SettingValue,
            onChange: (value) => this.setSetting('customColor', value),
          },
          {
            id: 'accentsEnabled',
            name: 'Акцентные цвета',
            description: 'Акценты',
            type: 'boolean',
            value: this.getSetting('accentsEnabled') as SettingValue,
            onChange: (value) => this.setSetting('accentsEnabled', value),
          },
          {
            id: 'accentColor',
            name: 'Цвет акцентов',
            description: 'Цвет',
            type: 'color',
            value: this.getSetting('accentColor') as SettingValue,
            onChange: (value) => this.setSetting('accentColor', value),
          },
          {
            id: 'useColoredText',
            name: 'Цветной текст',
            description: 'Цветной',
            type: 'boolean',
            value: this.getSetting('useColoredText') as SettingValue,
            onChange: (value) => this.setSetting('useColoredText', value),
          },
          {
            id: 'textColor',
            name: 'Цвет текста',
            description: 'Текст',
            type: 'color',
            value: this.getSetting('textColor') as SettingValue,
            onChange: (value) => this.setSetting('textColor', value),
          },
          {
            id: 'sidebarCollapsed',
            name: 'Свернутый сайдбар',
            description: 'Свернуть',
            type: 'boolean',
            value: this.getSetting('sidebarCollapsed') as SettingValue,
            onChange: (value) => this.setSetting('sidebarCollapsed', value),
          },
          {
            id: 'sidebarWidth',
            name: 'Ширина сайдбара',
            description: 'Пиксели',
            type: 'number',
            value: this.getSetting('sidebarWidth') as SettingValue,
            min: 256,
            max: 500,
            step: 10,
            onChange: (value) => this.setSetting('sidebarWidth', value),
          },
          {
            id: 'workspaceLayout',
            name: 'Макет рабочего пространства',
            description: 'Макет',
            type: 'select',
            value: this.getSetting('workspaceLayout') as SettingValue,
            options: [
              { label: 'Сетка', value: 'grid' },
              { label: 'Список', value: 'list' },
              { label: 'Компактный', value: 'compact' },
            ],
            onChange: (value) => this.setSetting('workspaceLayout', value),
          },
        ],
      },
      {
        id: 'chat',
        name: 'Чат',
        description: 'Чат',
        icon: 'chat',
        items: [
          {
            id: 'chatWidth',
            name: 'Ширина чата',
            description: 'Пиксели',
            type: 'number',
            value: this.getSetting('chatWidth') as SettingValue,
            min: 250,
            max: 2000,
            step: 10,
            onChange: (value) => this.setSetting('chatWidth', value),
          },
          {
            id: 'chatInputHeight',
            name: 'Высота поля ввода',
            description: 'Пиксели',
            type: 'number',
            value: this.getSetting('chatInputHeight') as SettingValue,
            min: 256,
            max: 1200,
            step: 10,
            onChange: (value) => this.setSetting('chatInputHeight', value),
          },
          {
            id: 'showTimestamps',
            name: 'Показывать время',
            description: 'Время',
            type: 'boolean',
            value: this.getSetting('showTimestamps') as SettingValue,
            onChange: (value) => this.setSetting('showTimestamps', value),
          },
          {
            id: 'autoScroll',
            name: 'Автопрокрутка',
            description: 'Прокрутка',
            type: 'boolean',
            value: this.getSetting('autoScroll') as SettingValue,
            onChange: (value) => this.setSetting('autoScroll', value),
          },
          {
            id: 'maxMessages',
            name: 'Максимум сообщений',
            description: 'Максимум',
            type: 'number',
            value: this.getSetting('maxMessages') as SettingValue,
            min: 50,
            max: 1000,
            step: 50,
            onChange: (value) => this.setSetting('maxMessages', value),
          },
          {
            id: 'enableVoice',
            name: 'Голосовые сообщения',
            description: 'Голос',
            type: 'boolean',
            value: this.getSetting('enableVoice') as SettingValue,
            onChange: (value) => this.setSetting('enableVoice', value),
          },
          {
            id: 'enableFileUpload',
            name: 'Загрузка файлов',
            description: 'Файлы',
            type: 'boolean',
            value: this.getSetting('enableFileUpload') as SettingValue,
            onChange: (value) => this.setSetting('enableFileUpload', value),
          },
          {
            id: 'hideChatFunctionButtons',
            name: 'Скрыть кнопки функций',
            description: 'Скрыть кнопки функций в чате',
            type: 'boolean',
            value: this.getSetting('hideChatFunctionButtons') as SettingValue,
            onChange: (value) => this.setSetting('hideChatFunctionButtons', value),
          },
        ],
      },
      {
        id: 'notifications',
        name: 'Уведомления',
        description: 'Уведомления',
        icon: 'notifications',
        items: [
          {
            id: 'notifications',
            name: 'Уведомления',
            description: 'Включить',
            type: 'boolean',
            value: this.getSetting('notifications') as SettingValue,
            onChange: (value) => this.setSetting('notifications', value),
          },
        ],
      },
    ];
  }

  // Экспорт настроек
  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Импорт настроек
  public importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.settings = { ...this.getDefaultSettings(), ...importedSettings };
      this.saveSettings();
      this.notifyAllListeners();
      return true;
    } catch (error) {
      console.error('Ошибка импорта настроек:', error);
      return false;
    }
  }

}

// Экспорт единственного экземпляра
export const settingsService = SettingsService.getInstance();
