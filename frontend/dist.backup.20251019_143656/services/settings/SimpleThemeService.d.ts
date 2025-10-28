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
export declare class SimpleThemeService {
    private static instance;
    private currentTheme;
    private constructor();
    static getInstance(): SimpleThemeService;
    /**
     * Получить цвета для конкретной темы
     * РАЗДЕЛЕНИЕ НА ЦВЕТА ПРИ ВЫБОРЕ ТЕМЫ
     */
    getThemeColors(theme: 'dark' | 'light' | 'custom'): ThemeColors;
    /**
     * Применить тему - ОБЪЕДИНЕНИЕ В ПЕРЕМЕННУЮ
     */
    applyTheme(theme: 'dark' | 'light' | 'custom'): void;
    /**
     * Установить CSS переменные из цветов темы
     * НЕ перезаписываем переменные, которые уже правильно определены в CSS
     */
    private setCSSVariables;
    /**
     * Смешать два цвета с заданным соотношением
     */
    private mixColors;
    /**
     * Получить текущую тему
     */
    getCurrentTheme(): string;
    /**
     * Установить кастомный цвет для custom темы
     */
    setCustomColor(color: string): void;
}
export declare const simpleThemeService: SimpleThemeService;
//# sourceMappingURL=SimpleThemeService.d.ts.map