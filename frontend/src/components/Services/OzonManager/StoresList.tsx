import React, { useState } from 'react';
import { Store } from './types';

interface StoresListProps {
    stores: Store[];
    onAddStore: () => void;
    onEditStore: (store: Store) => void;
    onDeleteStore: (storeName: string) => void;
    onRefresh: () => void;
    onTestConnection: (storeName: string) => void;
    isLoading: boolean;
}

/**
 * Список магазинов с таблицей
 * Воспроизводит функционал из Python gui.py (строки 761-792)
 */
export const StoresList: React.FC<StoresListProps> = ({
    stores,
    onAddStore,
    onEditStore,
    onDeleteStore,
    onRefresh,
    onTestConnection,
    isLoading
}) => {
    const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());

    const handleTestConnection = async (storeName: string) => {
        setTestingConnections(prev => new Set(prev).add(storeName));
        await onTestConnection(storeName);
        setTestingConnections(prev => {
            const newSet = new Set(prev);
            newSet.delete(storeName);
            return newSet;
        });
    };

    return (
        <div className="space-y-4">
            {/* Заголовок и кнопки */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Магазины Ozon</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="unified-button unified-button-secondary"
                    >
                        {isLoading ? 'Обновление...' : 'Обновить'}
                    </button>
                    <button
                        onClick={onAddStore}
                        className="unified-button unified-button-primary"
                    >
                        Добавить магазин
                    </button>
                </div>
            </div>

            {/* Таблица магазинов */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-surface">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Название
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Client ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Удаление из акций
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Разархивация
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Расписание
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stores.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                                        Нет добавленных магазинов
                                    </td>
                                </tr>
                            ) : (
                                stores.map((store) => (
                                    <tr key={store.name} className="hover:bg-surface-hover">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">
                                                {store.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-secondary">
                                                {store.client_id.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${store.remove_from_promotions
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {store.remove_from_promotions ? 'Включено' : 'Отключено'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${store.unarchive_enabled
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {store.unarchive_enabled ? 'Включено' : 'Отключено'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-secondary">
                                                <div>Акции: {store.schedule_times.remove}</div>
                                                <div>Архив: {store.schedule_times.unarchive}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleTestConnection(store.name)}
                                                    disabled={testingConnections.has(store.name)}
                                                    className="unified-button unified-button-secondary"
                                                >
                                                    {testingConnections.has(store.name) ? 'Тест...' : 'Тест'}
                                                </button>
                                                <button
                                                    onClick={() => onEditStore(store)}
                                                    className="unified-button unified-button-secondary"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => onDeleteStore(store.name)}
                                                    className="unified-button btn-danger"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Статистика */}
            {stores.length > 0 && (
                <div className="bg-surface px-4 py-3 rounded-md">
                    <div className="flex items-center justify-between text-sm text-secondary">
                        <span>Всего магазинов: {stores.length}</span>
                        <div className="flex space-x-4">
                            <span>
                                С акциями: {stores.filter(s => s.remove_from_promotions).length}
                            </span>
                            <span>
                                С разархивацией: {stores.filter(s => s.unarchive_enabled).length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
