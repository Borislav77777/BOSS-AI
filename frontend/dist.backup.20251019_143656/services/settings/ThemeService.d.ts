/**
 * Упрощенный сервис управления темами
 * Использует автоматическую генерацию цветов для сокращения кода на 70%
 */
import { ColorScheme } from '@/types/Theme';
export interface ThemeConfig {
    id: string;
    name: string;
    colors: ColorScheme;
    isCustom: boolean;
}
export declare class ThemeService {
    private static instance;
    private themes;
    private currentTheme;
    private constructor();
    static getInstance(): ThemeService;
    /**
     * Упрощенная инициализация стандартных тем
     * Только базовые цвета - остальные генерируются автоматически
     */
    private initializeDefaultThemes;
    /**
     * Создание конфигурации темы с правильной логикой цветов текста
     * Белая тема → черный текст, Темная/Цветная темы → белый текст
     */
    private createThemeConfig;
    /**
     * Получить все доступные темы
     */
    getThemes(): ThemeConfig[];
    /**
     * Получить тему по ID
     */
    getTheme(id: string): ThemeConfig | undefined;
    /**
     * Создать кастомную тему на основе основного цвета
     * Упрощенная версия с автоматической генерацией
     */
    createCustomTheme(primaryColor: string): ThemeConfig;
    /**
     * Применение цветного текста к текущей теме
     */
    applyColoredText(textColor: string): void;
    /**
     * Сброс цветного текста к стандартному для текущей темы
     */
    resetColoredText(): void;
    /**
     * Упрощенное применение темы с плавными переходами
     */
    applyTheme(themeId: string, customColor?: string, useColoredText?: boolean, textColor?: string, accentsEnabled?: boolean, accentColor?: string): void;
    /**
     * Упрощенное применение кастомной темы
     * Использует автоматическую генерацию переменных
     */
    private applyCustomTheme;
    /**
     * Упрощенное применение стандартной темы
     * Очищает кастомные переменные и применяет CSS правила
     */
    private applyStandardTheme;
    /**
     * Получить текущую тему
     */
    getCurrentTheme(): string;
    /**
     * Сбросить кастомную тему
     */
    resetCustomTheme(): void;
}
export declare const themeService: ThemeService;
//# sourceMappingURL=ThemeService.d.ts.map