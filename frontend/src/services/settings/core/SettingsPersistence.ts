/**
 * Модуль персистентности настроек
 */

import { SettingValue } from '@/types';
import { SettingsPersistence } from '../types/SettingsTypes';

export class SettingsPersistenceImpl implements SettingsPersistence {
  private static readonly SETTINGS_KEY = 'barsukov-settings';
  private static readonly VERSION_KEY = 'barsukov-settings-version';
  private static readonly CURRENT_VERSION = '1.0.0';

  async load(): Promise<Record<string, SettingValue>> {
    try {
      const savedSettings = localStorage.getItem(SettingsPersistenceImpl.SETTINGS_KEY);
      const savedVersion = localStorage.getItem(SettingsPersistenceImpl.VERSION_KEY);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        // Проверяем версию и выполняем миграцию если нужно
        if (savedVersion !== SettingsPersistenceImpl.CURRENT_VERSION) {
          console.log('Выполняется миграция настроек...');
          const migratedSettings = await this.migrate(parsedSettings, savedVersion);
          await this.save(migratedSettings);
          this.setVersion(SettingsPersistenceImpl.CURRENT_VERSION);
          return migratedSettings;
        }

        return parsedSettings;
      }

      return {};
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      return {};
    }
  }

  async save(settings: Record<string, SettingValue>): Promise<void> {
    try {
      localStorage.setItem(SettingsPersistenceImpl.SETTINGS_KEY, JSON.stringify(settings));
      this.setVersion(SettingsPersistenceImpl.CURRENT_VERSION);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      throw error;
    }
  }

  migrate(settings: Record<string, SettingValue>, oldVersion: string | null): Record<string, SettingValue> {
    const migratedSettings = { ...settings };

    // Миграция с версии без версионирования
    if (!oldVersion) {
      console.log('Миграция с версии без версионирования');

      // Добавляем новые настройки если их нет
      if (!migratedSettings.theme) {
        migratedSettings.theme = 'dark';
      }
      if (!migratedSettings.animations) {
        migratedSettings.animations = true;
      }
      if (!migratedSettings.sounds) {
        migratedSettings.sounds = true;
      }
      if (!migratedSettings.notifications) {
        migratedSettings.notifications = true;
      }
      if (!migratedSettings.autoSave) {
        migratedSettings.autoSave = true;
      }
      if (!migratedSettings.autoSaveInterval) {
        migratedSettings.autoSaveInterval = 5000;
      }
      if (!migratedSettings.chatWidth) {
        migratedSettings.chatWidth = 400;
      }
      if (!migratedSettings.chatInputHeight) {
        migratedSettings.chatInputHeight = 300;
      }
      if (!migratedSettings.sidebarWidth) {
        migratedSettings.sidebarWidth = 280;
      }
      if (!migratedSettings.sidebarCollapsed) {
        migratedSettings.sidebarCollapsed = false;
      }
      if (!migratedSettings.chatVisible) {
        migratedSettings.chatVisible = true;
      }
      if (!migratedSettings.activeService) {
        migratedSettings.activeService = undefined;
      }
      if (!migratedSettings.activeChat) {
        migratedSettings.activeChat = undefined;
      }
    }

    // Миграция с версии 0.9.0
    if (oldVersion === '0.9.0') {
      console.log('Миграция с версии 0.9.0');

      // Переименование настроек
      if (migratedSettings.chatPanelWidth) {
        migratedSettings.chatWidth = migratedSettings.chatPanelWidth;
        delete migratedSettings.chatPanelWidth;
      }

      if (migratedSettings.inputPanelHeight) {
        migratedSettings.chatInputHeight = migratedSettings.inputPanelHeight;
        delete migratedSettings.inputPanelHeight;
      }
    }

    return migratedSettings;
  }

  getVersion(): string {
    return localStorage.getItem(SettingsPersistenceImpl.VERSION_KEY) || '0.0.0';
  }

  setVersion(version: string): void {
    localStorage.setItem(SettingsPersistenceImpl.VERSION_KEY, version);
  }

  clear(): void {
    localStorage.removeItem(SettingsPersistenceImpl.SETTINGS_KEY);
    localStorage.removeItem(SettingsPersistenceImpl.VERSION_KEY);
  }

  export(): string {
    const settings = localStorage.getItem(SettingsPersistenceImpl.SETTINGS_KEY);
    return settings || '{}';
  }

  import(settingsJson: string): boolean {
    try {
      JSON.parse(settingsJson);
      localStorage.setItem(SettingsPersistenceImpl.SETTINGS_KEY, settingsJson);
      return true;
    } catch (error) {
      console.error('Ошибка импорта настроек:', error);
      return false;
    }
  }

  getStorageSize(): number {
    const settings = localStorage.getItem(SettingsPersistenceImpl.SETTINGS_KEY);
    return settings ? settings.length : 0;
  }

  isStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
