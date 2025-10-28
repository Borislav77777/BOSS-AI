import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Утилита для объединения классов CSS с поддержкой Tailwind Merge
 * @param inputs - Классы для объединения
 * @returns Объединенная строка классов с разрешением конфликтов
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
//# sourceMappingURL=cn.js.map