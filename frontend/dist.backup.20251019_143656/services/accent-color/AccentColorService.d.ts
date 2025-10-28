/**
 * Упрощенный сервис управления цветами акцентов
 * Использует модульную архитектуру для лучшей поддерживаемости
 */
import { AccentColorState } from './AccentColorState';
export declare class AccentColorService {
    private static instance;
    private state;
    private constructor();
    static getInstance(): AccentColorService;
    getDarkAccentHue(): number;
    getLightAccentHue(): number;
    getDarkBrightness(): number;
    getLightBrightness(): number;
    getState(): AccentColorState;
    getBrightnessOverlay(): boolean;
    setDarkAccentHue(hue: number): void;
    setLightAccentHue(hue: number): void;
    setDarkBrightness(brightness: number): void;
    setLightBrightness(brightness: number): void;
    setEnabled(enabled: boolean): void;
    setBrightnessOverlay(enabled: boolean): void;
    setAccentColor(color: string): void;
    setDarkContrastAccent(): void;
    /**
     * Применение акцентных цветов к текущей теме
     */
    applyAccentColors(): void;
    /**
     * Конвертация HEX в HSL
     */
    hexToHsl(hex: string): {
        h: number;
        s: number;
        l: number;
    } | null;
    /**
     * Сброс к настройкам по умолчанию
     */
    reset(): void;
    private loadFromStorage;
    private saveToStorage;
    private applyAccentColorsIfCurrentTheme;
}
export declare const accentColorService: AccentColorService;
//# sourceMappingURL=AccentColorService.d.ts.map