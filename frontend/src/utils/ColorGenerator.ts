/**
 * Утилиты для автоматической генерации цветов
 * Сокращает необходимость в ручном определении 25+ CSS переменных
 */

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorScheme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
}

export class ColorGenerator {
  /**
   * Конвертация HEX в HSL
   */
  static hexToHsl(hex: string): HSLColor {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
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

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Конвертация HSL в HEX
   */
  static hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (sNorm === 0) {
      r = g = b = lNorm; // achromatic
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      r = hue2rgb(p, q, hNorm + 1/3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Определение яркости цвета (для выбора светлой/темной темы)
   */
  static getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Конвертация HEX в RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Генерация цвета поверхности на основе фона
   */
  static generateSurfaceColor(background: string): string {
    const _hsl = this.hexToHsl(background);
    const isLight = _hsl.l > 50;

    if (isLight) {
      // Для светлых тем - немного темнее
      return this.hslToHex(_hsl.h, _hsl.s, Math.max(_hsl.l - 5, 10));
    } else {
      // Для темных тем - немного светлее
      return this.hslToHex(_hsl.h, _hsl.s, Math.min(_hsl.l + 5, 90));
    }
  }

  /**
   * Генерация цвета границ
   */
  static generateBorderColor(background: string, isLight: boolean): string {
    // const _hsl = this.hexToHsl(background);
    const opacity = isLight ? 0.12 : 0.10;
    const color = isLight ? '0,0,0' : '255,255,255';
    return `rgba(${color}, ${opacity})`;
  }

  /**
   * Генерация цветов кнопок
   */
  static generateButtonColors(primary: string, background: string) {
    const primaryHsl = this.hexToHsl(primary);
    const backgroundHsl = this.hexToHsl(background);
    const isLight = backgroundHsl.l > 50;

    return {
      primary: primary,
      secondary: this.hslToHex(
        primaryHsl.h,
        primaryHsl.s,
        isLight ? Math.min(primaryHsl.l + 20, 90) : Math.max(primaryHsl.l - 20, 10)
      ),
      hover: this.hslToHex(
        primaryHsl.h,
        primaryHsl.s,
        isLight ? Math.max(primaryHsl.l - 10, 20) : Math.min(primaryHsl.l + 10, 80)
      )
    };
  }

  /**
   * Генерация полной цветовой схемы на основе основного цвета
   */
  static generateColorScheme(primaryColor: string): ColorScheme {
    const _hsl = this.hexToHsl(primaryColor);
    const isLight = _hsl.l > 50;

    // Генерируем фон на основе основного цвета
    const background = this.hslToHex(
      _hsl.h,
      Math.min(_hsl.s + 10, 100),
      Math.max(_hsl.l - 40, 5)
    );

    // ТЕКСТ ДОЛЖЕН ИСПОЛЬЗОВАТЬ ПОЛНЫЙ КОНТРАСТ - переключается уже при приближении к белому!
    const isLightForText = _hsl.l > 90;  // Уже при 30% яркости переключаемся на черный текст
    const textColor = isLightForText ? '#111827' : '#e5e7eb';  // Полный контраст для текста
    const textSecondaryColor = isLightForText ? '#6b7280' : '#9ca3af';  // Серые оттенки для вторичного текста

    return {
      primary: primaryColor,
      background,
      surface: this.generateSurfaceColor(background),
      text: textColor,
      textSecondary: textSecondaryColor,
      border: this.generateBorderColor(background, isLight),
      success: '#10b981',
      error: '#ef4444'
    };
  }

  /**
   * Упрощенное создание CSS переменных - только 6 базовых
   */
  static createCustomThemeVariables(primaryColor: string): Record<string, string> {
    const scheme = this.generateColorScheme(primaryColor);
    const _hsl = this.hexToHsl(primaryColor);
    const isLight = _hsl.l > 50;

    return {
      '--primary': scheme.primary,
      '--background': scheme.background,
      '--surface': scheme.surface,
      '--text': scheme.text,                    // Полный контраст (черный 10%/белый 90%)
      '--text-secondary': scheme.textSecondary, // Серые оттенки для вторичного текста
      '--border': scheme.border,

      // Состояния фокуса и выделения - БЕЗ СИНЕГО
      '--focus-ring': primaryColor,
      '--focus-border': primaryColor,
      '--selection-bg': isLight ? '#f3f4f6' : '#374151',
      '--selection-text': scheme.text,          // Используем новый цвет текста
      '--highlight-bg': isLight ? '#f3f4f6' : '#374151',
      '--highlight-text': scheme.text,          // Используем новый цвет текста

      // Градиенты для разделителей
      '--gradient-divider': `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
      '--gradient-divider-light': `linear-gradient(to right, transparent, ${primaryColor}30, transparent)`
    };
  }

  /**
   * Определение контрастного цвета для иконок на основе фона
   * Возвращает белый цвет для темных фонов и темный цвет для светлых фонов
   */
  static getContrastIconColor(backgroundColor: string): string {
    const luminance = this.getLuminance(backgroundColor);

    // Если фон светлый (luminance > 0.5), иконки должны быть темными
    // Если фон темный (luminance <= 0.5), иконки должны быть светлыми
    return luminance > 0.5 ? '#111827' : '#e5e7eb';
  }

  /**
   * Определение контрастного цвета для иконок на основе акцентного цвета
   * Учитывает как акцентный цвет, так и текущую тему
   */
  static getContrastIconColorForAccent(accentColor: string, isDarkTheme: boolean = true): string {
    const accentLuminance = this.getLuminance(accentColor);

    // Для темной темы:
    // - Если акцентный цвет очень светлый (близок к белому), иконки должны быть темными
    // - Иначе используем стандартный светлый цвет для темной темы
    if (isDarkTheme) {
      return accentLuminance > 0.9 ? '#111827' : '#e5e7eb';
    }

    // Для светлой темы:
    // - Если акцентный цвет очень темный (близок к черному), иконки должны быть светлыми
    // - Иначе используем стандартный темный цвет для светлой темы
    return accentLuminance < 0.1 ? '#e5e7eb' : '#111827';
  }

  /**
   * Упрощенная очистка - только 6 базовых переменных
   */
  static getCustomVariablesToRemove(): string[] {
    return [
      '--primary', '--background', '--surface', '--text', '--text-secondary', '--border',
      '--focus-ring', '--focus-border', '--selection-bg', '--selection-text', '--highlight-bg', '--highlight-text',
      '--gradient-divider', '--gradient-divider-light'
    ];
  }
}
