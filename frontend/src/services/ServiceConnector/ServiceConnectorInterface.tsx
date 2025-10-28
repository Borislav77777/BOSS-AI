/**
 * Универсальный интерфейс для подключения новых сервисов
 */

import { ServiceConfig } from '@/types/services';
import {
    Check,
    Plus,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { connectorManager } from '../Connectors/ConnectorManager';
import { connectorValidator } from '../Connectors/ConnectorValidator';
import { ConnectorConfig } from '../Connectors/ServiceConnector';

interface ServiceConnectorInterfaceProps {
    onServiceAdded?: (serviceId: string) => void;
    onServiceRemoved?: (serviceId: string) => void;
    className?: string;
}

const AVAILABLE_ICONS = [
    'Bot', 'Settings', 'FileText', 'MessageCircle', 'Clock', 'Mic', 'Search',
    'Download', 'Upload', 'Edit', 'Plus', 'Minus', 'Check', 'X', 'Alert',
    'Info', 'Warning', 'Error', 'Success', 'Play', 'Pause', 'Stop',
    'Grid3X3', 'List', 'Layout', 'Monitor', 'Palette', 'Cog', 'Zap'
];

// Удалено неиспользуемое определение

export const ServiceConnectorInterface: React.FC<ServiceConnectorInterfaceProps> = ({
    onServiceAdded,
    onServiceRemoved: _onServiceRemoved,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [validationResults, setValidationResults] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [testResults, setTestResults] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    // Удалено неиспользуемое состояние

    // Форма для нового сервиса
    const [serviceForm, setServiceForm] = useState<Partial<ServiceConfig>>({
        id: '',
        name: '',
        description: '',
        icon: 'Settings',
        version: '1.0.0',
        isActive: false,
        category: 'utility',
        priority: 10,
        author: '',
        tools: [],
        chatButtons: [],
        dependencies: []
    });

    // Форма для коннектора
    const [connectorForm, setConnectorForm] = useState<Partial<ConnectorConfig>>({
        baseUrl: '',
        timeout: 5000,
        retries: 3,
        headers: {},
        healthCheck: {
            endpoint: '/health',
            interval: 30000,
            timeout: 5000
        }
    });

    useEffect(() => {
        // Загружаем существующие сервисы
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            // Здесь должна быть логика загрузки существующих сервисов
            // setServices(await serviceManager.getAllServices());
        } catch (error) {
            console.error('Ошибка загрузки сервисов:', error);
        }
    };

    const handleServiceFormChange = (field: keyof ServiceConfig, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setServiceForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleConnectorFormChange = (field: keyof ConnectorConfig, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setConnectorForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateService = () => {
        const validation = connectorValidator.validateServiceConfig(serviceForm as ServiceConfig);
        setValidationResults(validation);
        return validation.isValid;
    };

    const testConnector = async () => {
        if (!serviceForm.id || !connectorForm.baseUrl) {
            alert('Заполните обязательные поля');
            return;
        }

        setIsConnecting(true);
        try {
            const results = await connectorValidator.testConnector(
                serviceForm.id,
                connectorForm as ConnectorConfig
            );
            setTestResults(results);
        } catch (error) {
            console.error('Ошибка тестирования коннектора:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const addService = async () => {
        if (!validateService()) {
            alert('Исправьте ошибки валидации');
            return;
        }

        if (!testResults || testResults.some((r: any) => !r.passed)) { // eslint-disable-line @typescript-eslint/no-explicit-any
            alert('Исправьте ошибки тестирования');
            return;
        }

        setIsConnecting(true);
        try {
            // Добавляем сервис в конфигурацию
            const serviceConfig = serviceForm as ServiceConfig;

            // Добавляем коннектор
            connectorManager.addConnector({
                serviceId: serviceConfig.id,
                connector: connectorForm as ConnectorConfig,
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 5,
                healthCheckInterval: 30000
            });

            // Подключаем сервис
            const connected = await connectorManager.connectService(serviceConfig.id);
            if (connected) {
                onServiceAdded?.(serviceConfig.id);
                setIsOpen(false);
                resetForms();
            } else {
                alert('Не удалось подключить сервис');
            }
        } catch (error) {
            console.error('Ошибка добавления сервиса:', error);
            alert('Ошибка добавления сервиса');
        } finally {
            setIsConnecting(false);
        }
    };

    const resetForms = () => {
        setServiceForm({
            id: '',
            name: '',
            description: '',
            icon: 'Settings',
            version: '1.0.0',
            isActive: false,
            category: 'utility',
            priority: 10,
            author: '',
            tools: [],
            chatButtons: [],
            dependencies: []
        });
        setConnectorForm({
            baseUrl: '',
            timeout: 5000,
            retries: 3,
            headers: {},
            healthCheck: {
                endpoint: '/health',
                interval: 30000,
                timeout: 5000
            }
        });
        setValidationResults(null);
        setTestResults(null);
    };

    // Удалена неиспользуемая функция

    return (
        <div className={`service-connector-interface ${className || ''}`}>
            {/* Кнопка открытия */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-black hover:bg-black text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
                title="Добавить новый сервис"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Модальное окно */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Подключение нового сервиса</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-text hover:text-text"
                                    title="Закрыть"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Форма сервиса */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Конфигурация сервиса</h3>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">ID сервиса *</label>
                                        <input
                                            type="text"
                                            value={serviceForm.id || ''}
                                            onChange={(e) => handleServiceFormChange('id', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="my-service"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Название *</label>
                                        <input
                                            type="text"
                                            value={serviceForm.name || ''}
                                            onChange={(e) => handleServiceFormChange('name', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Мой сервис"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Описание *</label>
                                        <textarea
                                            value={serviceForm.description || ''}
                                            onChange={(e) => handleServiceFormChange('description', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                            placeholder="Описание сервиса"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Иконка *</label>
                                        <select
                                            value={serviceForm.icon || 'Settings'}
                                            onChange={(e) => handleServiceFormChange('icon', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            title="Выберите иконку для сервиса"
                                        >
                                            {AVAILABLE_ICONS.map(icon => (
                                                <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Версия *</label>
                                            <input
                                                type="text"
                                                value={serviceForm.version || '1.0.0'}
                                                onChange={(e) => handleServiceFormChange('version', e.target.value)}
                                                className="w-full p-2 border rounded-md"
                                                placeholder="1.0.0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Приоритет</label>
                                            <input
                                                type="number"
                                                value={serviceForm.priority || 10}
                                                onChange={(e) => handleServiceFormChange('priority', parseInt(e.target.value))}
                                                className="w-full p-2 border rounded-md"
                                                min="0"
                                                title="Приоритет сервиса"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Категория</label>
                                        <select
                                            value={serviceForm.category || 'utility'}
                                            onChange={(e) => handleServiceFormChange('category', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            title="Выберите категорию сервиса"
                                        >
                                            <option value="utility">Утилиты</option>
                                            <option value="ai">ИИ</option>
                                            <option value="file">Файлы</option>
                                            <option value="settings">Настройки</option>
                                            <option value="system">Система</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Форма коннектора */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Конфигурация коннектора</h3>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Base URL *</label>
                                        <input
                                            type="url"
                                            value={connectorForm.baseUrl || ''}
                                            onChange={(e) => handleConnectorFormChange('baseUrl', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="https://api.example.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Timeout (ms)</label>
                                            <input
                                                type="number"
                                                value={connectorForm.timeout || 5000}
                                                onChange={(e) => handleConnectorFormChange('timeout', parseInt(e.target.value))}
                                                className="w-full p-2 border rounded-md"
                                                min="1000"
                                                title="Таймаут подключения в миллисекундах"
                                                placeholder="5000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Retries</label>
                                            <input
                                                type="number"
                                                value={connectorForm.retries || 3}
                                                onChange={(e) => handleConnectorFormChange('retries', parseInt(e.target.value))}
                                                className="w-full p-2 border rounded-md"
                                                min="0"
                                                max="10"
                                                title="Количество повторных попыток подключения"
                                                placeholder="3"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Health Check Endpoint</label>
                                        <input
                                            type="text"
                                            value={connectorForm.healthCheck?.endpoint || '/health'}
                                            onChange={(e) => handleConnectorFormChange('healthCheck', {
                                                ...connectorForm.healthCheck,
                                                endpoint: e.target.value
                                            })}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="/health"
                                            title="Эндпоинт для проверки здоровья сервиса"
                                        />
                                    </div>

                                    {/* Результаты валидации */}
                                    {validationResults && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Результаты валидации</h4>
                                            {validationResults.errors.length > 0 && (
                                                <div className="text-red-600 text-sm">
                                                    <strong>Ошибки:</strong>
                                                    <ul className="list-disc list-inside">
                                                        {validationResults.errors.map((error: string, index: number) => (
                                                            <li key={index}>{error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {validationResults.warnings.length > 0 && (
                                                <div className="text-yellow-600 text-sm">
                                                    <strong>Предупреждения:</strong>
                                                    <ul className="list-disc list-inside">
                                                        {validationResults.warnings.map((warning: string, index: number) => (
                                                            <li key={index}>{warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {validationResults.suggestions.length > 0 && (
                                                <div className="text-text text-sm">
                                                    <strong>Предложения:</strong>
                                                    <ul className="list-disc list-inside">
                                                        {validationResults.suggestions.map((suggestion: string, index: number) => (
                                                            <li key={index}>{suggestion}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Результаты тестирования */}
                                    {testResults && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Результаты тестирования</h4>
                                            {testResults.map((result: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <div key={index} className={`flex items-center space-x-2 text-sm ${result.passed ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {result.passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    <span>{result.testName}: {result.passed ? 'Пройден' : 'Не пройден'}</span>
                                                    {result.error && <span className="text-text">({result.error})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={validateService}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                >
                                    Валидировать
                                </button>
                                <button
                                    onClick={testConnector}
                                    disabled={isConnecting}
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-black disabled:opacity-50"
                                >
                                    {isConnecting ? 'Тестирование...' : 'Тестировать'}
                                </button>
                                <button
                                    onClick={addService}
                                    disabled={isConnecting || !validationResults?.isValid}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                >
                                    {isConnecting ? 'Подключение...' : 'Подключить'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
