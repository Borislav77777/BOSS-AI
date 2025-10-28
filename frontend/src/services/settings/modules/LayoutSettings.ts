/**
 * Модуль настроек макета
 */

import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';

export class LayoutSettings implements SettingsModule {
  name = 'layout';
  category = 'layout';
  dependencies = ['chatWidth', 'sidebarWidth'];

  settings: Record<string, SettingValue> = {
    chatWidth: 400,
    chatInputHeight: 300,
    sidebarWidth: 280,
    sidebarCollapsed: false,
    chatVisible: true
  };

  validators: Record<string, (value: SettingValue) => boolean> = {
    chatWidth: (value: SettingValue) => {
      return typeof value === 'number' &&
             value >= 250 && value <= 2000;
    },
    chatInputHeight: (value: SettingValue) => {
      return typeof value === 'number' &&
             value >= 256 && value <= 800;
    },
    sidebarWidth: (value: SettingValue) => {
      return typeof value === 'number' &&
             value >= 200 && value <= 600;
    },
    sidebarCollapsed: (value: SettingValue) => {
      return typeof value === 'boolean';
    },
    chatVisible: (value: SettingValue) => {
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
      chatWidth: 400,
      chatInputHeight: 300,
      sidebarWidth: 280,
      sidebarCollapsed: false,
      chatVisible: true
    };
  }

  validateSetting(key: string, value: SettingValue): boolean {
    const validator = this.validators[key];
    return validator ? validator(value) : false;
  }

  getChatWidthRange(): { min: number; max: number } {
    return { min: 250, max: 2000 };
  }

  getChatInputHeightRange(): { min: number; max: number } {
    return { min: 200, max: 800 };
  }

  getSidebarWidthRange(): { min: number; max: number } {
    return { min: 200, max: 600 };
  }

  getChatWidth(): number {
    return this.settings.chatWidth as number;
  }

  getChatInputHeight(): number {
    return this.settings.chatInputHeight as number;
  }

  getSidebarWidth(): number {
    return this.settings.sidebarWidth as number;
  }

  isSidebarCollapsed(): boolean {
    return this.settings.sidebarCollapsed as boolean;
  }

  isChatVisible(): boolean {
    return this.settings.chatVisible as boolean;
  }

  toggleSidebarCollapsed(): void {
    this.settings.sidebarCollapsed = !this.settings.sidebarCollapsed;
  }

  toggleChatVisible(): void {
    this.settings.chatVisible = !this.settings.chatVisible;
  }
}
