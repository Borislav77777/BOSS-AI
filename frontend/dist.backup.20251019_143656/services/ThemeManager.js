/**
 * Централизованный менеджер тем
 * Управляет всеми темами, цветовыми схемами и их применением
 */
import { ThemeValidator } from '@/utils/ThemeValidator';
export class ThemeManager {
    constructor() {
        this.changeQueue = [];
        this.isProcessing = false;
        this.processingTimeout = null;
        this.config = {
            defaultTheme: 'dark',
            enableBatching: true,
            enableValidation: true,
            enableServiceThemes: true,
            batchDelay: 16 // ~60fps
        };
        this.state = {
            currentTheme: this.config.defaultTheme,
            serviceThemes: new Map(),
            isProcessing: false,
            changeQueue: [],
            listeners: new Set()
        };
        this.initializeDefaultThemes();
    }
    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
    /**
     * Инициализация стандартных тем
     */
    initializeDefaultThemes() {
        // Светлая тема
        this.registerServiceTheme('light', {
            id: 'light',
            name: 'Светлая тема',
            description: 'Классическая светлая тема',
            colors: {
                primary: '#000000', // Черный цвет
                secondary: '#f3f4f6',
                accent: '#000000', // Черный акцент
                background: '#ffffff', // Белый фон
                surface: '#ffffff', // Белая поверхность
                text: '#000000', // Черный текст
                textSecondary: '#000000', // Черный вторичный текст
                border: 'rgba(0,0,0,0.12)',
                muted: '#000000', // Черный приглушенный
                destructive: '#ef4444',
                success: '#10b981',
                warning: '#f59e0b',
                info: '#000000' // Черный info
            },
            variables: {
                '--background': '#ffffff',
                '--foreground': '#000000', // Черный foreground
                '--primary': '#000000', // Черный primary
                '--secondary': '#f3f4f6',
                '--muted': '#000000', // Черный muted
                '--border': 'rgba(0,0,0,0.12)'
            }
        });
        // Темная тема
        this.registerServiceTheme('dark', {
            id: 'dark',
            name: 'Темная тема',
            description: 'Современная темная тема',
            colors: {
                primary: '#000000', // Черный цвет
                secondary: '#1a1a1a', // Очень темно-серый
                accent: '#000000', // Черный акцент
                background: '#000000', // Черный фон
                surface: '#1a1a1a', // Очень темно-серый
                text: '#ffffff', // Белый текст
                textSecondary: '#ffffff', // Белый вторичный текст
                border: 'rgba(255,255,255,0.10)',
                muted: '#ffffff', // Белый приглушенный
                destructive: '#ef4444',
                success: '#10b981',
                warning: '#f59e0b',
                info: '#000000' // Черный info
            },
            variables: {
                '--background': '#000000', // Черный фон
                '--foreground': '#ffffff', // Белый foreground
                '--primary': '#ffffff', // Белый primary для темной темы
                '--secondary': '#1a1a1a', // Очень темно-серый secondary
                '--muted': '#ffffff', // Белый muted
                '--border': 'rgba(255,255,255,0.10)'
            }
        });
    }
    /**
     * Установка темы
     */
    setTheme(theme) {
        if (this.state.currentTheme === theme) {
            return;
        }
        this.state.currentTheme = theme;
        this.applyTheme();
        this.notifyListeners();
    }
    /**
     * Получение текущей темы
     */
    getCurrentTheme() {
        return this.state.currentTheme;
    }
    /**
     * Регистрация темы сервиса
     */
    registerServiceTheme(serviceId, theme) {
        if (this.config.enableValidation) {
            const validation = ThemeValidator.validateServiceTheme(theme);
            if (!validation.isValid) {
                console.error(`Ошибка валидации темы сервиса ${serviceId}:`, validation.errors);
                return;
            }
        }
        this.state.serviceThemes.set(serviceId, theme);
    }
    /**
     * Удаление темы сервиса
     */
    unregisterServiceTheme(serviceId) {
        this.state.serviceThemes.delete(serviceId);
    }
    /**
     * Получение темы сервиса
     */
    getServiceTheme(serviceId) {
        if (!serviceId || typeof serviceId !== 'string') {
            console.warn('Invalid serviceId provided to getServiceTheme:', serviceId);
            return undefined;
        }
        return this.state.serviceThemes.get(serviceId);
    }
    /**
     * Получение всех зарегистрированных тем
     */
    getAllThemes() {
        const themes = [];
        // Стандартные темы
        themes.push({
            id: 'light',
            name: 'Светлая',
            type: 'light',
            isDefault: false,
            version: '1.0.0',
            description: 'Классическая светлая тема'
        }, {
            id: 'dark',
            name: 'Темная',
            type: 'dark',
            isDefault: true,
            version: '1.0.0',
            description: 'Современная темная тема'
        });
        // Темы сервисов
        this.state.serviceThemes.forEach((theme, serviceId) => {
            themes.push({
                id: `service-${serviceId}`,
                name: theme.name,
                type: 'service',
                isServiceTheme: true,
                serviceId,
                version: theme.version || '1.0.0',
                author: theme.author,
                description: theme.description
            });
        });
        return themes;
    }
    /**
     * Применение темы
     */
    applyTheme() {
        const root = document.documentElement;
        const theme = this.state.currentTheme;
        // Определяем реальную тему
        const actualTheme = theme;
        // Применяем атрибут темы
        root.setAttribute('data-theme', actualTheme);
        // Применяем переменные темы
        this.applyThemeVariables(actualTheme);
    }
    /**
     * Применение переменных темы
     */
    applyThemeVariables(theme) {
        const root = document.documentElement;
        // Получаем тему
        let themeData;
        if (theme.startsWith('service-')) {
            const serviceId = theme.replace('service-', '');
            themeData = this.state.serviceThemes.get(serviceId);
        }
        else {
            themeData = this.state.serviceThemes.get(theme);
        }
        if (!themeData) {
            console.warn(`Тема ${theme} не найдена`);
            return;
        }
        // Применяем CSS переменные
        if (themeData.variables) {
            Object.entries(themeData.variables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }
        // Применяем цвета
        Object.entries(themeData.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        // Применяем анимации
        if (themeData.animations) {
            Object.entries(themeData.animations).forEach(([key, value]) => {
                root.style.setProperty(`--animation-${key}`, value);
            });
        }
    }
    /**
     * Батчинг изменений темы
     */
    queueThemeChange(change) {
        if (!this.config.enableBatching) {
            this.applyThemeChange(change);
            return;
        }
        this.changeQueue.push(change);
        if (!this.isProcessing) {
            this.processChanges();
        }
    }
    /**
     * Обработка изменений в батче
     */
    processChanges() {
        if (this.isProcessing || this.changeQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        // Группируем изменения
        const groupedChanges = this.groupChanges(this.changeQueue);
        // Применяем изменения
        this.batchApplyChanges(groupedChanges);
        // Очищаем очередь
        this.changeQueue = [];
        this.isProcessing = false;
        // Уведомляем слушателей
        this.notifyListeners();
    }
    /**
     * Группировка изменений
     */
    groupChanges(changes) {
        const grouped = {
            attributes: {},
            variables: {},
            animations: {}
        };
        changes.forEach(change => {
            switch (change.type) {
                case 'theme':
                    grouped.attributes['data-theme'] = change.value;
                    break;
                case 'color':
                case 'variable':
                    grouped.variables[change.key] = change.value;
                    break;
                case 'animation':
                    grouped.animations[change.key] = change.value;
                    break;
            }
        });
        return grouped;
    }
    /**
     * Батчевое применение изменений
     */
    batchApplyChanges(changes) {
        requestAnimationFrame(() => {
            const root = document.documentElement;
            // Применяем атрибуты
            Object.entries(changes.attributes).forEach(([key, value]) => {
                root.setAttribute(key, value);
            });
            // Применяем CSS переменные
            Object.entries(changes.variables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            // Применяем анимации
            Object.entries(changes.animations).forEach(([key, value]) => {
                root.style.setProperty(`--animation-${key}`, value);
            });
        });
    }
    /**
     * Применение отдельного изменения
     */
    applyThemeChange(change) {
        const root = document.documentElement;
        switch (change.type) {
            case 'theme':
                root.setAttribute('data-theme', change.value);
                break;
            case 'color':
            case 'variable':
                root.style.setProperty(change.key, change.value);
                break;
            case 'animation':
                root.style.setProperty(`--animation-${change.key}`, change.value);
                break;
        }
    }
    /**
     * Подписка на изменения темы
     */
    subscribe(listener) {
        this.state.listeners.add(listener);
        return () => {
            this.state.listeners.delete(listener);
        };
    }
    /**
     * Уведомление слушателей
     */
    notifyListeners() {
        const changes = [...this.changeQueue];
        this.state.listeners.forEach(listener => {
            try {
                listener(this.state.currentTheme, changes);
            }
            catch (error) {
                console.error('Ошибка в слушателе темы:', error);
            }
        });
    }
    /**
     * Обновление конфигурации
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Получение конфигурации
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Сброс к настройкам по умолчанию
     */
    reset() {
        this.state.currentTheme = this.config.defaultTheme;
        this.state.serviceThemes.clear();
        this.changeQueue = [];
        this.initializeDefaultThemes();
        this.applyTheme();
    }
    /**
     * Получение статистики
     */
    getStats() {
        return {
            currentTheme: this.state.currentTheme,
            registeredThemes: this.state.serviceThemes.size,
            pendingChanges: this.changeQueue.length,
            listeners: this.state.listeners.size,
            isProcessing: this.state.isProcessing
        };
    }
}
// Экспорт единственного экземпляра
export const themeManager = ThemeManager.getInstance();
//# sourceMappingURL=ThemeManager.js.map