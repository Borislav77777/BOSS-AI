/**
 * Модуль для применения акцентных цветов к темам
 */
import { AccentColorState } from './AccentColorState';
export declare class AccentColorApplier {
    /**
     * Применение акцента для темной темы
     */
    static applyDarkAccent(state: AccentColorState): void;
    /**
     * Применение акцента для светлой темы
     */
    static applyLightAccent(state: AccentColorState): void;
    /**
     * Применение акцента для кастомной темы (без наложения яркости)
     */
    static applyCustomAccent(state: AccentColorState): void;
    /**
     * Сброс акцентных цветов
     */
    static resetAccentColors(): void;
    /**
     * Конвертация HSL в HEX
     */
    private static hslToHex;
}
//# sourceMappingURL=AccentColorApplier.d.ts.map