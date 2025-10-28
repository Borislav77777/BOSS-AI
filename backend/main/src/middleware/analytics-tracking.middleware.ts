import { apiGatewayLogger } from '@boss-ai/shared';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware для автоматического трекинга всех API запросов в Analytics Service
 * Собирает данные о каждом запросе и отправляет в Analytics Service
 */

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4400';

/**
 * Клиент для отправки данных в Analytics Service
 */
class AnalyticsClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Отправка данных об использовании сервиса
   */
  async trackServiceUsage(data: {
    userId: string;
    serviceName: string;
    action: string;
    success: boolean;
    durationMs: number;
    costBt?: number;
    costRub?: number;
    requestData?: any;
    responseData?: any;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/analytics/service-usage`, data, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Не падаем если аналитика недоступна
      apiGatewayLogger.error('Failed to track service usage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
    }
  }

  /**
   * Трекинг события
   */
  async trackEvent(data: {
    userId: string;
    eventType: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    serviceName?: string;
    sessionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/analytics/track`, data, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      apiGatewayLogger.error('Failed to track event', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Трекинг метрики производительности
   */
  async trackPerformance(data: {
    userId?: string;
    metricType: string;
    metricName: string;
    value: number;
    unit: string;
    pageUrl?: string;
    serviceName?: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/analytics/performance`, data, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      apiGatewayLogger.error('Failed to track performance', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

const analyticsClient = new AnalyticsClient(ANALYTICS_SERVICE_URL);

/**
 * Извлечение имени сервиса из пути
 */
function extractServiceName(path: string): string {
  const parts = path.split('/').filter(Boolean);

  if (parts.length >= 2 && parts[0] === 'api') {
    return parts[1]; // ozon, katya, ai, etc.
  }

  return 'unknown';
}

/**
 * Очистка данных запроса от чувствительной информации
 */
function sanitizeRequest(req: Request): any {
  const sanitized: any = {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent')
    }
  };

  // Убираем пароли, токены и другую чувствительную информацию
  if (req.body) {
    const bodyCopy = { ...req.body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];

    sensitiveFields.forEach(field => {
      if (bodyCopy[field]) {
        bodyCopy[field] = '[REDACTED]';
      }
    });

    sanitized.body = bodyCopy;
  }

  return sanitized;
}

/**
 * Очистка данных ответа от чувствительной информации
 */
function sanitizeResponse(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Если это data объект, рекурсивно очищаем
  if (sanitized.data && typeof sanitized.data === 'object') {
    sanitized.data = sanitizeResponse(sanitized.data);
  }

  return sanitized;
}

/**
 * Middleware для автоматического трекинга всех API запросов
 */
export const analyticsTrackingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Пропускаем запросы к самому Analytics Service чтобы избежать рекурсии
  if (req.path.startsWith('/api/analytics')) {
    return next();
  }

  // Пропускаем health checks
  if (req.path.includes('/health')) {
    return next();
  }

  const startTime = Date.now();
  const userId = (req as any).user?.id || (req as any).user?.userId;
  const sessionId = (req as any).sessionId;
  const serviceName = extractServiceName(req.path);

  // Перехватываем ответ для логирования
  const originalJson = res.json.bind(res);

  res.json = function(body: any) {
    const durationMs = Date.now() - startTime;
    const success = res.statusCode < 400;

    // Асинхронно отправляем данные в Analytics Service
    if (userId) {
      // Трекинг использования сервиса
      analyticsClient.trackServiceUsage({
        userId,
        serviceName,
        action: `${req.method} ${req.path}`,
        success,
        durationMs,
        costBt: body.billing?.costBt || 0,
        costRub: body.billing?.costRub || 0,
        requestData: sanitizeRequest(req),
        responseData: sanitizeResponse(body),
        errorMessage: body.error || (success ? undefined : 'Request failed')
      }).catch(err => {
        // Игнорируем ошибки трекинга чтобы не влиять на основной запрос
        apiGatewayLogger.debug('Analytics tracking error (ignored)', {
          error: err.message
        });
      });

      // Трекинг API вызова как события
      analyticsClient.trackEvent({
        userId,
        eventType: 'api_call',
        eventCategory: 'api',
        eventAction: `${req.method} ${req.path}`,
        eventValue: durationMs,
        serviceName,
        sessionId,
        metadata: {
          statusCode: res.statusCode,
          success,
          durationMs
        }
      }).catch(err => {
        apiGatewayLogger.debug('Analytics event tracking error (ignored)', {
          error: err.message
        });
      });

      // Трекинг метрики производительности
      analyticsClient.trackPerformance({
        userId,
        metricType: 'api_response',
        metricName: `${serviceName}_response_time`,
        value: durationMs,
        unit: 'ms',
        serviceName
      }).catch(err => {
        apiGatewayLogger.debug('Analytics performance tracking error (ignored)', {
          error: err.message
        });
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * Middleware для трекинга начала сессии
 * Вызывается при успешной авторизации
 */
export const trackSessionStart = async (
  userId: string,
  sessionId: string,
  req: Request
): Promise<void> => {
  try {
    await axios.post(
      `${ANALYTICS_SERVICE_URL}/api/analytics/session/start`,
      {
        sessionId,
        userId,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent') || 'unknown'
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    apiGatewayLogger.error('Failed to track session start', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      sessionId
    });
  }
};

/**
 * Middleware для трекинга завершения сессии
 * Вызывается при логауте или истечении токена
 */
export const trackSessionEnd = async (sessionId: string): Promise<void> => {
  try {
    await axios.post(
      `${ANALYTICS_SERVICE_URL}/api/analytics/session/end`,
      { sessionId },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    apiGatewayLogger.error('Failed to track session end', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
  }
};

export { analyticsClient };
