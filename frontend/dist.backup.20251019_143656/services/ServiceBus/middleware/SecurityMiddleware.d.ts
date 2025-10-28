/**
 * Middleware для безопасности Service Bus
 */
import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';
export declare class SecurityMiddleware implements ServiceMiddleware {
    private allowedSources;
    private blockedSources;
    private allowedMethods;
    private blockedMethods;
    name: string;
    priority: number;
    constructor(allowedSources?: string[], blockedSources?: string[], allowedMethods?: string[], blockedMethods?: string[]);
    beforeEvent(event: ServiceEvent): ServiceEvent | null;
    afterEvent(event: ServiceEvent): ServiceEvent | null;
    beforeRequest(request: ServiceRequest): ServiceRequest | null;
    afterResponse(response: ServiceResponse): ServiceResponse | null;
    private sanitizeData;
}
//# sourceMappingURL=SecurityMiddleware.d.ts.map