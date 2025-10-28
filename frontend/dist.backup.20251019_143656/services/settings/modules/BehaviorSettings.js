/**
 * Модуль настроек поведения
 */
export class BehaviorSettings {
    constructor() {
        this.name = 'behavior';
        this.category = 'behavior';
        this.dependencies = ['sounds', 'notifications'];
        this.settings = {
            sounds: true,
            notifications: true,
            autoSave: true,
            autoSaveInterval: 5000
        };
        this.validators = {
            sounds: (value) => {
                return typeof value === 'boolean';
            },
            notifications: (value) => {
                return typeof value === 'boolean';
            },
            autoSave: (value) => {
                return typeof value === 'boolean';
            },
            autoSaveInterval: (value) => {
                return typeof value === 'number' &&
                    value >= 1000 && value <= 60000;
            }
        };
    }
    getSetting(key) {
        return this.settings[key];
    }
    setSetting(key, value) {
        if (this.validators[key] && this.validators[key](value)) {
            this.settings[key] = value;
            return true;
        }
        return false;
    }
    getAllSettings() {
        return { ...this.settings };
    }
    resetSettings() {
        this.settings = {
            sounds: true,
            notifications: true,
            autoSave: true,
            autoSaveInterval: 5000
        };
    }
    validateSetting(key, value) {
        const validator = this.validators[key];
        return validator ? validator(value) : false;
    }
    getAutoSaveIntervalRange() {
        return { min: 1000, max: 60000 };
    }
    getAutoSaveIntervalOptions() {
        return [
            { value: 1000, label: '1 секунда' },
            { value: 5000, label: '5 секунд' },
            { value: 10000, label: '10 секунд' },
            { value: 30000, label: '30 секунд' },
            { value: 60000, label: '1 минута' }
        ];
    }
    isAutoSaveEnabled() {
        return this.settings.autoSave;
    }
    getAutoSaveInterval() {
        return this.settings.autoSaveInterval;
    }
    areSoundsEnabled() {
        return this.settings.sounds;
    }
    areNotificationsEnabled() {
        return this.settings.notifications;
    }
}
//# sourceMappingURL=BehaviorSettings.js.map