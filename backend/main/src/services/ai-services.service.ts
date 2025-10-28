import { ApiResponse, HealthStatus } from '../types';
import { logger } from '../utils/logger';
import { createAIServicesProxy } from '../utils/proxy';

/**
 * Сервис для работы с AI Services микросервисом
 * Пока что заглушка для будущих AI сервисов
 */
export class AIServicesService {
  private proxy = createAIServicesProxy();
  private logger = logger;
  private isEnabled = false;

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    this.logger.info('Инициализация AIServicesService...');

    // Проверяем доступность микросервиса
    try {
      const isHealthy = await this.proxy.healthCheck();
      this.isEnabled = isHealthy;

      if (isHealthy) {
        this.logger.info('AI Services микросервис доступен');
      } else {
        this.logger.warn('AI Services микросервис недоступен, будет работать в режиме graceful degradation');
      }
    } catch (error) {
      this.logger.warn('AI Services недоступен, будет работать в режиме graceful degradation');
      this.isEnabled = false;
      // Не выбрасываем ошибку, позволяем сервису работать без AI Services
    }
  }

  /**
   * Проверка доступности AI Services
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
   * Проверить доступность AI сервисов
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Отправить запрос к ChatGPT
   */
  async sendChatGPTRequest(prompt: string, options?: any): Promise<ApiResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: {
          message: 'AI Services недоступны',
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      this.logger.debug('Отправка запроса к ChatGPT', { prompt: prompt.substring(0, 100) });
      const response = await this.proxy.post('/api/ai/chatgpt', {
        prompt,
        ...options
      });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка запроса к ChatGPT', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка запроса к ChatGPT',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Отправить запрос к Claude
   */
  async sendClaudeRequest(prompt: string, options?: any): Promise<ApiResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: {
          message: 'AI Services недоступны',
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      this.logger.debug('Отправка запроса к Claude', { prompt: prompt.substring(0, 100) });
      const response = await this.proxy.post('/api/ai/claude', {
        prompt,
        ...options
      });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка запроса к Claude', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка запроса к Claude',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Отправить запрос к Gemini
   */
  async sendGeminiRequest(prompt: string, options?: any): Promise<ApiResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: {
          message: 'AI Services недоступны',
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      this.logger.debug('Отправка запроса к Gemini', { prompt: prompt.substring(0, 100) });
      const response = await this.proxy.post('/api/ai/gemini', {
        prompt,
        ...options
      });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка запроса к Gemini', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка запроса к Gemini',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Получить список доступных AI моделей
   */
  async getAvailableModels(): Promise<ApiResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: {
          message: 'AI Services недоступны',
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      this.logger.debug('Получение списка AI моделей');
      const response = await this.proxy.get('/api/ai/models');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка получения списка моделей', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка получения списка моделей',
          statusCode: error.status || 500,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Получить историю запросов пользователя
   */
  async getRequestHistory(userId: string, limit?: number): Promise<ApiResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: {
          message: 'AI Services недоступны',
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      this.logger.debug('Получение истории запросов', { userId });
      const response = await this.proxy.get(`/api/ai/history/${userId}`, {
        params: { limit }
      });
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.logger.error('Ошибка получения истории запросов', error);
      return {
        success: false,
        error: {
          message: error.data?.error?.message || 'Ошибка получения истории запросов',
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
    if (!this.isEnabled) {
      return {
        service: 'ai-services',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: 'Service not enabled'
      };
    }

    try {
      const isHealthy = await this.proxy.healthCheck();
      return {
        service: 'ai-services',
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'ai-services',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const aiServicesService = new AIServicesService();
