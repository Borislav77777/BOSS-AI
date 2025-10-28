/**
 * Упрощенный сервис управления цветами акцентов
 * Использует модульную архитектуру для лучшей поддерживаемости
 */
import { AccentColorApplier } from './AccentColorApplier';
import { AccentColorStorage } from './AccentColorStorage';
export class AccentColorService {
    constructor() {
        this.state = {
            darkAccentHue: 0,
            lightAccentHue: 0,
            darkBrightness: 50,
            lightBrightness: 50,
            isEnabled: false,
            brightnessOverlay: true
        };
        this.loadFromStorage();
    }
    static getInstance() {
        if (!AccentColorService.instance) {
            AccentColorService.instance = new AccentColorService();
        }
        return AccentColorService.instance;
    }
    // ==================== ГЕТТЕРЫ ====================
    getDarkAccentHue() {
        return this.state.darkAccentHue;
    }
    getLightAccentHue() {
        return this.state.lightAccentHue;
    }
    getDarkBrightness() {
        return this.state.darkBrightness;
    }
    getLightBrightness() {
        return this.state.lightBrightness;
    }
    getState() {
        return { ...this.state };
    }
    getBrightnessOverlay() {
        return this.state.brightnessOverlay;
    }
    // ==================== СЕТТЕРЫ ====================
    setDarkAccentHue(hue) {
        this.state.darkAccentHue = Math.max(0, Math.min(360, hue));
        this.saveToStorage();
        this.applyAccentColorsIfCurrentTheme('dark');
    }
    setLightAccentHue(hue) {
        this.state.lightAccentHue = Math.max(0, Math.min(360, hue));
        this.saveToStorage();
        this.applyAccentColorsIfCurrentTheme('light');
    }
    setDarkBrightness(brightness) {
        this.state.darkBrightness = Math.max(0, Math.min(100, brightness));
        this.saveToStorage();
        this.applyAccentColorsIfCurrentTheme('dark');
    }
    setLightBrightness(brightness) {
        this.state.lightBrightness = Math.max(0, Math.min(100, brightness));
        this.saveToStorage();
        this.applyAccentColorsIfCurrentTheme('light');
    }
    setEnabled(enabled) {
        this.state.isEnabled = enabled;
        this.saveToStorage();
        this.applyAccentColors();
    }
    setBrightnessOverlay(enabled) {
        this.state.brightnessOverlay = enabled;
        this.saveToStorage();
        this.applyAccentColors();
    }
    setAccentColor(color) {
        // Конвертируем HEX в HSL и берем hue
        const hsl = this.hexToHsl(color);
        if (!hsl)
            return;
        const hue = hsl.h;
        this.state.darkAccentHue = hue;
        this.state.lightAccentHue = hue;
        this.saveToStorage();
        this.applyAccentColors();
    }
    setDarkContrastAccent() {
        this.state.darkAccentHue = 210; // Синий цвет
        this.saveToStorage();
        this.applyAccentColors();
    }
    // ==================== ОСНОВНЫЕ МЕТОДЫ ====================
    /**
     * Применение акцентных цветов к текущей теме
     */
    applyAccentColors() {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        // ВСЕГДА сначала очищаем все акценты для предотвращения конфликтов
        AccentColorApplier.resetAccentColors();
        if (!this.state.isEnabled) {
            return;
        }
        if (currentTheme === 'dark') {
            AccentColorApplier.applyDarkAccent(this.state);
        }
        else if (currentTheme === 'light') {
            AccentColorApplier.applyLightAccent(this.state);
        }
        else if (currentTheme === 'custom') {
            AccentColorApplier.applyCustomAccent(this.state);
        }
    }
    /**
     * Конвертация HEX в HSL
     */
    hexToHsl(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result)
            return null;
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
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
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
    reset() {
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
    loadFromStorage() {
        const savedState = AccentColorStorage.loadState();
        this.state = { ...this.state, ...savedState };
    }
    saveToStorage() {
        AccentColorStorage.saveState(this.state);
    }
    applyAccentColorsIfCurrentTheme(theme) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === theme) {
            this.applyAccentColors();
        }
    }
}
// Экспортируем синглтон
export const accentColorService = AccentColorService.getInstance();
//# sourceMappingURL=AccentColorService.js.map