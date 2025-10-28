/**
 * Модульная версия SettingsService
 */
import { SettingsDefaultsImpl } from './core/SettingsDefaults';
import { SettingsNotificationsImpl } from './core/SettingsNotifications';
import { SettingsPersistenceImpl } from './core/SettingsPersistence';
import { SettingsValidatorImpl } from './core/SettingsValidator';
import { AppearanceSettings } from './modules/AppearanceSettings';
import { BehaviorSettings } from './modules/BehaviorSettings';
import { LayoutSettings } from './modules/LayoutSettings';
export class SettingsServiceModular {
    constructor() {
        this.initializeModules();
        this.initializeState();
        this.loadSettings();
    }
    static getInstance() {
        if (!SettingsServiceModular.instance) {
            SettingsServiceModular.instance = new SettingsServiceModular();
        }
        return SettingsServiceModular.instance;
    }
    initializeModules() {
        this.validator = new SettingsValidatorImpl();
        this.persistence = new SettingsPersistenceImpl();
        this.defaults = new SettingsDefaultsImpl();
        this.notifications = new SettingsNotificationsImpl();
        this.appearanceSettings = new AppearanceSettings();
        this.behaviorSettings = new BehaviorSettings();
        this.layoutSettings = new LayoutSettings();
    }
    initializeState() {
        this.state = {
            settings: {},
            version: '1.0.0',
            isLoaded: false
        };
    }
    async loadSettings() {
        try {
            const savedSettings = await this.persistence.load();
            const defaultSettings = this.defaults.getDefaults();
            this.state.settings = this.defaults.mergeWithDefaults(savedSettings);
            this.state.isLoaded = true;
            await this.persistence.save(this.state.settings);
        }
        catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            this.state.settings = this.defaults.getDefaults();
            this.state.isLoaded = true;
        }
    }
    // Основные методы
    getSetting(key) {
        return this.state.settings[key];
    }
    async setSetting(key, value) {
        if (!this.validator.validate(key, value)) {
            throw new Error(`Недопустимое значение для настройки ${key}`);
        }
        this.state.settings[key] = value;
        await this.persistence.save(this.state.settings);
        this.notifications.notify(key, value);
    }
    getAllSettings() {
        return { ...this.state.settings };
    }
    resetSettings() {
        this.state.settings = this.defaults.getDefaults();
        this.persistence.save(this.state.settings);
        this.notifications.notifyAll();
    }
    subscribe(key, callback) {
        return this.notifications.subscribe(key, callback);
    }
    getUserPreferences() {
        return {
            theme: this.getSetting('theme'),
            sidebarCollapsed: this.getSetting('sidebarCollapsed'),
            animations: this.getSetting('animations'),
            sounds: this.getSetting('sounds'),
            notifications: this.getSetting('notifications')
        };
    }
    updateUserPreferences(preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
            this.setSetting(key, value);
        });
    }
    getSettingsCategories() {
        return [
            {
                id: 'appearance',
                name: 'Внешний вид',
                description: 'Настройки темы и отображения',
                icon: 'Palette',
                items: []
            },
            {
                id: 'behavior',
                name: 'Поведение',
                description: 'Настройки звуков, уведомлений и автосохранения',
                icon: 'Settings',
                items: []
            },
            {
                id: 'layout',
                name: 'Макет',
                description: 'Настройки размеров панелей и их видимости',
                icon: 'Layout',
                items: []
            }
        ];
    }
    exportSettings() {
        return this.persistence.export();
    }
    importSettings(settingsJson) {
        const success = this.persistence.import(settingsJson);
        if (success) {
            this.loadSettings();
            this.notifications.notifyAll();
        }
        return success;
    }
    // Методы для работы с модулями
    getAppearanceSettings() {
        return this.appearanceSettings.getAllSettings();
    }
    getBehaviorSettings() {
        return this.behaviorSettings.getAllSettings();
    }
    getLayoutSettings() {
        return this.layoutSettings.getAllSettings();
    }
    // Валидация
    validateSetting(key, value) {
        return this.validator.validate(key, value);
    }
    validateAllSettings() {
        return this.validator.validateAll(this.state.settings);
    }
    getInvalidSettings() {
        return this.validator.getInvalidSettings(this.state.settings);
    }
    // Персистентность
    async saveSettings() {
        await this.persistence.save(this.state.settings);
    }
    async loadSettingsFromStorage() {
        const settings = await this.persistence.load();
        this.state.settings = this.defaults.mergeWithDefaults(settings);
    }
    // Уведомления
    getSubscribersCount(key) {
        return this.notifications.getSubscribersCount(key);
    }
    getAllSubscribersCount() {
        return this.notifications.getAllSubscribersCount();
    }
    getSubscribedKeys() {
        return this.notifications.getSubscribedKeys();
    }
    // Состояние
    isLoaded() {
        return this.state.isLoaded;
    }
    getVersion() {
        return this.state.version;
    }
    getStorageSize() {
        return this.persistence.getStorageSize();
    }
    isStorageAvailable() {
        return this.persistence.isStorageAvailable();
    }
}
//# sourceMappingURL=SettingsServiceModular.js.map