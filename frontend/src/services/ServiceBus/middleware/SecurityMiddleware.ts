/**
 * Middleware для безопасности Service Bus
 */

import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';

export class SecurityMiddleware implements ServiceMiddleware {
  name = 'SecurityMiddleware';
  priority = 10;

  constructor(
    private allowedSources: string[] = [],
    private blockedSources: string[] = [],
    private allowedMethods: string[] = [],
    private blockedMethods: string[] = []
  ) {}

  beforeEvent(event: ServiceEvent): ServiceEvent | null {
    // Проверка заблокированных источников
    if (this.blockedSources.includes(event.source)) {
      console.warn(`[ServiceBus] Событие заблокировано: источник ${event.source} в черном списке`);
      return null;
    }

    // Проверка разрешенных источников
    if (this.allowedSources.length > 0 && !this.allowedSources.includes(event.source)) {
      console.warn(`[ServiceBus] Событие заблокировано: источник ${event.source} не в белом списке`);
      return null;
    }

    // Проверка TTL
    if (event.ttl && event.ttl < Date.now() - event.timestamp.getTime()) {
      console.warn(`[ServiceBus] Событие ${event.id} истекло`);
      return null;
    }

    // Санитизация данных
    if (event.data) {
      event.data = this.sanitizeData(event.data);
    }

    return event;
  }

  afterEvent(event: ServiceEvent): ServiceEvent | null {
    return event;
  }

  beforeRequest(request: ServiceRequest): ServiceRequest | null {
    // Проверка заблокированных источников
    if (this.blockedSources.includes(request.source)) {
      console.warn(`[ServiceBus] Запрос заблокирован: источник ${request.source} в черном списке`);
      return null;
    }

    // Проверка разрешенных источников
    if (this.allowedSources.length > 0 && !this.allowedSources.includes(request.source)) {
      console.warn(`[ServiceBus] Запрос заблокирован: источник ${request.source} не в белом списке`);
      return null;
    }

    // Проверка заблокированных методов
    if (this.blockedMethods.includes(request.method)) {
      console.warn(`[ServiceBus] Запрос заблокирован: метод ${request.method} в черном списке`);
      return null;
    }

    // Проверка разрешенных методов
    if (this.allowedMethods.length > 0 && !this.allowedMethods.includes(request.method)) {
      console.warn(`[ServiceBus] Запрос заблокирован: метод ${request.method} не в белом списке`);
      return null;
    }

    // Санитизация параметров
    if (request.params) {
      request.params = this.sanitizeData(request.params);
    }

    return request;
  }

  afterResponse(response: ServiceResponse): ServiceResponse | null {
    // Санитизация данных ответа
    if (response.data) {
      response.data = this.sanitizeData(response.data);
    }

    return response;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Удаляем потенциально опасные символы
      return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        // Пропускаем потенциально опасные ключи
        if (key.startsWith('__') || key.includes('prototype') || key.includes('constructor')) {
          continue;
        }
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }

    return data;
  }
}
