/**
 * Централизованный реестр сервисов
 */
import { ServiceValidator } from './ServiceValidator';
export class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.eventListeners = {
            onServiceRegistered: [],
            onServiceUnregistered: [],
            onServiceActivated: [],
            onServiceDeactivated: []
        };
        this.validator = new ServiceValidator();
    }
    /**
     * Регистрирует сервис в реестре
     */
    async registerService(service) {
        // Валидируем сервис
        const validation = this.validator.validateService(service);
        if (!validation.isValid) {
            return validation;
        }
        // Проверяем конфликты
        const existingServices = Array.from(this.services.values()).map(entry => entry.config);
        const conflicts = this.validator.checkConflicts(service, existingServices);
        if (conflicts.length > 0) {
            return {
                isValid: false,
                errors: conflicts,
                warnings: validation.warnings,
                suggestions: validation.suggestions
            };
        }
        // Создаем запись в реестре
        const capabilities = this.extractCapabilities(service);
        const dependencies = this.extractDependencies(service);
        const entry = {
            config: service,
            capabilities,
            dependencies,
            isRegistered: true,
            isActive: service.isActive || false,
            lastUpdated: new Date(),
            metadata: {
                author: service.author || 'Unknown',
                license: 'MIT', // TODO: извлекать из конфигурации
                repository: undefined,
                documentation: undefined
            }
        };
        // Сохраняем в реестре
        this.services.set(service.id, entry);
        // Уведомляем слушателей
        this.eventListeners.onServiceRegistered.forEach(callback => callback(entry));
        return {
            isValid: true,
            errors: [],
            warnings: validation.warnings,
            suggestions: validation.suggestions
        };
    }
    /**
     * Удаляет сервис из реестра
     */
    async unregisterService(serviceId) {
        const entry = this.services.get(serviceId);
        if (!entry) {
            return false;
        }
        // Проверяем зависимости
        const dependentServices = this.getDependentServices(serviceId);
        if (dependentServices.length > 0) {
            console.warn(`Нельзя удалить сервис ${serviceId}: от него зависят ${dependentServices.join(', ')}`);
            return false;
        }
        // Удаляем из реестра
        this.services.delete(serviceId);
        // Уведомляем слушателей
        this.eventListeners.onServiceUnregistered.forEach(callback => callback(serviceId));
        return true;
    }
    /**
     * Очищает весь реестр сервисов
     */
    async clearRegistry() {
        console.log('[ServiceRegistry] Очистка реестра сервисов');
        this.services.clear();
        this.eventListeners = {
            onServiceRegistered: [],
            onServiceUnregistered: [],
            onServiceActivated: [],
            onServiceDeactivated: []
        };
    }
    /**
     * Получает сервис по ID
     */
    getService(serviceId) {
        return this.services.get(serviceId) || null;
    }
    /**
     * Получает все сервисы
     */
    getAllServices() {
        return Array.from(this.services.values());
    }
    /**
     * Получает сервисы по категории
     */
    getServicesByCategory(category) {
        return Array.from(this.services.values()).filter(entry => entry.config.category === category);
    }
    /**
     * Получает возможности сервиса
     */
    getServiceCapabilities(serviceId) {
        const entry = this.services.get(serviceId);
        return entry ? entry.capabilities : null;
    }
    /**
     * Валидирует сервис
     */
    validateService(service) {
        return this.validator.validateService(service);
    }
    /**
     * Валидирует зависимости сервиса
     */
    validateDependencies(serviceId) {
        const entry = this.services.get(serviceId);
        if (!entry) {
            return {
                isValid: false,
                errors: [`Сервис ${serviceId} не найден`],
                warnings: [],
                suggestions: []
            };
        }
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Проверяем каждую зависимость
        entry.dependencies.forEach(dep => {
            const depEntry = this.services.get(dep.serviceId);
            if (!depEntry) {
                if (dep.optional) {
                    warnings.push(`Опциональная зависимость ${dep.serviceId} не найдена`);
                }
                else {
                    errors.push(`Обязательная зависимость ${dep.serviceId} не найдена`);
                }
            }
            else if (!depEntry.isActive) {
                if (dep.optional) {
                    warnings.push(`Опциональная зависимость ${dep.serviceId} неактивна`);
                }
                else {
                    errors.push(`Обязательная зависимость ${dep.serviceId} неактивна`);
                }
            }
        });
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Проверяет конфликты
     */
    checkConflicts(serviceId) {
        const entry = this.services.get(serviceId);
        if (!entry)
            return [];
        const existingServices = Array.from(this.services.values())
            .filter(e => e.config.id !== serviceId)
            .map(e => e.config);
        return this.validator.checkConflicts(entry.config, existingServices);
    }
    /**
     * Получает зависимости сервиса
     */
    getServiceDependencies(serviceId) {
        const entry = this.services.get(serviceId);
        return entry ? entry.dependencies : [];
    }
    /**
     * Получает сервисы, зависящие от данного
     */
    getDependentServices(serviceId) {
        const dependent = [];
        this.services.forEach((entry, id) => {
            if (id !== serviceId) {
                const hasDependency = entry.dependencies.some(dep => dep.serviceId === serviceId);
                if (hasDependency) {
                    dependent.push(id);
                }
            }
        });
        return dependent;
    }
    /**
     * Разрешает дерево зависимостей
     */
    resolveDependencyTree(serviceId) {
        const resolved = [];
        const visited = new Set();
        const resolve = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const entry = this.services.get(id);
            if (entry) {
                entry.dependencies.forEach(dep => {
                    resolve(dep.serviceId);
                });
                resolved.push(id);
            }
        };
        resolve(serviceId);
        return resolved;
    }
    /**
     * Проверяет, зарегистрирован ли сервис
     */
    isServiceRegistered(serviceId) {
        return this.services.has(serviceId);
    }
    /**
     * Проверяет, активен ли сервис
     */
    isServiceActive(serviceId) {
        const entry = this.services.get(serviceId);
        return entry ? entry.isActive : false;
    }
    /**
     * Активирует сервис
     */
    async activateService(serviceId) {
        const entry = this.services.get(serviceId);
        if (!entry) {
            return false;
        }
        // Проверяем зависимости
        const dependencyValidation = this.validateDependencies(serviceId);
        if (!dependencyValidation.isValid) {
            console.error(`Нельзя активировать сервис ${serviceId}:`, dependencyValidation.errors);
            return false;
        }
        // Активируем сервис
        entry.isActive = true;
        entry.config.isActive = true;
        // Уведомляем слушателей
        this.eventListeners.onServiceActivated.forEach(callback => callback(serviceId));
        return true;
    }
    /**
     * Деактивирует сервис
     */
    async deactivateService(serviceId) {
        const entry = this.services.get(serviceId);
        if (!entry) {
            return false;
        }
        // Проверяем зависимые сервисы
        const dependentServices = this.getDependentServices(serviceId);
        if (dependentServices.length > 0) {
            console.warn(`Нельзя деактивировать сервис ${serviceId}: от него зависят ${dependentServices.join(', ')}`);
            return false;
        }
        // Деактивируем сервис
        entry.isActive = false;
        entry.config.isActive = false;
        // Уведомляем слушателей
        this.eventListeners.onServiceDeactivated.forEach(callback => callback(serviceId));
        return true;
    }
    /**
     * Подписывается на события регистрации сервисов
     */
    onServiceRegistered(callback) {
        this.eventListeners.onServiceRegistered.push(callback);
    }
    /**
     * Подписывается на события удаления сервисов
     */
    onServiceUnregistered(callback) {
        this.eventListeners.onServiceUnregistered.push(callback);
    }
    /**
     * Подписывается на события активации сервисов
     */
    onServiceActivated(callback) {
        this.eventListeners.onServiceActivated.push(callback);
    }
    /**
     * Подписывается на события деактивации сервисов
     */
    onServiceDeactivated(callback) {
        this.eventListeners.onServiceDeactivated.push(callback);
    }
    /**
     * Извлекает возможности сервиса
     */
    extractCapabilities(service) {
        return {
            id: service.id,
            name: service.name,
            version: service.version,
            category: service.category,
            capabilities: {
                settings: !!service.settings,
                workspace: false, // TODO: Добавить workspaceItems в ServiceConfig
                chat: !!(service.chatButtons && service.chatButtons.length > 0),
                widgets: service.category === 'widgets',
                api: !!service.chatApiBaseUrl, // TODO: Добавить apiEndpoints в ServiceConfig
                events: false // TODO: Добавить eventHandlers в ServiceConfig
            },
            dependencies: service.dependencies || [],
            conflicts: [],
            requirements: {
                minPlatformVersion: '1.0.0',
                nodeVersion: '>=16.0.0',
                browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
            }
        };
    }
    /**
     * Извлекает зависимости сервиса
     */
    extractDependencies(service) {
        if (!service.dependencies)
            return [];
        return service.dependencies.map(dep => ({
            serviceId: dep,
            version: 'latest',
            optional: false,
            description: `Зависимость от сервиса ${dep}`
        }));
    }
}
//# sourceMappingURL=ServiceRegistry.js.map