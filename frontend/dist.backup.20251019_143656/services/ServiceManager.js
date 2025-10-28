// vite types reference removed to avoid linter error
import { chatIntegrationManager } from '@/services/ChatIntegration';
import { dynamicServiceLoader } from '@/services/DynamicServiceLoader';
import { serviceBus } from '@/services/ServiceBus';
import { serviceCommunicationManager } from '@/services/ServiceCommunication';
import { serviceRegistry } from '@/services/ServiceRegistry';
import { themeManager } from '@/services/ThemeManager';
import { workspaceIntegrationManager } from '@/services/WorkspaceIntegration';
class ServiceManagerImpl {
    constructor() {
        this.services = [];
        this.hasLoadedOnce = false;
        this.isLoading = false;
    }
    /**
     * Проводит быструю валидацию и нормализацию конфигурации сервиса.
     * - Проставляет tool.action = tool.id, если action отсутствует
     * - Проверяет соответствие action ↔ id и логирует предупреждение при расхождении
     * - Валидирует позиции chatButtons (top/bottom), дефолтит к 'top'
     * - Проверяет, что chatButtons.action соответствует id одного из tools/chatFunctions
     */
    validateAndNormalizeConfig(config) {
        try {
            const normalized = { ...config };
            // Нормализуем инструменты
            if (Array.isArray(normalized.tools)) {
                normalized.tools = normalized.tools.map((tool) => {
                    const t = { ...tool };
                    if (!t.action) {
                        t.action = t.id;
                    }
                    if (t.action !== t.id) {
                        console.warn(`[services] Tool action differs from id in service ${normalized.id}: tool.id='${t.id}', action='${t.action}'`);
                    }
                    return t;
                });
            }
            // Нормализуем chatFunctions
            if (Array.isArray(normalized.chatFunctions)) {
                normalized.chatFunctions = normalized.chatFunctions.map((fn) => {
                    const f = { ...fn };
                    if (!f.id) {
                        console.warn(`[services] Chat function without id in service ${normalized.id}`);
                    }
                    if (!('action' in f) || !f.action) {
                        f.action = f.id;
                    }
                    if (f.action && f.id && f.action !== f.id) {
                        console.warn(`[services] Chat function action differs from id in service ${normalized.id}: id='${f.id}', action='${f.action}'`);
                    }
                    f.isChatFunction = true;
                    return f;
                });
            }
            // Соберем множество допустимых action/id
            const validIds = new Set();
            const validActions = new Set();
            (normalized.tools || []).forEach(t => { validIds.add(t.id); validActions.add(t.action || t.id); });
            (normalized.chatFunctions || []).forEach(f => { validIds.add(f.id); validActions.add(f.action || f.id); });
            // Валидируем chatButtons
            if (Array.isArray(normalized.chatButtons)) {
                normalized.chatButtons = normalized.chatButtons.map((btn) => {
                    const b = { ...btn };
                    if (!b.isEnabled && b.isEnabled !== false) {
                        b.isEnabled = true;
                    }
                    if (b.position !== 'top' && b.position !== 'bottom') {
                        if (b.position !== undefined) {
                            console.warn(`[services] Invalid chatButton.position '${b.position}' in service ${normalized.id}, defaulting to 'top'`);
                        }
                        b.position = 'top';
                    }
                    if (b.action && !(validIds.has(b.action) || validActions.has(b.action))) {
                        console.warn(`[services] chatButton.action '${b.action}' not found in tools/chatFunctions of service ${normalized.id}`);
                    }
                    return b;
                });
            }
            return normalized;
        }
        catch (e) {
            console.warn(`[services] Validation failed for service ${config.id}:`, e);
            return config;
        }
    }
    /**
     * Загружает все сервисы из папки services
     */
    async loadAllServices() {
        try {
            // Предотвращаем повторную загрузку если уже загружаем или загрузили
            if (this.isLoading) {
                console.log('[ServiceManager] Загрузка сервисов уже в процессе, пропускаем');
                return;
            }
            if (this.hasLoadedOnce && this.services.length > 0) {
                console.log('[ServiceManager] Сервисы уже загружены, пропускаем повторную загрузку');
                return;
            }
            this.isLoading = true;
            console.log('[ServiceManager] Начинаем загрузку сервисов...');
            // Сбрасываем внутренний список перед повторной загрузкой (во избежание дублей при HMR)
            this.services = [];
            // Очищаем реестр сервисов перед загрузкой
            await serviceRegistry.clearRegistry();
            // Список сервисов для загрузки
            const serviceFiles = [
                'ai-assistant.json',
                'example-service.json',
                'file-manager.json',
                'settings.json',
                'chatgpt-service.json',
                'widgets-service.json',
                'prompts-service.json',
                'real-speech-service.json',
                'ozon-manager.json',
                'photo-studio.json'
            ];
            for (const filename of serviceFiles) {
                try {
                    const response = await fetch(`/services/${filename}`);
                    if (!response.ok) {
                        console.warn(`Файл сервиса ${filename} не найден`);
                        continue;
                    }
                    const loaded = await response.json();
                    const config = this.validateAndNormalizeConfig(loaded);
                    // Регистрируем сервис в Service Registry
                    const registryResult = await serviceRegistry.registerService(config);
                    if (!registryResult.isValid) {
                        console.error(`Ошибка регистрации сервиса ${config.id}:`, registryResult.errors);
                        continue;
                    }
                    // Показываем предупреждения и предложения
                    if (registryResult.warnings.length > 0) {
                        console.warn(`Предупреждения для сервиса ${config.id}:`, registryResult.warnings);
                    }
                    if (registryResult.suggestions.length > 0) {
                        console.info(`Предложения для сервиса ${config.id}:`, registryResult.suggestions);
                    }
                    const serviceModule = { config, module: null, isLoaded: false };
                    // Избегаем дублей по id
                    if (!this.services.some(s => s.config.id === config.id)) {
                        this.services.push(serviceModule);
                        // Регистрируем тему сервиса если она есть
                        if (config.theme) {
                            themeManager.registerServiceTheme(config.id, config.theme);
                        }
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                    console.error(`Ошибка загрузки сервиса ${filename}:`, errorMessage);
                    // Логируем детали ошибки для отладки
                    if (error instanceof Error && error.stack) {
                        console.error('Stack trace:', error.stack);
                    }
                }
            }
            this.hasLoadedOnce = true;
            console.log('[ServiceManager] Загрузка сервисов завершена успешно');
        }
        catch (error) {
            console.error('Ошибка загрузки сервисов:', error);
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Загружает сервис из JSON файла
     */
    async loadServiceFromFile(filename) {
        try {
            const response = await fetch(`/services/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const config = await response.json();
            const normalized = this.validateAndNormalizeConfig(config);
            // Создаем модуль сервиса
            const serviceModule = {
                config: normalized,
                module: null, // Пока что модуль не загружается
                isLoaded: false,
            };
            // Загружаем только стандартизированные сервисы (например, настройки)
            if (config.id === 'settings' || config.category === 'settings') {
                this.services.push(serviceModule);
            }
        }
        catch (error) {
            console.error(`Ошибка загрузки сервиса ${filename}:`, error);
        }
    }
    /**
     * Загружает конкретный сервис по ID с динамической загрузкой модуля
     */
    async loadService(serviceId) {
        let service = this.services.find(s => s.config.id === serviceId);
        // Если сервис не найден в списке, пытаемся загрузить его конфигурацию
        if (!service) {
            try {
                const config = this.validateAndNormalizeConfig(await dynamicServiceLoader.loadServiceConfig(serviceId));
                service = {
                    config,
                    module: null,
                    isLoaded: false,
                };
                this.services.push(service);
                // Регистрируем тему сервиса если она есть
                if (config.theme) {
                    themeManager.registerServiceTheme(config.id, config.theme);
                }
            }
            catch (error) {
                console.error(`Не удалось загрузить конфигурацию сервиса ${serviceId}:`, error);
                throw new Error(`Сервис ${serviceId} не найден`);
            }
        }
        if (service.isLoaded) {
            return; // Сервис уже загружен
        }
        try {
            // Загружаем модуль сервиса динамически
            const module = await dynamicServiceLoader.loadServiceModule(serviceId);
            // Инициализируем модуль если есть метод initialize
            if (module.initialize) {
                await module.initialize();
            }
            service.module = module;
            service.isLoaded = true;
            service.error = undefined;
            // Сервис успешно загружен и инициализирован
        }
        catch (error) {
            service.error = error instanceof Error ? error.message : 'Неизвестная ошибка';
            console.error(`Ошибка загрузки сервиса ${serviceId}:`, error);
            throw error;
        }
    }
    /**
     * Выгружает сервис
     */
    unloadService(serviceId) {
        const service = this.services.find(s => s.config.id === serviceId);
        if (service) {
            // Вызываем cleanup если модуль загружен
            if (service.module && service.module.cleanup) {
                service.module.cleanup().catch(error => {
                    console.error(`Ошибка при выгрузке сервиса ${serviceId}:`, error);
                });
            }
            service.isLoaded = false;
            service.module = null;
            // Также выгружаем из динамического загрузчика
            dynamicServiceLoader.unloadService(serviceId);
        }
    }
    /**
     * Получает сервис по ID
     */
    getService(serviceId) {
        return this.services.find(s => s.config.id === serviceId);
    }
    /**
     * Получает все сервисы
     */
    getAllServices() {
        return this.services;
    }
    /**
     * Выполняет инструмент сервиса
     */
    async executeTool(serviceId, toolId, params) {
        const service = this.getService(serviceId);
        if (!service) {
            throw new Error(`Сервис ${serviceId} не найден`);
        }
        const tool = service.config.tools.find(t => t.id === toolId);
        if (!tool) {
            throw new Error(`Инструмент ${toolId} не найден в сервисе ${serviceId}`);
        }
        if (!tool.isEnabled) {
            throw new Error(`Инструмент ${toolId} отключен`);
        }
        // Проверяем, является ли инструмент чат функцией
        if (tool.isChatFunction) {
            return await this.executeChatFunction(service, tool, params);
        }
        // Убеждаемся, что сервис загружен
        if (!service.isLoaded) {
            await this.loadService(serviceId);
        }
        // Выполняем через динамический модуль если доступен
        if (service.module && service.module.execute) {
            try {
                return await service.module.execute(toolId, { ...tool, ...params });
            }
            catch (error) {
                console.error(`Ошибка выполнения инструмента ${toolId} через модуль:`, error);
                throw error;
            }
        }
        // Fallback для сервисов без динамических модулей
        // console.log(`Выполнение инструмента ${toolId} из сервиса ${serviceId}`);
        return {
            success: true,
            message: `Инструмент ${tool.name} выполнен`,
            data: null
        };
    }
    /**
     * Выполняет чат функцию сервиса
     */
    async executeChatFunction(service, tool, params) {
        try {
            // Если есть API endpoint для чата
            if (tool.chatApiEndpoint && service.config.chatApiBaseUrl) {
                const response = await fetch(`${service.config.chatApiBaseUrl}${tool.chatApiEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${service.config.chatApiKey || ''}`,
                    },
                    body: JSON.stringify({
                        prompt: tool.chatPrompt || tool.description,
                        serviceId: service.config.id,
                        toolId: tool.id,
                        ...params
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                return {
                    success: true,
                    message: `Чат функция ${tool.name} выполнена`,
                    data: data,
                    isChatResponse: true,
                };
            }
            // Если нет API, возвращаем промпт для локальной обработки
            return {
                success: true,
                message: `Чат функция ${tool.name} готова к выполнению`,
                data: {
                    prompt: tool.chatPrompt || tool.description,
                    serviceId: service.config.id,
                    toolId: tool.id,
                },
                isChatResponse: true,
            };
        }
        catch (error) {
            console.error(`Ошибка выполнения чат функции ${tool.name}:`, error);
            throw error;
        }
    }
    /**
     * Получает все чат кнопки от активных сервисов
     */
    getChatButtons() {
        const buttons = [];
        this.services
            // Для отображения кнопок чата достаточно активного сервиса.
            // Кнопки берутся из конфигурации и не требуют загруженного модуля.
            .filter(service => service.config.isActive)
            .forEach(service => {
            if (service.config.chatButtons) {
                buttons.push(...service.config.chatButtons.filter(button => button.isEnabled));
            }
        });
        return buttons;
    }
    /**
     * Прогоняет валидацию для всех загруженных конфигураций сервисов (runtime‑проверка)
     */
    validateAllServices() {
        try {
            this.services.forEach((s) => {
                s.config = this.validateAndNormalizeConfig(s.config);
            });
            // console.log('[services] Validation pass completed');
        }
        catch (error) {
            console.warn('[services] Validation pass failed:', error);
        }
    }
    /**
     * Возвращает кнопки чата, сгруппированные по позиции и сервису
     */
    getChatButtonsGrouped() {
        const top = [];
        const bottom = [];
        this.services
            .filter(service => service.config.isActive)
            .forEach(service => {
            const buttons = (service.config.chatButtons || []).filter(b => b.isEnabled);
            if (buttons.length === 0)
                return;
            const byTop = buttons.filter(b => (b.position || 'top') === 'top');
            const byBottom = buttons.filter(b => (b.position || 'top') === 'bottom');
            if (byTop.length > 0) {
                top.push({ serviceId: service.config.id, serviceName: service.config.name, serviceIcon: service.config.icon, buttons: byTop });
            }
            if (byBottom.length > 0) {
                bottom.push({ serviceId: service.config.id, serviceName: service.config.name, serviceIcon: service.config.icon, buttons: byBottom });
            }
        });
        return { top, bottom };
    }
    /**
     * Пытается найти чат-функцию для кнопки (по action/id) внутри сервиса
     */
    findChatFunctionInService(service, actionOrId) {
        const fromChatFunctions = (service.config.chatFunctions || []).find(t => (t.isChatFunction && t.isEnabled) && (t.id === actionOrId || t.action === actionOrId));
        if (fromChatFunctions)
            return fromChatFunctions;
        const fromTools = service.config.tools.find(t => (t.isChatFunction && t.isEnabled) && (t.id === actionOrId || t.action === actionOrId));
        return fromTools;
    }
    /**
     * Выполняет связанную с кнопкой чат-функцию, если удаётся сопоставить
     */
    async executeChatButton(serviceId, button, params) {
        const service = this.getService(serviceId);
        if (!service)
            throw new Error(`Сервис ${serviceId} не найден`);
        // Пытаемся найти инструмент по action/id кнопки
        const tool = this.findChatFunctionInService(service, button.action || button.id);
        if (!tool) {
            // Если чат-функция не найдена, возвращаем fallback
            return {
                success: false,
                message: `Не найдена чат-функция для кнопки ${button.name}`,
            };
        }
        // Выполняем tool через стандартный механизм с параметрами
        return this.executeTool(service.config.id, tool.id, params);
    }
    /**
     * Получает чат функции от активных сервисов
     */
    getChatFunctions() {
        const functions = [];
        this.services
            .filter(service => service.config.isActive && service.isLoaded)
            .forEach(service => {
            if (service.config.chatFunctions) {
                functions.push(...service.config.chatFunctions.filter(func => func.isEnabled));
            }
            // Также добавляем обычные инструменты, помеченные как чат функции
            functions.push(...service.config.tools.filter(tool => tool.isChatFunction && tool.isEnabled));
        });
        return functions;
    }
    /**
     * Получает все активные сервисы
     */
    getActiveServices() {
        return this.services.filter(s => s.config.isActive && s.isLoaded);
    }
    /**
     * Сортирует сервисы по приоритету
     */
    getSortedServices() {
        return [...this.services].sort((a, b) => a.config.priority - b.config.priority);
    }
    /**
     * Предзагружает сервис
     */
    async preloadService(serviceId) {
        try {
            await dynamicServiceLoader.preloadService(serviceId);
            // console.log(`Сервис ${serviceId} предзагружен`);
        }
        catch (error) {
            console.warn(`Не удалось предзагрузить сервис ${serviceId}:`, error);
        }
    }
    /**
     * Предзагружает несколько сервисов параллельно
     */
    async preloadServices(serviceIds) {
        await dynamicServiceLoader.preloadServices(serviceIds);
    }
    /**
     * Проверяет, загружен ли сервис
     */
    isServiceLoaded(serviceId) {
        const service = this.getService(serviceId);
        return service ? service.isLoaded : false;
    }
    /**
     * Проверяет, загружается ли сервис
     */
    isServiceLoading(serviceId) {
        return dynamicServiceLoader.isServiceLoading(serviceId);
    }
    /**
     * Получает список загруженных сервисов
     */
    getLoadedServices() {
        return this.services
            .filter(s => s.isLoaded)
            .map(s => s.config.id);
    }
    /**
     * Получает информацию о сервисе из реестра
     */
    getServiceInfo(serviceId) {
        return serviceRegistry.getService(serviceId);
    }
    /**
     * Получает возможности сервиса
     */
    getServiceCapabilities(serviceId) {
        return serviceRegistry.getServiceCapabilities(serviceId);
    }
    /**
     * Валидирует сервис
     */
    validateService(service) {
        return serviceRegistry.validateService(service);
    }
    /**
     * Проверяет зависимости сервиса
     */
    validateServiceDependencies(serviceId) {
        return serviceRegistry.validateDependencies(serviceId);
    }
    /**
     * Получает сервисы по категории
     */
    getServicesByCategory(category) {
        return serviceRegistry.getServicesByCategory(category);
    }
    /**
     * Активирует сервис
     */
    async activateService(serviceId) {
        return await serviceRegistry.activateService(serviceId);
    }
    /**
     * Деактивирует сервис
     */
    async deactivateService(serviceId) {
        return await serviceRegistry.deactivateService(serviceId);
    }
    /**
     * Подписывается на события реестра
     */
    onServiceRegistered(callback) {
        serviceRegistry.onServiceRegistered((entry) => callback(entry.config));
    }
    onServiceUnregistered(callback) {
        serviceRegistry.onServiceUnregistered(callback);
    }
    onServiceActivated(callback) {
        serviceRegistry.onServiceActivated(callback);
    }
    onServiceDeactivated(callback) {
        serviceRegistry.onServiceDeactivated(callback);
    }
    /**
     * Регистрирует интеграцию сервиса с Workspace
     */
    registerWorkspaceIntegration(serviceId, workspaceItems, autoCreate = true) {
        workspaceIntegrationManager.registerServiceIntegration({
            serviceId,
            workspaceItems,
            autoCreateItems: autoCreate,
            itemTemplates: [], // TODO: Извлекать из конфигурации сервиса
            eventHandlers: {
                onItemCreate: (item) => {
                    console.log(`[ServiceManager] Создан элемент Workspace: ${item.name}`);
                },
                onItemUpdate: (item) => {
                    console.log(`[ServiceManager] Обновлен элемент Workspace: ${item.name}`);
                },
                onItemDelete: (itemId) => {
                    console.log(`[ServiceManager] Удален элемент Workspace: ${itemId}`);
                },
                onItemSelect: (item) => {
                    console.log(`[ServiceManager] Выбран элемент Workspace: ${item.name}`);
                }
            }
        });
    }
    /**
     * Создает элемент Workspace для сервиса
     */
    createWorkspaceItem(serviceId, templateId, data) {
        return workspaceIntegrationManager.createWorkspaceItem(serviceId, templateId, data);
    }
    /**
     * Получает элементы Workspace сервиса
     */
    getServiceWorkspaceItems(serviceId) {
        return workspaceIntegrationManager.getServiceItems(serviceId);
    }
    /**
     * Синхронизирует Workspace с платформой
     */
    syncWorkspace() {
        workspaceIntegrationManager.syncWithPlatform();
    }
    /**
     * Регистрирует интеграцию сервиса с чатом
     */
    registerChatIntegration(serviceId, handlers, chatButtons) {
        chatIntegrationManager.registerServiceIntegration({
            serviceId,
            handlers,
            chatButtons,
            autoRegister: true,
            eventHandlers: {
                onMessageReceived: (message) => {
                    console.log(`[ServiceManager] Получено сообщение для сервиса ${serviceId}:`, message);
                },
                onResponseGenerated: (response) => {
                    console.log(`[ServiceManager] Сгенерирован ответ для сервиса ${serviceId}:`, response);
                },
                onHandlerExecuted: (handler, _result) => {
                    console.log(`[ServiceManager] Выполнен обработчик ${handler.name} для сервиса ${serviceId}`);
                }
            }
        });
    }
    /**
     * Получает кнопки чата сервиса
     */
    getServiceChatButtons(serviceId) {
        return chatIntegrationManager.getChatButtons(serviceId);
    }
    /**
     * Получает обработчики чата сервиса
     */
    getServiceChatHandlers(serviceId) {
        return chatIntegrationManager.getServiceHandlers(serviceId);
    }
    /**
     * Синхронизирует чат с платформой
     */
    syncChat() {
        chatIntegrationManager.syncWithChat();
    }
    /**
     * Создает канал связи между сервисами
     */
    createServiceChannel(name, type, participants) {
        return serviceCommunicationManager.createChannel(name, type, participants);
    }
    /**
     * Отправляет сообщение между сервисами
     */
    sendServiceMessage(recipientId, content, type = 'message') {
        return serviceCommunicationManager.sendDirectMessage(recipientId, content, type);
    }
    /**
     * Получает статус сервиса
     */
    getServiceStatus(serviceId) {
        return serviceCommunicationManager.getServiceStatus(serviceId);
    }
    /**
     * Устанавливает статус сервиса
     */
    setServiceStatus(serviceId, status) {
        serviceCommunicationManager.setServiceStatus(serviceId, status);
    }
    /**
     * Синхронизирует данные сервиса
     */
    syncServiceData(serviceId, data) {
        serviceCommunicationManager.syncServiceData(serviceId, data);
    }
    /**
     * Получает данные сервиса
     */
    getServiceData(serviceId) {
        return serviceCommunicationManager.getServiceData(serviceId);
    }
    /**
     * Получает статистику взаимодействия сервисов
     */
    getServiceCommunicationStats() {
        return serviceCommunicationManager.getStats();
    }
    /**
     * Публикует событие через Service Bus
     */
    publishEvent(eventType, data, source = 'ServiceManager') {
        serviceBus.publish({
            id: `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            source,
            data,
            timestamp: new Date(),
            priority: 'normal'
        });
    }
    /**
     * Подписывается на события через Service Bus
     */
    subscribeToEvents(eventType, handler) {
        return serviceBus.subscribe(eventType, handler);
    }
    /**
     * Отправляет запрос сервису через Service Bus
     */
    async requestFromService(serviceId, method, params) {
        const response = await serviceBus.request({
            id: `sm_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            method,
            params,
            source: 'ServiceManager',
            target: serviceId,
            timestamp: new Date()
        });
        if (!response.success) {
            throw new Error(response.error || 'Неизвестная ошибка');
        }
        return response.data;
    }
    /**
     * Регистрирует обработчик запросов для сервиса
     */
    registerServiceHandler(serviceId, method, handler) {
        serviceBus.respond(serviceId, method, async (request) => {
            try {
                const result = await handler(request.params);
                return {
                    id: `sm_resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    requestId: request.id,
                    success: true,
                    data: result,
                    timestamp: new Date()
                };
            }
            catch (error) {
                return {
                    id: `sm_resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    requestId: request.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Неизвестная ошибка',
                    timestamp: new Date()
                };
            }
        });
    }
}
// Создаем единственный экземпляр менеджера сервисов
export const serviceManager = new ServiceManagerImpl();
//# sourceMappingURL=ServiceManager.js.map