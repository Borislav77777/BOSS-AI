/**
 * ChatGPT Service Module
 *
 * Обработчик для ChatGPT сервиса
 * Пока что работает локально без внешнего API
 */
declare const _default: {
    /**
     * Инициализация сервиса
     */
    initialize(): Promise<void>;
    /**
     * Выполнение инструмента сервиса
     */
    execute(toolId: string, params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            model: string;
            tokensUsed: number;
            timestamp: string;
        };
        isChatResponse: boolean;
    } | {
        success: boolean;
        message: string;
        data: {
            originalText: string;
            rewrittenText: string;
            improvements: string[];
        };
        isChatResponse: boolean;
    } | {
        success: boolean;
        message: string;
        data: {
            originalText: string;
            summary: string;
            keyPoints: string[];
        };
        isChatResponse: boolean;
    } | {
        success: boolean;
        message: string;
        data: {
            originalText: string;
            translatedText: string;
            sourceLanguage: string;
            targetLanguage: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Основная чат функция
     */
    chatCompletion(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            model: string;
            tokensUsed: number;
            timestamp: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Переписывание текста
     */
    rewriteText(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            originalText: string;
            rewrittenText: string;
            improvements: string[];
        };
        isChatResponse: boolean;
    }>;
    /**
     * Краткое изложение
     */
    summarizeText(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            originalText: string;
            summary: string;
            keyPoints: string[];
        };
        isChatResponse: boolean;
    }>;
    /**
     * Перевод текста
     */
    translateText(params?: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        data: {
            originalText: string;
            translatedText: string;
            sourceLanguage: string;
            targetLanguage: string;
        };
        isChatResponse: boolean;
    }>;
    /**
     * Очистка ресурсов
     */
    cleanup(): Promise<void>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map