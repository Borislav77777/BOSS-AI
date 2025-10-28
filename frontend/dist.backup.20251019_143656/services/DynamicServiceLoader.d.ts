import { ServiceConfig, ServiceModuleInterface } from '@/types/services';
/**
 * Интерфейс для динамически загружаемых модулей сервисов
 */
export interface DynamicServiceModule {
    default: ServiceModuleInterface;
    config?: ServiceConfig;
}
/**
 * Менеджер динамической загрузки сервисов
 */
export declare class DynamicServiceLoader {
    private cache;
    private basePath;
    private configPath;
    /**
     * Загружает конфигурацию сервиса
     */
    loadServiceConfig(serviceId: string): Promise<ServiceConfig>;
    /**
     * Загружает модуль сервиса динамически
     */
    loadServiceModule(serviceId: string): Promise<ServiceModuleInterface>;
    /**
     * Загружает модуль из файловой системы
     */
    private loadModuleFromPath;
    /**
     * Создает заглушку для несуществующего модуля
     */
    private createFallbackModule;
    /**
     * Предзагружает модуль сервиса
     */
    preloadService(serviceId: string): Promise<void>;
    /**
     * Предзагружает несколько сервисов параллельно
     */
    preloadServices(serviceIds: string[]): Promise<void>;
    /**
     * Выгружает модуль из памяти
     */
    unloadService(serviceId: string): void;
    /**
     * Проверяет, загружен ли сервис
     */
    isServiceLoaded(serviceId: string): boolean;
    /**
     * Проверяет, загружается ли сервис
     */
    isServiceLoading(serviceId: string): boolean;
    /**
     * Получает список загруженных сервисов
     */
    getLoadedServices(): string[];
    /**
     * Очищает кэш
     */
    clearCache(): void;
    /**
     * Устанавливает базовый путь для модулей
     */
    setBasePath(path: string): void;
    /**
     * Устанавливает путь для конфигураций
     */
    setConfigPath(path: string): void;
}
export declare const dynamicServiceLoader: DynamicServiceLoader;
//# sourceMappingURL=DynamicServiceLoader.d.ts.map