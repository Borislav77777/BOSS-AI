import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { ozonApiClient } from '../../../services/api';
import { ControlPanel } from './ControlPanel';
import { LogsViewer } from './LogsViewer';
import { SchedulerPanel } from './SchedulerPanel';
import { StoreDialog } from './StoreDialog';
import { StoresList } from './StoresList';
/**
 * Главный компонент Ozon Manager
 * Воспроизводит функционал из Python gui.py OzonManagerGUI
 */
export const OzonManager = () => {
    // Состояние компонента
    const [activeTab, setActiveTab] = useState('stores');
    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Диалог магазина
    const [storeDialog, setStoreDialog] = useState({
        isOpen: false,
        mode: 'add',
        store: null
    });
    // Статус операций
    const [operationStatus, setOperationStatus] = useState({
        isRunning: false,
        operation: null,
        progress: 0,
        message: '',
        results: []
    });
    // Статус планировщика
    const [, setSchedulerStatus] = useState({
        isRunning: false,
        tasksCount: 0,
        tasks: []
    });
    // Логи
    const [, setLogs] = useState([]);
    // Загружаем данные при монтировании
    useEffect(() => {
        loadStores();
        loadSchedulerStatus();
        loadLogs();
    }, []);
    // Автообновление каждые 30 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'logs') {
                loadLogs();
            }
            if (activeTab === 'scheduler') {
                loadSchedulerStatus();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);
    // Загрузка магазинов
    const loadStores = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ozonApiClient.getStores();
            if (response.success) {
                setStores(response.data || []);
            }
            else {
                setError(`Ошибка загрузки магазинов: ${response.error?.message || 'Неизвестная ошибка'}`);
            }
        }
        catch (error) {
            setError(`Ошибка загрузки магазинов: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Загрузка статуса планировщика
    const loadSchedulerStatus = async () => {
        try {
            const response = await ozonApiClient.getSchedulerStatus();
            if (response.success) {
                setSchedulerStatus(response.data);
            }
        }
        catch (error) {
            console.error('Ошибка загрузки статуса планировщика:', error);
        }
    };
    // Загрузка логов
    const loadLogs = async () => {
        try {
            const response = await ozonApiClient.getLogs();
            if (response.success) {
                setLogs(response.data || []);
            }
        }
        catch (error) {
            console.error('Ошибка загрузки логов:', error);
        }
    };
    // Обработчики магазинов
    const handleAddStore = () => {
        setStoreDialog({
            isOpen: true,
            mode: 'add',
            store: null
        });
    };
    const handleEditStore = (store) => {
        setStoreDialog({
            isOpen: true,
            mode: 'edit',
            store
        });
    };
    const handleDeleteStore = async (storeName) => {
        if (window.confirm(`Удалить магазин "${storeName}"?`)) {
            try {
                const response = await ozonApiClient.deleteStore(storeName);
                if (response.success) {
                    setStores(prev => prev.filter(s => s.name !== storeName));
                    setSelectedStores(prev => prev.filter(s => s !== storeName));
                }
                else {
                    setError(`Ошибка удаления магазина: ${response.error?.message || 'Неизвестная ошибка'}`);
                }
            }
            catch (error) {
                setError(`Ошибка удаления магазина: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };
    const handleSaveStore = async (store) => {
        try {
            let response;
            if (storeDialog.mode === 'add') {
                response = await ozonApiClient.createStore(store);
            }
            else {
                response = await ozonApiClient.updateStore(storeDialog.store?.name || '', store);
            }
            if (response.success) {
                // Перезагружаем список магазинов
                await loadStores();
            }
            else {
                setError(`Ошибка сохранения магазина: ${response.error?.message || 'Неизвестная ошибка'}`);
            }
        }
        catch (error) {
            setError(`Ошибка сохранения магазина: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    const handleTestConnection = async (storeName) => {
        try {
            const response = await ozonApiClient.testConnection(storeName);
            if (response.success) {
                alert('✅ Подключение успешно!');
            }
            else {
                alert(`❌ Ошибка подключения: ${response.error?.message || 'Неизвестная ошибка'}`);
            }
        }
        catch (error) {
            alert(`Ошибка тестирования подключения: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    // Обработчики операций
    const handleRunPromotions = async () => {
        if (selectedStores.length === 0) {
            alert('Выберите магазины для операции');
            return;
        }
        setOperationStatus({
            isRunning: true,
            operation: 'Удаление из акций',
            progress: 0,
            message: 'Запуск операции...',
            results: []
        });
        try {
            const response = await ozonApiClient.removeFromPromotions(selectedStores);
            if (response.success) {
                setOperationStatus(prev => ({
                    ...prev,
                    isRunning: false,
                    operation: null,
                    progress: 100,
                    message: 'Операция завершена',
                    results: response.data || []
                }));
            }
            else {
                setOperationStatus(prev => ({
                    ...prev,
                    isRunning: false,
                    operation: null,
                    message: `Ошибка: ${response.error}`
                }));
            }
        }
        catch (error) {
            setOperationStatus(prev => ({
                ...prev,
                isRunning: false,
                operation: null,
                message: `Ошибка: ${error instanceof Error ? error.message : String(error)}`
            }));
        }
    };
    const handleRunUnarchive = async () => {
        if (selectedStores.length === 0) {
            alert('Выберите магазины для операции');
            return;
        }
        setOperationStatus({
            isRunning: true,
            operation: 'Разархивация товаров',
            progress: 0,
            message: 'Запуск операции...',
            results: []
        });
        try {
            const response = await ozonApiClient.unarchiveProducts(selectedStores);
            if (response.success) {
                setOperationStatus(prev => ({
                    ...prev,
                    isRunning: false,
                    operation: null,
                    progress: 100,
                    message: 'Операция завершена',
                    results: response.data || []
                }));
            }
            else {
                setOperationStatus(prev => ({
                    ...prev,
                    isRunning: false,
                    operation: null,
                    message: `Ошибка: ${response.error}`
                }));
            }
        }
        catch (error) {
            setOperationStatus(prev => ({
                ...prev,
                isRunning: false,
                operation: null,
                message: `Ошибка: ${error instanceof Error ? error.message : String(error)}`
            }));
        }
    };
    const handleRunAll = async () => {
        await handleRunPromotions();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await handleRunUnarchive();
    };
    const handleStop = () => {
        setOperationStatus(prev => ({
            ...prev,
            isRunning: false,
            operation: null,
            message: 'Операция остановлена пользователем'
        }));
    };
    // Обработчики планировщика
    const handleReloadSchedule = async () => {
        try {
            // Перезагружаем статус планировщика
            await loadSchedulerStatus();
        }
        catch (error) {
            setError(`Ошибка перезагрузки расписания: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    // Обработчики логов
    const handleRefreshLogs = async () => {
        await loadLogs();
    };
    const handleOpenLogsFolder = () => {
        alert('Открытие папки логов (в реальности откроется файловый менеджер)');
    };
    return (_jsxs("div", { className: "min-h-screen bg-surface", children: [_jsx("div", { className: "liquid-glass-block border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("h1", { className: "text-xl font-semibold text-foreground", children: "Ozon Manager" }), _jsx("p", { className: "text-sm text-secondary", children: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u0430\u043C\u0438 \u043D\u0430 Ozon" })] })] }), _jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { className: "text-sm text-secondary", children: ["\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432: ", stores.length] }) })] }) }) }), _jsx("div", { className: "liquid-glass-block", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("nav", { className: "flex space-x-2", children: [
                            { id: 'stores', name: 'Магазины', icon: '🏪' },
                            { id: 'control', name: 'Управление', icon: '🎛️' },
                            { id: 'scheduler', name: 'Расписание', icon: '📅' },
                            { id: 'logs', name: 'Логи', icon: '📋' }
                        ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `ozon-button ${activeTab === tab.id ? 'ozon-button-primary' : ''}`, children: [_jsx("span", { className: "mr-2", children: tab.icon }), tab.name] }, tab.id))) }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [error && (_jsx("div", { className: "mb-6 liquid-glass-block border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "\u041E\u0448\u0438\u0431\u043A\u0430" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) })), activeTab === 'stores' && (_jsx(StoresList, { stores: stores, onAddStore: handleAddStore, onEditStore: handleEditStore, onDeleteStore: handleDeleteStore, onRefresh: loadStores, onTestConnection: handleTestConnection, isLoading: isLoading })), activeTab === 'control' && (_jsx(ControlPanel, { stores: stores.map(s => s.name), selectedStores: selectedStores, onStoreSelectionChange: setSelectedStores, onRunPromotions: handleRunPromotions, onRunUnarchive: handleRunUnarchive, onRunAll: handleRunAll, onStop: handleStop, operationStatus: operationStatus })), activeTab === 'scheduler' && (_jsx(SchedulerPanel, { onReloadSchedule: handleReloadSchedule, isLoading: isLoading })), activeTab === 'logs' && (_jsx(LogsViewer, { onRefresh: handleRefreshLogs, onOpenLogsFolder: handleOpenLogsFolder, isLoading: isLoading }))] }), _jsx(StoreDialog, { isOpen: storeDialog.isOpen, onClose: () => setStoreDialog(prev => ({ ...prev, isOpen: false })), onSave: handleSaveStore, store: storeDialog.store, mode: storeDialog.mode })] }));
};
//# sourceMappingURL=OzonManager.js.map