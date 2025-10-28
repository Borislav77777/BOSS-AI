/**
 * Утилиты для работы с датами
 */
/**
 * Форматирует дату в формат времени (ЧЧ:ММ)
 * @param date - Дата для форматирования
 * @returns Отформатированное время
 */
export declare const formatTime: (date: Date) => string;
/**
 * Форматирует дату в полный формат (ДД.ММ.ГГГГ ЧЧ:ММ)
 * @param date - Дата для форматирования (Date или string)
 * @returns Отформатированная дата
 */
export declare const formatDate: (date: Date | string) => string;
/**
 * Форматирует размер файла в читаемый вид
 * @param bytes - Размер в байтах
 * @returns Отформатированный размер
 */
export declare const formatFileSize: (bytes: number) => string;
//# sourceMappingURL=dateUtils.d.ts.map