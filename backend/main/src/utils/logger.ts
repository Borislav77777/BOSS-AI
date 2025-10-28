/**
 * Простой логгер для API Gateway
 */
export class Logger {
  private context: string;

  constructor(context: string = 'API-Gateway') {
    this.context = context;
  }

  /**
   * Логирование информации
   */
  info(message: string, data?: any): void {
    console.log(`[${new Date().toISOString()}] [${this.context}] [INFO] ${message}`, data || '');
  }

  /**
   * Логирование предупреждений
   */
  warn(message: string, data?: any): void {
    console.warn(`[${new Date().toISOString()}] [${this.context}] [WARN] ${message}`, data || '');
  }

  /**
   * Логирование ошибок
   */
  error(message: string, error?: Error | any): void {
    console.error(`[${new Date().toISOString()}] [${this.context}] [ERROR] ${message}`, error || '');
  }

  /**
   * Логирование отладки
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [${this.context}] [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Логирование HTTP запросов
   */
  http(method: string, url: string, statusCode: number, responseTime?: number): void {
    const time = responseTime ? ` (${responseTime}ms)` : '';
    this.info(`${method} ${url} - ${statusCode}${time}`);
  }

  /**
   * Логирование прокси запросов
   */
  proxy(target: string, method: string, url: string, statusCode: number, responseTime?: number): void {
    const time = responseTime ? ` (${responseTime}ms)` : '';
    this.info(`[PROXY] ${target} - ${method} ${url} - ${statusCode}${time}`);
  }
}

/**
 * Создание логгера с контекстом
 */
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

/**
 * Глобальный логгер
 */
export const logger = new Logger();
