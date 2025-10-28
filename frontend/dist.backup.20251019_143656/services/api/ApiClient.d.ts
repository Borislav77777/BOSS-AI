import { AxiosInstance, AxiosRequestConfig } from 'axios';
/**
 * Базовый HTTP клиент для API запросов
 */
export declare class ApiClient {
    private client;
    private baseURL;
    private token;
    constructor(baseURL?: string);
    /**
     * Настройка перехватчиков для автоматической обработки ошибок и токенов
     */
    private setupInterceptors;
    /**
     * Установить токен авторизации
     */
    setToken(token: string): void;
    /**
     * Очистить токен авторизации
     */
    clearToken(): void;
    /**
     * GET запрос
     */
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * POST запрос
     */
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PUT запрос
     */
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * DELETE запрос
     */
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PATCH запрос
     */
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Загрузка файла
     */
    uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T>;
    /**
     * Скачивание файла
     */
    downloadFile(url: string, filename?: string): Promise<void>;
    /**
     * Проверка здоровья API
     */
    healthCheck(): Promise<boolean>;
    /**
     * Получить базовый URL
     */
    getBaseURL(): string;
    /**
     * Получить экземпляр axios клиента для расширенного использования
     */
    getAxiosInstance(): AxiosInstance;
}
/**
 * Глобальный экземпляр API клиента
 */
export declare const apiClient: ApiClient;
//# sourceMappingURL=ApiClient.d.ts.map