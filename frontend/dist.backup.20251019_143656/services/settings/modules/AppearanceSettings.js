/**
 * Модуль настроек внешнего вида
 */
export class AppearanceSettings {
    constructor() {
        this.name = 'appearance';
        this.category = 'appearance';
        this.dependencies = ['theme'];
        this.settings = {
            theme: 'dark',
            animations: true
        };
        this.validators = {
            theme: (value) => {
                return typeof value === 'string' &&
                    ['light', 'dark'].includes(value);
            },
            animations: (value) => {
                return typeof value === 'boolean';
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
            theme: 'dark',
            animations: true
        };
    }
    validateSetting(key, value) {
        const validator = this.validators[key];
        return validator ? validator(value) : false;
    }
    getAvailableThemes() {
        return ['light', 'dark'];
    }
    getFontSizeRange() {
        return { min: 12, max: 24 };
    }
    isThemeSupported(theme) {
        return this.getAvailableThemes().includes(theme);
    }
}
//# sourceMappingURL=AppearanceSettings.js.map