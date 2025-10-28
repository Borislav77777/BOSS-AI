/**
 * Модуль настроек поведения
 */

import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';

export class BehaviorSettings implements SettingsModule {
  name = 'behavior';
  category = 'behavior';
  dependencies = ['sounds', 'notifications'];

  settings: Record<string, SettingValue> = {
    sounds: true,
    notifications: true,
    autoSave: true,
    autoSaveInterval: 5000
  };

  validators: Record<string, (value: SettingValue) => boolean> = {
    sounds: (value: SettingValue) => {
      return typeof value === 'boolean';
    },
    notifications: (value: SettingValue) => {
      return typeof value === 'boolean';
    },
    autoSave: (value: SettingValue) => {
      return typeof value === 'boolean';
    },
    autoSaveInterval: (value: SettingValue) => {
      return typeof value === 'number' &&
             value >= 1000 && value <= 60000;
    }
  };

  getSetting(key: string): SettingValue | undefined {
    return this.settings[key];
  }

  setSetting(key: string, value: SettingValue): boolean {
    if (this.validators[key] && this.validators[key](value)) {
      this.settings[key] = value;
      return true;
    }
    return false;
  }

  getAllSettings(): Record<string, SettingValue> {
    return { ...this.settings };
  }

  resetSettings(): void {
    this.settings = {
      sounds: true,
      notifications: true,
      autoSave: true,
      autoSaveInterval: 5000
    };
  }

  validateSetting(key: string, value: SettingValue): boolean {
    const validator = this.validators[key];
    return validator ? validator(value) : false;
  }

  getAutoSaveIntervalRange(): { min: number; max: number } {
    return { min: 1000, max: 60000 };
  }

  getAutoSaveIntervalOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1000, label: '1 секунда' },
      { value: 5000, label: '5 секунд' },
      { value: 10000, label: '10 секунд' },
      { value: 30000, label: '30 секунд' },
      { value: 60000, label: '1 минута' }
    ];
  }

  isAutoSaveEnabled(): boolean {
    return this.settings.autoSave as boolean;
  }

  getAutoSaveInterval(): number {
    return this.settings.autoSaveInterval as number;
  }

  areSoundsEnabled(): boolean {
    return this.settings.sounds as boolean;
  }

  areNotificationsEnabled(): boolean {
    return this.settings.notifications as boolean;
  }
}
