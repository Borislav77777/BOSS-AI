import { ApiClient } from './ApiClient';
/**
 * Клиент для работы с Ozon Manager API
 */
export class OzonApiClient extends ApiClient {
    constructor(baseURL) {
        super(baseURL);
    }
    /**
     * Получить все магазины
     */
    async getStores() {
        return this.get('/api/ozon/stores');
    }
    /**
     * Создать новый магазин
     */
    async createStore(storeData) {
        return this.post('/api/ozon/stores', storeData);
    }
    /**
     * Обновить магазин
     */
    async updateStore(storeName, storeData) {
        return this.put(`/api/ozon/stores/${storeName}`, storeData);
    }
    /**
     * Удалить магазин
     */
    async deleteStore(storeName) {
        return this.delete(`/api/ozon/stores/${storeName}`);
    }
    /**
     * Тест подключения к API магазина
     */
    async testConnection(storeName) {
        return this.post(`/api/ozon/stores/${storeName}/test-connection`);
    }
    /**
     * Удаление товаров из акций
     */
    async removeFromPromotions(storeNames) {
        return this.post('/api/ozon/promotions/remove', {
            storeNames
        });
    }
    /**
     * Разархивация товаров
     */
    async unarchiveProducts(storeNames) {
        return this.post('/api/ozon/archive/unarchive', {
            storeNames
        });
    }
    /**
     * Получить логи
     */
    async getLogs() {
        return this.get('/api/ozon/logs');
    }
    /**
     * Получить статус планировщика
     */
    async getSchedulerStatus() {
        return this.get('/api/ozon/scheduler/status');
    }
    /**
     * Запустить планировщик
     */
    async startScheduler() {
        return this.post('/api/ozon/scheduler/start');
    }
    /**
     * Остановить планировщик
     */
    async stopScheduler() {
        return this.post('/api/ozon/scheduler/stop');
    }
    /**
     * Добавить задачу в планировщик
     */
    async addSchedulerTask(taskData) {
        return this.post('/api/ozon/scheduler/tasks', taskData);
    }
    /**
     * Удалить задачу из планировщика
     */
    async removeSchedulerTask(taskId) {
        return this.delete(`/api/ozon/scheduler/tasks/${taskId}`);
    }
    /**
     * Получить статистику операций
     */
    async getStatistics() {
        return this.get('/api/ozon/statistics');
    }
    /**
     * Экспорт конфигурации магазинов
     */
    async exportStores() {
        const response = await this.getAxiosInstance().get('/api/ozon/stores/export', {
            responseType: 'blob'
        });
        return response.data;
    }
    /**
     * Импорт конфигурации магазинов
     */
    async importStores(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.post('/api/ozon/stores/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}
/**
 * Глобальный экземпляр Ozon API клиента
 */
export const ozonApiClient = new OzonApiClient();
//# sourceMappingURL=OzonApiClient.js.map