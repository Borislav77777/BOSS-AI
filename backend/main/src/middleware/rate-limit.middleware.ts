import { NextFunction, Request, Response } from 'express';

/**
 * Простой in-memory rate limiter
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Создаем новую запись или сбрасываем счетчик
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}

// Создаем экземпляр rate limiter
const rateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
);

/**
 * Middleware для ограничения количества запросов
 */
export const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Получаем идентификатор клиента (IP адрес)
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';

  if (!rateLimiter.isAllowed(clientId)) {
    const remainingTime = rateLimiter.getRemainingTime(clientId);

    res.status(429).json({
      success: false,
      error: {
        message: 'Слишком много запросов',
        statusCode: 429,
        retryAfter: Math.ceil(remainingTime / 1000),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  next();
};

/**
 * Специальный rate limiter для авторизации (более строгий)
 */
const authRateLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 минут
  5 // максимум 5 попыток входа
);

export const authRateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';

  if (!authRateLimiter.isAllowed(clientId)) {
    const remainingTime = authRateLimiter.getRemainingTime(clientId);

    res.status(429).json({
      success: false,
      error: {
        message: 'Слишком много попыток авторизации. Попробуйте позже.',
        statusCode: 429,
        retryAfter: Math.ceil(remainingTime / 1000),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  next();
};
