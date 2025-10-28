/**
 * Модуль для работы с localStorage акцентных цветов
 */

import { AccentColorState } from './AccentColorState';

export class AccentColorStorage {
  private static readonly STORAGE_KEYS = {
    DARK_ACCENT_HUE: 'darkAccentHue',
    LIGHT_ACCENT_HUE: 'lightAccentHue',
    DARK_BRIGHTNESS: 'darkBrightness',
    LIGHT_BRIGHTNESS: 'lightBrightness',
    ENABLED: 'accentColorsEnabled',
    BRIGHTNESS_OVERLAY: 'brightnessOverlay'
  } as const;

  /**
   * Загрузка состояния из localStorage
   */
  public static loadState(): Partial<AccentColorState> {
    const state: Partial<AccentColorState> = {};

    try {
      const savedDarkAccent = localStorage.getItem(this.STORAGE_KEYS.DARK_ACCENT_HUE);
      const savedLightAccent = localStorage.getItem(this.STORAGE_KEYS.LIGHT_ACCENT_HUE);
      const savedDarkBrightness = localStorage.getItem(this.STORAGE_KEYS.DARK_BRIGHTNESS);
      const savedLightBrightness = localStorage.getItem(this.STORAGE_KEYS.LIGHT_BRIGHTNESS);
      const savedEnabled = localStorage.getItem(this.STORAGE_KEYS.ENABLED);
      const savedBrightnessOverlay = localStorage.getItem(this.STORAGE_KEYS.BRIGHTNESS_OVERLAY);

      if (savedDarkAccent) {
        state.darkAccentHue = parseInt(savedDarkAccent);
      }
      if (savedLightAccent) {
        state.lightAccentHue = parseInt(savedLightAccent);
      }
      if (savedDarkBrightness) {
        state.darkBrightness = parseInt(savedDarkBrightness);
      }
      if (savedLightBrightness) {
        state.lightBrightness = parseInt(savedLightBrightness);
      }
      if (savedEnabled !== null) {
        state.isEnabled = savedEnabled === 'true';
      }
      if (savedBrightnessOverlay !== null) {
        state.brightnessOverlay = savedBrightnessOverlay === 'true';
      }
    } catch (error) {
      console.warn('Failed to load accent colors from localStorage:', error);
    }

    return state;
  }

  /**
   * Сохранение состояния в localStorage
   */
  public static saveState(state: AccentColorState): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.DARK_ACCENT_HUE, state.darkAccentHue.toString());
      localStorage.setItem(this.STORAGE_KEYS.LIGHT_ACCENT_HUE, state.lightAccentHue.toString());
      localStorage.setItem(this.STORAGE_KEYS.DARK_BRIGHTNESS, state.darkBrightness.toString());
      localStorage.setItem(this.STORAGE_KEYS.LIGHT_BRIGHTNESS, state.lightBrightness.toString());
      localStorage.setItem(this.STORAGE_KEYS.ENABLED, state.isEnabled.toString());
      localStorage.setItem(this.STORAGE_KEYS.BRIGHTNESS_OVERLAY, state.brightnessOverlay.toString());
    } catch (error) {
      console.warn('Failed to save accent colors to localStorage:', error);
    }
  }
}
