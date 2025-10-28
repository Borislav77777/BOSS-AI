import { RateLimiter } from '../types';

/**
 * Ограничитель скорости запросов (50 запросов в секунду)
 * Портировано из Python api_client.py
 */
export class RateLimiterService {
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor(
    private maxRequests: number = 50,
    private timeWindow: number = 1000 // 1 секунда в миллисекундах
  ) {}

  /**
   * Ждет если превышен лимит запросов для конкретного клиента
   */
  async waitIfNeeded(clientId: string): Promise<void> {
    const now = Date.now();
    let limiter = this.rateLimiters.get(clientId);

    if (!limiter) {
      limiter = {
        max_requests: this.maxRequests,
        time_window: this.timeWindow,
        requests: []
      };
      this.rateLimiters.set(clientId, limiter);
    }

    // Удаляем старые запросы
    limiter.requests = limiter.requests.filter(
      reqTime => now - reqTime < this.timeWindow
    );

    if (limiter.requests.length >= this.maxRequests) {
      const sleepTime = this.timeWindow - (now - limiter.requests[0]);
      if (sleepTime > 0) {
        await this.sleep(sleepTime);
        // Очищаем после ожидания
        limiter.requests = [];
      }
    }

    limiter.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Очищает старые лимитеры
   */
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, limiter] of this.rateLimiters.entries()) {
      limiter.requests = limiter.requests.filter(
        reqTime => now - reqTime < this.timeWindow
      );

      if (limiter.requests.length === 0) {
        this.rateLimiters.delete(clientId);
      }
    }
  }
}
