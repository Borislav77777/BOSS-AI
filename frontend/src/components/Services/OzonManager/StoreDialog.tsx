import React, { useEffect, useState } from 'react';
import { Store, StoreDialogProps } from './types';

/**
 * Диалог добавления/редактирования магазина
 * Воспроизводит функционал из Python gui.py StoreDialog
 */
export const StoreDialog: React.FC<StoreDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    store,
    mode
}) => {
    const [formData, setFormData] = useState<Store>({
        name: '',
        client_id: '',
        api_key: '',
        remove_from_promotions: false,
        unarchive_enabled: false,
        manual_run_on_startup: false,
        schedule_times: {
            remove: '09:00',
            unarchive: '10:00'
        }
    });

    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    // Заполняем форму при редактировании
    useEffect(() => {
        if (mode === 'edit' && store) {
            setFormData(store);
        } else {
            setFormData({
                name: '',
                client_id: '',
                api_key: '',
                remove_from_promotions: false,
                unarchive_enabled: false,
                manual_run_on_startup: false,
                schedule_times: {
                    remove: '09:00',
                    unarchive: '10:00'
                }
            });
        }
        setConnectionStatus('idle');
        setConnectionMessage('');
    }, [isOpen, mode, store]);

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field.startsWith('schedule_times.')) {
            const scheduleField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                schedule_times: {
                    ...prev.schedule_times,
                    [scheduleField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleTestConnection = async () => {
        if (!formData.name || !formData.client_id || !formData.api_key) {
            setConnectionMessage('Заполните все обязательные поля');
            setConnectionStatus('error');
            return;
        }

        setIsTestingConnection(true);
        setConnectionStatus('idle');
        setConnectionMessage('Тестируем подключение...');

        try {
            // Имитируем тест подключения (в реальности будет API вызов)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Случайный результат для демонстрации
            const isSuccess = Math.random() > 0.3;

            if (isSuccess) {
                setConnectionStatus('success');
                setConnectionMessage('✅ Подключение успешно!');
            } else {
                setConnectionStatus('error');
                setConnectionMessage('❌ Ошибка подключения к API');
            }
        } catch (error) {
            setConnectionStatus('error');
            setConnectionMessage('❌ Ошибка подключения');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.client_id || !formData.api_key) {
            alert('Заполните все обязательные поля');
            return;
        }

        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="liquid-glass-block rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Заголовок */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-foreground">
                        {mode === 'add' ? 'Добавить магазин' : 'Редактировать магазин'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-primary transition-colors"
                        aria-label="Закрыть диалог"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Форма */}
                <div className="p-6 space-y-6">
                    {/* Основная информация */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Основная информация</h3>

                        <div>
                            <label htmlFor="store-name" className="block text-sm font-medium text-foreground mb-1">
                                Название магазина *
                            </label>
                            <input
                                id="store-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                placeholder="Введите название магазина"
                            />
                        </div>

                        <div>
                            <label htmlFor="client-id" className="block text-sm font-medium text-foreground mb-1">
                                Client ID *
                            </label>
                            <input
                                id="client-id"
                                type="text"
                                value={formData.client_id}
                                onChange={(e) => handleInputChange('client_id', e.target.value)}
                                className="w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                placeholder="Введите Client ID"
                            />
                        </div>

                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-1">
                                API Key *
                            </label>
                            <input
                                id="api-key"
                                type="password"
                                value={formData.api_key}
                                onChange={(e) => handleInputChange('api_key', e.target.value)}
                                className="w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                placeholder="Введите API Key"
                            />
                        </div>

                        {/* Кнопка тестирования подключения */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleTestConnection}
                                disabled={isTestingConnection || !formData.name || !formData.client_id || !formData.api_key}
                                className="unified-button unified-button-secondary"
                            >
                                {isTestingConnection ? 'Тестируем...' : 'Тест подключения'}
                            </button>

                            {connectionMessage && (
                                <span className={`text-sm ${connectionStatus === 'success' ? 'text-green-600' :
                                    connectionStatus === 'error' ? 'text-red-600' :
                                        'text-gray-600'
                                    }`}>
                                    {connectionMessage}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Настройки операций */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Настройки операций</h3>

                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.remove_from_promotions}
                                    onChange={(e) => handleInputChange('remove_from_promotions', e.target.checked)}
                                    className="mr-3 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Удаление из невыгодных акций</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.unarchive_enabled}
                                    onChange={(e) => handleInputChange('unarchive_enabled', e.target.checked)}
                                    className="mr-3 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Разархивация товаров</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.manual_run_on_startup}
                                    onChange={(e) => handleInputChange('manual_run_on_startup', e.target.checked)}
                                    className="mr-3 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Запуск при старте программы</span>
                            </label>
                        </div>
                    </div>

                    {/* Расписание */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Расписание</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="remove-time" className="block text-sm font-medium text-foreground mb-1">
                                    Время удаления из акций
                                </label>
                                <input
                                    id="remove-time"
                                    type="time"
                                    value={formData.schedule_times.remove}
                                    onChange={(e) => handleInputChange('schedule_times.remove', e.target.value)}
                                    className="w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                />
                            </div>

                            <div>
                                <label htmlFor="unarchive-time" className="block text-sm font-medium text-foreground mb-1">
                                    Время разархивации
                                </label>
                                <input
                                    id="unarchive-time"
                                    type="time"
                                    value={formData.schedule_times.unarchive}
                                    onChange={(e) => handleInputChange('schedule_times.unarchive', e.target.value)}
                                    className="w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t bg-surface">
                    <button
                        onClick={onClose}
                        className="unified-button unified-button-secondary"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        className="unified-button unified-button-primary"
                    >
                        {mode === 'add' ? 'Добавить' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};
