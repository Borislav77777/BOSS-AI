/**
 * Упрощенный сервис управления темами
 * Использует автоматическую генерацию цветов для сокращения кода на 70%
 */
import { ColorGenerator } from '@/utils/ColorGenerator';
import { accentColorService } from '../accent-color/AccentColorService';
export class ThemeService {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'dark';
        this.initializeDefaultThemes();
    }
    static getInstance() {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }
    /**
     * Упрощенная инициализация стандартных тем
     * Только базовые цвета - остальные генерируются автоматически
     */
    initializeDefaultThemes() {
        // Светлая тема
        this.themes.set('light', this.createThemeConfig('light', '#111827', '#ffffff', 'Светлая'));
        // Темная тема
        this.themes.set('dark', this.createThemeConfig('dark', '#e5e7eb', '#0a0a0a', 'Темная'));
    }
    /**
     * Создание конфигурации темы с правильной логикой цветов текста
     * Белая тема → черный текст, Темная/Цветная темы → белый текст
     */
    createThemeConfig(id, primary, background, name) {
        const isLight = ColorGenerator.getLuminance(background) > 0.5;
        // Новая логика цветов текста:
        // Белая тема → черный текст, остальные → белый текст
        const textColor = isLight ? '#000000' : '#ffffff';
        return {
            id,
            name,
            colors: {
                primary,
                secondary: ColorGenerator.generateButtonColors(primary, background).secondary,
                accent: ColorGenerator.generateButtonColors(primary, background).secondary,
                background,
                surface: ColorGenerator.generateSurfaceColor(background),
                text: textColor,
                textSecondary: isLight ? '#6b7280' : '#9ca3af',
                border: ColorGenerator.generateBorderColor(background, isLight),
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#10b981'
            },
            isCustom: false
        };
    }
    /**
     * Получить все доступные темы
     */
    getThemes() {
        return Array.from(this.themes.values());
    }
    /**
     * Получить тему по ID
     */
    getTheme(id) {
        return this.themes.get(id);
    }
    /**
     * Создать кастомную тему на основе основного цвета
     * Упрощенная версия с автоматической генерацией
     */
    createCustomTheme(primaryColor) {
        const generatedScheme = ColorGenerator.generateColorScheme(primaryColor);
        // Для цветной темы всегда используем белый текст
        const textColor = '#ffffff';
        const customTheme = {
            id: 'custom',
            name: 'Цветная',
            colors: {
                ...generatedScheme,
                text: textColor, // Принудительно белый текст для цветной темы
                secondary: ColorGenerator.generateButtonColors(primaryColor, generatedScheme.background).secondary,
                accent: ColorGenerator.generateButtonColors(primaryColor, generatedScheme.background).secondary,
                warning: '#f59e0b',
                info: generatedScheme.success
            },
            isCustom: true
        };
        this.themes.set('custom', customTheme);
        return customTheme;
    }
    /**
     * Применение цветного текста к текущей теме
     */
    applyColoredText(textColor) {
        const root = document.documentElement;
        root.style.setProperty('--text', textColor);
        // НЕ перезаписываем --primary, чтобы не влиять на кнопки
        // root.style.setProperty('--primary', textColor);
    }
    /**
     * Сброс цветного текста к стандартному для текущей темы
     */
    resetColoredText() {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme') || 'dark';
        // Получаем стандартный цвет текста для текущей темы
        const theme = this.getTheme(currentTheme);
        if (theme) {
            root.style.setProperty('--text', theme.colors.text);
            // НЕ перезаписываем --primary, чтобы не влиять на кнопки
            // root.style.setProperty('--primary', theme.colors.primary);
        }
    }
    /**
     * Упрощенное применение темы с плавными переходами
     */
    applyTheme(themeId, customColor, useColoredText, textColor, accentsEnabled, accentColor) {
        const root = document.documentElement;
        // Добавляем класс для плавного перехода
        root.classList.add('theme-transitioning');
        // Небольшая задержка для начала перехода
        requestAnimationFrame(() => {
            // Устанавливаем data-theme только если он еще не установлен или отличается
            if (root.getAttribute('data-theme') !== themeId) {
                root.setAttribute('data-theme', themeId);
            }
            if (themeId === 'custom' && customColor) {
                this.applyCustomTheme(customColor);
            }
            else {
                this.applyStandardTheme(themeId);
            }
            // Убираем класс перехода после завершения анимации
            setTimeout(() => {
                root.classList.remove('theme-transitioning');
                // Применяем цветной текст если нужно
                if (useColoredText && textColor) {
                    this.applyColoredText(textColor);
                }
                else {
                    this.resetColoredText();
                }
                // Применяем акцентные цвета после смены темы только если они включены
                if (accentsEnabled && accentColor) {
                    // Устанавливаем акцентный цвет через AccentColorService
                    accentColorService.setAccentColor(accentColor);
                    accentColorService.applyAccentColors();
                }
                else if (accentColorService.getState().isEnabled) {
                    accentColorService.applyAccentColors();
                }
            }, 500); // Длительность должна совпадать с --theme-transition-duration
        });
    }
    /**
     * Упрощенное применение кастомной темы
     * Использует автоматическую генерацию переменных
     */
    applyCustomTheme(primaryColor) {
        const root = document.documentElement;
        const customVariables = ColorGenerator.createCustomThemeVariables(primaryColor);
        // Применяем все сгенерированные переменные
        Object.entries(customVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }
    /**
     * Упрощенное применение стандартной темы
     * Очищает кастомные переменные и применяет CSS правила
     */
    applyStandardTheme(themeId) {
        const root = document.documentElement;
        // Очищаем все кастомные переменные
        const customVariables = ColorGenerator.getCustomVariablesToRemove();
        customVariables.forEach(variable => {
            root.style.removeProperty(variable);
        });
        // Устанавливаем атрибут темы для применения CSS правил
        root.setAttribute('data-theme', themeId);
    }
    /**
     * Получить текущую тему
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    /**
     * Сбросить кастомную тему
     */
    resetCustomTheme() {
        this.themes.delete('custom');
        if (this.currentTheme === 'custom') {
            this.currentTheme = 'dark';
            this.applyTheme('dark');
        }
    }
}
// Экспортируем синглтон
export const themeService = ThemeService.getInstance();
//# sourceMappingURL=ThemeService.js.map