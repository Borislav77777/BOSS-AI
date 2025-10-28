/**
 * Сервис для управления code splitting
 */
class CodeSplittingService {
    constructor(config) {
        this.modules = new Map();
        this.preloadQueue = [];
        this.prefetchQueue = [];
        this.intersectionObserver = null;
        this.config = config;
        this.initializeService();
    }
    /**
     * Инициализирует сервис
     */
    initializeService() {
        if (this.config.enableIntersectionObserver) {
            this.setupIntersectionObserver();
        }
        if (this.config.enablePreloading) {
            this.setupPreloading();
        }
        if (this.config.enablePrefetching) {
            this.setupPrefetching();
        }
    }
    /**
     * Динамически загружает модуль
     */
    async loadModule(modulePath, moduleName, _options = {}) {
        const startTime = performance.now();
        try {
            // Проверяем, не загружен ли уже модуль
            if (this.modules.has(moduleName) && this.modules.get(moduleName).isLoaded) {
                this.updateModuleAccess(moduleName);
                return this.getCachedModule(moduleName);
            }
            // Загружаем модуль
            const module = await import(/* @vite-ignore */ modulePath);
            const loadTime = performance.now() - startTime;
            // Сохраняем информацию о модуле
            this.modules.set(moduleName, {
                name: moduleName,
                path: modulePath,
                size: this.estimateModuleSize(module),
                loadTime,
                isLoaded: true,
                isPreloaded: false,
                isPrefetched: false,
                lastAccessed: new Date(),
                accessCount: 1
            });
            // Кэшируем модуль
            this.cacheModule(moduleName, module);
            return module.default || module;
        }
        catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }
    /**
     * Предзагружает модуль
     */
    async preloadModule(modulePath, moduleName) {
        if (!this.config.enablePreloading) {
            return;
        }
        // Проверяем лимит предзагруженных модулей
        if (this.getPreloadedModulesCount() >= this.config.maxPreloadedModules) {
            return;
        }
        // Проверяем, не загружен ли уже модуль
        if (this.modules.has(moduleName) && this.modules.get(moduleName).isLoaded) {
            return;
        }
        try {
            // Добавляем в очередь предзагрузки
            this.preloadQueue.push(moduleName);
            // Загружаем модуль
            const module = await import(/* @vite-ignore */ modulePath);
            // Обновляем информацию о модуле
            const moduleInfo = this.modules.get(moduleName) || {
                name: moduleName,
                path: modulePath,
                size: 0,
                loadTime: 0,
                isLoaded: false,
                isPreloaded: false,
                isPrefetched: false,
                lastAccessed: new Date(),
                accessCount: 0
            };
            moduleInfo.isPreloaded = true;
            moduleInfo.size = this.estimateModuleSize(module);
            this.modules.set(moduleName, moduleInfo);
            // Кэшируем модуль
            this.cacheModule(moduleName, module);
            // Удаляем из очереди
            this.preloadQueue = this.preloadQueue.filter(name => name !== moduleName);
        }
        catch (error) {
            console.error(`Failed to preload module ${moduleName}:`, error);
        }
    }
    /**
     * Предзагружает модуль (только метаданные)
     */
    async prefetchModule(modulePath, moduleName) {
        if (!this.config.enablePrefetching) {
            return;
        }
        // Проверяем, не загружен ли уже модуль
        if (this.modules.has(moduleName) && this.modules.get(moduleName).isLoaded) {
            return;
        }
        try {
            // Добавляем в очередь предзагрузки
            this.prefetchQueue.push(moduleName);
            // Создаем ссылку на модуль для предзагрузки
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = modulePath;
            document.head.appendChild(link);
            // Обновляем информацию о модуле
            const moduleInfo = this.modules.get(moduleName) || {
                name: moduleName,
                path: modulePath,
                size: 0,
                loadTime: 0,
                isLoaded: false,
                isPreloaded: false,
                isPrefetched: false,
                lastAccessed: new Date(),
                accessCount: 0
            };
            moduleInfo.isPrefetched = true;
            this.modules.set(moduleName, moduleInfo);
            // Удаляем из очереди
            this.prefetchQueue = this.prefetchQueue.filter(name => name !== moduleName);
        }
        catch (error) {
            console.error(`Failed to prefetch module ${moduleName}:`, error);
        }
    }
    /**
     * Загружает модуль по требованию
     */
    async loadModuleOnDemand(modulePath, moduleName, trigger, options = {}) {
        // Предзагружаем, если нужно
        if (options.preload) {
            this.preloadModule(modulePath, moduleName);
        }
        // Предзагружаем метаданные, если нужно
        if (options.prefetch) {
            this.prefetchModule(modulePath, moduleName);
        }
        // Ждем триггера
        if (trigger()) {
            return this.loadModule(modulePath, moduleName);
        }
        return null;
    }
    /**
     * Получает информацию о модуле
     */
    getModuleInfo(moduleName) {
        return this.modules.get(moduleName) || null;
    }
    /**
     * Получает все модули
     */
    getAllModules() {
        return Array.from(this.modules.values());
    }
    /**
     * Получает статистику загрузки
     */
    getLoadingStats() {
        const modules = Array.from(this.modules.values());
        return {
            totalModules: modules.length,
            loadedModules: modules.filter(m => m.isLoaded).length,
            preloadedModules: modules.filter(m => m.isPreloaded).length,
            prefetchedModules: modules.filter(m => m.isPrefetched).length,
            averageLoadTime: modules.length > 0
                ? modules.reduce((sum, m) => sum + m.loadTime, 0) / modules.length
                : 0,
            totalSize: modules.reduce((sum, m) => sum + m.size, 0)
        };
    }
    /**
     * Очищает кэш модулей
     */
    clearCache() {
        this.modules.clear();
        this.preloadQueue = [];
        this.prefetchQueue = [];
    }
    /**
     * Останавливает сервис
     */
    stop() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
    }
    /**
     * Настраивает Intersection Observer
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) {
            return;
        }
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const moduleName = entry.target.getAttribute('data-module-name');
                    const modulePath = entry.target.getAttribute('data-module-path');
                    if (moduleName && modulePath) {
                        this.preloadModule(modulePath, moduleName);
                    }
                }
            });
        }, { threshold: 0.1 });
    }
    /**
     * Настраивает предзагрузку
     */
    setupPreloading() {
        // Здесь можно добавить логику для автоматической предзагрузки
        // на основе пользовательского поведения
    }
    /**
     * Настраивает предзагрузку метаданных
     */
    setupPrefetching() {
        // Здесь можно добавить логику для автоматической предзагрузки метаданных
        // на основе пользовательского поведения
    }
    /**
     * Обновляет информацию о доступе к модулю
     */
    updateModuleAccess(moduleName) {
        const module = this.modules.get(moduleName);
        if (module) {
            module.lastAccessed = new Date();
            module.accessCount++;
        }
    }
    /**
     * Получает количество предзагруженных модулей
     */
    getPreloadedModulesCount() {
        return Array.from(this.modules.values()).filter(m => m.isPreloaded).length;
    }
    /**
     * Оценивает размер модуля
     */
    estimateModuleSize(module) {
        // Простая оценка размера модуля
        return JSON.stringify(module).length * 2; // Примерная оценка в байтах
    }
    /**
     * Кэширует модуль
     */
    cacheModule(_moduleName, _module) {
        // Здесь можно добавить логику кэширования
        // Например, в localStorage или IndexedDB
    }
    /**
     * Получает кэшированный модуль
     */
    getCachedModule(moduleName) {
        // Здесь можно добавить логику получения из кэша
        throw new Error(`Module ${moduleName} not found in cache`);
    }
}
// Создаем экземпляр сервиса
export const codeSplittingService = new CodeSplittingService({
    enablePreloading: true,
    enablePrefetching: true,
    preloadDelay: 1000, // 1 секунда
    prefetchDelay: 500, // 0.5 секунды
    maxPreloadedModules: 10,
    enableIntersectionObserver: true,
    enableRouteBasedSplitting: true
});
//# sourceMappingURL=CodeSplittingService.js.map