/**
 * Middleware для логирования событий и запросов
 */

import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';

export class LoggingMiddleware implements ServiceMiddleware {
  name = 'LoggingMiddleware';
  priority = 100;

  constructor(private enableEventLogging: boolean = true, private enableRequestLogging: boolean = true) {}

  beforeEvent(event: ServiceEvent): ServiceEvent | null {
    if (this.enableEventLogging) {
      console.log(`[ServiceBus] Событие: ${event.type} от ${event.source}`, {
        id: event.id,
        data: event.data,
        timestamp: event.timestamp
      });
    }
    return event;
  }

  afterEvent(event: ServiceEvent): ServiceEvent | null {
    if (this.enableEventLogging) {
      console.log(`[ServiceBus] Событие ${event.id} доставлено`);
    }
    return event;
  }

  beforeRequest(request: ServiceRequest): ServiceRequest | null {
    if (this.enableRequestLogging) {
      console.log(`[ServiceBus] Запрос: ${request.method} от ${request.source} к ${request.target}`, {
        id: request.id,
        params: request.params,
        timestamp: request.timestamp
      });
    }
    return request;
  }

  afterResponse(response: ServiceResponse): ServiceResponse | null {
    if (this.enableRequestLogging) {
      console.log(`[ServiceBus] Ответ: ${response.requestId}`, {
        success: response.success,
        data: response.data,
        error: response.error,
        timestamp: response.timestamp
      });
    }
    return response;
  }
}
