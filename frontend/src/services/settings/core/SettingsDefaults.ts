/**
 * Модуль настроек по умолчанию
 */

import { SettingValue } from '@/types';
import { SettingsDefaults } from '../types/SettingsTypes';

export class SettingsDefaultsImpl implements SettingsDefaults {
  private defaultSettings: Record<string, SettingValue> = {};

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
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

  getDefaults(): Record<string, SettingValue> {
    return { ...this.defaultSettings };
  }

  getCategoryDefaults(category: string): Record<string, SettingValue> {
    const categoryDefaults: Record<string, Record<string, SettingValue>> = {
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

  mergeWithDefaults(settings: Record<string, SettingValue>): Record<string, SettingValue> {
    return { ...this.defaultSettings, ...settings };
  }

  getDefaultValue(key: string): SettingValue | undefined {
    return this.defaultSettings[key];
  }

  hasDefault(key: string): boolean {
    return key in this.defaultSettings;
  }

  addDefault(key: string, value: SettingValue): void {
    this.defaultSettings[key] = value;
  }

  removeDefault(key: string): void {
    delete this.defaultSettings[key];
  }

  resetDefaults(): void {
    this.initializeDefaults();
  }

  getDefaultKeys(): string[] {
    return Object.keys(this.defaultSettings);
  }

  getDefaultKeysByCategory(category: string): string[] {
    const categoryDefaults = this.getCategoryDefaults(category);
    return Object.keys(categoryDefaults);
  }
}
