/**
 * Ozon Manager API Client Module
 * Модуль для взаимодействия с Ozon Manager API
 */

class OzonManagerModule {
  constructor() {
    this.apiUrl = 'http://localhost:4200/api';
    this.isInitialized = false;
    this.authToken = null;
  }

  /**
   * Инициализация модуля
   */
  async initialize() {
    try {
      console.log('🔄 Инициализация Ozon Manager модуля...');

      // Получаем токен авторизации
      await this.authenticate();

      // Проверяем доступность API
      const healthResponse = await this.makeRequest('GET', '/health');
      if (healthResponse.success) {
        console.log('✅ Ozon Manager API доступен');
        this.isInitialized = true;
        return true;
      } else {
        console.error('❌ Ozon Manager API недоступен');
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации Ozon Manager:', error);
      return false;
    }
  }

  /**
   * Авторизация в API
   */
  async authenticate() {
    try {
      const response = await fetch(`${this.apiUrl}/auth/token`);
      const result = await response.json();

      if (result.success) {
        this.authToken = result.data.token;
        console.log('✅ Авторизация успешна');
        return true;
      } else {
        console.error('❌ Ошибка авторизации:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      return false;
    }
  }

  /**
   * Выполняет HTTP запрос к API
   */
  async makeRequest(method, endpoint, data = null) {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Добавляем токен авторизации если есть
      if (this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // === УПРАВЛЕНИЕ МАГАЗИНАМИ ===

  /**
   * Получает список всех магазинов
   */
  async getStores() {
    return this.makeRequest('GET', '/stores');
  }

  /**
   * Добавляет новый магазин
   */
  async addStore(storeData) {
    return this.makeRequest('POST', '/stores', storeData);
  }

  /**
   * Обновляет магазин
   */
  async updateStore(storeName, storeData) {
    return this.makeRequest('PUT', `/stores/${encodeURIComponent(storeName)}`, storeData);
  }

  /**
   * Удаляет магазин
   */
  async removeStore(storeName) {
    return this.makeRequest('DELETE', `/stores/${encodeURIComponent(storeName)}`);
  }

  /**
   * Тестирует подключение к API магазина
   */
  async testStoreConnection(storeName) {
    return this.makeRequest('POST', `/stores/${encodeURIComponent(storeName)}/test-connection`);
  }

  // === ОПЕРАЦИИ С АКЦИЯМИ ===

  /**
   * Запускает удаление товаров из невыгодных акций
   */
  async removeFromPromotions(storeNames) {
    return this.makeRequest('POST', '/promotions/remove', { storeNames });
  }

  // === ОПЕРАЦИИ С АРХИВОМ ===

  /**
   * Запускает разархивацию товаров
   */
  async unarchiveProducts(storeNames) {
    return this.makeRequest('POST', '/archive/unarchive', { storeNames });
  }

  // === ПЛАНИРОВЩИК ===

  /**
   * Получает статус планировщика
   */
  async getSchedulerStatus() {
    return this.makeRequest('GET', '/schedule/status');
  }

  /**
   * Перезагружает расписание
   */
  async reloadSchedule() {
    return this.makeRequest('POST', '/schedule/reload');
  }

  // === ЛОГИ ===

  /**
   * Получает логи
   */
  async getLogs() {
    return this.makeRequest('GET', '/logs');
  }

  // === УТИЛИТЫ ===

  /**
   * Проверяет статус API
   */
  async checkHealth() {
    return this.makeRequest('GET', '/health');
  }

  /**
   * Получает информацию о модуле
   */
  getModuleInfo() {
    return {
      name: 'Ozon Manager',
      version: '1.0.0',
      description: 'Автоматизация управления товарами на Ozon',
      isInitialized: this.isInitialized,
      apiUrl: this.apiUrl,
      isAuthenticated: !!this.authToken
    };
  }

  /**
   * Устанавливает URL API сервера
   */
  setApiUrl(url) {
    this.apiUrl = url;
    console.log(`🔧 API URL изменен на: ${url}`);
  }

  /**
   * Устанавливает токен авторизации
   */
  setAuthToken(token) {
    this.authToken = token;
    console.log('🔑 Токен авторизации установлен');
  }
}

// Экспортируем экземпляр модуля
export default new OzonManagerModule();
