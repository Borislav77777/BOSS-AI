/**
 * Time Service Module
 *
 * Сервис времени и даты
 * Предоставляет текущее время, дату и форматирование
 */

export default {
  /**
   * Инициализация сервиса
   */
  async initialize() {
    console.log('Time service initialized');
  },

  /**
   * Выполнение инструмента сервиса
   */
  async execute(toolId, params) {
    console.log(`Executing Time tool: ${toolId}`, params);

    switch (toolId) {
      case 'get-current-time':
        return await this.getCurrentTime(params);

      case 'get-current-date':
        return await this.getCurrentDate(params);

      case 'format-time':
        return await this.formatTime(params);

      default:
        throw new Error(`Unknown Time tool: ${toolId}`);
    }
  },

  /**
   * Получение текущего времени
   */
  async getCurrentTime(params) {
    const { timezone = 'Europe/Moscow', format24h = true, showSeconds = true } = params;

    try {
      const now = new Date();
      const timeString = this.formatTimeString(now, { timezone, format24h, showSeconds });

      return {
        success: true,
        message: `Текущее время: ${timeString}`,
        data: {
          time: timeString,
          timestamp: now.getTime(),
          timezone,
          format24h,
          showSeconds,
          iso: now.toISOString(),
          unix: Math.floor(now.getTime() / 1000)
        },
        isChatResponse: true
      };
    } catch (error) {
      console.error('Time service error:', error);
      return {
        success: false,
        message: 'Ошибка получения времени',
        error: error.message
      };
    }
  },

  /**
   * Получение текущей даты
   */
  async getCurrentDate(params) {
    const { language = 'ru', timezone = 'Europe/Moscow' } = params;

    try {
      const now = new Date();
      const dateString = this.formatDateString(now, { language, timezone });

      return {
        success: true,
        message: `Сегодня: ${dateString}`,
        data: {
          date: dateString,
          timestamp: now.getTime(),
          timezone,
          language,
          iso: now.toISOString(),
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          weekday: now.getDay()
        },
        isChatResponse: true
      };
    } catch (error) {
      console.error('Date service error:', error);
      return {
        success: false,
        message: 'Ошибка получения даты',
        error: error.message
      };
    }
  },

  /**
   * Форматирование времени
   */
  async formatTime(params) {
    const { timestamp, format, timezone = 'Europe/Moscow' } = params;

    try {
      const date = timestamp ? new Date(timestamp) : new Date();
      const formattedTime = this.formatTimeString(date, { timezone, format });

      return {
        success: true,
        message: `Форматированное время: ${formattedTime}`,
        data: {
          formatted: formattedTime,
          timestamp: date.getTime(),
          timezone,
          format
        },
        isChatResponse: true
      };
    } catch (error) {
      console.error('Time formatting error:', error);
      return {
        success: false,
        message: 'Ошибка форматирования времени',
        error: error.message
      };
    }
  },

  /**
   * Форматирование времени в строку
   */
  formatTimeString(date, options = {}) {
    const { timezone = 'Europe/Moscow', format24h = true, showSeconds = true } = options;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    let timeString = '';

    if (format24h) {
      timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (showSeconds) {
        timeString += `:${seconds.toString().padStart(2, '0')}`;
      }
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      timeString = `${displayHours}:${minutes.toString().padStart(2, '0')}`;
      if (showSeconds) {
        timeString += `:${seconds.toString().padStart(2, '0')}`;
      }
      timeString += ` ${ampm}`;
    }

    return timeString;
  },

  /**
   * Форматирование даты в строку
   */
  formatDateString(date, options = {}) {
    const { language = 'ru', timezone = 'Europe/Moscow' } = options;

    const options_date = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: timezone
    };

    return date.toLocaleDateString(language, options_date);
  },

  /**
   * Очистка ресурсов
   */
  async cleanup() {
    console.log('Time service cleaned up');
  }
};
