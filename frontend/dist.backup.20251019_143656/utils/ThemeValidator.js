/**
 * Валидатор для тем и цветовых схем
 * Обеспечивает безопасность и корректность тем
 */
export class ThemeValidator {
    /**
     * Валидирует цветовую схему
     */
    static validateColorScheme(colors) {
        const errors = [];
        const warnings = [];
        // Проверяем наличие обязательных цветов
        for (const key of this.REQUIRED_COLOR_KEYS) {
            if (!colors[key]) {
                errors.push(`Отсутствует обязательный цвет: ${key}`);
                continue;
            }
            if (!this.isValidColor(colors[key])) {
                errors.push(`Некорректный формат цвета для ${key}: ${colors[key]}`);
            }
        }
        // Проверяем дополнительные цвета
        const additionalColors = Object.entries(colors).filter(([key]) => !this.REQUIRED_COLOR_KEYS.includes(key));
        for (const [key, value] of additionalColors) {
            if (value && !this.isValidColor(value)) {
                warnings.push(`Некорректный формат дополнительного цвета ${key}: ${value}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    /**
     * Валидирует тему сервиса
     */
    static validateServiceTheme(theme) {
        const errors = [];
        const warnings = [];
        // Проверяем обязательные поля
        if (!theme.id) {
            errors.push('Отсутствует ID темы');
        }
        else if (!/^[a-zA-Z0-9-_]+$/.test(theme.id)) {
            errors.push('ID темы содержит недопустимые символы');
        }
        if (!theme.name) {
            errors.push('Отсутствует название темы');
        }
        if (!theme.colors) {
            errors.push('Отсутствует цветовая схема');
        }
        else {
            const colorValidation = this.validateColorScheme(theme.colors);
            errors.push(...colorValidation.errors);
            if (colorValidation.warnings) {
                warnings.push(...colorValidation.warnings);
            }
        }
        // Проверяем CSS переменные
        if (theme.variables) {
            for (const [key, value] of Object.entries(theme.variables)) {
                if (!this.VALID_CSS_VARIABLE_PATTERN.test(key)) {
                    errors.push(`Некорректное имя CSS переменной: ${key}`);
                }
                if (typeof value !== 'string') {
                    errors.push(`CSS переменная ${key} должна быть строкой`);
                }
            }
        }
        // Проверяем анимации
        if (theme.animations) {
            for (const [key, value] of Object.entries(theme.animations)) {
                if (!this.VALID_ANIMATION_PATTERN.test(key)) {
                    errors.push(`Некорректное имя анимации: ${key}`);
                }
                if (typeof value !== 'string') {
                    errors.push(`Анимация ${key} должна быть строкой`);
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    /**
     * Валидирует CSS переменную
     */
    static validateCSSVariable(key, value) {
        const errors = [];
        if (!this.VALID_CSS_VARIABLE_PATTERN.test(key)) {
            errors.push(`Некорректное имя CSS переменной: ${key}`);
        }
        if (typeof value !== 'string') {
            errors.push('Значение CSS переменной должно быть строкой');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Проверяет валидность цвета
     */
    static isValidColor(color) {
        if (typeof color !== 'string') {
            return false;
        }
        // Проверяем по регулярным выражениям
        for (const pattern of this.VALID_COLOR_FORMATS) {
            if (pattern.test(color)) {
                return true;
            }
        }
        // Дополнительная проверка через создание элемента
        try {
            const s = new Option().style;
            s.color = color;
            return s.color !== '';
        }
        catch {
            return false;
        }
    }
    /**
     * Валидирует анимацию
     */
    static validateAnimation(key, value) {
        const errors = [];
        if (!this.VALID_ANIMATION_PATTERN.test(key)) {
            errors.push(`Некорректное имя анимации: ${key}`);
        }
        if (typeof value !== 'string') {
            errors.push('Значение анимации должно быть строкой');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Валидирует конфигурацию темы
     */
    static validateThemeConfig(config) {
        const errors = [];
        if (!config || typeof config !== 'object') {
            errors.push('Конфигурация темы должна быть объектом');
            return { isValid: false, errors };
        }
        const configObj = config;
        if (!configObj.id || typeof configObj.id !== 'string') {
            errors.push('Отсутствует или некорректный ID темы');
        }
        if (!configObj.name || typeof configObj.name !== 'string') {
            errors.push('Отсутствует или некорректное название темы');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
ThemeValidator.VALID_COLOR_FORMATS = [
    /^#[0-9A-Fa-f]{3}$/, // #RGB
    /^#[0-9A-Fa-f]{6}$/, // #RRGGBB
    /^#[0-9A-Fa-f]{8}$/, // #RRGGBBAA
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // rgb(r,g,b)
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // rgba(r,g,b,a)
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // hsl(h,s,l)
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // hsla(h,s,l,a)
    /^var\(--[a-zA-Z0-9-]+\)$/, // CSS переменные
    /^theme\(['"][^'"]+['"]\)$/, // Tailwind theme функции
];
ThemeValidator.REQUIRED_COLOR_KEYS = [
    'primary',
    'secondary',
    'accent',
    'background',
    'text',
    'border'
];
ThemeValidator.VALID_CSS_VARIABLE_PATTERN = /^--[a-zA-Z0-9-]+$/;
ThemeValidator.VALID_ANIMATION_PATTERN = /^[a-zA-Z0-9-]+$/;
//# sourceMappingURL=ThemeValidator.js.map