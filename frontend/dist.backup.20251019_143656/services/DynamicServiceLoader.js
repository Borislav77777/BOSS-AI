/**
 * Кэш для загруженных модулей
 */
class ServiceModuleCache {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }
    /**
     * Получает модуль из кэша
     */
    get(serviceId) {
        return this.cache.get(serviceId);
    }
    /**
     * Сохраняет модуль в кэш
     */
    set(serviceId, module) {
        this.cache.set(serviceId, module);
    }
    /**
     * Проверяет, загружается ли модуль
     */
    isLoading(serviceId) {
        return this.loadingPromises.has(serviceId);
    }
    /**
     * Устанавливает промис загрузки
     */
    setLoadingPromise(serviceId, promise) {
        this.loadingPromises.set(serviceId, promise);
    }
    /**
     * Получает промис загрузки
     */
    getLoadingPromise(serviceId) {
        return this.loadingPromises.get(serviceId);
    }
    /**
     * Удаляет промис загрузки
     */
    deleteLoadingPromise(serviceId) {
        this.loadingPromises.delete(serviceId);
    }
    /**
     * Очищает кэш
     */
    clear() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
    /**
     * Удаляет модуль из кэша
     */
    delete(serviceId) {
        this.cache.delete(serviceId);
        this.loadingPromises.delete(serviceId);
    }
}
/**
 * Менеджер динамической загрузки сервисов
 */
export class DynamicServiceLoader {
    constructor() {
        this.cache = new ServiceModuleCache();
        this.basePath = '/services/modules/';
        this.configPath = '/services/';
    }
    /**
     * Загружает конфигурацию сервиса
     */
    async loadServiceConfig(serviceId) {
        try {
            const response = await fetch(`${this.configPath}${serviceId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load service config: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            console.error(`Error loading service config for ${serviceId}:`, errorMessage);
            // Создаем более информативную ошибку
            const enhancedError = new Error(`Failed to load service config for ${serviceId}: ${errorMessage}`);
            if (error instanceof Error && error.stack) {
                enhancedError.stack = error.stack;
            }
            throw enhancedError;
        }
    }
    /**
     * Загружает модуль сервиса динамически
     */
    async loadServiceModule(serviceId) {
        // Проверяем кэш
        const cached = this.cache.get(serviceId);
        if (cached) {
            return cached;
        }
        // Проверяем, загружается ли уже
        const loadingPromise = this.cache.getLoadingPromise(serviceId);
        if (loadingPromise) {
            return loadingPromise;
        }
        // Создаем промис загрузки
        const loadPromise = this.loadModuleFromPath(serviceId);
        this.cache.setLoadingPromise(serviceId, loadPromise);
        try {
            const module = await loadPromise;
            this.cache.set(serviceId, module);
            this.cache.deleteLoadingPromise(serviceId);
            return module;
        }
        catch (error) {
            this.cache.deleteLoadingPromise(serviceId);
            throw error;
        }
    }
    /**
     * Загружает модуль из файловой системы
     */
    async loadModuleFromPath(serviceId) {
        try {
            // Пытаемся загрузить модуль через динамический импорт
            const modulePath = `${this.basePath}${serviceId}/index.js`;
            // В development режиме используем Vite's dynamic import
            if (import.meta.env.DEV) {
                const dynamicModule = await import(/* @vite-ignore */ modulePath);
                if (dynamicModule.default) {
                    return dynamicModule.default;
                }
                else {
                    throw new Error('Module does not have a default export');
                }
            }
            else {
                // В production режиме используем обычный fetch
                const response = await fetch(modulePath);
                if (!response.ok) {
                    throw new Error(`Failed to load module: ${response.statusText}`);
                }
                // Создаем blob URL для выполнения модуля
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                try {
                    const dynamicModule = await import(/* @vite-ignore */ url);
                    return dynamicModule.default;
                }
                finally {
                    URL.revokeObjectURL(url);
                }
            }
        }
        catch (error) {
            console.error(`Error loading service module ${serviceId}:`, error);
            // Возвращаем заглушку, если модуль не найден
            return this.createFallbackModule(serviceId);
        }
    }
    /**
     * Создает заглушку для несуществующего модуля
     */
    createFallbackModule(serviceId) {
        return {
            initialize: async () => {
                console.warn(`Service ${serviceId} is using fallback module`);
            },
            execute: async (toolId, _params) => {
                console.warn(`Tool ${toolId} from service ${serviceId} is not implemented`);
                return { error: 'Tool not implemented' };
            },
            cleanup: async () => {
                // console.log(`Cleaning up fallback module for ${serviceId}`);
            }
        };
    }
    /**
     * Предзагружает модуль сервиса
     */
    async preloadService(serviceId) {
        try {
            await this.loadServiceModule(serviceId);
            // console.log(`Service ${serviceId} preloaded successfully`);
        }
        catch (error) {
            console.warn(`Failed to preload service ${serviceId}:`, error);
        }
    }
    /**
     * Предзагружает несколько сервисов параллельно
     */
    async preloadServices(serviceIds) {
        const promises = serviceIds.map(id => this.preloadService(id));
        await Promise.allSettled(promises);
    }
    /**
     * Выгружает модуль из памяти
     */
    unloadService(serviceId) {
        const module = this.cache.get(serviceId);
        if (module && module.cleanup) {
            module.cleanup().catch(error => {
                console.error(`Error cleaning up service ${serviceId}:`, error);
            });
        }
        this.cache.delete(serviceId);
    }
    /**
     * Проверяет, загружен ли сервис
     */
    isServiceLoaded(serviceId) {
        return this.cache.get(serviceId) !== undefined;
    }
    /**
     * Проверяет, загружается ли сервис
     */
    isServiceLoading(serviceId) {
        return this.cache.isLoading(serviceId);
    }
    /**
     * Получает список загруженных сервисов
     */
    getLoadedServices() {
        return Array.from(this.cache['cache'].keys());
    }
    /**
     * Очищает кэш
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Устанавливает базовый путь для модулей
     */
    setBasePath(path) {
        this.basePath = path;
    }
    /**
     * Устанавливает путь для конфигураций
     */
    setConfigPath(path) {
        this.configPath = path;
    }
}
// Создаем единственный экземпляр загрузчика
export const dynamicServiceLoader = new DynamicServiceLoader();
//# sourceMappingURL=DynamicServiceLoader.js.map