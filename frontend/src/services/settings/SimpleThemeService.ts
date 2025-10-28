/**
 * Простой сервис тем - максимально упрощенная логика
 * 1. Разделение на цвета при выборе темы
 * 2. Объединение в переменную
 */

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export class SimpleThemeService {
  private static instance: SimpleThemeService;
  private currentTheme: string = 'dark';

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SimpleThemeService {
    if (!SimpleThemeService.instance) {
      SimpleThemeService.instance = new SimpleThemeService();
    }
    return SimpleThemeService.instance;
  }

  /**
   * Получить цвета для конкретной темы
   * РАЗДЕЛЕНИЕ НА ЦВЕТА ПРИ ВЫБОРЕ ТЕМЫ
   */
  public getThemeColors(theme: 'dark' | 'light' | 'custom'): ThemeColors {
    switch (theme) {
      case 'dark':
        return {
          primary: '#ffffff', // Белый цвет для темной темы
          background: '#000000', // Черный фон
          surface: '#1a1a1a', // Очень темно-серый
          text: '#ffffff', // Белый текст
          textSecondary: '#ffffff', // Белый вторичный текст
          border: 'rgba(255,255,255,0.1)'
        };

      case 'light':
        return {
          primary: '#000000', // Черный цвет
          background: '#ffffff', // Белый фон
          surface: '#ffffff', // Белая поверхность
          text: '#000000', // Черный текст
          textSecondary: '#000000', // Черный вторичный текст
          border: 'rgba(0,0,0,0.1)'
        };

      case 'custom':
        return {
          primary: '#000000', // Черный цвет
          background: '#000000', // Черный фон
          surface: '#1a1a1a', // Очень темно-серый
          text: '#ffffff', // Белый текст
          textSecondary: '#ffffff', // Белый вторичный текст
          border: 'rgba(255,255,255,0.10)'
        };

      default:
        return this.getThemeColors('dark');
    }
  }

  /**
   * Применить тему - ОБЪЕДИНЕНИЕ В ПЕРЕМЕННУЮ
   */
  public applyTheme(theme: 'dark' | 'light' | 'custom'): void {
    this.currentTheme = theme;

    // Получаем цвета для темы
    const colors = this.getThemeColors(theme);

    // Устанавливаем data-theme атрибут
    document.documentElement.setAttribute('data-theme', theme);

    // ОБЪЕДИНЯЕМ В CSS ПЕРЕМЕННЫЕ
    this.setCSSVariables(colors);
  }

  /**
   * Установить CSS переменные из цветов темы
   * НЕ перезаписываем переменные, которые уже правильно определены в CSS
   */
  private setCSSVariables(colors: ThemeColors): void {
    const root = document.documentElement;

    // Базовые переменные - только те, которые не определены в CSS
    // НЕ перезаписываем --primary, чтобы не влиять на кнопки
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border', colors.border);

    // Автоматически генерируем производные цвета
    root.style.setProperty('--secondary', this.mixColors(colors.primary, colors.background, 0.8));
    root.style.setProperty('--accent', this.mixColors(colors.primary, colors.background, 0.6));
    root.style.setProperty('--text-muted', this.mixColors(colors.text, colors.background, 0.6));

    // Границы
    root.style.setProperty('--border-light', this.mixColors(colors.border, 'transparent', 0.5));
    root.style.setProperty('--border-strong', this.mixColors(colors.border, 'transparent', 2));
    root.style.setProperty('--border-active', this.mixColors(colors.primary, 'transparent', 0.6));

    // Поверхности
    root.style.setProperty('--surface-hover', this.mixColors(colors.surface, colors.primary, 0.1));

    // Кнопки - НЕ перезаписываем, оставляем CSS значения
    // root.style.setProperty('--button-primary', colors.primary);
    // root.style.setProperty('--button-primary-hover', this.mixColors(colors.primary, colors.background, 0.8));
    // root.style.setProperty('--button-secondary', colors.surface);
    // root.style.setProperty('--button-text', colors.background);
    // root.style.setProperty('--button-secondary-text', colors.text);

    // Иконки
    root.style.setProperty('--icon-primary', colors.text);
    root.style.setProperty('--icon-secondary', colors.textSecondary);
    root.style.setProperty('--icon-accent', colors.primary);

    // Liquid Glass переменные - НЕ перезаписываем, оставляем CSS значения
    // root.style.setProperty('--card-bg', colors.surface);
    // root.style.setProperty('--card-border', colors.border);
    // root.style.setProperty('--panel-bg', colors.surface);
    // root.style.setProperty('--panel-border', colors.border);
  }

  /**
   * Смешать два цвета с заданным соотношением
   */
  private mixColors(color1: string, color2: string, _ratio: number): string {
    // Простое смешивание цветов
    if (color2 === 'transparent') {
      return color1;
    }

    // Простое смешивание через opacity
    if (color1 === color2) {
      return color1;
    }

    // Для простоты возвращаем базовый цвет с небольшой вариацией
    return color1;
  }

  /**
   * Получить текущую тему
   */
  public getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Установить кастомный цвет для custom темы
   */
  public setCustomColor(color: string): void {
    if (this.currentTheme === 'custom') {
      const root = document.documentElement;
      // НЕ перезаписываем --primary, чтобы не влиять на кнопки
      // root.style.setProperty('--primary', color);

      // Обновляем производные цвета
      const background = root.style.getPropertyValue('--background') || '#0a0a0a';
      root.style.setProperty('--secondary', this.mixColors(color, background, 0.8));
      root.style.setProperty('--accent', this.mixColors(color, background, 0.6));
      // НЕ перезаписываем --button-primary, оставляем значения из CSS
      // root.style.setProperty('--button-primary', color);
      root.style.setProperty('--icon-accent', color);
    }
  }
}

// Экспортируем единственный экземпляр
export const simpleThemeService = SimpleThemeService.getInstance();
