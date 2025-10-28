import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Провайдер для интеграции сервисов с чатом
 */
import { chatIntegrationManager } from '@/services/ChatIntegration';
import React, { createContext, useContext, useEffect, useState } from 'react';
const ServiceChatContext = createContext(null);
export const useServiceChat = () => {
    const context = useContext(ServiceChatContext);
    if (!context) {
        throw new Error('useServiceChat must be used within ServiceChatProvider');
    }
    return context;
};
export const ServiceChatProvider = ({ children }) => {
    const [chatButtons, setChatButtons] = useState([]);
    const [handlers, setHandlers] = useState([]);
    useEffect(() => {
        // Загружаем кнопки и обработчики при инициализации
        const loadData = () => {
            const buttons = chatIntegrationManager.getChatButtons();
            const handlers = chatIntegrationManager.getAllHandlers();
            setChatButtons(buttons);
            setHandlers(handlers);
        };
        loadData();
        // Подписываемся на события
        const handleResponseGenerated = (response) => {
            console.log('[ServiceChatProvider] Получен ответ:', response);
        };
        const handleHandlerExecuted = (handler, result) => {
            console.log('[ServiceChatProvider] Выполнен обработчик:', handler.name);
        };
        chatIntegrationManager.onResponseGenerated(handleResponseGenerated);
        chatIntegrationManager.onHandlerExecuted(handleHandlerExecuted);
        return () => {
            // Очистка подписок
        };
    }, []);
    const onButtonClick = (button) => {
        try {
            button.handler();
            console.log(`[ServiceChatProvider] Выполнена кнопка: ${button.label}`);
        }
        catch (error) {
            console.error(`[ServiceChatProvider] Ошибка выполнения кнопки ${button.label}:`, error);
        }
    };
    const processMessage = async (message) => {
        try {
            const context = {
                userId: 'current-user',
                sessionId: 'current-session',
                timestamp: new Date(),
                previousMessages: [],
                userPreferences: {},
                serviceData: {}
            };
            const responses = await chatIntegrationManager.processMessage(message, context);
            console.log('[ServiceChatProvider] Обработано сообщение:', responses);
        }
        catch (error) {
            console.error('[ServiceChatProvider] Ошибка обработки сообщения:', error);
        }
    };
    const getServiceButtons = (serviceId) => {
        return chatIntegrationManager.getChatButtons(serviceId);
    };
    const getServiceHandlers = (serviceId) => {
        return chatIntegrationManager.getServiceHandlers(serviceId);
    };
    const value = {
        chatButtons,
        handlers,
        onButtonClick,
        processMessage,
        getServiceButtons,
        getServiceHandlers
    };
    return (_jsx(ServiceChatContext.Provider, { value: value, children: children }));
};
//# sourceMappingURL=ServiceChatProvider.js.map