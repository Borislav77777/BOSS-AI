import axios, { AxiosInstance } from 'axios';

/**
 * API клиент для взаимодействия с backend
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || '/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Добавляем токен авторизации к каждому запросу
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Обработка ошибок ответа
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Токен истек или недействителен
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    // Можно добавить редирект на страницу авторизации
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        );
    }

    get<T = any>(url: string, config?: any) {
        return this.client.get<T>(url, config);
    }

    post<T = any>(url: string, data?: any, config?: any) {
        return this.client.post<T>(url, data, config);
    }

    put<T = any>(url: string, data?: any, config?: any) {
        return this.client.put<T>(url, data, config);
    }

    delete<T = any>(url: string, config?: any) {
        return this.client.delete<T>(url, config);
    }

    patch<T = any>(url: string, data?: any, config?: any) {
        return this.client.patch<T>(url, data, config);
    }
}

export const apiClient = new ApiClient();
