import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
/**
 * Диалог добавления/редактирования магазина
 * Воспроизводит функционал из Python gui.py StoreDialog
 */
export const StoreDialog = ({ isOpen, onClose, onSave, store, mode }) => {
    const [formData, setFormData] = useState({
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
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [connectionMessage, setConnectionMessage] = useState('');
    // Заполняем форму при редактировании
    useEffect(() => {
        if (mode === 'edit' && store) {
            setFormData(store);
        }
        else {
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
    const handleInputChange = (field, value) => {
        if (field.startsWith('schedule_times.')) {
            const scheduleField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                schedule_times: {
                    ...prev.schedule_times,
                    [scheduleField]: value
                }
            }));
        }
        else {
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
            }
            else {
                setConnectionStatus('error');
                setConnectionMessage('❌ Ошибка подключения к API');
            }
        }
        catch (error) {
            setConnectionStatus('error');
            setConnectionMessage('❌ Ошибка подключения');
        }
        finally {
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
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "liquid-glass-block rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold text-foreground", children: mode === 'add' ? 'Добавить магазин' : 'Редактировать магазин' }), _jsx("button", { onClick: onClose, className: "text-secondary hover:text-primary transition-colors", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0434\u0438\u0430\u043B\u043E\u0433", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-foreground", children: "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F" }), _jsxs("div", { children: [_jsx("label", { htmlFor: "store-name", className: "block text-sm font-medium text-foreground mb-1", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 *" }), _jsx("input", { id: "store-name", type: "text", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), className: "w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "client-id", className: "block text-sm font-medium text-foreground mb-1", children: "Client ID *" }), _jsx("input", { id: "client-id", type: "text", value: formData.client_id, onChange: (e) => handleInputChange('client_id', e.target.value), className: "w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 Client ID" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "api-key", className: "block text-sm font-medium text-foreground mb-1", children: "API Key *" }), _jsx("input", { id: "api-key", type: "password", value: formData.api_key, onChange: (e) => handleInputChange('api_key', e.target.value), className: "w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 API Key" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: handleTestConnection, disabled: isTestingConnection || !formData.name || !formData.client_id || !formData.api_key, className: "unified-button unified-button-secondary", children: isTestingConnection ? 'Тестируем...' : 'Тест подключения' }), connectionMessage && (_jsx("span", { className: `text-sm ${connectionStatus === 'success' ? 'text-green-600' :
                                                connectionStatus === 'error' ? 'text-red-600' :
                                                    'text-gray-600'}`, children: connectionMessage }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-foreground", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.remove_from_promotions, onChange: (e) => handleInputChange('remove_from_promotions', e.target.checked), className: "mr-3 text-primary focus:ring-primary" }), _jsx("span", { className: "text-sm text-foreground", children: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0438\u0437 \u043D\u0435\u0432\u044B\u0433\u043E\u0434\u043D\u044B\u0445 \u0430\u043A\u0446\u0438\u0439" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.unarchive_enabled, onChange: (e) => handleInputChange('unarchive_enabled', e.target.checked), className: "mr-3 text-primary focus:ring-primary" }), _jsx("span", { className: "text-sm text-foreground", children: "\u0420\u0430\u0437\u0430\u0440\u0445\u0438\u0432\u0430\u0446\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.manual_run_on_startup, onChange: (e) => handleInputChange('manual_run_on_startup', e.target.checked), className: "mr-3 text-primary focus:ring-primary" }), _jsx("span", { className: "text-sm text-foreground", children: "\u0417\u0430\u043F\u0443\u0441\u043A \u043F\u0440\u0438 \u0441\u0442\u0430\u0440\u0442\u0435 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-foreground", children: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "remove-time", className: "block text-sm font-medium text-foreground mb-1", children: "\u0412\u0440\u0435\u043C\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0438\u0437 \u0430\u043A\u0446\u0438\u0439" }), _jsx("input", { id: "remove-time", type: "time", value: formData.schedule_times.remove, onChange: (e) => handleInputChange('schedule_times.remove', e.target.value), className: "w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "unarchive-time", className: "block text-sm font-medium text-foreground mb-1", children: "\u0412\u0440\u0435\u043C\u044F \u0440\u0430\u0437\u0430\u0440\u0445\u0438\u0432\u0430\u0446\u0438\u0438" }), _jsx("input", { id: "unarchive-time", type: "time", value: formData.schedule_times.unarchive, onChange: (e) => handleInputChange('schedule_times.unarchive', e.target.value), className: "w-full px-3 py-2 bg-input border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground" })] })] })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-3 p-6 border-t bg-surface", children: [_jsx("button", { onClick: onClose, className: "unified-button unified-button-secondary", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { onClick: handleSave, className: "unified-button unified-button-primary", children: mode === 'add' ? 'Добавить' : 'Сохранить' })] })] }) }));
};
//# sourceMappingURL=StoreDialog.js.map