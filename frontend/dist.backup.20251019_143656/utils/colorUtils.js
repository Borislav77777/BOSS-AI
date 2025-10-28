/**
 * Утилиты для работы с цветами
 */
/**
 * Конвертация HEX в HSL
 */
export const hexToHsl = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h = 0;
    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff) % 6;
        }
        else if (max === g) {
            h = (b - r) / diff + 2;
        }
        else {
            h = (r - g) / diff + 4;
        }
    }
    h = Math.round(h * 60);
    if (h < 0)
        h += 360;
    return h;
};
/**
 * Конвертация HSL в HEX
 */
export const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
    }
    else if (1 / 6 <= h && h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
    }
    else if (2 / 6 <= h && h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
    }
    else if (3 / 6 <= h && h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
    }
    else if (4 / 6 <= h && h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
    }
    else if (5 / 6 <= h && h < 1) {
        r = c;
        g = 0;
        b = x;
    }
    const toHex = (n) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
/**
 * Конвертация HSL в RGB
 */
export const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
    }
    else if (1 / 6 <= h && h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
    }
    else if (2 / 6 <= h && h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
    }
    else if (3 / 6 <= h && h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
    }
    else if (4 / 6 <= h && h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
    }
    else if (5 / 6 <= h && h < 1) {
        r = c;
        g = 0;
        b = x;
    }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
};
/**
 * Получение полного HSL объекта из HEX
 */
export const hexToHslFull = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h = 0;
    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff) % 6;
        }
        else if (max === g) {
            h = (b - r) / diff + 2;
        }
        else {
            h = (r - g) / diff + 4;
        }
    }
    h = Math.round(h * 60);
    if (h < 0)
        h += 360;
    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
    return {
        h,
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};
/**
 * Debounce функция для оптимизации производительности
 */
export const debounce = (func, delay) => {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
//# sourceMappingURL=colorUtils.js.map