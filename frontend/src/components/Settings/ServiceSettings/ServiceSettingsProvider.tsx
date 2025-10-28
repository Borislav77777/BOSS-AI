/**
 * Провайдер настроек сервисов
 * Автоматически регистрирует настройки сервисов в системе настроек
 */

// @ts-nocheck
import { serviceManager } from '@/services/ServiceManager';
import { ServiceRegistryEntry } from '@/services/ServiceRegistry/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ServiceSettingsContextType {
    serviceSettings: ServiceRegistryEntry[];
    registerServiceSettings: (service: ServiceRegistryEntry) => void;
    unregisterServiceSettings: (serviceId: string) => void;
    getServiceSettings: (serviceId: string) => ServiceRegistryEntry | null;
}

const ServiceSettingsContext = createContext<ServiceSettingsContextType | null>(null);

export const useServiceSettings = () => {
    const context = useContext(ServiceSettingsContext);
    if (!context) {
        // Возвращаем значения по умолчанию вместо выброса ошибки
        console.warn('useServiceSettings используется вне ServiceSettingsProvider, возвращаем значения по умолчанию');
        return {
            serviceSettings: [],
            registerServiceSettings: () => { },
            getServiceSettings: () => null
        };
    }
    return context;
};

interface ServiceSettingsProviderProps {
    children: React.ReactNode;
}

export const ServiceSettingsProvider: React.FC<ServiceSettingsProviderProps> = ({ children }) => {
    const [serviceSettings, setServiceSettings] = useState<ServiceRegistryEntry[]>([]);

    useEffect(() => {
        // Загружаем настройки сервисов при инициализации
        const loadServiceSettings = () => {
            const allServices = serviceManager.getAllServices();
            const servicesWithSettings = allServices.filter(service =>
                service.config.settings && Object.keys(service.config.settings).length > 0
            );
            setServiceSettings(servicesWithSettings);
        };

        loadServiceSettings();

        // Подписываемся на события регистрации сервисов
        const handleServiceRegistered = (service: any) => {
            if (service.config.settings && Object.keys(service.config.settings).length > 0) {
                setServiceSettings(prev => [...prev, service]);
            }
        };

        const handleServiceUnregistered = (serviceId: string) => {
            setServiceSettings(prev => prev.filter(service => service.config.id !== serviceId));
        };

        // serviceRegistry отключен, закомментируем вызовы
        // serviceManager.onServiceRegistered(handleServiceRegistered);
        // serviceManager.onServiceUnregistered(handleServiceUnregistered);

        return () => {
            // Очистка подписок при размонтировании
        };
    }, []);

    const registerServiceSettings = (service: ServiceRegistryEntry) => {
        setServiceSettings(prev => {
            const exists = prev.some(s => s.config.id === service.config.id);
            if (exists) {
                return prev.map(s => s.config.id === service.config.id ? service : s);
            }
            return [...prev, service];
        });
    };

    const unregisterServiceSettings = (serviceId: string) => {
        setServiceSettings(prev => prev.filter(service => service.config.id !== serviceId));
    };

    const getServiceSettings = (serviceId: string) => {
        return serviceSettings.find(service => service.config.id === serviceId) || null;
    };

    const value: ServiceSettingsContextType = {
        serviceSettings,
        registerServiceSettings,
        unregisterServiceSettings,
        getServiceSettings
    };

    return (
        <ServiceSettingsContext.Provider value={value}>
            {children}
        </ServiceSettingsContext.Provider>
    );
};
