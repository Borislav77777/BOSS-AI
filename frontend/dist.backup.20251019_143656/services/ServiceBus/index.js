/**
 * Service Bus - Система событий и запросов между сервисами
 */
export { ServiceBus } from './ServiceBus';
export * from './types';
// Middleware
export { LoggingMiddleware } from './middleware/LoggingMiddleware';
export { SecurityMiddleware } from './middleware/SecurityMiddleware';
export { ValidationMiddleware } from './middleware/ValidationMiddleware';
// Создаем единственный экземпляр Service Bus
import { ServiceBus } from './ServiceBus';
import { LoggingMiddleware } from './middleware/LoggingMiddleware';
import { SecurityMiddleware } from './middleware/SecurityMiddleware';
import { ValidationMiddleware } from './middleware/ValidationMiddleware';
export const serviceBus = new ServiceBus({
    maxConcurrentRequests: 100,
    defaultTimeout: 30000,
    eventBufferSize: 1000,
    enableLogging: true,
    enableMetrics: true
});
// Добавляем стандартные middleware
serviceBus.addMiddleware(new LoggingMiddleware());
serviceBus.addMiddleware(new ValidationMiddleware());
serviceBus.addMiddleware(new SecurityMiddleware());
// Запускаем Service Bus
serviceBus.start();
//# sourceMappingURL=index.js.map