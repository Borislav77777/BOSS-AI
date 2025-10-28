import React from 'react';
import { OperationStatus } from './types';

interface ControlPanelProps {
    stores: string[];
    selectedStores: string[];
    onStoreSelectionChange: (stores: string[]) => void;
    onRunPromotions: () => void;
    onRunUnarchive: () => void;
    onRunAll: () => void;
    onStop: () => void;
    operationStatus: OperationStatus;
}

/**
 * Панель управления операциями
 * Воспроизводит функционал из Python gui.py (строки 685-707)
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
    stores,
    selectedStores,
    onStoreSelectionChange,
    onRunPromotions,
    onRunUnarchive,
    onRunAll,
    onStop,
    operationStatus
}) => {
    const handleStoreToggle = (storeName: string) => {
        if (selectedStores.includes(storeName)) {
            onStoreSelectionChange(selectedStores.filter(s => s !== storeName));
        } else {
            onStoreSelectionChange([...selectedStores, storeName]);
        }
    };

    const handleSelectAll = () => {
        onStoreSelectionChange(stores);
    };

    const handleSelectNone = () => {
        onStoreSelectionChange([]);
    };

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-var-text">Управление операциями</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleSelectAll}
                        className="unified-button unified-button-secondary"
                    >
                        Выбрать все
                    </button>
                    <button
                        onClick={handleSelectNone}
                        className="unified-button unified-button-secondary"
                    >
                        Снять все
                    </button>
                </div>
            </div>

            {/* Выбор магазинов */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4 text-var-text">Выберите магазины для операций</h3>

                {stores.length === 0 ? (
                    <p className="text-var-text-muted">Нет доступных магазинов</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stores.map((storeName) => (
                            <label key={storeName} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-surface-hover">
                                <input
                                    type="checkbox"
                                    checked={selectedStores.includes(storeName)}
                                    onChange={() => handleStoreToggle(storeName)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-var-text">{storeName}</span>
                            </label>
                        ))}
                    </div>
                )}

                {selectedStores.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Выбрано магазинов: {selectedStores.length} из {stores.length}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {selectedStores.join(', ')}
                        </p>
                    </div>
                )}
            </div>

            {/* Кнопки операций */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4 text-var-text">Операции</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Удаление из акций */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-var-text">Удаление из акций</h4>
                                <p className="text-sm text-var-text-muted">Удаление товаров из невыгодных акций</p>
                            </div>
                            <button
                                onClick={onRunPromotions}
                                disabled={selectedStores.length === 0 || operationStatus.isRunning}
                                className="unified-button unified-button-primary"
                            >
                                Запустить
                            </button>
                        </div>
                    </div>

                    {/* Разархивация */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-var-text">Разархивация</h4>
                                <p className="text-sm text-var-text-muted">Извлечение товаров из автоархива</p>
                            </div>
                            <button
                                onClick={onRunUnarchive}
                                disabled={selectedStores.length === 0 || operationStatus.isRunning}
                                className="unified-button unified-button-primary"
                            >
                                Запустить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Общие операции */}
                <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-var-text">Все операции</h4>
                            <p className="text-sm text-var-text-muted">Запуск всех выбранных операций последовательно</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={onRunAll}
                                disabled={selectedStores.length === 0 || operationStatus.isRunning}
                                className="unified-button unified-button-primary"
                            >
                                Запустить все
                            </button>
                            <button
                                onClick={onStop}
                                disabled={!operationStatus.isRunning}
                                className="unified-button btn-danger"
                            >
                                Остановить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статус операции */}
            {operationStatus.isRunning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Выполняется: {operationStatus.operation}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                {operationStatus.message}
                            </p>
                            {operationStatus.progress > 0 && (
                                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                                        data-progress={operationStatus.progress}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Результаты операций */}
            {operationStatus.results.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-foreground mb-4">Результаты операций</h3>
                    <div className="space-y-3">
                        {operationStatus.results.map((result, index) => {
                            const typedResult = result as {
                                store: string;
                                success: boolean;
                                products_removed?: number;
                                actions_processed?: number;
                                total_unarchived?: number;
                                cycles_completed?: number;
                                error?: string;
                            };

                            return (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-foreground">{typedResult.store}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typedResult.success
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {typedResult.success ? 'Успешно' : 'Ошибка'}
                                        </span>
                                    </div>
                                    {typedResult.success && (
                                        <div className="mt-2 text-sm text-secondary">
                                            {typedResult.products_removed !== undefined && (
                                                <p>Удалено товаров: {typedResult.products_removed}</p>
                                            )}
                                            {typedResult.actions_processed !== undefined && (
                                                <p>Обработано акций: {typedResult.actions_processed}</p>
                                            )}
                                            {typedResult.total_unarchived !== undefined && (
                                                <p>Разархивировано: {typedResult.total_unarchived}</p>
                                            )}
                                            {typedResult.cycles_completed !== undefined && (
                                                <p>Циклов: {typedResult.cycles_completed}</p>
                                            )}
                                        </div>
                                    )}
                                    {!typedResult.success && typedResult.error && (
                                        <p className="mt-2 text-sm text-red-600">{typedResult.error}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
