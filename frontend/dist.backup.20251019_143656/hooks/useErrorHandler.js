/**
 * Хук для создания error boundary с пользовательским обработчиком
 */
export const useErrorHandler = () => {
    const handleError = (error, errorInfo) => {
        // Здесь можно добавить логику отправки ошибок в сервис мониторинга
        console.error('Application error:', error, errorInfo);
        // Пример отправки в сервис мониторинга (например, Sentry)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //     window.Sentry.captureException(error, { extra: errorInfo });
        // }
    };
    return { handleError };
};
//# sourceMappingURL=useErrorHandler.js.map