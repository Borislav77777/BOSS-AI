/**
 * Middleware для валидации событий и запросов
 */

import { ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse } from '../types';

export class ValidationMiddleware implements ServiceMiddleware {
  name = 'ValidationMiddleware';
  priority = 50;

  constructor(private strictMode: boolean = false) {}

  beforeEvent(event: ServiceEvent): ServiceEvent | null {
    // Валидация обязательных полей
    if (!event.id || !event.type || !event.source) {
      console.error('[ServiceBus] Невалидное событие: отсутствуют обязательные поля');
      return null;
    }

    // Валидация типа события
    if (!this.isValidEventType(event.type)) {
      console.error(`[ServiceBus] Невалидный тип события: ${event.type}`);
      return null;
    }

    // Валидация данных
    if (event.data && typeof event.data !== 'object') {
      console.error('[ServiceBus] Данные события должны быть объектом');
      return null;
    }

    return event;
  }

  afterEvent(event: ServiceEvent): ServiceEvent | null {
    return event;
  }

  beforeRequest(request: ServiceRequest): ServiceRequest | null {
    // Валидация обязательных полей
    if (!request.id || !request.method || !request.source || !request.target) {
      console.error('[ServiceBus] Невалидный запрос: отсутствуют обязательные поля');
      return null;
    }

    // Валидация метода
    if (!this.isValidMethod(request.method)) {
      console.error(`[ServiceBus] Невалидный метод: ${request.method}`);
      return null;
    }

    // Валидация параметров
    if (request.params && typeof request.params !== 'object') {
      console.error('[ServiceBus] Параметры запроса должны быть объектом');
      return null;
    }

    return request;
  }

  afterResponse(response: ServiceResponse): ServiceResponse | null {
    // Валидация ответа
    if (typeof response.success !== 'boolean') {
      console.error('[ServiceBus] Поле success в ответе должно быть булевым');
      return null;
    }

    if (!response.success && !response.error) {
      console.warn('[ServiceBus] Неуспешный ответ без описания ошибки');
    }

    return response;
  }

  private isValidEventType(type: string): boolean {
    const validTypes = [
      'service.registered',
      'service.unregistered',
      'service.activated',
      'service.deactivated',
      'service.error',
      'data.changed',
      'user.action',
      'system.notification'
    ];

    return validTypes.includes(type) || type.startsWith('custom.');
  }

  private isValidMethod(method: string): boolean {
    const validMethods = [
      'get',
      'set',
      'create',
      'update',
      'delete',
      'execute',
      'process',
      'validate',
      'transform'
    ];

    return validMethods.includes(method) || method.includes('.');
  }
}
