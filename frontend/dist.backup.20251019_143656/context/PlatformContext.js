import { jsx as _jsx } from "react/jsx-runtime";
import { LAYOUT, THEMES } from '@/constants';
import { aiBrain } from '@/services/AIBrain';
import { notificationService } from '@/services/NotificationService';
import { serviceManager } from '@/services/ServiceManager';
import { themeManager } from '@/services/ThemeManager';
import { settingsService, simpleThemeService } from '@/services/settings';
import { authService } from '@/services/AuthService';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { PlatformContext } from './PlatformContextDefinition';
// Начальное состояние платформы
const initialState = {
    user: null,
    authUser: null, // Telegram авторизация
    authLoading: false, // Загрузка авторизации
    authError: null, // Ошибки авторизации
    layout: {
        sidebarCollapsed: false,
        sidebarWidth: LAYOUT.SIDEBAR.DEFAULT_WIDTH,
        chatVisible: true,
        chatWidth: LAYOUT.CHAT.DEFAULT_WIDTH,
        chatInputHeight: LAYOUT.CHAT.INPUT_DEFAULT_HEIGHT,
        workspaceLayout: 'grid',
        activeService: null,
        activeTool: null,
        activeSection: 'ai-lawyer', // AI-юрист открыт по умолчанию
        activeSettingsCategory: 'all', // Активная категория настроек
        activeWidgetsCategory: [], // Массив активных виджетов
        chatType: 'default', // Тип чата по умолчанию
        expandedTabsHeight: 0, // Высота раскрытых вкладок
    },
    services: [],
    activeChat: null,
    workspaceItems: [],
    settings: {
        theme: THEMES.AVAILABLE.DARK,
        fontSize: THEMES.FONT_SIZES.MEDIUM,
        animations: true,
        sidebarCollapsed: false,
        useColoredText: false,
        textColor: '#ffffff',
        accentsEnabled: false,
        autoScroll: true,
        hideChatFunctionButtons: false,
        showTimestamps: false,
    },
    isLoading: true,
    error: null,
    isInitialized: false,
};
// Редьюсер для управления состоянием
function platformReducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_AUTH_USER': {
            const authUser = action.payload;
            // Синхронизируем с существующим user полем для обратной совместимости
            const legacyUser = {
                id: authUser.id.toString(),
                name: `${authUser.first_name} ${authUser.last_name || ''}`.trim(),
                email: authUser.username ? `${authUser.username}@telegram.user` : '',
                avatar: authUser.photo_url,
                preferences: state.user?.preferences || {
                    theme: 'dark',
                    sidebarCollapsed: false,
                    notifications: true,
                    animations: true,
                    sounds: false,
                },
            };
            return {
                ...state,
                authUser,
                user: legacyUser,
                authError: null,
            };
        }
        case 'CLEAR_AUTH_USER':
            return {
                ...state,
                authUser: null,
                user: null,
                authError: null,
            };
        case 'SET_AUTH_LOADING':
            return { ...state, authLoading: action.payload };
        case 'SET_AUTH_ERROR':
            return { ...state, authError: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        case 'SWITCH_SERVICE': {
            // Применяем тему сервиса при переключении
            const serviceId = action.payload;
            const service = state.services.find(s => s.config.id === serviceId);
            if (service?.config.theme) {
                themeManager.setTheme(`service-${serviceId}`);
            }
            return {
                ...state,
                layout: {
                    ...state.layout,
                    activeService: action.payload,
                    activeTool: null,
                },
            };
        }
        case 'SWITCH_TOOL':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    activeTool: action.payload,
                },
            };
        case 'ADD_MESSAGE':
            if (!state.activeChat)
                return state;
            return {
                ...state,
                activeChat: {
                    ...state.activeChat,
                    messages: [...state.activeChat.messages, action.payload],
                    updatedAt: new Date(),
                },
            };
        case 'CREATE_WORKSPACE_ITEM': {
            // Проверяем, что элемент с таким ID не существует
            const item = action.payload;
            const existingItem = state.workspaceItems.find(existing => existing.id === item.id);
            if (existingItem) {
                return state; // Не добавляем дубликат
            }
            // Убеждаемся, что даты валидны
            const validatedItem = {
                ...item,
                createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
                updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt),
            };
            const newItems = [...state.workspaceItems, validatedItem];
            try {
                localStorage.setItem('barsukov-workspace', JSON.stringify(newItems));
            }
            catch {
                // ignore persistence errors
            }
            return {
                ...state,
                workspaceItems: newItems,
            };
        }
        case 'REMOVE_WORKSPACE_ITEM': {
            const removed = state.workspaceItems.find(w => w.id === action.payload);
            const newItems = state.workspaceItems.filter(w => w.id !== action.payload);
            try {
                localStorage.setItem('barsukov-workspace', JSON.stringify(newItems));
            }
            catch {
                // ignore persistence errors
            }
            const newState = {
                ...state,
                workspaceItems: newItems,
            };
            if (removed) {
                notificationService.info('Проект удалён', removed.title, {
                    duration: 5000,
                    actions: [
                        {
                            label: 'Отменить',
                            action: () => {
                                const restored = [...newState.workspaceItems, removed];
                                try {
                                    localStorage.setItem('barsukov-workspace', JSON.stringify(restored));
                                }
                                catch {
                                    // ignore persistence errors
                                }
                                window.dispatchEvent(new CustomEvent('workspace:restore', { detail: removed }));
                            },
                            variant: 'primary',
                        },
                    ],
                });
            }
            return newState;
        }
        case 'UPDATE_SETTINGS': {
            // Обновляем настройки через сервис
            settingsService.setSetting(action.payload.key, action.payload.value);
            const newState = {
                ...state,
                settings: {
                    ...state.settings,
                    [action.payload.key]: action.payload.value,
                },
            };
            // Обновляем layout если изменились связанные настройки
            if (action.payload.key === 'chatInputHeight') {
                newState.layout = {
                    ...newState.layout,
                    chatInputHeight: typeof action.payload.value === 'number' ? action.payload.value : 300,
                };
            }
            return newState;
        }
        case 'UPDATE_WORKSPACE_ITEM': {
            const { id, updates } = action.payload;
            const newItems = state.workspaceItems.map(w => w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w);
            try {
                localStorage.setItem('barsukov-workspace', JSON.stringify(newItems));
            }
            catch {
                // ignore
            }
            return { ...state, workspaceItems: newItems };
        }
        case 'TOGGLE_SIDEBAR':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    sidebarCollapsed: !state.layout.sidebarCollapsed,
                },
            };
        case 'TOGGLE_CHAT':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    chatVisible: !state.layout.chatVisible,
                },
            };
        case 'SET_CHAT_TYPE':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    chatType: action.payload,
                },
            };
        case 'SET_LAYOUT':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    ...action.payload,
                },
            };
        case 'SWITCH_SECTION':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    activeSection: action.payload,
                },
            };
        case 'SET_ACTIVE_SETTINGS_CATEGORY':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    activeSettingsCategory: action.payload,
                },
            };
        case 'SET_ACTIVE_WIDGETS_CATEGORY':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    activeWidgetsCategory: action.payload,
                },
            };
        case 'SET_EXPANDED_TABS_HEIGHT':
            return {
                ...state,
                layout: {
                    ...state.layout,
                    expandedTabsHeight: action.payload,
                },
            };
        case 'ADD_SERVICE': {
            // Проверяем, что сервис с таким ID еще не существует
            const existingServiceIndex = state.services.findIndex(s => s.config.id === action.payload.config.id);
            if (existingServiceIndex >= 0) {
                // Если сервис уже существует, обновляем его
                const updatedServices = [...state.services];
                updatedServices[existingServiceIndex] = action.payload;
                return {
                    ...state,
                    services: updatedServices,
                };
            }
            else {
                // Если сервис новый, добавляем его
                return {
                    ...state,
                    services: [...state.services, action.payload],
                };
            }
        }
        case 'TOGGLE_SERVICE':
            return {
                ...state,
                services: state.services.map(service => service.config.id === action.payload
                    ? { ...service, config: { ...service.config, isActive: !service.config.isActive } }
                    : service),
            };
        case 'SET_ACTIVE_CHAT':
            return {
                ...state,
                activeChat: action.payload,
            };
        default:
            return state;
    }
}
// Провайдер контекста
export function PlatformProvider({ children }) {
    const [state, dispatch] = useReducer(platformReducer, initialState);
    // Восстановление удалённого проекта по событию Undo
    useEffect(() => {
        const handler = (e) => {
            const detail = e.detail;
            if (!detail)
                return;
            dispatch({ type: 'CREATE_WORKSPACE_ITEM', payload: detail });
        };
        window.addEventListener('workspace:restore', handler);
        return () => window.removeEventListener('workspace:restore', handler);
    }, []);
    // Загрузка данных при инициализации
    useEffect(() => {
        // Защита от повторной инициализации при HMR
        if (state.isInitialized) {
            return;
        }
        const initializePlatform = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                // Параллельная загрузка данных из localStorage для ускорения
                const [savedUser, savedSettings, savedWorkspace] = await Promise.all([
                    Promise.resolve(localStorage.getItem('barsukov-user')),
                    Promise.resolve(localStorage.getItem('barsukov-settings')),
                    Promise.resolve(localStorage.getItem('barsukov-workspace'))
                ]);
                // Проверка авторизации (приоритет над сохраненным пользователем)
                await checkAuth();
                // Загрузка пользователя (только если нет авторизации)
                if (!state.authUser && savedUser) {
                    const user = JSON.parse(savedUser);
                    dispatch({ type: 'SET_USER', payload: user });
                }
                // Загрузка настроек
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    const layoutKeyMap = {
                        chatWidth: 'chatWidth',
                        chatInputHeight: 'chatInputHeight',
                        sidebarCollapsed: 'sidebarCollapsed',
                        sidebarWidth: 'sidebarWidth',
                        workspaceLayout: 'workspaceLayout',
                    };
                    Object.entries(settings).forEach(([key, value]) => {
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { key, value: value } });
                        if (key in layoutKeyMap) {
                            dispatch({ type: 'SET_LAYOUT', payload: { [layoutKeyMap[key]]: value } });
                        }
                    });
                }
                // Загрузка элементов рабочего пространства
                if (savedWorkspace) {
                    const workspaceItems = JSON.parse(savedWorkspace);
                    workspaceItems.forEach((item) => {
                        // Преобразуем строковые даты обратно в Date объекты
                        const itemWithDates = {
                            ...item,
                            createdAt: new Date(item.createdAt),
                            updatedAt: new Date(item.updatedAt),
                        };
                        dispatch({ type: 'CREATE_WORKSPACE_ITEM', payload: itemWithDates });
                    });
                }
                // Загрузка сервисов
                await serviceManager.loadAllServices();
                const loadedServices = serviceManager.getSortedServices();
                // Очищаем текущий список перед добавлением, чтобы не копить дубли при HMR/реинициализации
                // Добавляем каждый сервис ровно один раз
                loadedServices.forEach(service => {
                    dispatch({ type: 'ADD_SERVICE', payload: service });
                });
                // Создание активного чата
                const activeChat = {
                    id: 'default-chat',
                    title: 'Основной чат',
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                };
                // Устанавливаем активный чат в состояние
                dispatch({ type: 'SET_ACTIVE_CHAT', payload: activeChat });
                // Применяем тему сразу после загрузки настроек
                const theme = state.settings?.theme || 'light';
                const customColor = state.settings?.customColor;
                // Устанавливаем data-theme атрибут сразу для применения CSS правил
                document.documentElement.setAttribute('data-theme', theme);
                // Используем SimpleThemeService для единообразия
                if (theme === 'custom' && customColor) {
                    simpleThemeService.applyTheme('custom');
                    simpleThemeService.setCustomColor(customColor);
                }
                else {
                    simpleThemeService.applyTheme(theme);
                }
                // Убираем искусственную задержку для ускорения инициализации
                dispatch({ type: 'SET_LOADING', payload: false });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
            }
            catch (error) {
                console.error('Ошибка инициализации платформы:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Ошибка загрузки платформы' });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        initializePlatform();
    }, [state.settings?.theme, state.settings?.customColor]); // Добавляем зависимости для темы
    // Применение темы к документу через ThemeService с плавными переходами
    useEffect(() => {
        const theme = state.settings?.theme || 'dark';
        const customColor = state.settings?.customColor;
        // Устанавливаем data-theme атрибут сразу для применения CSS правил
        document.documentElement.setAttribute('data-theme', theme);
        // Применяем тему через SimpleThemeService с плавными переходами
        // customColor передаем только для custom темы
        if (theme === 'custom' && customColor) {
            simpleThemeService.applyTheme('custom');
            simpleThemeService.setCustomColor(customColor);
        }
        else {
            simpleThemeService.applyTheme(theme);
        }
    }, [state.settings?.theme, state.settings?.customColor]);
    // Применение размера шрифта (small/medium/large)
    useEffect(() => {
        const fontSize = state.settings?.fontSize || 'medium';
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, [state.settings?.fontSize]);
    // Вкл/выкл анимаций через ThemeManager
    useEffect(() => {
        const animations = state.settings?.animations;
        themeManager.queueThemeChange({
            type: 'animation',
            key: 'enabled',
            value: animations ? 'true' : 'false'
        });
        document.documentElement.setAttribute('data-animations', animations ? 'on' : 'off');
    }, [state.settings?.animations]);
    // Сохранение состояния в localStorage
    // Объединенный useEffect для сохранения в localStorage - оптимизация производительности
    useEffect(() => {
        try {
            // Сохраняем пользователя
            if (state.user) {
                localStorage.setItem('barsukov-user', JSON.stringify(state.user));
            }
            // Сохраняем настройки
            localStorage.setItem('barsukov-settings', JSON.stringify(state.settings));
            // Сохраняем элементы рабочего пространства
            localStorage.setItem('barsukov-workspace', JSON.stringify(state.workspaceItems));
        }
        catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
        }
    }, [state.user, state.settings, state.workspaceItems]);
    // Методы для работы с платформой - мемоизированные для производительности
    const switchService = useCallback((serviceId) => {
        dispatch({ type: 'SWITCH_SERVICE', payload: serviceId });
    }, []);
    const switchTool = useCallback((toolId) => {
        dispatch({ type: 'SWITCH_TOOL', payload: toolId });
    }, []);
    const sendMessage = useCallback(async (content) => {
        // Создаем сообщение пользователя
        const userMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content,
            sender: 'user',
            timestamp: new Date(),
            type: 'text',
        };
        // Добавляем сообщение пользователя в чат
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        // Добавляем в историю AI Brain
        aiBrain.addMessageToHistory(userMessage);
        try {
            // Обрабатываем сообщение через AI Brain
            const response = await aiBrain.processMessage(content, state.layout.activeService, state.layout.activeSection);
            // Создаем ответное сообщение
            const responseMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: response.message,
                sender: response.isSystemResponse ? 'system' : 'assistant',
                timestamp: new Date(),
                type: 'text',
            };
            // Добавляем ответ в чат
            dispatch({ type: 'ADD_MESSAGE', payload: responseMessage });
            // Добавляем в историю AI Brain
            aiBrain.addMessageToHistory(responseMessage);
            // Если нужно переключиться на сервис
            if (response.shouldRouteToService && response.serviceId) {
                dispatch({ type: 'SWITCH_SERVICE', payload: response.serviceId });
            }
        }
        catch (error) {
            console.error('AI Brain processing error:', error);
            // Создаем сообщение об ошибке
            const errorMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: 'Произошла ошибка при обработке сообщения. Попробуйте еще раз.',
                sender: 'system',
                timestamp: new Date(),
                type: 'text',
            };
            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        }
    }, [state.layout.activeService, state.layout.activeSection]);
    const createWorkspaceItem = useCallback((item) => {
        // Проверяем, что элемент с таким ID не существует
        const existingItem = state.workspaceItems.find(existing => existing.id === item.id);
        if (existingItem) {
            console.warn('Элемент с таким ID уже существует:', item.id);
            return; // Не добавляем дубликат
        }
        dispatch({ type: 'CREATE_WORKSPACE_ITEM', payload: item });
    }, [state.workspaceItems]);
    const updateSettings = useCallback((key, value) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { key, value } });
        const layoutKeyMap = {
            chatWidth: 'chatWidth',
            sidebarCollapsed: 'sidebarCollapsed',
            sidebarWidth: 'sidebarWidth',
            workspaceLayout: 'workspaceLayout',
        };
        if (key in layoutKeyMap) {
            dispatch({ type: 'SET_LAYOUT', payload: { [layoutKeyMap[key]]: value } });
        }
    }, []);
    const toggleSidebar = useCallback(() => {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []);
    const toggleChat = useCallback(() => {
        dispatch({ type: 'TOGGLE_CHAT' });
    }, []);
    const setChatType = useCallback((chatType) => {
        dispatch({ type: 'SET_CHAT_TYPE', payload: chatType });
    }, []);
    const switchSection = useCallback((section) => {
        dispatch({ type: 'SWITCH_SECTION', payload: section });
        // Сбрасываем фокус с активного элемента для устранения остаточного выделения
        setTimeout(() => {
            if (document.activeElement && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }, 0);
    }, []);
    const setActiveSettingsCategory = useCallback((category) => {
        dispatch({ type: 'SET_ACTIVE_SETTINGS_CATEGORY', payload: category });
    }, []);
    const setExpandedTabsHeight = useCallback((height) => {
        dispatch({ type: 'SET_EXPANDED_TABS_HEIGHT', payload: height });
    }, []);
    const toggleService = useCallback((serviceId) => {
        dispatch({ type: 'TOGGLE_SERVICE', payload: serviceId });
        // Сбрасываем фокус с активного элемента для устранения остаточного выделения
        setTimeout(() => {
            if (document.activeElement && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }, 0);
    }, []);
    const executeServiceTool = useCallback(async (serviceId, toolId) => {
        try {
            // Встроенная маршрутизация действий для сервиса настроек
            if (serviceId === 'settings') {
                if (toolId === 'open-preferences' ||
                    toolId === 'appearance' ||
                    toolId === 'interface' ||
                    toolId === 'chat' ||
                    toolId === 'notifications') {
                    const resolved = toolId === 'open-preferences' ? 'appearance' : toolId;
                    dispatch({ type: 'SWITCH_SECTION', payload: 'settings' });
                    // Сохраняем выбранную категорию, чтобы экран настроек переключился
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { key: 'selectedSettingsCategory', value: resolved } });
                    // Сбрасываем фокус с активного элемента для устранения остаточного выделения
                    setTimeout(() => {
                        if (document.activeElement && document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }, 0);
                    return { success: true, message: 'Открыты настройки', data: { section: resolved } };
                }
                if (toolId === 'toggle-theme') {
                    const current = state.settings?.theme || 'dark';
                    const next = current === 'dark' ? 'light' : 'dark';
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { key: 'theme', value: next } });
                    return { success: true, message: `Тема переключена: ${next}`, data: { theme: next } };
                }
            }
            return await serviceManager.executeTool(serviceId, toolId);
        }
        catch (error) {
            console.error('Ошибка выполнения инструмента:', error);
            throw error;
        }
    }, [state.settings?.theme]);
    // Методы для Telegram авторизации
    const loginWithTelegram = useCallback(async (telegramData) => {
        try {
            dispatch({ type: 'SET_AUTH_LOADING', payload: true });
            dispatch({ type: 'SET_AUTH_ERROR', payload: null });
            console.log('[PlatformContext] Начинаем авторизацию через Telegram:', telegramData);
            // Вызываем AuthService
            const result = await authService.loginWithTelegram(telegramData);
            // Сохраняем токен и пользователя
            authService.setStoredToken(result.token);
            authService.setStoredUser(result.user);
            // Обновляем состояние
            dispatch({ type: 'SET_AUTH_USER', payload: result.user });
            console.log('[PlatformContext] Авторизация успешна:', {
                userId: result.user.id,
                needsAgreement: result.needsAgreement,
            });
            // Если нужно принять соглашение, это обрабатывается в AuthWidget
            if (result.needsAgreement) {
                console.log('[PlatformContext] Требуется принятие соглашения');
            }
        }
        catch (error) {
            console.error('[PlatformContext] Ошибка авторизации:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ошибка авторизации';
            dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
            throw error;
        }
        finally {
            dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        }
    }, []);
    const logout = useCallback(async () => {
        try {
            console.log('[PlatformContext] Выход из системы');
            // Вызываем AuthService logout
            await authService.logout();
            // Очищаем состояние
            dispatch({ type: 'CLEAR_AUTH_USER' });
            console.log('[PlatformContext] Выход выполнен успешно');
        }
        catch (error) {
            console.error('[PlatformContext] Ошибка при выходе:', error);
            // Даже если logout на сервере не удался, очищаем локальное состояние
            dispatch({ type: 'CLEAR_AUTH_USER' });
        }
    }, []);
    const checkAuth = useCallback(async () => {
        try {
            console.log('[PlatformContext] Проверка авторизации...');
            const token = authService.getStoredToken();
            if (!token) {
                console.log('[PlatformContext] Токен не найден');
                return;
            }
            console.log('[PlatformContext] Токен найден, проверяем пользователя...');
            // Получаем текущего пользователя
            const user = await authService.getCurrentUser();
            // Обновляем состояние
            dispatch({ type: 'SET_AUTH_USER', payload: user });
            console.log('[PlatformContext] Авторизация подтверждена:', {
                userId: user.id,
                username: user.username,
            });
        }
        catch (error) {
            console.error('[PlatformContext] Ошибка проверки авторизации:', error);
            // Очищаем невалидные данные
            authService.clearStorage();
            dispatch({ type: 'CLEAR_AUTH_USER' });
        }
    }, []);
    const contextValue = useMemo(() => ({
        state,
        dispatch,
        switchService,
        switchTool,
        sendMessage,
        createWorkspaceItem,
        updateSettings,
        toggleSidebar,
        toggleChat,
        setChatType,
        switchSection,
        setActiveSettingsCategory,
        setExpandedTabsHeight,
        toggleService,
        executeServiceTool,
        // Методы для Telegram авторизации
        loginWithTelegram,
        logout,
        checkAuth,
    }), [
        state,
        dispatch,
        switchService,
        switchTool,
        sendMessage,
        createWorkspaceItem,
        updateSettings,
        toggleSidebar,
        toggleChat,
        setChatType,
        switchSection,
        setActiveSettingsCategory,
        setExpandedTabsHeight,
        toggleService,
        executeServiceTool,
        // Методы для Telegram авторизации
        loginWithTelegram,
        logout,
        checkAuth,
    ]);
    return (_jsx(PlatformContext.Provider, { value: contextValue, children: children }));
}
//# sourceMappingURL=PlatformContext.js.map