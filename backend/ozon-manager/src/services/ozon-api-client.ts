import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { OzonAPIResponse, OzonClientConfig } from '../types';
import { Logger } from '../utils/logger';
import { RateLimiterService } from '../utils/rate-limiter';

/**
 * Mock данные для тестирования без реального Ozon API
 */
const MOCK_DATA = {
  stores: [
    {
      id: 'mock-store-1',
      name: 'Тестовый магазин',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  products: [
    {
      id: 12345,
      name: 'Тестовый товар',
      price: 1000,
      stock: 10,
      status: 'active'
    }
  ],
  orders: [
    {
      id: 'mock-order-1',
      status: 'delivered',
      total: 1500,
      created_at: '2024-01-15T10:30:00Z'
    }
  ]
};

/**
 * Клиент для работы с Ozon Seller API
 * Портировано из Python api_client.py
 */
export class OzonAPIClient {
  private client?: AxiosInstance;
  private rateLimiter: RateLimiterService;
  private logger: Logger;
  private recentLimitErrors: number[] = [];

  constructor(
    private config: OzonClientConfig,
    logger?: Logger
  ) {
    this.logger = logger || new Logger();
    this.rateLimiter = new RateLimiterService(50, 1000); // 50 запросов в секунду

    // Проверяем mock режим
    if (process.env.OZON_MOCK_MODE === 'true') {
      this.logger.info('🔧 OzonAPIClient запущен в MOCK режиме');
      return;
    }

    this.client = axios.create({
      baseURL: config.base_url,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.logger.info(`Создан OzonAPIClient для Client-Id: ${config.client_id.substring(0, 8)}...`);
  }

  /**
   * Выполняет HTTP запрос с обработкой ошибок и логированием
   */
  private async makeRequest(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<OzonAPIResponse> {
    // Mock режим
    if (process.env.OZON_MOCK_MODE === 'true') {
      return this.getMockResponse(endpoint, data);
    }

    if (!this.client) {
      throw new Error('OzonAPIClient не инициализирован');
    }

    await this.rateLimiter.waitIfNeeded(this.config.client_id);

    const url = `${this.config.base_url}${endpoint}`;
    const startTime = Date.now();

    try {
      const headers = {
        'Client-Id': this.config.client_id,
        'Api-Key': this.config.api_key,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      let response: AxiosResponse;
      if (method === 'GET') {
        response = await this.client.get(endpoint, { params, headers });
      } else {
        response = await this.client.post(endpoint, data, { params, headers });
      }

      const responseTime = Date.now() - startTime;

      // Логируем запрос
      this.logger.logApiRequest({
        method,
        url,
        status_code: response.status,
        response_time: responseTime / 1000,
        error: response.status >= 400 ? `HTTP ${response.status}` : undefined
      });

      if (response.status >= 400) {
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      return {
        success: true,
        data: response.data,
        status_code: response.status
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';

      this.logger.logApiRequest({
        method,
        url,
        status_code: error.response?.status || 0,
        response_time: responseTime / 1000,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        status_code: error.response?.status || 0
      };
    }
  }

  /**
   * Получает список всех доступных акций
   */
  async getActions(): Promise<OzonAPIResponse> {
    return this.makeRequest('GET', '/v1/actions');
  }

  /**
   * Получает список товаров в акции
   */
  async getActionProducts(actionId: number, limit: number = 1000, lastId: string = ''): Promise<OzonAPIResponse> {
    const data: any = {
      action_id: actionId,
      limit
    };

    if (lastId) {
      data['last_id'] = lastId;
    }

    return this.makeRequest('POST', '/v1/actions/products', data);
  }

  /**
   * Удаляет товары из акции
   */
  async removeProductsFromAction(actionId: number, productIds: number[]): Promise<OzonAPIResponse> {
    if (productIds.length > 100) {
      return {
        success: false,
        error: 'Максимум 100 товаров за один запрос'
      };
    }

    const data = {
      action_id: actionId,
      product_ids: productIds.map(id => Number(id))
    };

    return this.makeRequest('POST', '/v1/actions/products/deactivate', data);
  }

  /**
   * Получает список заархивированных товаров
   */
  async getArchivedProducts(limit: number = 1000, lastId: string = ''): Promise<OzonAPIResponse> {
    const data: any = {
      filter: {
        visibility: 'ARCHIVED'
      },
      limit
    };

    if (lastId) {
      data['last_id'] = lastId;
    }

    return this.makeRequest('POST', '/v3/product/list', data);
  }

  /**
   * Получает автоархивированные товары
   */
  async getAutoarchivedProducts(limit: number = 1000, lastId: string = ''): Promise<OzonAPIResponse> {
    const data: any = {
      filter: {
        visibility: 'ARCHIVED',
        is_autoarchived: true
      },
      limit
    };

    if (lastId) {
      data['last_id'] = lastId;
    }

    return this.makeRequest('POST', '/v3/product/list', data);
  }

  /**
   * Разархивирует товары
   */
  async unarchiveProducts(productIds: number[]): Promise<OzonAPIResponse> {
    if (productIds.length === 0) {
      return {
        success: false,
        error: 'Пустой список товаров для разархивации'
      };
    }

    if (productIds.length > 100) {
      return {
        success: false,
        error: `Превышен лимит: максимум 100 товаров за запрос, передано ${productIds.length}`
      };
    }

    const data = {
      product_id: productIds.map(id => String(id))
    };

    this.logger.info(`Отправляем запрос на разархивацию ${productIds.length} товаров`);
    this.logger.info(`ID товаров: ${productIds}`);

    return this.makeRequest('POST', '/v1/product/unarchive', data);
  }

  /**
   * Тестирует подключение к API
   */
  async testConnection(): Promise<boolean> {
    try {
      this.logger.info(`Тестируем подключение к API для Client-Id: ${this.config.client_id.substring(0, 8)}...`);

      const data = {
        filter: {},
        limit: 1
      };

      const response = await this.makeRequest('POST', '/v3/product/list', data);

      if (response.success) {
        this.logger.info(`API подключение успешно: статус ${response.status_code}`);
        return true;
      } else {
        this.logger.error(`API вернул неожиданный статус: ${response.status_code}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Ошибка API при подключении: ${error}`);
      return false;
    }
  }

  /**
   * Проверяет были ли ошибки лимита в последние N минут
   */
  hasRecentLimitError(minutes: number = 5): boolean {
    const currentTime = Date.now();
    const cutoffTime = currentTime - (minutes * 60 * 1000);

    this.recentLimitErrors = this.recentLimitErrors.filter(time => time > cutoffTime);
    return this.recentLimitErrors.length > 0;
  }

  /**
   * Записывает текущее время как момент ошибки лимита
   */
  recordLimitError(): void {
    this.recentLimitErrors.push(Date.now());
    if (this.recentLimitErrors.length > 10) {
      this.recentLimitErrors = this.recentLimitErrors.slice(-10);
    }
    this.logger.info(`Зафиксирована ошибка лимита API (всего записей: ${this.recentLimitErrors.length})`);
  }

  /**
   * Mock методы для тестирования
   */
  private getMockResponse(endpoint: string, data?: any): OzonAPIResponse {
    this.logger.info(`🔧 Mock ответ для ${endpoint}`);
    
    if (endpoint.includes('/v3/product/list')) {
      return {
        success: true,
        status_code: 200,
        data: {
          items: MOCK_DATA.products,
          total: MOCK_DATA.products.length
        }
      };
    }
    
    if (endpoint.includes('/stores')) {
      return {
        success: true,
        status_code: 200,
        data: MOCK_DATA.stores
      };
    }
    
    if (endpoint.includes('/orders')) {
      return {
        success: true,
        status_code: 200,
        data: MOCK_DATA.orders
      };
    }
    
    // Общий mock ответ
    return {
      success: true,
      status_code: 200,
      data: { message: 'Mock response', endpoint }
    };
  }
}
