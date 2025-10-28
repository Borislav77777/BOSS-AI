/**
 * Провайдер для интеграции сервисов с чатом
 */

import { chatIntegrationManager } from '@/services/ChatIntegration';
import { ChatHandler, ServiceChatButton } from '@/services/ChatIntegration/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ServiceChatContextType {
    chatButtons: ServiceChatButton[];
    handlers: ChatHandler[];
    onButtonClick: (button: ServiceChatButton) => void;
    processMessage: (message: string) => Promise<void>;
    getServiceButtons: (serviceId: string) => ServiceChatButton[];
    getServiceHandlers: (serviceId: string) => ChatHandler[];
}

const ServiceChatContext = createContext<ServiceChatContextType | null>(null);

export const useServiceChat = () => {
    const context = useContext(ServiceChatContext);
    if (!context) {
        throw new Error('useServiceChat must be used within ServiceChatProvider');
    }
    return context;
};

interface ServiceChatProviderProps {
    children: React.ReactNode;
}

export const ServiceChatProvider: React.FC<ServiceChatProviderProps> = ({ children }) => {
    const [chatButtons, setChatButtons] = useState<ServiceChatButton[]>([]);
    const [handlers, setHandlers] = useState<ChatHandler[]>([]);

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
        const handleResponseGenerated = (response: any) => {
            console.log('[ServiceChatProvider] Получен ответ:', response);
        };

        const handleHandlerExecuted = (handler: ChatHandler, result: any) => {
            console.log('[ServiceChatProvider] Выполнен обработчик:', handler.name);
        };

        chatIntegrationManager.onResponseGenerated(handleResponseGenerated);
        chatIntegrationManager.onHandlerExecuted(handleHandlerExecuted);

        return () => {
            // Очистка подписок
        };
    }, []);

    const onButtonClick = (button: ServiceChatButton) => {
        try {
            button.handler();
            console.log(`[ServiceChatProvider] Выполнена кнопка: ${button.label}`);
        } catch (error) {
            console.error(`[ServiceChatProvider] Ошибка выполнения кнопки ${button.label}:`, error);
        }
    };

    const processMessage = async (message: string) => {
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
        } catch (error) {
            console.error('[ServiceChatProvider] Ошибка обработки сообщения:', error);
        }
    };

    const getServiceButtons = (serviceId: string): ServiceChatButton[] => {
        return chatIntegrationManager.getChatButtons(serviceId);
    };

    const getServiceHandlers = (serviceId: string): ChatHandler[] => {
        return chatIntegrationManager.getServiceHandlers(serviceId);
    };

    const value: ServiceChatContextType = {
        chatButtons,
        handlers,
        onButtonClick,
        processMessage,
        getServiceButtons,
        getServiceHandlers
    };

    return (
        <ServiceChatContext.Provider value={value}>
            {children}
        </ServiceChatContext.Provider>
    );
};
