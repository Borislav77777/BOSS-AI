/**
 * Service Bus - Система событий и запросов между сервисами
 */
export { ServiceBus } from './ServiceBus';
export * from './types';
export { LoggingMiddleware } from './middleware/LoggingMiddleware';
export { SecurityMiddleware } from './middleware/SecurityMiddleware';
export { ValidationMiddleware } from './middleware/ValidationMiddleware';
import { ServiceBus } from './ServiceBus';
export declare const serviceBus: ServiceBus;
//# sourceMappingURL=index.d.ts.map