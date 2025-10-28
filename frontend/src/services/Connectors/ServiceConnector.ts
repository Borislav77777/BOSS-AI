/**
 * Стандартизированный коннектор для всех сервисов
 */


export interface ConnectorConfig {
  serviceId: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'api-key' | 'basic' | 'oauth';
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  healthCheck: {
    endpoint: string;
    interval: number;
    timeout: number;
  };
  rateLimit?: {
    requests: number;
    window: number;
  };
}

export interface ConnectorResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

export interface ConnectorMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Date;
  errorRate: number;
}

export class ServiceConnector {
  private static instances: Map<string, ServiceConnector> = new Map();
  private config: ConnectorConfig;
  private metrics: ConnectorMetrics;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  private constructor(config: ConnectorConfig) {
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
      errorRate: 0
    };
  }

  /**
   * Получает или создает экземпляр коннектора для сервиса
   */
  public static getInstance(serviceId: string, config: ConnectorConfig): ServiceConnector {
    if (!ServiceConnector.instances.has(serviceId)) {
      ServiceConnector.instances.set(serviceId, new ServiceConnector(config));
    }
    return ServiceConnector.instances.get(serviceId)!;
  }

  /**
   * Выполняет HTTP запрос к сервису
   */
  public async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<ConnectorResponse<T>> {
    const startTime = Date.now();
    const requestId = `${this.config.serviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Подготавливаем заголовки
      const headers = {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Service-ID': this.config.serviceId,
        ...this.config.headers,
        ...options.headers
      };

      // Добавляем авторизацию
      if (this.config.auth) {
        this.addAuthHeaders(headers);
      }

      // Выполняем запрос с повторными попытками
      const response = await this.executeWithRetries(
        `${this.config.baseUrl}${endpoint}`,
        {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: AbortSignal.timeout(options.timeout || this.config.timeout)
        }
      );

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      // Обновляем метрики
      this.updateMetrics(true, responseTime);

      return {
        success: true,
        data,
        statusCode: response.status,
        responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

      // Обновляем метрики
      this.updateMetrics(false, responseTime);

      return {
        success: false,
        error: errorMessage,
        statusCode: 0,
        responseTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Выполняет запрос с повторными попытками
   */
  private async executeWithRetries(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Если статус успешный, возвращаем ответ
        if (response.ok) {
          return response;
        }

        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === this.config.retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Ждем перед следующей попыткой
        await this.delay(Math.pow(2, attempt) * 1000);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Неизвестная ошибка');

        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === this.config.retries) {
          throw lastError;
        }

        // Ждем перед следующей попыткой
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw lastError || new Error('Неизвестная ошибка');
  }

  /**
   * Добавляет заголовки авторизации
   */
  private addAuthHeaders(headers: Record<string, string>): void {
    if (!this.config.auth) return;

    switch (this.config.auth.type) {
      case 'bearer':
        if (this.config.auth.token) {
          headers['Authorization'] = `Bearer ${this.config.auth.token}`;
        }
        break;
      case 'api-key':
        if (this.config.auth.apiKey) {
          headers['X-API-Key'] = this.config.auth.apiKey;
        }
        break;
      case 'basic':
        if (this.config.auth.username && this.config.auth.password) {
          const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'oauth':
        if (this.config.auth.token) {
          headers['Authorization'] = `OAuth ${this.config.auth.token}`;
        }
        break;
    }
  }

  /**
   * Задержка между попытками
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Обновляет метрики коннектора
   */
  private updateMetrics(success: boolean, responseTime: number): void {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Обновляем среднее время ответа
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
      this.metrics.totalRequests;

    this.metrics.lastRequestTime = new Date();
    this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
  }

  /**
   * Получает метрики коннектора
   */
  public getMetrics(): ConnectorMetrics {
    return { ...this.metrics };
  }

  /**
   * Получает конфигурацию коннектора
   */
  public getConfig(): ConnectorConfig {
    return { ...this.config };
  }

  /**
   * Обновляет конфигурацию коннектора
   */
  public updateConfig(newConfig: Partial<ConnectorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Проверяет доступность сервиса
   */
  public async healthCheck(): Promise<ConnectorResponse> {
    return this.request(this.config.healthCheck.endpoint, {
      method: 'GET',
      timeout: this.config.healthCheck.timeout
    });
  }

  /**
   * Выполняет пакетные запросы
   */
  public async batchRequest<T = any>(
    requests: Array<{
      endpoint: string;
      options?: Parameters<ServiceConnector['request']>[1];
    }>
  ): Promise<ConnectorResponse<T>[]> {
    const promises = requests.map(req =>
      this.request<T>(req.endpoint, req.options)
    );

    return Promise.all(promises);
  }

  /**
   * Очищает метрики коннектора
   */
  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
      errorRate: 0
    };
  }

  /**
   * Удаляет экземпляр коннектора
   */
  public static removeInstance(serviceId: string): void {
    ServiceConnector.instances.delete(serviceId);
  }

  /**
   * Получает все экземпляры коннекторов
   */
  public static getAllInstances(): Map<string, ServiceConnector> {
    return new Map(ServiceConnector.instances);
  }
}
