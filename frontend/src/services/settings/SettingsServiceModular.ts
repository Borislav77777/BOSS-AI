/**
 * Модульная версия SettingsService
 */

import { SettingsCategory, SettingValue, UserPreferences } from '@/types';
import { SettingsDefaultsImpl } from './core/SettingsDefaults';
import { SettingsNotificationsImpl } from './core/SettingsNotifications';
import { SettingsPersistenceImpl } from './core/SettingsPersistence';
import { SettingsValidatorImpl } from './core/SettingsValidator';
import { AppearanceSettings } from './modules/AppearanceSettings';
import { BehaviorSettings } from './modules/BehaviorSettings';
import { LayoutSettings } from './modules/LayoutSettings';
import { SettingsState } from './types/SettingsTypes';

export class SettingsServiceModular {
  private static instance: SettingsServiceModular;

  // Модули
  private validator!: SettingsValidatorImpl;
  private persistence!: SettingsPersistenceImpl;
  private defaults!: SettingsDefaultsImpl;
  private notifications!: SettingsNotificationsImpl;

  // Модули настроек
  private appearanceSettings!: AppearanceSettings;
  private behaviorSettings!: BehaviorSettings;
  private layoutSettings!: LayoutSettings;

  // Состояние
  private state!: SettingsState;

  private constructor() {
    this.initializeModules();
    this.initializeState();
    this.loadSettings();
  }

  public static getInstance(): SettingsServiceModular {
    if (!SettingsServiceModular.instance) {
      SettingsServiceModular.instance = new SettingsServiceModular();
    }
    return SettingsServiceModular.instance;
  }

  private initializeModules(): void {
    this.validator = new SettingsValidatorImpl();
    this.persistence = new SettingsPersistenceImpl();
    this.defaults = new SettingsDefaultsImpl();
    this.notifications = new SettingsNotificationsImpl();

    this.appearanceSettings = new AppearanceSettings();
    this.behaviorSettings = new BehaviorSettings();
    this.layoutSettings = new LayoutSettings();
  }

  private initializeState(): void {
    this.state = {
      settings: {},
      version: '1.0.0',
      isLoaded: false
    };
  }

  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await this.persistence.load();
      const defaultSettings = this.defaults.getDefaults();

      this.state.settings = this.defaults.mergeWithDefaults(savedSettings);
      this.state.isLoaded = true;

      await this.persistence.save(this.state.settings);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      this.state.settings = this.defaults.getDefaults();
      this.state.isLoaded = true;
    }
  }

  // Основные методы
  getSetting(key: string): SettingValue {
    return this.state.settings[key];
  }

  async setSetting(key: string, value: SettingValue): Promise<void> {
    if (!this.validator.validate(key, value)) {
      throw new Error(`Недопустимое значение для настройки ${key}`);
    }

    this.state.settings[key] = value;
    await this.persistence.save(this.state.settings);
    this.notifications.notify(key, value);
  }

  getAllSettings(): Record<string, SettingValue> {
    return { ...this.state.settings };
  }

  resetSettings(): void {
    this.state.settings = this.defaults.getDefaults();
    this.persistence.save(this.state.settings);
    this.notifications.notifyAll();
  }

  subscribe(key: string, callback: (value: SettingValue) => void): () => void {
    return this.notifications.subscribe(key, callback);
  }

  getUserPreferences(): UserPreferences {
    return {
      theme: this.getSetting('theme') as 'light' | 'dark',
      sidebarCollapsed: this.getSetting('sidebarCollapsed') as boolean,
      animations: this.getSetting('animations') as boolean,
      sounds: this.getSetting('sounds') as boolean,
      notifications: this.getSetting('notifications') as boolean
    };
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.setSetting(key, value as SettingValue);
    });
  }

  getSettingsCategories(): SettingsCategory[] {
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

  exportSettings(): string {
    return this.persistence.export();
  }

  importSettings(settingsJson: string): boolean {
    const success = this.persistence.import(settingsJson);
    if (success) {
      this.loadSettings();
      this.notifications.notifyAll();
    }
    return success;
  }

  // Методы для работы с модулями
  getAppearanceSettings(): Record<string, SettingValue> {
    return this.appearanceSettings.getAllSettings();
  }

  getBehaviorSettings(): Record<string, SettingValue> {
    return this.behaviorSettings.getAllSettings();
  }

  getLayoutSettings(): Record<string, SettingValue> {
    return this.layoutSettings.getAllSettings();
  }

  // Валидация
  validateSetting(key: string, value: SettingValue): boolean {
    return this.validator.validate(key, value);
  }

  validateAllSettings(): Record<string, boolean> {
    return this.validator.validateAll(this.state.settings);
  }

  getInvalidSettings(): string[] {
    return this.validator.getInvalidSettings(this.state.settings);
  }

  // Персистентность
  async saveSettings(): Promise<void> {
    await this.persistence.save(this.state.settings);
  }

  async loadSettingsFromStorage(): Promise<void> {
    const settings = await this.persistence.load();
    this.state.settings = this.defaults.mergeWithDefaults(settings);
  }

  // Уведомления
  getSubscribersCount(key: string): number {
    return this.notifications.getSubscribersCount(key);
  }

  getAllSubscribersCount(): number {
    return this.notifications.getAllSubscribersCount();
  }

  getSubscribedKeys(): string[] {
    return this.notifications.getSubscribedKeys();
  }

  // Состояние
  isLoaded(): boolean {
    return this.state.isLoaded;
  }

  getVersion(): string {
    return this.state.version;
  }

  getStorageSize(): number {
    return this.persistence.getStorageSize();
  }

  isStorageAvailable(): boolean {
    return this.persistence.isStorageAvailable();
  }
}
