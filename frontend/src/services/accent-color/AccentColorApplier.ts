/**
 * Модуль для применения акцентных цветов к темам
 */

import { ColorGenerator } from '../../utils/ColorGenerator';
import { AccentColorState } from './AccentColorState';

export class AccentColorApplier {
  /**
   * Применение акцента для темной темы
   */
  public static applyDarkAccent(state: AccentColorState): void {
    const root = document.documentElement;
    let accentColor: string;

    // Базовый акцент для темной темы — БЕЛЫЙ
    const isDefaultState =
      state.darkAccentHue === 0 && state.lightAccentHue === 0 &&
      state.darkBrightness === 50 && state.lightBrightness === 50;
    if (isDefaultState) {
      accentColor = '#ffffff';
    } else {
      // Цвет из hue (0 = красный, это валидное значение)
      const baseLightness = 50;
      const adjustedLightness = Math.round(baseLightness * (state.darkBrightness / 100));
      accentColor = this.hslToHex(state.darkAccentHue, 100, adjustedLightness);
    }

    // Применяем яркость к фону и поверхностям темной темы только если включено наложение
    if (state.brightnessOverlay) {
      const backgroundBrightness = Math.round(4 * (state.darkBrightness / 100));
      const surfaceBrightness = Math.round(10 * (state.darkBrightness / 100));

      // Всегда обновляем переменные, чтобы изменение яркости было заметно сразу
      root.style.setProperty('--background', `hsl(0, 0%, ${backgroundBrightness}%)`);
      root.style.setProperty('--surface', `hsl(0, 0%, ${surfaceBrightness}%)`);
    } else {
      // Возвращаем стандартные цвета темы (очищаем переопределения)
      root.style.removeProperty('--background');
      root.style.removeProperty('--surface');
    }

    // Определяем контрастный цвет для иконок
    const iconColor = ColorGenerator.getContrastIconColorForAccent(accentColor, true);

    // Устанавливаем переменные акцента
    root.style.setProperty('--accent-color', accentColor, 'important');
    // НЕ перезаписываем --primary, чтобы не влиять на кнопки
    root.style.setProperty('--accent', accentColor, 'important');
    // НЕ перезаписываем --button-primary, оставляем значения из темы
    root.style.setProperty('--focus-ring', accentColor, 'important');

    // Устанавливаем правильные цвета для всех типов иконок в темной теме
    root.style.setProperty('--icon-accent', iconColor, 'important');
    root.style.setProperty('--icon-primary', '#e5e7eb', 'important'); // Светлые иконки для темной темы
    root.style.setProperty('--icon-secondary', '#d1d5db', 'important'); // Светлые вторичные иконки
    root.style.setProperty('--icon-muted', '#9ca3af', 'important'); // Светлые приглушенные иконки

    root.style.setProperty('--border-active', accentColor, 'important');
    root.style.setProperty('--selection-bg', `${accentColor}20`, 'important');

    // Устанавливаем переменные для ползунков
    root.style.setProperty('--slider-active', accentColor, 'important');
    root.style.setProperty('--slider-thumb', accentColor, 'important');
    root.style.setProperty('--indicator-border', accentColor, 'important');
    root.style.setProperty('--indicator-shadow', accentColor, 'important');
    root.style.setProperty('--indicator-bg', '#ffffff', 'important'); // Белый фон для индикаторов в темной теме

    // Добавляем CSS класс
    root.classList.remove('theme-accent-light');
    root.classList.add('theme-accent-dark');
  }

  /**
   * Применение акцента для светлой темы
   */
  public static applyLightAccent(state: AccentColorState): void {
    const root = document.documentElement;
    let accentColor: string;

    // Базовый акцент для светлой темы — ЧЕРНЫЙ
    const isDefaultState =
      state.darkAccentHue === 0 && state.lightAccentHue === 0 &&
      state.darkBrightness === 50 && state.lightBrightness === 50;
    if (isDefaultState) {
      accentColor = '#000000';
    } else {
      // Цвет из hue (0 = красный, это валидное значение)
      const baseLightness = 20;
      const adjustedLightness = Math.round(baseLightness * (state.lightBrightness / 100));
      accentColor = this.hslToHex(state.lightAccentHue, 100, adjustedLightness);
    }

    // Применяем яркость к фону и поверхностям светлой темы только если включено наложение
    if (state.brightnessOverlay) {
      const backgroundBrightness = Math.round(100 - (20 * (state.lightBrightness / 100)));
      const surfaceBrightness = Math.round(98 - (10 * (state.lightBrightness / 100)));

      // Всегда обновляем переменные, чтобы изменение яркости было заметно сразу
      root.style.setProperty('--background', `hsl(0, 0%, ${backgroundBrightness}%)`);
      root.style.setProperty('--surface', `hsl(0, 0%, ${surfaceBrightness}%)`);
    } else {
      // Возвращаем стандартные цвета темы (очищаем переопределения)
      root.style.removeProperty('--background');
      root.style.removeProperty('--surface');
    }

    // Устанавливаем переменные акцента
    root.style.setProperty('--accent-color', accentColor, 'important');
    // НЕ перезаписываем --primary, чтобы не влиять на кнопки
    root.style.setProperty('--accent', accentColor, 'important');
    // НЕ перезаписываем --button-primary, оставляем значения из темы
    root.style.setProperty('--focus-ring', accentColor, 'important');

    // Устанавливаем правильные цвета для всех типов иконок в светлой теме
    root.style.setProperty('--icon-accent', accentColor, 'important');
    root.style.setProperty('--icon-primary', '#111827', 'important'); // Темные иконки для светлой темы
    root.style.setProperty('--icon-secondary', '#6b7280', 'important'); // Темные вторичные иконки
    root.style.setProperty('--icon-muted', '#9ca3af', 'important'); // Темные приглушенные иконки

    root.style.setProperty('--border-active', accentColor, 'important');
    root.style.setProperty('--selection-bg', `${accentColor}20`, 'important');

    // Устанавливаем переменные для ползунков
    root.style.setProperty('--slider-active', accentColor, 'important');
    root.style.setProperty('--slider-thumb', accentColor, 'important');
    root.style.setProperty('--indicator-border', accentColor, 'important');
    root.style.setProperty('--indicator-shadow', accentColor, 'important');

    // Добавляем CSS класс
    root.classList.remove('theme-accent-dark');
    root.classList.add('theme-accent-light');
  }

