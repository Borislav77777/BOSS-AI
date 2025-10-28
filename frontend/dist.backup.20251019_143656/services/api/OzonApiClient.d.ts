import { ApiResponse } from '../../types';
import { ApiClient } from './ApiClient';
/**
 * Интерфейс для магазина Ozon
 */
export interface OzonStore {
    name: string;
    client_id: string;
    api_key: string;
    remove_from_promotions: boolean;
    unarchive_products: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
/**
 * Интерфейс для результата операции
 */
export interface OperationResult {
    store: string;
    success: boolean;
    products_removed?: number;
    actions_processed?: number;
    errors?: string[];
    error?: string;
}
/**
 * Интерфейс для статуса планировщика
 */
export interface SchedulerStatus {
    isRunning: boolean;
    tasksCount: number;
    tasks: Array<{
        id: string;
        name: string;
        schedule: string;
        lastRun: string;
        nextRun: string;
        status: 'active' | 'inactive' | 'error';
    }>;
}
/**
 * Клиент для работы с Ozon Manager API
 */
export declare class OzonApiClient extends ApiClient {
    constructor(baseURL?: string);
    /**
     * Получить все магазины
     */
    getStores(): Promise<ApiResponse<OzonStore[]>>;
    /**
     * Создать новый магазин
     */
    createStore(storeData: Partial<OzonStore>): Promise<ApiResponse<OzonStore>>;
    /**
     * Обновить магазин
     */
    updateStore(storeName: string, storeData: Partial<OzonStore>): Promise<ApiResponse<OzonStore>>;
    /**
     * Удалить магазин
     */
    deleteStore(storeName: string): Promise<ApiResponse>;
    /**
     * Тест подключения к API магазина
     */
    testConnection(storeName: string): Promise<ApiResponse<{
        success: boolean;
        message: string;
    }>>;
    /**
     * Удаление товаров из акций
     */
    removeFromPromotions(storeNames: string[]): Promise<ApiResponse<OperationResult[]>>;
    /**
     * Разархивация товаров
     */
    unarchiveProducts(storeNames: string[]): Promise<ApiResponse<OperationResult[]>>;
    /**
     * Получить логи
     */
    getLogs(): Promise<ApiResponse<string[]>>;
    /**
     * Получить статус планировщика
     */
    getSchedulerStatus(): Promise<ApiResponse<SchedulerStatus>>;
    /**
     * Запустить планировщик
     */
    startScheduler(): Promise<ApiResponse>;
    /**
     * Остановить планировщик
     */
    stopScheduler(): Promise<ApiResponse>;
    /**
     * Добавить задачу в планировщик
     */
    addSchedulerTask(taskData: {
        name: string;
        schedule: string;
        action: string;
        stores: string[];
    }): Promise<ApiResponse>;
    /**
     * Удалить задачу из планировщика
     */
    removeSchedulerTask(taskId: string): Promise<ApiResponse>;
    /**
     * Получить статистику операций
     */
    getStatistics(): Promise<ApiResponse<{
        totalStores: number;
        activeStores: number;
        totalOperations: number;
        successfulOperations: number;
        failedOperations: number;
        lastOperationTime: string;
    }>>;
    /**
     * Экспорт конфигурации магазинов
     */
    exportStores(): Promise<Blob>;
    /**
     * Импорт конфигурации магазинов
     */
    importStores(file: File): Promise<ApiResponse>;
}
/**
 * Глобальный экземпляр Ozon API клиента
 */
export declare const ozonApiClient: OzonApiClient;
//# sourceMappingURL=OzonApiClient.d.ts.map