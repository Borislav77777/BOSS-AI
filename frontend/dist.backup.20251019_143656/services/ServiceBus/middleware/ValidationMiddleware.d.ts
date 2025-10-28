/**
 * Middleware для валидации событий и запросов
 */
import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';
export declare class ValidationMiddleware implements ServiceMiddleware {
    private strictMode;
    name: string;
    priority: number;
    constructor(strictMode?: boolean);
    beforeEvent(event: ServiceEvent): ServiceEvent | null;
    afterEvent(event: ServiceEvent): ServiceEvent | null;
    beforeRequest(request: ServiceRequest): ServiceRequest | null;
    afterResponse(response: ServiceResponse): ServiceResponse | null;
    private isValidEventType;
    private isValidMethod;
}
//# sourceMappingURL=ValidationMiddleware.d.ts.map