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
export declare class ColorGenerator {
    /**
     * Конвертация HEX в HSL
     */
    static hexToHsl(hex: string): HSLColor;
    /**
     * Конвертация HSL в HEX
     */
    static hslToHex(h: number, s: number, l: number): string;
    /**
     * Определение яркости цвета (для выбора светлой/темной темы)
     */
    static getLuminance(hex: string): number;
    /**
     * Конвертация HEX в RGB
     */
    static hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    } | null;
    /**
     * Генерация цвета поверхности на основе фона
     */
    static generateSurfaceColor(background: string): string;
    /**
     * Генерация цвета границ
     */
    static generateBorderColor(background: string, isLight: boolean): string;
    /**
     * Генерация цветов кнопок
     */
    static generateButtonColors(primary: string, background: string): {
        primary: string;
        secondary: string;
        hover: string;
    };
    /**
     * Генерация полной цветовой схемы на основе основного цвета
     */
    static generateColorScheme(primaryColor: string): ColorScheme;
    /**
     * Упрощенное создание CSS переменных - только 6 базовых
     */
    static createCustomThemeVariables(primaryColor: string): Record<string, string>;
    /**
     * Определение контрастного цвета для иконок на основе фона
     * Возвращает белый цвет для темных фонов и темный цвет для светлых фонов
     */
    static getContrastIconColor(backgroundColor: string): string;
    /**
     * Определение контрастного цвета для иконок на основе акцентного цвета
     * Учитывает как акцентный цвет, так и текущую тему
     */
    static getContrastIconColorForAccent(accentColor: string, isDarkTheme?: boolean): string;
    /**
     * Упрощенная очистка - только 6 базовых переменных
     */
    static getCustomVariablesToRemove(): string[];
}
//# sourceMappingURL=ColorGenerator.d.ts.map