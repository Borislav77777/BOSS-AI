/**
 * Модуль валидации настроек
 */
export class SettingsValidatorImpl {
    constructor() {
        this.validationRules = {};
        this.initializeValidationRules();
    }
    initializeValidationRules() {
        this.validationRules = {
            // Тема
            'theme': (value) => {
                return typeof value === 'string' &&
                    ['light', 'dark', 'auto'].includes(value);
            },
            // Анимации
            'animations': (value) => {
                return typeof value === 'boolean';
            },
            // Звуки
            'sounds': (value) => {
                return typeof value === 'boolean';
            },
            // Уведомления
            'notifications': (value) => {
                return typeof value === 'boolean';
            },
            // Автосохранение
            'autoSave': (value) => {
                return typeof value === 'boolean';
            },
            // Интервал автосохранения
            'autoSaveInterval': (value) => {
                return typeof value === 'number' &&
                    value >= 1000 && value <= 60000;
            },
            // Размер чата
            'chatWidth': (value) => {
                return typeof value === 'number' &&
                    value >= 250 && value <= 2000;
            },
            // Высота поля ввода чата
            'chatInputHeight': (value) => {
                return typeof value === 'number' &&
                    value >= 256 && value <= 800;
            },
            // Ширина сайдбара
            'sidebarWidth': (value) => {
                return typeof value === 'number' &&
                    value >= 200 && value <= 600;
            },
            // Свернутый сайдбар
            'sidebarCollapsed': (value) => {
                return typeof value === 'boolean';
            },
            // Видимость чата
            'chatVisible': (value) => {
                return typeof value === 'boolean';
            },
            // Активный сервис
            'activeService': (value) => {
                return typeof value === 'string' || value === null;
            },
            // Активный чат
            'activeChat': (value) => {
                return typeof value === 'object' || value === null;
            }
        };
    }
    validate(key, value) {
        const validator = this.validationRules[key];
        if (!validator) {
            console.warn(`Нет валидатора для настройки: ${key}`);
            return true; // Если нет валидатора, считаем значение валидным
        }
        try {
            return validator(value);
        }
        catch (error) {
            console.error(`Ошибка валидации настройки ${key}:`, error);
            return false;
        }
    }
    getValidationRules() {
        return { ...this.validationRules };
    }
    addValidationRule(key, validator) {
        this.validationRules[key] = validator;
    }
    removeValidationRule(key) {
        delete this.validationRules[key];
    }
    validateAll(settings) {
        const results = {};
        Object.entries(settings).forEach(([key, value]) => {
            results[key] = this.validate(key, value);
        });
        return results;
    }
    getInvalidSettings(settings) {
        const invalidSettings = [];
        Object.entries(settings).forEach(([key, value]) => {
            if (!this.validate(key, value)) {
                invalidSettings.push(key);
            }
        });
        return invalidSettings;
    }
}
//# sourceMappingURL=SettingsValidator.js.map