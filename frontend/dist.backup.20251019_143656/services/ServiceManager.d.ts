import { ChatHandler, ServiceChatButton } from '@/services/ChatIntegration/types';
import { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
import { ChatButton, ServiceConfig, ServiceManager, ServiceModule, ServiceTool } from '@/types/services';
declare class ServiceManagerImpl implements ServiceManager {
    services: ServiceModule[];
    private hasLoadedOnce;
    private isLoading;
    /**
     * Проводит быструю валидацию и нормализацию конфигурации сервиса.
     * - Проставляет tool.action = tool.id, если action отсутствует
     * - Проверяет соответствие action ↔ id и логирует предупреждение при расхождении
     * - Валидирует позиции chatButtons (top/bottom), дефолтит к 'top'
     * - Проверяет, что chatButtons.action соответствует id одного из tools/chatFunctions
     */
    private validateAndNormalizeConfig;
    /**
     * Загружает все сервисы из папки services
     */
    loadAllServices(): Promise<void>;
    /**
     * Загружает сервис из JSON файла
     */
    private loadServiceFromFile;
    /**
     * Загружает конкретный сервис по ID с динамической загрузкой модуля
     */
    loadService(serviceId: string): Promise<void>;
    /**
     * Выгружает сервис
     */
    unloadService(serviceId: string): void;
    /**
     * Получает сервис по ID
     */
    getService(serviceId: string): ServiceModule | undefined;
    /**
     * Получает все сервисы
     */
    getAllServices(): ServiceModule[];
    /**
     * Выполняет инструмент сервиса
     */
    executeTool(serviceId: string, toolId: string, params?: Record<string, unknown>): Promise<unknown>;
    /**
     * Выполняет чат функцию сервиса
     */
    executeChatFunction(service: ServiceModule, tool: ServiceTool, params?: Record<string, unknown>): Promise<unknown>;
    /**
     * Получает все чат кнопки от активных сервисов
     */
    getChatButtons(): ChatButton[];
    /**
     * Прогоняет валидацию для всех загруженных конфигураций сервисов (runtime‑проверка)
     */
    validateAllServices(): void;
    /**
     * Возвращает кнопки чата, сгруппированные по позиции и сервису
     */
    getChatButtonsGrouped(): {
        top: {
            serviceId: string;
            serviceName: string;
            serviceIcon?: string;
            buttons: ChatButton[];
        }[];
        bottom: {
            serviceId: string;
            serviceName: string;
            serviceIcon?: string;
            buttons: ChatButton[];
        }[];
    };
    /**
     * Пытается найти чат-функцию для кнопки (по action/id) внутри сервиса
     */
    private findChatFunctionInService;
    /**
     * Выполняет связанную с кнопкой чат-функцию, если удаётся сопоставить
     */
    executeChatButton(serviceId: string, button: ChatButton, params?: Record<string, unknown>): Promise<unknown>;
    /**
     * Получает чат функции от активных сервисов
     */
    getChatFunctions(): ServiceTool[];
    /**
     * Получает все активные сервисы
     */
    getActiveServices(): ServiceModule[];
    /**
     * Сортирует сервисы по приоритету
     */
    getSortedServices(): ServiceModule[];
    /**
     * Предзагружает сервис
     */
    preloadService(serviceId: string): Promise<void>;
    /**
     * Предзагружает несколько сервисов параллельно
     */
    preloadServices(serviceIds: string[]): Promise<void>;
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
     * Получает информацию о сервисе из реестра
     */
    getServiceInfo(serviceId: string): import("@/services/ServiceRegistry").ServiceRegistryEntry | null;
    /**
     * Получает возможности сервиса
     */
    getServiceCapabilities(serviceId: string): import("@/services/ServiceRegistry").ServiceCapabilities | null;
    /**
     * Валидирует сервис
     */
    validateService(service: ServiceConfig): import("@/services/ServiceRegistry").ServiceValidationResult;
    /**
     * Проверяет зависимости сервиса
     */
    validateServiceDependencies(serviceId: string): import("@/services/ServiceRegistry").ServiceValidationResult;
    /**
     * Получает сервисы по категории
     */
    getServicesByCategory(category: string): import("@/services/ServiceRegistry").ServiceRegistryEntry[];
    /**
     * Активирует сервис
     */
    activateService(serviceId: string): Promise<boolean>;
    /**
     * Деактивирует сервис
     */
    deactivateService(serviceId: string): Promise<boolean>;
    /**
     * Подписывается на события реестра
     */
    onServiceRegistered(callback: (service: ServiceConfig) => void): void;
    onServiceUnregistered(callback: (serviceId: string) => void): void;
    onServiceActivated(callback: (serviceId: string) => void): void;
    onServiceDeactivated(callback: (serviceId: string) => void): void;
    /**
     * Регистрирует интеграцию сервиса с Workspace
     */
    registerWorkspaceIntegration(serviceId: string, workspaceItems: WorkspaceItem[], autoCreate?: boolean): void;
    /**
     * Создает элемент Workspace для сервиса
     */
    createWorkspaceItem(serviceId: string, templateId: string, data?: unknown): WorkspaceItem;
    /**
     * Получает элементы Workspace сервиса
     */
    getServiceWorkspaceItems(serviceId: string): WorkspaceItem[];
    /**
     * Синхронизирует Workspace с платформой
     */
    syncWorkspace(): void;
    /**
     * Регистрирует интеграцию сервиса с чатом
     */
    registerChatIntegration(serviceId: string, handlers: ChatHandler[], chatButtons: ServiceChatButton[]): void;
    /**
     * Получает кнопки чата сервиса
     */
    getServiceChatButtons(serviceId: string): unknown[];
    /**
     * Получает обработчики чата сервиса
     */
    getServiceChatHandlers(serviceId: string): unknown[];
    /**
     * Синхронизирует чат с платформой
     */
    syncChat(): void;
    /**
     * Создает канал связи между сервисами
     */
    createServiceChannel(name: string, type: 'direct' | 'broadcast' | 'multicast' | 'unicast', participants: string[]): unknown;
    /**
     * Отправляет сообщение между сервисами
     */
    sendServiceMessage(recipientId: string, content: unknown, type?: string): Promise<boolean>;
    /**
     * Получает статус сервиса
     */
    getServiceStatus(serviceId: string): 'online' | 'offline' | 'busy' | 'away';
    /**
     * Устанавливает статус сервиса
     */
    setServiceStatus(serviceId: string, status: 'online' | 'offline' | 'busy' | 'away'): void;
    /**
     * Синхронизирует данные сервиса
     */
    syncServiceData(serviceId: string, data: unknown): void;
    /**
     * Получает данные сервиса
     */
    getServiceData(serviceId: string): unknown;
    /**
     * Получает статистику взаимодействия сервисов
     */
    getServiceCommunicationStats(): unknown;
    /**
     * Публикует событие через Service Bus
     */
    publishEvent(eventType: string, data: unknown, source?: string): void;
    /**
     * Подписывается на события через Service Bus
     */
    subscribeToEvents(eventType: string, handler: (event: unknown) => void): string;
    /**
     * Отправляет запрос сервису через Service Bus
     */
    requestFromService(serviceId: string, method: string, params: unknown): Promise<unknown>;
    /**
     * Регистрирует обработчик запросов для сервиса
     */
    registerServiceHandler(serviceId: string, method: string, handler: (params: unknown) => Promise<unknown>): void;
}
export declare const serviceManager: ServiceManagerImpl;
export {};
//# sourceMappingURL=ServiceManager.d.ts.map