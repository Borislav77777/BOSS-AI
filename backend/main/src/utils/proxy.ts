import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from './logger';

/**
 * Конфигурация прокси
 */
export interface ProxyConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

/**
 * Класс для проксирования запросов к микросервисам
 */
export class ProxyClient {
  private client: AxiosInstance;
  private config: ProxyConfig;
  private logger = createLogger('ProxyClient');

  constructor(config: ProxyConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Boss-AI-API-Gateway/1.0.0',
        ...this.config.headers
      }
    });

    this.setupInterceptors();
  }

  /**
   * Настройка перехватчиков для логирования и обработки ошибок
   */
  private setupInterceptors(): void {
    // Перехватчик запросов
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`Отправка запроса: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Ошибка в перехватчике запроса', error);
        return Promise.reject(error);
      }
    );

    // Перехватчик ответов
    this.client.interceptors.response.use(
      (response) => {
        this.logger.proxy(
          this.config.baseURL,
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || '',
          response.status,
          0 // Время ответа будет вычислено в методе request
        );
        return response;
      },
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          this.logger.warn(`Сервис недоступен: ${this.config.baseURL}`);
        } else {
          this.logger.error('Ошибка в перехватчике ответа', error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Проксирование GET запроса
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Проксирование POST запроса
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Проксирование PUT запроса
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Проксирование DELETE запроса
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Универсальный метод для проксирования запросов
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const response: AxiosResponse<T> = await this.client.request({
        method: method as any,
        url,
        data,
        ...config,
        // metadata: { responseTime: 0 }
      });

      // Добавляем время ответа в метаданные
      // response.config.metadata = {
      //   responseTime: Date.now() - startTime
      // };

      return response.data;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (error.response) {
        // Сервер ответил с ошибкой
        this.logger.error(
          `Ошибка прокси: ${method} ${url} - ${error.response.status}`,
          {
            status: error.response.status,
            data: error.response.data,
            responseTime
          }
        );

        // Проксируем ошибку от микросервиса
        throw {
          status: error.response.status,
          data: error.response.data,
          isProxyError: true
        };
      } else if (error.request) {
        // Запрос не дошел до сервера
        this.logger.error(
          `Сетевая ошибка прокси: ${method} ${url}`,
          {
            message: error.message,
            responseTime
          }
        );

        throw {
          status: 503,
          data: {
            success: false,
            error: {
              message: 'Микросервис недоступен',
              statusCode: 503,
              timestamp: new Date().toISOString()
            }
          },
          isProxyError: true
        };
      } else {
        // Другая ошибка
        this.logger.error(`Ошибка прокси: ${method} ${url}`, error);
        throw error;
      }
    }
  }

  /**
   * Проверка доступности микросервиса
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      this.logger.warn(`Микросервис недоступен: ${this.config.baseURL}`);
      return false;
    }
  }
}

/**
 * Создание клиента для Ozon Manager
 */
export const createOzonManagerProxy = (): ProxyClient => {
  const ozonManagerUrl = process.env.OZON_MANAGER_URL || 'http://localhost:4200';

  return new ProxyClient({
    baseURL: ozonManagerUrl,
    timeout: 30000,
    headers: {
      'X-Service': 'ozon-manager'
    }
  });
};

/**
 * Создание клиента для AI Services
 */
export const createAIServicesProxy = (): ProxyClient => {
  const aiServicesUrl = process.env.AI_SERVICES_URL || 'http://localhost:4300';

  return new ProxyClient({
    baseURL: aiServicesUrl,
    timeout: 60000, // AI запросы могут занимать больше времени
    headers: {
      'X-Service': 'ai-services'
    }
  });
};
