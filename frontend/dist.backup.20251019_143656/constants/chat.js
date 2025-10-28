/**
 * Константы для чата
 */
export const CHAT = {
    // Лимиты сообщений
    MESSAGES: {
        MAX_COUNT: 1000,
        LOAD_MORE_COUNT: 50,
        TYPING_INDICATOR_DELAY: 1000,
    },
    // Таймауты и интервалы
    TIMEOUTS: {
        TYPING_INDICATOR: 3000,
        MESSAGE_SEND_RETRY: 5000,
        CONNECTION_RETRY: 10000,
    },
    // Размеры файлов
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_FILES_PER_MESSAGE: 5,
        ALLOWED_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/zip',
        ],
    },
    // Аудио сообщения
    AUDIO: {
        MAX_DURATION: 300, // 5 минут
        SAMPLE_RATE: 44100,
        BIT_RATE: 128,
        FORMATS: ['audio/webm', 'audio/mp4', 'audio/wav'],
    },
    // Настройки отображения
    DISPLAY: {
        SHOW_TIMESTAMPS: true,
        AUTO_SCROLL: true,
        MESSAGE_ANIMATION_DURATION: 300,
    },
};
//# sourceMappingURL=chat.js.map