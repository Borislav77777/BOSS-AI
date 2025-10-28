import { ApiResponse, HealthStatus } from '../types';
import { logger } from '../utils/logger';
import { createOzonManagerProxy } from '../utils/proxy';

/**
 * Сервис для работы с Ozon Manager микросервисом
 */
export class OzonManagerService {
  private proxy = createOzonManagerProxy();
  private logger = logger;

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    this.logger.info('Инициализация OzonManagerService...');

    try {
      // Проверяем доступность микросервиса
      const isHealthy = await this.proxy.healthCheck();
      if (!isHealthy) {
        this.logger.warn('Ozon Manager микросервис недоступен, будет работать в режиме graceful degradation');
      } else {
        this.logger.info('Ozon Manager микросервис доступен');
      }
    } catch (error) {
      this.logger.warn('Ozon Manager недоступен, будет работать в режиме graceful degradation');
      // Не выбрасываем ошибку, позволяем сервису работать без Ozon Manager
    }
  }

  /**
   * Проверка доступности Ozon Manager
   */
  async isAvailable(): Promise<boolean> {
    try {
      const isHealthy = await this.proxy.healthCheck();
      return isHealthy;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получить все магазины
   */
  async getStores(): Promise<ApiResponse> {
    try {
      this.logger.debug('Получение списка магазинов');
      const response = await this.proxy.get('/api/stores');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка получения магазинов', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка получения магазинов',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Создать новый магазин
   */
  async createStore(storeData: any): Promise<ApiResponse> {
    try {
      this.logger.debug('Создание нового магазина', { storeName: storeData.name });
      const response = await this.proxy.post('/api/stores', storeData);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка создания магазина', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка создания магазина',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Обновить магазин
   */
  async updateStore(storeName: string, storeData: any): Promise<ApiResponse> {
    try {
      this.logger.debug('Обновление магазина', { storeName });
      const response = await this.proxy.put(`/api/stores/${storeName}`, storeData);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка обновления магазина', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка обновления магазина',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Удалить магазин
   */
  async deleteStore(storeName: string): Promise<ApiResponse> {
    try {
      this.logger.debug('Удаление магазина', { storeName });
      const response = await this.proxy.delete(`/api/stores/${storeName}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка удаления магазина', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка удаления магазина',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Тест подключения к API магазина
   */
  async testConnection(storeName: string): Promise<ApiResponse> {
    try {
      this.logger.debug('Тестирование подключения', { storeName });
      const response = await this.proxy.post(`/api/stores/${storeName}/test-connection`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка тестирования подключения', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка тестирования подключения',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Удаление товаров из акций
   */
  async removeFromPromotions(storeNames: string[]): Promise<ApiResponse> {
    try {
      this.logger.debug('Удаление товаров из акций', { storeNames });
      const response = await this.proxy.post('/api/promotions/remove', { storeNames });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка удаления из акций', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка удаления из акций',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Разархивация товаров
   */
  async unarchiveProducts(storeNames: string[]): Promise<ApiResponse> {
    try {
      this.logger.debug('Разархивация товаров', { storeNames });
      const response = await this.proxy.post('/api/archive/unarchive', { storeNames });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка разархивации товаров', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка разархивации товаров',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Получить логи
   */
  async getLogs(): Promise<ApiResponse> {
    try {
      this.logger.debug('Получение логов');
      const response = await this.proxy.get('/api/logs');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка получения логов', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка получения логов',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Получить статус планировщика
   */
  async getSchedulerStatus(): Promise<ApiResponse> {
    try {
      this.logger.debug('Получение статуса планировщика');
      const response = await this.proxy.get('/api/schedule/status');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка получения статуса планировщика', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка получения статуса планировщика',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Проверить здоровье сервиса
   */
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const isHealthy = await this.proxy.healthCheck();
      return {
        service: 'ozon-manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'ozon-manager',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const ozonManagerService = new OzonManagerService();
