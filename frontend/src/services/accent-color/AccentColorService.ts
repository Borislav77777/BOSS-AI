/**
 * Упрощенный сервис управления цветами акцентов
 * Использует модульную архитектуру для лучшей поддерживаемости
 */

import { AccentColorApplier } from './AccentColorApplier';
import { AccentColorState } from './AccentColorState';
import { AccentColorStorage } from './AccentColorStorage';

export class AccentColorService {
  private static instance: AccentColorService;
  private state: AccentColorState = {
    darkAccentHue: 0,
    lightAccentHue: 0,
    darkBrightness: 50,
    lightBrightness: 50,
    isEnabled: false,
    brightnessOverlay: true
  };

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AccentColorService {
    if (!AccentColorService.instance) {
      AccentColorService.instance = new AccentColorService();
    }
    return AccentColorService.instance;
  }

  // ==================== ГЕТТЕРЫ ====================

  public getDarkAccentHue(): number {
    return this.state.darkAccentHue;
  }

  public getLightAccentHue(): number {
    return this.state.lightAccentHue;
  }

  public getDarkBrightness(): number {
    return this.state.darkBrightness;
  }

  public getLightBrightness(): number {
    return this.state.lightBrightness;
  }

  public getState(): AccentColorState {
    return { ...this.state };
  }

  public getBrightnessOverlay(): boolean {
    return this.state.brightnessOverlay;
  }

  // ==================== СЕТТЕРЫ ====================

  public setDarkAccentHue(hue: number): void {
    this.state.darkAccentHue = Math.max(0, Math.min(360, hue));
    this.saveToStorage();
    this.applyAccentColorsIfCurrentTheme('dark');
  }

  public setLightAccentHue(hue: number): void {
    this.state.lightAccentHue = Math.max(0, Math.min(360, hue));
    this.saveToStorage();
    this.applyAccentColorsIfCurrentTheme('light');
  }

  public setDarkBrightness(brightness: number): void {
    this.state.darkBrightness = Math.max(0, Math.min(100, brightness));
    this.saveToStorage();
    this.applyAccentColorsIfCurrentTheme('dark');
  }

  public setLightBrightness(brightness: number): void {
    this.state.lightBrightness = Math.max(0, Math.min(100, brightness));
    this.saveToStorage();
    this.applyAccentColorsIfCurrentTheme('light');
  }

  public setEnabled(enabled: boolean): void {
    this.state.isEnabled = enabled;
    this.saveToStorage();
    this.applyAccentColors();
  }

  public setBrightnessOverlay(enabled: boolean): void {
    this.state.brightnessOverlay = enabled;
    this.saveToStorage();
    this.applyAccentColors();
  }

  public setAccentColor(color: string): void {
    // Конвертируем HEX в HSL и берем hue
    const hsl = this.hexToHsl(color);
    if (!hsl) return;
    const hue = hsl.h;
    this.state.darkAccentHue = hue;
    this.state.lightAccentHue = hue;
    this.saveToStorage();
    this.applyAccentColors();
  }

  public setDarkContrastAccent(): void {
    this.state.darkAccentHue = 210; // Синий цвет
    this.saveToStorage();
    this.applyAccentColors();
  }

  // ==================== ОСНОВНЫЕ МЕТОДЫ ====================

  /**
   * Применение акцентных цветов к текущей теме
   */
  public applyAccentColors(): void {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');

    // ВСЕГДА сначала очищаем все акценты для предотвращения конфликтов
    AccentColorApplier.resetAccentColors();

    if (!this.state.isEnabled) {
      return;
    }

    if (currentTheme === 'dark') {
      AccentColorApplier.applyDarkAccent(this.state);
    } else if (currentTheme === 'light') {
      AccentColorApplier.applyLightAccent(this.state);
    } else if (currentTheme === 'custom') {
      AccentColorApplier.applyCustomAccent(this.state);
    }
  }

  /**
   * Конвертация HEX в HSL
   */
  public hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Сброс к настройкам по умолчанию
   */
  public reset(): void {
    this.state = {
      darkAccentHue: 0,
      lightAccentHue: 0,
      darkBrightness: 50,
      lightBrightness: 50,
      isEnabled: false,
      brightnessOverlay: true
    };
    this.saveToStorage();
    this.applyAccentColors();
  }

  // ==================== ПРИВАТНЫЕ МЕТОДЫ ====================

  private loadFromStorage(): void {
    const savedState = AccentColorStorage.loadState();
    this.state = { ...this.state, ...savedState };
  }

  private saveToStorage(): void {
    AccentColorStorage.saveState(this.state);
  }

  private applyAccentColorsIfCurrentTheme(theme: string): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === theme) {
      this.applyAccentColors();
    }
  }
}

// Экспортируем синглтон
export const accentColorService = AccentColorService.getInstance();
