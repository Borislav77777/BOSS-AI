import { accentColorService } from '../accent-color/AccentColorService';
import { simpleThemeService } from './SimpleThemeService';
export class SettingsService {
    constructor() {
        this.settings = {};
        this.listeners = new Map();
        this.loadSettings();
    }
    static getInstance() {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }
    // Загрузка настроек из localStorage с миграцией
    loadSettings() {
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
            }
            else {
                this.settings = this.getDefaultSettings();
                this.saveSettings();
            }
        }
        catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            this.settings = this.getDefaultSettings();
            this.saveSettings();
        }
    }
    // Миграция настроек при обновлении
    migrateSettings(settings, oldVersion) {
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
    saveSettings() {
        try {
            localStorage.setItem('barsukov-settings', JSON.stringify(this.settings));
        }
        catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }
    // Получение настроек по умолчанию
    getDefaultSettings() {
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
    getSetting(key) {
        return this.settings[key];
    }
    // Валидация значения настройки
    validateSetting(key, value) {
        const validators = {
            theme: (v) => ['dark', 'light', 'custom'].includes(v),
            customColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v),
            accentColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v),
            textColor: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v),
            sidebarWidth: (v) => typeof v === 'number' && v >= 200 && v <= 500,
            chatWidth: (v) => typeof v === 'number' && v >= 250 && v <= 2000,
            chatInputHeight: (v) => typeof v === 'number' && v >= 256 && v <= 1200,
            maxMessages: (v) => typeof v === 'number' && v >= 50 && v <= 1000,
            workspaceLayout: (v) => ['grid', 'list', 'compact'].includes(v),
        };
        const validator = validators[key];
        if (!validator)
            return true; // Если валидатора нет, считаем валидным
        return validator(value);
    }
    // Установка значения настройки с валидацией
    async setSetting(key, value) {
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
            simpleThemeService.applyTheme(theme);
        }
        // Применяем кастомный цвет для custom темы
        if (key === 'customColor' && this.settings.theme === 'custom') {
            const customColor = this.settings.customColor;
            simpleThemeService.setCustomColor(customColor);
        }
        // Применяем настройки яркости через AccentColorService
        if (key === 'brightnessOverlay') {
            accentColorService.setBrightnessOverlay(value);
        }
    }
    // Получение всех настроек
    getAllSettings() {
        return { ...this.settings };
    }
    // Сброс настроек к значениям по умолчанию
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.notifyAllListeners();
    }
    // Подписка на изменения настройки
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        // Возвращаем функцию отписки
        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }
    // Уведомление слушателей
    notifyListeners(key, value) {
        this.listeners.get(key)?.forEach(callback => callback(value));
    }
    // Уведомление всех слушателей
    notifyAllListeners() {
        this.listeners.forEach((callbacks, key) => {
            callbacks.forEach(callback => callback(this.settings[key]));
        });
    }
    // Получение настроек пользователя
    getUserPreferences() {
        return {
            theme: this.getSetting('theme') || 'dark',
            sidebarCollapsed: this.getSetting('sidebarCollapsed') || false,
            notifications: this.getSetting('notifications') || true,
            animations: this.getSetting('animations') || true,
            sounds: this.getSetting('sounds') || true,
        };
    }
    // Обновление настроек пользователя
    updateUserPreferences(preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
            this.setSetting(key, value);
        });
    }
    // Получение категорий настроек
    getSettingsCategories() {
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
                        value: this.getSetting('theme'),
                        onChange: (value) => this.setSetting('theme', value),
                    },
                    {
                        id: 'animations',
                        name: 'Анимации',
                        description: 'Плавно',
                        type: 'boolean',
                        value: this.getSetting('animations'),
                        onChange: (value) => this.setSetting('animations', value),
                    },
                    {
                        id: 'autoSave',
                        name: 'Автосохранение',
                        description: 'Авто',
                        type: 'boolean',
                        value: this.getSetting('autoSave'),
                        onChange: (value) => this.setSetting('autoSave', value),
                    },
                    {
                        id: 'customColor',
                        name: 'Кастомный цвет',
                        description: 'Свой',
                        type: 'color',
                        value: this.getSetting('customColor'),
                        onChange: (value) => this.setSetting('customColor', value),
                    },
                    {
                        id: 'accentsEnabled',
                        name: 'Акцентные цвета',
                        description: 'Акценты',
                        type: 'boolean',
                        value: this.getSetting('accentsEnabled'),
                        onChange: (value) => this.setSetting('accentsEnabled', value),
                    },
                    {
                        id: 'accentColor',
                        name: 'Цвет акцентов',
                        description: 'Цвет',
                        type: 'color',
                        value: this.getSetting('accentColor'),
                        onChange: (value) => this.setSetting('accentColor', value),
                    },
                    {
                        id: 'useColoredText',
                        name: 'Цветной текст',
                        description: 'Цветной',
                        type: 'boolean',
                        value: this.getSetting('useColoredText'),
                        onChange: (value) => this.setSetting('useColoredText', value),
                    },
                    {
                        id: 'textColor',
                        name: 'Цвет текста',
                        description: 'Текст',
                        type: 'color',
                        value: this.getSetting('textColor'),
                        onChange: (value) => this.setSetting('textColor', value),
                    },
                    {
                        id: 'sidebarCollapsed',
                        name: 'Свернутый сайдбар',
                        description: 'Свернуть',
                        type: 'boolean',
                        value: this.getSetting('sidebarCollapsed'),
                        onChange: (value) => this.setSetting('sidebarCollapsed', value),
                    },
                    {
                        id: 'sidebarWidth',
                        name: 'Ширина сайдбара',
                        description: 'Пиксели',
                        type: 'number',
                        value: this.getSetting('sidebarWidth'),
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
                        value: this.getSetting('workspaceLayout'),
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
                        value: this.getSetting('chatWidth'),
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
                        value: this.getSetting('chatInputHeight'),
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
                        value: this.getSetting('showTimestamps'),
                        onChange: (value) => this.setSetting('showTimestamps', value),
                    },
                    {
                        id: 'autoScroll',
                        name: 'Автопрокрутка',
                        description: 'Прокрутка',
                        type: 'boolean',
                        value: this.getSetting('autoScroll'),
                        onChange: (value) => this.setSetting('autoScroll', value),
                    },
                    {
                        id: 'maxMessages',
                        name: 'Максимум сообщений',
                        description: 'Максимум',
                        type: 'number',
                        value: this.getSetting('maxMessages'),
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
                        value: this.getSetting('enableVoice'),
                        onChange: (value) => this.setSetting('enableVoice', value),
                    },
                    {
                        id: 'enableFileUpload',
                        name: 'Загрузка файлов',
                        description: 'Файлы',
                        type: 'boolean',
                        value: this.getSetting('enableFileUpload'),
                        onChange: (value) => this.setSetting('enableFileUpload', value),
                    },
                    {
                        id: 'hideChatFunctionButtons',
                        name: 'Скрыть кнопки функций',
                        description: 'Скрыть кнопки функций в чате',
                        type: 'boolean',
                        value: this.getSetting('hideChatFunctionButtons'),
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
                        value: this.getSetting('notifications'),
                        onChange: (value) => this.setSetting('notifications', value),
                    },
                ],
            },
        ];
    }
    // Экспорт настроек
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }
    // Импорт настроек
    importSettings(settingsJson) {
        try {
            const importedSettings = JSON.parse(settingsJson);
            this.settings = { ...this.getDefaultSettings(), ...importedSettings };
            this.saveSettings();
            this.notifyAllListeners();
            return true;
        }
        catch (error) {
            console.error('Ошибка импорта настроек:', error);
            return false;
        }
    }
}
// Версия настроек для миграции
SettingsService.SETTINGS_VERSION = '1.0.0';
// Экспорт единственного экземпляра
export const settingsService = SettingsService.getInstance();
//# sourceMappingURL=SettingsService.js.map