  /**
   * Применение акцента для кастомной темы (без наложения яркости)
   */
  public static applyCustomAccent(state: AccentColorState): void {
    const root = document.documentElement;
    let accentColor: string;

    // Базовый акцент для цветной (custom) темы — БЕЛЫЙ
    const isDefaultState =
      state.darkAccentHue === 0 && state.lightAccentHue === 0 &&
      state.darkBrightness === 50 && state.lightBrightness === 50;
    if (isDefaultState) {
      accentColor = '#ffffff';
    } else {
      // Кастомный цвет из hue без наложения яркости
      const baseLightness = 50;
      accentColor = this.hslToHex(state.darkAccentHue, 100, baseLightness);
    }

    // НЕ применяем яркость к фону и поверхностям для кастомной темы
    // НЕ удаляем переменные фона и поверхности - они должны остаться от ThemeService
    root.style.removeProperty('--global-brightness');

    // Определяем контрастный цвет для иконок на основе фона кастомной темы
    // Для кастомной темы используем средний уровень контраста
    const iconColor = ColorGenerator.getContrastIconColorForAccent(accentColor, false);

    // Устанавливаем переменные акцента
    root.style.setProperty('--accent-color', accentColor, 'important');
    // НЕ перезаписываем --primary, чтобы не влиять на кнопки
    root.style.setProperty('--accent', accentColor, 'important');
    // НЕ перезаписываем --button-primary, оставляем значения из темы
    root.style.setProperty('--focus-ring', accentColor, 'important');

    // Устанавливаем правильные цвета для всех типов иконок в кастомной теме
    root.style.setProperty('--icon-accent', iconColor, 'important');
    root.style.setProperty('--icon-primary', iconColor, 'important'); // Используем контрастный цвет
    root.style.setProperty('--icon-secondary', iconColor, 'important'); // Используем контрастный цвет
    root.style.setProperty('--icon-muted', iconColor, 'important'); // Используем контрастный цвет

    root.style.setProperty('--border-active', accentColor, 'important');
    root.style.setProperty('--selection-bg', `${accentColor}20`, 'important');

    // Устанавливаем переменные для ползунков
    root.style.setProperty('--slider-active', accentColor, 'important');
    root.style.setProperty('--slider-thumb', accentColor, 'important');
    root.style.setProperty('--indicator-border', accentColor, 'important');
    root.style.setProperty('--indicator-shadow', accentColor, 'important');
    root.style.setProperty('--indicator-bg', '#ffffff', 'important'); // Белый фон для индикаторов в кастомной теме

    // Добавляем CSS класс для кастомной темы
    root.classList.remove('theme-accent-light', 'theme-accent-dark');
    root.classList.add('theme-accent-custom');
  }

  /**
   * Сброс акцентных цветов
   */
  public static resetAccentColors(): void {
    const root = document.documentElement;
    // const currentTheme = root.getAttribute('data-theme'); // Больше не используется

    // Удаляем кастомные переменные акцента
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--button-primary');
    root.style.removeProperty('--focus-ring');
    root.style.removeProperty('--icon-accent');
    root.style.removeProperty('--icon-primary');
    root.style.removeProperty('--icon-secondary');
    root.style.removeProperty('--icon-muted');
    root.style.removeProperty('--border-active');
    root.style.removeProperty('--selection-bg');

    // Удаляем переменные для ползунков
    root.style.removeProperty('--slider-active');
    root.style.removeProperty('--slider-thumb');
    root.style.removeProperty('--indicator-border');
    root.style.removeProperty('--indicator-shadow');

    // НЕ перезаписываем --primary, оставляем значения из CSS тем
    // root.style.setProperty('--primary', ...); // Убираем перезапись
    // currentTheme больше не используется

    // Удаляем CSS классы
    root.classList.remove('theme-accent-dark', 'theme-accent-light', 'theme-accent-custom');
  }

  /**
   * Конвертация HSL в HEX
   */
  private static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1 / 6) {
      r = c; g = x; b = 0;
    } else if (1 / 6 <= h && h < 2 / 6) {
      r = x; g = c; b = 0;
    } else if (2 / 6 <= h && h < 3 / 6) {
      r = 0; g = c; b = x;
    } else if (3 / 6 <= h && h < 4 / 6) {
      r = 0; g = x; b = c;
    } else if (4 / 6 <= h && h < 5 / 6) {
      r = x; g = 0; b = c;
    } else if (5 / 6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
  }
}
