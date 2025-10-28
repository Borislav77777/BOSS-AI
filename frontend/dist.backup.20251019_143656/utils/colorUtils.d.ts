/**
 * Утилиты для работы с цветами
 */
export interface HSL {
    h: number;
    s: number;
    l: number;
}
export interface RGB {
    r: number;
    g: number;
    b: number;
}
/**
 * Конвертация HEX в HSL
 */
export declare const hexToHsl: (hex: string) => number;
/**
 * Конвертация HSL в HEX
 */
export declare const hslToHex: (h: number, s: number, l: number) => string;
/**
 * Конвертация HSL в RGB
 */
export declare const hslToRgb: (h: number, s: number, l: number) => RGB;
/**
 * Получение полного HSL объекта из HEX
 */
export declare const hexToHslFull: (hex: string) => HSL;
/**
 * Debounce функция для оптимизации производительности
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => ((...args: Parameters<T>) => void);
//# sourceMappingURL=colorUtils.d.ts.map