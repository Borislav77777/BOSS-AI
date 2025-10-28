import axios from 'axios';
/**
 * Базовый HTTP клиент для API запросов
 */
export class ApiClient {
    constructor(baseURL) {
        this.token = null;
        this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Boss-AI-Frontend/1.0.0'
            }
        });
        this.setupInterceptors();
    }
    /**
     * Настройка перехватчиков для автоматической обработки ошибок и токенов
     */
    setupInterceptors() {
        // Перехватчик запросов - добавляем токен авторизации
        this.client.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        }, (error) => {
            console.error('Ошибка в перехватчике запроса:', error);
            return Promise.reject(error);
        });
        // Перехватчик ответов - обработка ошибок
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                // Токен истек или недействителен
                this.clearToken();
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(error);
        });
    }
    /**
     * Установить токен авторизации
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Очистить токен авторизации
     */
    clearToken() {
        this.token = null;
    }
    /**
     * GET запрос
     */
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    /**
     * POST запрос
     */
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    /**
     * PUT запрос
     */
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    /**
     * DELETE запрос
     */
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    /**
     * PATCH запрос
     */
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    /**
     * Загрузка файла
     */
    async uploadFile(url, file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            }
        };
        const response = await this.client.post(url, formData, config);
        return response.data;
    }
    /**
     * Скачивание файла
     */
    async downloadFile(url, filename) {
        const response = await this.client.get(url, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }
    /**
     * Проверка здоровья API
     */
    async healthCheck() {
        try {
            await this.get('/api/health');
            return true;
        }
        catch (error) {
            console.error('API недоступен:', error);
            return false;
        }
    }
    /**
     * Получить базовый URL
     */
    getBaseURL() {
        return this.baseURL;
    }
    /**
     * Получить экземпляр axios клиента для расширенного использования
     */
    getAxiosInstance() {
        return this.client;
    }
}
/**
 * Глобальный экземпляр API клиента
 */
export const apiClient = new ApiClient();
//# sourceMappingURL=ApiClient.js.map