/**
 * Валидатор для тем и цветовых схем
 * Обеспечивает безопасность и корректность тем
 */
import { ColorScheme, ServiceTheme, ValidationResult } from '@/types/Theme';
export declare class ThemeValidator {
    private static readonly VALID_COLOR_FORMATS;
    private static readonly REQUIRED_COLOR_KEYS;
    private static readonly VALID_CSS_VARIABLE_PATTERN;
    private static readonly VALID_ANIMATION_PATTERN;
    /**
     * Валидирует цветовую схему
     */
    static validateColorScheme(colors: ColorScheme): ValidationResult;
    /**
     * Валидирует тему сервиса
     */
    static validateServiceTheme(theme: ServiceTheme): ValidationResult;
    /**
     * Валидирует CSS переменную
     */
    static validateCSSVariable(key: string, value: string): ValidationResult;
    /**
     * Проверяет валидность цвета
     */
    private static isValidColor;
    /**
     * Валидирует анимацию
     */
    static validateAnimation(key: string, value: string): ValidationResult;
    /**
     * Валидирует конфигурацию темы
     */
    static validateThemeConfig(config: unknown): ValidationResult;
}
//# sourceMappingURL=ThemeValidator.d.ts.map