/**
 * Утилиты для работы с датами
 */
/**
 * Форматирует дату в формат времени (ЧЧ:ММ)
 * @param date - Дата для форматирования
 * @returns Отформатированное время
 */
export const formatTime = (date) => {
    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
/**
 * Форматирует дату в полный формат (ДД.ММ.ГГГГ ЧЧ:ММ)
 * @param date - Дата для форматирования (Date или string)
 * @returns Отформатированная дата
 */
export const formatDate = (date) => {
    try {
        // Преобразуем в Date объект если это строка
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        // Проверяем валидность даты
        if (isNaN(dateObj.getTime())) {
            return 'Неизвестно';
        }
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    }
    catch (error) {
        console.warn('Ошибка форматирования даты:', error);
        return 'Неизвестно';
    }
};
/**
 * Форматирует размер файла в читаемый вид
 * @param bytes - Размер в байтах
 * @returns Отформатированный размер
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
//# sourceMappingURL=dateUtils.js.map