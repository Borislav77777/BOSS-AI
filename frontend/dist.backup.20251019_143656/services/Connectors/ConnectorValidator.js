/**
 * Валидатор коннекторов для всех сервисов
 */
export class ConnectorValidator {
    constructor() {
        this.testResults = new Map();
        // Инициализация валидатора
    }
    static getInstance() {
        if (!ConnectorValidator.instance) {
            ConnectorValidator.instance = new ConnectorValidator();
        }
        return ConnectorValidator.instance;
    }
    /**
     * Валидирует конфигурацию коннектора
     */
    validateConnectorConfig(config) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Проверяем обязательные поля
        if (!config.serviceId) {
            errors.push('serviceId обязателен');
        }
        if (!config.baseUrl) {
            errors.push('baseUrl обязателен');
        }
        else if (!this.isValidUrl(config.baseUrl)) {
            errors.push('baseUrl должен быть валидным URL');
        }
        if (config.timeout <= 0) {
            errors.push('timeout должен быть больше 0');
        }
        else if (config.timeout > 30000) {
            warnings.push('timeout больше 30 секунд может привести к плохому UX');
        }
        if (config.retries < 0) {
            errors.push('retries не может быть отрицательным');
        }
        else if (config.retries > 10) {
            warnings.push('retries больше 10 может привести к долгому ожиданию');
        }
        // Проверяем health check
        if (!config.healthCheck.endpoint) {
            errors.push('healthCheck.endpoint обязателен');
        }
        if (config.healthCheck.timeout <= 0) {
            errors.push('healthCheck.timeout должен быть больше 0');
        }
        if (config.healthCheck.interval <= 0) {
            errors.push('healthCheck.interval должен быть больше 0');
        }
        // Проверяем авторизацию
        if (config.auth) {
            if (!config.auth.type) {
                errors.push('auth.type обязателен при наличии auth');
            }
            else {
                switch (config.auth.type) {
                    case 'bearer':
                        if (!config.auth.token) {
                            errors.push('auth.token обязателен для bearer auth');
                        }
                        break;
                    case 'api-key':
                        if (!config.auth.apiKey) {
                            errors.push('auth.apiKey обязателен для api-key auth');
                        }
                        break;
                    case 'basic':
                        if (!config.auth.username || !config.auth.password) {
                            errors.push('auth.username и auth.password обязательны для basic auth');
                        }
                        break;
                    case 'oauth':
                        if (!config.auth.token) {
                            errors.push('auth.token обязателен для oauth auth');
                        }
                        break;
                }
            }
        }
        // Проверяем rate limit
        if (config.rateLimit) {
            if (config.rateLimit.requests <= 0) {
                errors.push('rateLimit.requests должен быть больше 0');
            }
            if (config.rateLimit.window <= 0) {
                errors.push('rateLimit.window должен быть больше 0');
            }
        }
        // Предложения по улучшению
        if (!config.headers['User-Agent']) {
            suggestions.push('Добавьте User-Agent заголовок для лучшей идентификации');
        }
        if (!config.headers['X-Request-ID']) {
            suggestions.push('Добавьте X-Request-ID заголовок для трекинга запросов');
        }
        if (config.timeout < 5000) {
            suggestions.push('Рассмотрите увеличение timeout для стабильности');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Валидирует конфигурацию сервиса
     */
    validateServiceConfig(config) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Проверяем обязательные поля
        if (!config.id) {
            errors.push('id обязателен');
        }
        else if (!this.isValidServiceId(config.id)) {
            errors.push('id должен содержать только буквы, цифры и дефисы');
        }
        if (!config.name) {
            errors.push('name обязателен');
        }
        if (!config.description) {
            errors.push('description обязателен');
        }
        if (!config.version) {
            errors.push('version обязателен');
        }
        else if (!this.isValidVersion(config.version)) {
            errors.push('version должен быть в формате semver (например, 1.0.0)');
        }
        if (!config.icon) {
            errors.push('icon обязателен');
        }
        else if (!this.isValidIcon(config.icon)) {
            warnings.push(`Иконка ${config.icon} может не поддерживаться`);
        }
        if (config.priority < 0) {
            errors.push('priority не может быть отрицательным');
        }
        if (config.isActive === undefined) {
            warnings.push('isActive не указан, будет использовано значение по умолчанию');
        }
        // Проверяем инструменты
        if (config.tools && Array.isArray(config.tools)) {
            config.tools.forEach((tool, index) => {
                if (!tool.id) {
                    errors.push(`tool[${index}].id обязателен`);
                }
                if (!tool.name) {
                    errors.push(`tool[${index}].name обязателен`);
                }
                if (!tool.description) {
                    errors.push(`tool[${index}].description обязателен`);
                }
                if (tool.isEnabled === undefined) {
                    warnings.push(`tool[${index}].isEnabled не указан`);
                }
            });
        }
        // Проверяем chatButtons
        if (config.chatButtons && Array.isArray(config.chatButtons)) {
            config.chatButtons.forEach((button, index) => {
                if (!button.id) {
                    errors.push(`chatButton[${index}].id обязателен`);
                }
                if (!button.name) {
                    errors.push(`chatButton[${index}].name обязателен`);
                }
                if (!button.action) {
                    errors.push(`chatButton[${index}].action обязателен`);
                }
                if (button.isEnabled === undefined) {
                    warnings.push(`chatButton[${index}].isEnabled не указан`);
                }
            });
        }
        // Предложения по улучшению
        if (!config.author) {
            suggestions.push('Добавьте информацию об авторе');
        }
        if (!config.category) {
            suggestions.push('Добавьте категорию сервиса');
        }
        if (!config.dependencies || config.dependencies.length === 0) {
            suggestions.push('Добавьте зависимости сервиса');
        }
        if (!config.theme) {
            suggestions.push('Добавьте тему сервиса');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Выполняет тесты коннектора
     */
    async testConnector(serviceId, config) {
        const results = [];
        const startTime = Date.now();
        // Тест 1: Проверка конфигурации
        const configValidation = this.validateConnectorConfig(config);
        results.push({
            serviceId,
            testName: 'config-validation',
            passed: configValidation.isValid,
            error: configValidation.errors.join(', '),
            duration: Date.now() - startTime,
            timestamp: new Date()
        });
        // Тест 2: Проверка доступности endpoint
        try {
            const response = await fetch(`${config.baseUrl}${config.healthCheck.endpoint}`, {
                method: 'GET',
                signal: AbortSignal.timeout(config.healthCheck.timeout),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Health-Check': 'true'
                }
            });
            results.push({
                serviceId,
                testName: 'endpoint-availability',
                passed: response.ok,
                error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
                duration: Date.now() - startTime,
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                serviceId,
                testName: 'endpoint-availability',
                passed: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
                duration: Date.now() - startTime,
                timestamp: new Date()
            });
        }
        // Тест 3: Проверка времени ответа
        try {
            const start = Date.now();
            await fetch(`${config.baseUrl}${config.healthCheck.endpoint}`, {
                method: 'GET',
                signal: AbortSignal.timeout(config.healthCheck.timeout)
            });
            const responseTime = Date.now() - start;
            results.push({
                serviceId,
                testName: 'response-time',
                passed: responseTime < config.timeout,
                error: responseTime >= config.timeout ? `Время ответа ${responseTime}ms превышает timeout ${config.timeout}ms` : undefined,
                duration: responseTime,
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                serviceId,
                testName: 'response-time',
                passed: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
                duration: Date.now() - startTime,
                timestamp: new Date()
            });
        }
        // Тест 4: Проверка авторизации (если есть)
        if (config.auth) {
            try {
                const headers = {};
                this.addAuthHeaders(headers, config.auth);
                await fetch(`${config.baseUrl}${config.healthCheck.endpoint}`, {
                    method: 'GET',
                    headers,
                    signal: AbortSignal.timeout(config.healthCheck.timeout)
                });
                results.push({
                    serviceId,
                    testName: 'auth-validation',
                    passed: true,
                    duration: Date.now() - startTime,
                    timestamp: new Date()
                });
            }
            catch (error) {
                results.push({
                    serviceId,
                    testName: 'auth-validation',
                    passed: false,
                    error: error instanceof Error ? error.message : 'Неизвестная ошибка',
                    duration: Date.now() - startTime,
                    timestamp: new Date()
                });
            }
        }
        this.testResults.set(serviceId, results);
        return results;
    }
    /**
     * Получает результаты тестов для сервиса
     */
    getTestResults(serviceId) {
        return this.testResults.get(serviceId) || [];
    }
    /**
     * Получает все результаты тестов
     */
    getAllTestResults() {
        return new Map(this.testResults);
    }
    /**
     * Очищает результаты тестов
     */
    clearTestResults(serviceId) {
        if (serviceId) {
            this.testResults.delete(serviceId);
        }
        else {
            this.testResults.clear();
        }
    }
    // Вспомогательные методы
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidServiceId(id) {
        return /^[a-zA-Z0-9-]+$/.test(id);
    }
    isValidVersion(version) {
        return /^\d+\.\d+\.\d+/.test(version);
    }
    isValidIcon(icon) {
        const validIcons = [
            'Bot', 'Settings', 'FileText', 'MessageCircle', 'Clock', 'Mic', 'Search',
            'Download', 'Upload', 'Edit', 'Plus', 'Minus', 'Check', 'X', 'Alert',
            'Info', 'Warning', 'Error', 'Success', 'Play', 'Pause', 'Stop',
            'Grid3X3', 'List', 'Layout', 'Monitor', 'Palette', 'Cog', 'Zap'
        ];
        return validIcons.includes(icon);
    }
    addAuthHeaders(headers, auth) {
        if (!auth)
            return;
        switch (auth.type) {
            case 'bearer':
                if (auth.token) {
                    headers['Authorization'] = `Bearer ${auth.token}`;
                }
                break;
            case 'api-key':
                if (auth.apiKey) {
                    headers['X-API-Key'] = auth.apiKey;
                }
                break;
            case 'basic':
                if (auth.username && auth.password) {
                    const credentials = btoa(`${auth.username}:${auth.password}`);
                    headers['Authorization'] = `Basic ${credentials}`;
                }
                break;
            case 'oauth':
                if (auth.token) {
                    headers['Authorization'] = `OAuth ${auth.token}`;
                }
                break;
        }
    }
}
// Экспортируем единственный экземпляр
export const connectorValidator = ConnectorValidator.getInstance();
//# sourceMappingURL=ConnectorValidator.js.map