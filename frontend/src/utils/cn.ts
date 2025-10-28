import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения классов CSS с поддержкой Tailwind Merge
 * @param inputs - Классы для объединения
 * @returns Объединенная строка классов с разрешением конфликтов
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
