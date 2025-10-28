/**
 * Сервис для управления code splitting
 */
export interface CodeSplittingConfig {
    enablePreloading: boolean;
    enablePrefetching: boolean;
    preloadDelay: number;
    prefetchDelay: number;
    maxPreloadedModules: number;
    enableIntersectionObserver: boolean;
    enableRouteBasedSplitting: boolean;
}
export interface ModuleInfo {
    name: string;
    path: string;
    size: number;
    loadTime: number;
    isLoaded: boolean;
    isPreloaded: boolean;
    isPrefetched: boolean;
    lastAccessed: Date;
    accessCount: number;
}
declare class CodeSplittingService {
    private config;
    private modules;
    private preloadQueue;
    private prefetchQueue;
    private intersectionObserver;
    constructor(config: CodeSplittingConfig);
    /**
     * Инициализирует сервис
     */
    private initializeService;
    /**
     * Динамически загружает модуль
     */
    loadModule<T = unknown>(modulePath: string, moduleName: string, _options?: {
        preload?: boolean;
        prefetch?: boolean;
        priority?: 'high' | 'normal' | 'low';
    }): Promise<T>;
    /**
     * Предзагружает модуль
     */
    preloadModule(modulePath: string, moduleName: string): Promise<void>;
    /**
     * Предзагружает модуль (только метаданные)
     */
    prefetchModule(modulePath: string, moduleName: string): Promise<void>;
    /**
     * Загружает модуль по требованию
     */
    loadModuleOnDemand<T = unknown>(modulePath: string, moduleName: string, trigger: () => boolean, options?: {
        preload?: boolean;
        prefetch?: boolean;
    }): Promise<T | null>;
    /**
     * Получает информацию о модуле
     */
    getModuleInfo(moduleName: string): ModuleInfo | null;
    /**
     * Получает все модули
     */
    getAllModules(): ModuleInfo[];
    /**
     * Получает статистику загрузки
     */
    getLoadingStats(): {
        totalModules: number;
        loadedModules: number;
        preloadedModules: number;
        prefetchedModules: number;
        averageLoadTime: number;
        totalSize: number;
    };
    /**
     * Очищает кэш модулей
     */
    clearCache(): void;
    /**
     * Останавливает сервис
     */
    stop(): void;
    /**
     * Настраивает Intersection Observer
     */
    private setupIntersectionObserver;
    /**
     * Настраивает предзагрузку
     */
    private setupPreloading;
    /**
     * Настраивает предзагрузку метаданных
     */
    private setupPrefetching;
    /**
     * Обновляет информацию о доступе к модулю
     */
    private updateModuleAccess;
    /**
     * Получает количество предзагруженных модулей
     */
    private getPreloadedModulesCount;
    /**
     * Оценивает размер модуля
     */
    private estimateModuleSize;
    /**
     * Кэширует модуль
     */
    private cacheModule;
    /**
     * Получает кэшированный модуль
     */
    private getCachedModule;
}
export declare const codeSplittingService: CodeSplittingService;
export {};
//# sourceMappingURL=CodeSplittingService.d.ts.map