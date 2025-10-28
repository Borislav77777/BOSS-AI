/**
 * Централизованный реестр сервисов
 */
import { ServiceConfig } from '@/types/services';
import { ServiceRegistry as IServiceRegistry, ServiceCapabilities, ServiceDependency, ServiceRegistryEntry, ServiceValidationResult } from './types';
export declare class ServiceRegistry implements IServiceRegistry {
    private services;
    private validator;
    private eventListeners;
    constructor();
    /**
     * Регистрирует сервис в реестре
     */
    registerService(service: ServiceConfig): Promise<ServiceValidationResult>;
    /**
     * Удаляет сервис из реестра
     */
    unregisterService(serviceId: string): Promise<boolean>;
    /**
     * Очищает весь реестр сервисов
     */
    clearRegistry(): Promise<void>;
    /**
     * Получает сервис по ID
     */
    getService(serviceId: string): ServiceRegistryEntry | null;
    /**
     * Получает все сервисы
     */
    getAllServices(): ServiceRegistryEntry[];
    /**
     * Получает сервисы по категории
     */
    getServicesByCategory(category: string): ServiceRegistryEntry[];
    /**
     * Получает возможности сервиса
     */
    getServiceCapabilities(serviceId: string): ServiceCapabilities | null;
    /**
     * Валидирует сервис
     */
    validateService(service: ServiceConfig): ServiceValidationResult;
    /**
     * Валидирует зависимости сервиса
     */
    validateDependencies(serviceId: string): ServiceValidationResult;
    /**
     * Проверяет конфликты
     */
    checkConflicts(serviceId: string): string[];
    /**
     * Получает зависимости сервиса
     */
    getServiceDependencies(serviceId: string): ServiceDependency[];
    /**
     * Получает сервисы, зависящие от данного
     */
    getDependentServices(serviceId: string): string[];
    /**
     * Разрешает дерево зависимостей
     */
    resolveDependencyTree(serviceId: string): string[];
    /**
     * Проверяет, зарегистрирован ли сервис
     */
    isServiceRegistered(serviceId: string): boolean;
    /**
     * Проверяет, активен ли сервис
     */
    isServiceActive(serviceId: string): boolean;
    /**
     * Активирует сервис
     */
    activateService(serviceId: string): Promise<boolean>;
    /**
     * Деактивирует сервис
     */
    deactivateService(serviceId: string): Promise<boolean>;
    /**
     * Подписывается на события регистрации сервисов
     */
    onServiceRegistered(callback: (service: ServiceRegistryEntry) => void): void;
    /**
     * Подписывается на события удаления сервисов
     */
    onServiceUnregistered(callback: (serviceId: string) => void): void;
    /**
     * Подписывается на события активации сервисов
     */
    onServiceActivated(callback: (serviceId: string) => void): void;
    /**
     * Подписывается на события деактивации сервисов
     */
    onServiceDeactivated(callback: (serviceId: string) => void): void;
    /**
     * Извлекает возможности сервиса
     */
    private extractCapabilities;
    /**
     * Извлекает зависимости сервиса
     */
    private extractDependencies;
}
//# sourceMappingURL=ServiceRegistry.d.ts.map