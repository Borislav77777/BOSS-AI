/**
 * Стандартизированный коннектор для всех сервисов
 */
export class ServiceConnector {
    constructor(config) {
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.config = config;
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: new Date(),
            errorRate: 0
        };
    }
    /**
     * Получает или создает экземпляр коннектора для сервиса
     */
    static getInstance(serviceId, config) {
        if (!ServiceConnector.instances.has(serviceId)) {
            ServiceConnector.instances.set(serviceId, new ServiceConnector(config));
        }
        return ServiceConnector.instances.get(serviceId);
    }
    /**
     * Выполняет HTTP запрос к сервису
     */
    async request(endpoint, options = {}) {
        const startTime = Date.now();
        const requestId = `${this.config.serviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            // Подготавливаем заголовки
            const headers = {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId,
                'X-Service-ID': this.config.serviceId,
                ...this.config.headers,
                ...options.headers
            };
            // Добавляем авторизацию
            if (this.config.auth) {
                this.addAuthHeaders(headers);
            }
            // Выполняем запрос с повторными попытками
            const response = await this.executeWithRetries(`${this.config.baseUrl}${endpoint}`, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: AbortSignal.timeout(options.timeout || this.config.timeout)
            });
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            // Обновляем метрики
            this.updateMetrics(true, responseTime);
            return {
                success: true,
                data,
                statusCode: response.status,
                responseTime,
                timestamp: new Date()
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            // Обновляем метрики
            this.updateMetrics(false, responseTime);
            return {
                success: false,
                error: errorMessage,
                statusCode: 0,
                responseTime,
                timestamp: new Date()
            };
        }
    }
    /**
     * Выполняет запрос с повторными попытками
     */
    async executeWithRetries(url, options) {
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const response = await fetch(url, options);
                // Если статус успешный, возвращаем ответ
                if (response.ok) {
                    return response;
                }
                // Если это последняя попытка, выбрасываем ошибку
                if (attempt === this.config.retries) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                // Ждем перед следующей попыткой
                await this.delay(Math.pow(2, attempt) * 1000);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Неизвестная ошибка');
                // Если это последняя попытка, выбрасываем ошибку
                if (attempt === this.config.retries) {
                    throw lastError;
                }
                // Ждем перед следующей попыткой
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }
        throw lastError || new Error('Неизвестная ошибка');
    }
    /**
     * Добавляет заголовки авторизации
     */
    addAuthHeaders(headers) {
        if (!this.config.auth)
            return;
        switch (this.config.auth.type) {
            case 'bearer':
                if (this.config.auth.token) {
                    headers['Authorization'] = `Bearer ${this.config.auth.token}`;
                }
                break;
            case 'api-key':
                if (this.config.auth.apiKey) {
                    headers['X-API-Key'] = this.config.auth.apiKey;
                }
                break;
            case 'basic':
                if (this.config.auth.username && this.config.auth.password) {
                    const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
                    headers['Authorization'] = `Basic ${credentials}`;
                }
                break;
            case 'oauth':
                if (this.config.auth.token) {
                    headers['Authorization'] = `OAuth ${this.config.auth.token}`;
                }
                break;
        }
    }
    /**
     * Задержка между попытками
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Обновляет метрики коннектора
     */
    updateMetrics(success, responseTime) {
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        }
        else {
            this.metrics.failedRequests++;
        }
        // Обновляем среднее время ответа
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
                this.metrics.totalRequests;
        this.metrics.lastRequestTime = new Date();
        this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    }
    /**
     * Получает метрики коннектора
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Получает конфигурацию коннектора
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Обновляет конфигурацию коннектора
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Проверяет доступность сервиса
     */
    async healthCheck() {
        return this.request(this.config.healthCheck.endpoint, {
            method: 'GET',
            timeout: this.config.healthCheck.timeout
        });
    }
    /**
     * Выполняет пакетные запросы
     */
    async batchRequest(requests) {
        const promises = requests.map(req => this.request(req.endpoint, req.options));
        return Promise.all(promises);
    }
    /**
     * Очищает метрики коннектора
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: new Date(),
            errorRate: 0
        };
    }
    /**
     * Удаляет экземпляр коннектора
     */
    static removeInstance(serviceId) {
        ServiceConnector.instances.delete(serviceId);
    }
    /**
     * Получает все экземпляры коннекторов
     */
    static getAllInstances() {
        return new Map(ServiceConnector.instances);
    }
}
ServiceConnector.instances = new Map();
//# sourceMappingURL=ServiceConnector.js.map