/**
 * Модуль валидации настроек
 */

import { SettingValue } from '@/types';
import { SettingsValidator } from '../types/SettingsTypes';

export class SettingsValidatorImpl implements SettingsValidator {
  private validationRules: Record<string, (value: SettingValue) => boolean> = {};

  constructor() {
    this.initializeValidationRules();
  }

  private initializeValidationRules(): void {
    this.validationRules = {
      // Тема
      'theme': (value: SettingValue) => {
        return typeof value === 'string' &&
               ['light', 'dark', 'auto'].includes(value);
      },



      // Анимации
      'animations': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Звуки
      'sounds': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Уведомления
      'notifications': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Автосохранение
      'autoSave': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Интервал автосохранения
      'autoSaveInterval': (value: SettingValue) => {
        return typeof value === 'number' &&
               value >= 1000 && value <= 60000;
      },

      // Размер чата
      'chatWidth': (value: SettingValue) => {
        return typeof value === 'number' &&
               value >= 250 && value <= 2000;
      },

      // Высота поля ввода чата
      'chatInputHeight': (value: SettingValue) => {
        return typeof value === 'number' &&
               value >= 256 && value <= 800;
      },

      // Ширина сайдбара
      'sidebarWidth': (value: SettingValue) => {
        return typeof value === 'number' &&
               value >= 200 && value <= 600;
      },

      // Свернутый сайдбар
      'sidebarCollapsed': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Видимость чата
      'chatVisible': (value: SettingValue) => {
        return typeof value === 'boolean';
      },

      // Активный сервис
      'activeService': (value: SettingValue) => {
        return typeof value === 'string' || value === null;
      },

      // Активный чат
      'activeChat': (value: SettingValue) => {
        return typeof value === 'object' || value === null;
      }
    };
  }

  validate(key: string, value: SettingValue): boolean {
    const validator = this.validationRules[key];
    if (!validator) {
      console.warn(`Нет валидатора для настройки: ${key}`);
      return true; // Если нет валидатора, считаем значение валидным
    }

    try {
      return validator(value);
    } catch (error) {
      console.error(`Ошибка валидации настройки ${key}:`, error);
      return false;
    }
  }

  getValidationRules(): Record<string, (value: SettingValue) => boolean> {
    return { ...this.validationRules };
  }

  addValidationRule(key: string, validator: (value: SettingValue) => boolean): void {
    this.validationRules[key] = validator;
  }

  removeValidationRule(key: string): void {
    delete this.validationRules[key];
  }

  validateAll(settings: Record<string, SettingValue>): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    Object.entries(settings).forEach(([key, value]) => {
      results[key] = this.validate(key, value);
    });

    return results;
  }

  getInvalidSettings(settings: Record<string, SettingValue>): string[] {
    const invalidSettings: string[] = [];

    Object.entries(settings).forEach(([key, value]) => {
      if (!this.validate(key, value)) {
        invalidSettings.push(key);
      }
    });

    return invalidSettings;
  }
}
