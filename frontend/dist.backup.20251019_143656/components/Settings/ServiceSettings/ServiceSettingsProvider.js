import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Провайдер настроек сервисов
 * Автоматически регистрирует настройки сервисов в системе настроек
 */
// @ts-nocheck
import { serviceManager } from '@/services/ServiceManager';
import React, { createContext, useContext, useEffect, useState } from 'react';
const ServiceSettingsContext = createContext(null);
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
export const ServiceSettingsProvider = ({ children }) => {
    const [serviceSettings, setServiceSettings] = useState([]);
    useEffect(() => {
        // Загружаем настройки сервисов при инициализации
        const loadServiceSettings = () => {
            const allServices = serviceManager.getAllServices();
            const servicesWithSettings = allServices.filter(service => service.config.settings && Object.keys(service.config.settings).length > 0);
            setServiceSettings(servicesWithSettings);
        };
        loadServiceSettings();
        // Подписываемся на события регистрации сервисов
        const handleServiceRegistered = (service) => {
            if (service.config.settings && Object.keys(service.config.settings).length > 0) {
                setServiceSettings(prev => [...prev, service]);
            }
        };
        const handleServiceUnregistered = (serviceId) => {
            setServiceSettings(prev => prev.filter(service => service.config.id !== serviceId));
        };
        serviceManager.onServiceRegistered(handleServiceRegistered);
        serviceManager.onServiceUnregistered(handleServiceUnregistered);
        return () => {
            // Очистка подписок при размонтировании
        };
    }, []);
    const registerServiceSettings = (service) => {
        setServiceSettings(prev => {
            const exists = prev.some(s => s.config.id === service.config.id);
            if (exists) {
                return prev.map(s => s.config.id === service.config.id ? service : s);
            }
            return [...prev, service];
        });
    };
    const unregisterServiceSettings = (serviceId) => {
        setServiceSettings(prev => prev.filter(service => service.config.id !== serviceId));
    };
    const getServiceSettings = (serviceId) => {
        return serviceSettings.find(service => service.config.id === serviceId) || null;
    };
    const value = {
        serviceSettings,
        registerServiceSettings,
        unregisterServiceSettings,
        getServiceSettings
    };
    return (_jsx(ServiceSettingsContext.Provider, { value: value, children: children }));
};
//# sourceMappingURL=ServiceSettingsProvider.js.map