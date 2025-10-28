/**
 * Модуль настроек внешнего вида
 */

import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';

export class AppearanceSettings implements SettingsModule {
  name = 'appearance';
  category = 'appearance';
  dependencies = ['theme'];

  settings: Record<string, SettingValue> = {
    theme: 'dark',
    animations: true
  };

  validators: Record<string, (value: SettingValue) => boolean> = {
    theme: (value: SettingValue) => {
      return typeof value === 'string' &&
             ['light', 'dark'].includes(value);
    },
    animations: (value: SettingValue) => {
      return typeof value === 'boolean';
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
      theme: 'dark',
      animations: true
    };
  }

  validateSetting(key: string, value: SettingValue): boolean {
    const validator = this.validators[key];
    return validator ? validator(value) : false;
  }

  getAvailableThemes(): string[] {
    return ['light', 'dark'];
  }


  getFontSizeRange(): { min: number; max: number } {
    return { min: 12, max: 24 };
  }

  isThemeSupported(theme: string): boolean {
    return this.getAvailableThemes().includes(theme);
  }

}
