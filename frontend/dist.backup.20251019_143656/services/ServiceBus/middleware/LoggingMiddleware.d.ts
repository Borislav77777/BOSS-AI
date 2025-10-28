/**
 * Middleware для логирования событий и запросов
 */
import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';
export declare class LoggingMiddleware implements ServiceMiddleware {
    private enableEventLogging;
    private enableRequestLogging;
    name: string;
    priority: number;
    constructor(enableEventLogging?: boolean, enableRequestLogging?: boolean);
    beforeEvent(event: ServiceEvent): ServiceEvent | null;
    afterEvent(event: ServiceEvent): ServiceEvent | null;
    beforeRequest(request: ServiceRequest): ServiceRequest | null;
    afterResponse(response: ServiceResponse): ServiceResponse | null;
}
//# sourceMappingURL=LoggingMiddleware.d.ts.map