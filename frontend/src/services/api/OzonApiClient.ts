import { ApiResponse } from "../../types";
import { ApiClient } from "./ApiClient";

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
    status: "active" | "inactive" | "error";
  }>;
}

/**
 * Клиент для работы с Ozon Manager API
 */
export class OzonApiClient extends ApiClient {
  constructor(baseURL?: string) {
    super(baseURL);

    // Автоматически устанавливаем токен из localStorage при создании
    this.initializeToken();
  }

  /**
   * Инициализация токена из localStorage
   */
  private initializeToken(): void {
    try {
      const token = localStorage.getItem("barsukov-token");
      if (token) {
        this.setToken(token);
      }
    } catch (error) {
      console.warn(
        "[OzonApiClient] Не удалось получить токен из localStorage:",
        error
      );
    }
  }

  /**
   * Получить все магазины
   */
  async getStores(): Promise<ApiResponse<OzonStore[]>> {
    return this.get<ApiResponse<OzonStore[]>>("/ozon/stores");
  }

  /**
   * Создать новый магазин
   */
  async createStore(
    storeData: Partial<OzonStore>
  ): Promise<ApiResponse<OzonStore>> {
    return this.post<ApiResponse<OzonStore>>("/ozon/stores", storeData);
  }

  /**
   * Обновить магазин
   */
  async updateStore(
    storeName: string,
    storeData: Partial<OzonStore>
  ): Promise<ApiResponse<OzonStore>> {
    return this.put<ApiResponse<OzonStore>>(
      `/ozon/stores/${storeName}`,
      storeData
    );
  }

  /**
   * Удалить магазин
   */
  async deleteStore(storeName: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/ozon/stores/${storeName}`);
  }

  /**
   * Тест подключения к API магазина
   */
  async testConnection(
    storeName: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.post<ApiResponse<{ success: boolean; message: string }>>(
      `/ozon/stores/${storeName}/test-connection`
    );
  }

  /**
   * Удаление товаров из акций
   */
  async removeFromPromotions(
    storeNames: string[]
  ): Promise<ApiResponse<OperationResult[]>> {
    return this.post<ApiResponse<OperationResult[]>>(
      "/ozon/promotions/remove",
      {
        storeNames,
      }
    );
  }

  /**
   * Разархивация товаров
   */
  async unarchiveProducts(
    storeNames: string[]
  ): Promise<ApiResponse<OperationResult[]>> {
    return this.post<ApiResponse<OperationResult[]>>(
      "/ozon/archive/unarchive",
      {
        storeNames,
      }
    );
  }

  /**
   * Получить логи
   */
  async getLogs(): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>("/ozon/logs");
  }

  /**
   * Получить статус планировщика
   */
  async getSchedulerStatus(): Promise<ApiResponse<SchedulerStatus>> {
    return this.get<ApiResponse<SchedulerStatus>>("/ozon/schedule/status");
  }

  /**
   * Запустить планировщик
   */
  async startScheduler(): Promise<ApiResponse> {
    return this.post<ApiResponse>("/ozon/scheduler/start");
  }

  /**
   * Остановить планировщик
   */
  async stopScheduler(): Promise<ApiResponse> {
    return this.post<ApiResponse>("/ozon/scheduler/stop");
  }

  /**
   * Добавить задачу в планировщик
   */
  async addSchedulerTask(taskData: {
    name: string;
    schedule: string;
    action: string;
    stores: string[];
  }): Promise<ApiResponse> {
    return this.post<ApiResponse>("/ozon/scheduler/tasks", taskData);
  }

  /**
   * Удалить задачу из планировщика
   */
  async removeSchedulerTask(taskId: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/ozon/scheduler/tasks/${taskId}`);
  }

  /**
   * Получить статистику операций
   */
  async getStatistics(): Promise<
    ApiResponse<{
      totalStores: number;
      activeStores: number;
      totalOperations: number;
      successfulOperations: number;
      failedOperations: number;
      lastOperationTime: string;
    }>
  > {
    return this.get<ApiResponse<any>>("/ozon/statistics");
  }

  /**
   * Экспорт конфигурации магазинов
   */
  async exportStores(): Promise<Blob> {
    const response = await this.getAxiosInstance().get("/ozon/stores/export", {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Импорт конфигурации магазинов
   */
  async importStores(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.post<ApiResponse>("/ozon/stores/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

/**
 * Глобальный экземпляр Ozon API клиента
 * В production используем относительный путь /api для проксирования через API Gateway
 */
export const ozonApiClient = new OzonApiClient(
  import.meta.env.PROD ? "/api" : undefined
);
