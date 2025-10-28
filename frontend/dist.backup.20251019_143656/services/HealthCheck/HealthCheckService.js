/**
 * Единая система HealthCheck для всех сервисов
 */
export class HealthCheckService {
    constructor() {
        this.healthChecks = new Map();
        this.results = new Map();
        this.intervals = new Map();
        this.listeners = new Set();
        this.initializeDefaultChecks();
    }
    static getInstance() {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }
    /**
     * Инициализация стандартных проверок для всех сервисов
     */
    initializeDefaultChecks() {
        const defaultChecks = [
            {
                serviceId: 'ai-assistant',
                endpoint: '/api/health/ai-assistant',
                timeout: 5000,
                interval: 30000,
                retries: 3,
                critical: true,
                dependencies: []
            },
            {
                serviceId: 'chatgpt-service',
                endpoint: '/api/health/chatgpt',
                timeout: 5000,
                interval: 30000,
                retries: 3,
                critical: true,
                dependencies: []
            },
            {
                serviceId: 'file-manager',
                endpoint: '/api/health/file-manager',
                timeout: 3000,
                interval: 60000,
                retries: 2,
                critical: false,
                dependencies: []
            },
            {
                serviceId: 'settings',
                endpoint: '/api/health/settings',
                timeout: 2000,
                interval: 120000,
                retries: 1,
                critical: true,
                dependencies: []
            },
            {
                serviceId: 'widgets-service',
                endpoint: '/api/health/widgets',
                timeout: 3000,
                interval: 60000,
                retries: 2,
                critical: false,
                dependencies: []
            },
            {
                serviceId: 'real-speech-service',
                endpoint: '/api/health/speech',
                timeout: 5000,
                interval: 30000,
                retries: 3,
                critical: false,
                dependencies: []
            }
        ];
        defaultChecks.forEach(config => this.addHealthCheck(config));
    }
    /**
     * Добавляет проверку здоровья для сервиса
     */
    addHealthCheck(config) {
        this.healthChecks.set(config.serviceId, config);
        this.startHealthCheck(config.serviceId);
    }
    /**
     * Удаляет проверку здоровья для сервиса
     */
    removeHealthCheck(serviceId) {
        this.healthChecks.delete(serviceId);
        this.stopHealthCheck(serviceId);
        this.results.delete(serviceId);
    }
    /**
     * Запускает проверку здоровья для сервиса
     */
    startHealthCheck(serviceId) {
        const config = this.healthChecks.get(serviceId);
        if (!config)
            return;
        // Останавливаем существующую проверку
        this.stopHealthCheck(serviceId);
        // Запускаем новую проверку
        const interval = setInterval(async () => {
            await this.performHealthCheck(serviceId);
        }, config.interval);
        this.intervals.set(serviceId, interval);
        // Выполняем первую проверку сразу
        this.performHealthCheck(serviceId);
    }
    /**
     * Останавливает проверку здоровья для сервиса
     */
    stopHealthCheck(serviceId) {
        const interval = this.intervals.get(serviceId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(serviceId);
        }
    }
    /**
     * Выполняет проверку здоровья для сервиса
     */
    async performHealthCheck(serviceId) {
        const config = this.healthChecks.get(serviceId);
        if (!config)
            return;
        const startTime = Date.now();
        let isHealthy = false;
        const errors = [];
        const warnings = [];
        try {
            // Проверяем зависимости
            for (const dependency of config.dependencies) {
                const depResult = this.results.get(dependency);
                if (!depResult || !depResult.isHealthy) {
                    warnings.push(`Зависимость ${dependency} недоступна`);
                }
            }
            // Выполняем HTTP запрос к endpoint сервиса
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            const response = await fetch(config.endpoint, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Health-Check': 'true'
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                isHealthy = data.status === 'healthy' || data.status === 'ok';
                if (data.warnings) {
                    warnings.push(...data.warnings);
                }
            }
            else {
                errors.push(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            errors.push(errorMessage);
        }
        const responseTime = Date.now() - startTime;
        const status = this.determineStatus(isHealthy, errors, warnings);
        const result = {
            serviceId,
            isHealthy,
            status,
            lastChecked: new Date(),
            responseTime,
            errors,
            warnings,
            metrics: {
                uptime: this.calculateUptime(serviceId, isHealthy),
                memoryUsage: this.getMemoryUsage(),
                cpuUsage: this.getCpuUsage(),
                requestCount: this.getRequestCount(serviceId),
                errorRate: this.getErrorRate(serviceId)
            }
        };
        this.results.set(serviceId, result);
        this.notifyListeners(result);
    }
    /**
     * Определяет статус сервиса на основе результатов проверки
     */
    determineStatus(isHealthy, errors, warnings) {
        if (isHealthy && errors.length === 0) {
            return warnings.length > 0 ? 'degraded' : 'healthy';
        }
        return errors.length > 0 ? 'unhealthy' : 'unknown';
    }
    /**
     * Получает результат проверки здоровья для сервиса
     */
    getHealthResult(serviceId) {
        return this.results.get(serviceId) || null;
    }
    /**
     * Получает все результаты проверки здоровья
     */
    getAllHealthResults() {
        return Array.from(this.results.values());
    }
    /**
     * Получает статус всех сервисов
     */
    getOverallStatus() {
        const results = this.getAllHealthResults();
        if (results.length === 0)
            return 'unhealthy';
        const criticalServices = results.filter(r => {
            const config = this.healthChecks.get(r.serviceId);
            return config?.critical === true;
        });
        const unhealthyCritical = criticalServices.filter(r => !r.isHealthy);
        if (unhealthyCritical.length > 0)
            return 'unhealthy';
        const degradedServices = results.filter(r => r.status === 'degraded');
        if (degradedServices.length > 0)
            return 'degraded';
        return 'healthy';
    }
    /**
     * Подписывается на изменения статуса здоровья
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    /**
     * Уведомляет слушателей об изменении статуса
     */
    notifyListeners(result) {
        this.listeners.forEach(callback => {
            try {
                callback(result);
            }
            catch (error) {
                console.error('Ошибка в listener healthcheck:', error);
            }
        });
    }
    /**
     * Выполняет принудительную проверку всех сервисов
     */
    async checkAllServices() {
        const promises = Array.from(this.healthChecks.keys()).map(serviceId => this.performHealthCheck(serviceId));
        await Promise.allSettled(promises);
        return this.getAllHealthResults();
    }
    /**
     * Останавливает все проверки здоровья
     */
    stopAllHealthChecks() {
        this.intervals.forEach((interval, _serviceId) => {
            clearInterval(interval);
        });
        this.intervals.clear();
    }
    // Вспомогательные методы для метрик
    calculateUptime(_serviceId, isHealthy) {
        // Упрощенная логика расчета uptime
        return isHealthy ? 99.9 : 0;
    }
    getMemoryUsage() {
        // Упрощенная логика получения использования памяти
        return Math.random() * 100;
    }
    getCpuUsage() {
        // Упрощенная логика получения использования CPU
        return Math.random() * 100;
    }
    getRequestCount(_serviceId) {
        // Упрощенная логика подсчета запросов
        return Math.floor(Math.random() * 1000);
    }
    getErrorRate(_serviceId) {
        // Упрощенная логика расчета ошибок
        return Math.random() * 5;
    }
}
// Экспортируем единственный экземпляр
export const healthCheckService = HealthCheckService.getInstance();
//# sourceMappingURL=HealthCheckService.js.map