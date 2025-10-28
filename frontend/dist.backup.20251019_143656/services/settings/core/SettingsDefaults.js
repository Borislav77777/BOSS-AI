/**
 * Модуль настроек по умолчанию
 */
export class SettingsDefaultsImpl {
    constructor() {
        this.defaultSettings = {};
        this.initializeDefaults();
    }
    initializeDefaults() {
        this.defaultSettings = {
            // Внешний вид
            theme: 'dark',
            animations: true,
            sounds: true,
            notifications: true,
            // Поведение
            autoSave: true,
            autoSaveInterval: 5000,
            // Макет
            chatWidth: 400,
            chatInputHeight: 300,
            sidebarWidth: 280,
            sidebarCollapsed: false,
            chatVisible: true,
            // Состояние
            activeService: undefined,
            activeChat: undefined
        };
    }
    getDefaults() {
        return { ...this.defaultSettings };
    }
    getCategoryDefaults(category) {
        const categoryDefaults = {
            appearance: {
                theme: this.defaultSettings.theme,
                animations: this.defaultSettings.animations
            },
            behavior: {
                sounds: this.defaultSettings.sounds,
                notifications: this.defaultSettings.notifications,
                autoSave: this.defaultSettings.autoSave,
                autoSaveInterval: this.defaultSettings.autoSaveInterval
            },
            layout: {
                chatWidth: this.defaultSettings.chatWidth,
                chatInputHeight: this.defaultSettings.chatInputHeight,
                sidebarWidth: this.defaultSettings.sidebarWidth,
                sidebarCollapsed: this.defaultSettings.sidebarCollapsed,
                chatVisible: this.defaultSettings.chatVisible
            },
            state: {
                activeService: this.defaultSettings.activeService,
                activeChat: this.defaultSettings.activeChat
            }
        };
        return categoryDefaults[category] || {};
    }
    mergeWithDefaults(settings) {
        return { ...this.defaultSettings, ...settings };
    }
    getDefaultValue(key) {
        return this.defaultSettings[key];
    }
    hasDefault(key) {
        return key in this.defaultSettings;
    }
    addDefault(key, value) {
        this.defaultSettings[key] = value;
    }
    removeDefault(key) {
        delete this.defaultSettings[key];
    }
    resetDefaults() {
        this.initializeDefaults();
    }
    getDefaultKeys() {
        return Object.keys(this.defaultSettings);
    }
    getDefaultKeysByCategory(category) {
        const categoryDefaults = this.getCategoryDefaults(category);
        return Object.keys(categoryDefaults);
    }
}
//# sourceMappingURL=SettingsDefaults.js.map