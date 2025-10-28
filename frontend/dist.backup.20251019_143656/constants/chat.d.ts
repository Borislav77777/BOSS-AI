/**
 * Константы для чата
 */
export declare const CHAT: {
    readonly MESSAGES: {
        readonly MAX_COUNT: 1000;
        readonly LOAD_MORE_COUNT: 50;
        readonly TYPING_INDICATOR_DELAY: 1000;
    };
    readonly TIMEOUTS: {
        readonly TYPING_INDICATOR: 3000;
        readonly MESSAGE_SEND_RETRY: 5000;
        readonly CONNECTION_RETRY: 10000;
    };
    readonly FILE_UPLOAD: {
        readonly MAX_SIZE: number;
        readonly MAX_FILES_PER_MESSAGE: 5;
        readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "application/zip"];
    };
    readonly AUDIO: {
        readonly MAX_DURATION: 300;
        readonly SAMPLE_RATE: 44100;
        readonly BIT_RATE: 128;
        readonly FORMATS: readonly ["audio/webm", "audio/mp4", "audio/wav"];
    };
    readonly DISPLAY: {
        readonly SHOW_TIMESTAMPS: true;
        readonly AUTO_SCROLL: true;
        readonly MESSAGE_ANIMATION_DURATION: 300;
    };
};
export type ChatConstants = typeof CHAT;
//# sourceMappingURL=chat.d.ts.map