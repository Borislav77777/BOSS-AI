/**
 * Утилиты для получения иконок с трендами 2025
 */
import type { ComponentType, SVGProps } from 'react';
type LucideIconType = ComponentType<SVGProps<SVGSVGElement>>;
/**
 * Получает иконку для категории настроек
 * @param categoryId - ID категории
 * @returns Lucide иконка
 */
export declare const getCategoryIcon: (categoryId: string) => LucideIconType;
/**
 * Получает иконку для типа сообщения
 * @param sender - Тип отправителя
 * @returns Lucide иконка
 */
export declare const getMessageIcon: (sender: string) => LucideIconType;
/**
 * Получает иконку для типа элемента рабочего пространства
 * @param type - Тип элемента
 * @returns Lucide иконка
 */
export declare const getItemIconType: (type: string) => LucideIconType;
/**
 * Получает иконку для действий
 * @param action - Название действия
 * @returns Lucide иконка
 */
export declare const getActionIcon: (action: string) => LucideIconType;
/**
 * Получает иконку для статуса
 * @param status - Статус
 * @returns Lucide иконка
 */
export declare const getStatusIcon: (status: string) => LucideIconType;
export {};
//# sourceMappingURL=iconUtils.d.ts.map