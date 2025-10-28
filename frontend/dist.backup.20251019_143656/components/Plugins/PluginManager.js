import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { pluginManager } from '@/services/PluginManager';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Clock, Download, Package, Pause, Play, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
/**
 * Компонент управления плагинами
 */
export const PluginManagerComponent = ({ className }) => {
    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlugin, setSelectedPlugin] = useState(null);
    // Загружаем список плагинов
    const loadPlugins = useCallback(() => {
        try {
            const pluginList = pluginManager.getPlugins();
            setPlugins(pluginList);
            setError(null);
        }
        catch (err) {
            setError('Ошибка загрузки списка плагинов');
            console.error('Ошибка загрузки плагинов:', err);
        }
    }, []);
    useEffect(() => {
        loadPlugins();
    }, [loadPlugins]);
    // Удаление плагина
    const handleUninstallPlugin = async (pluginId) => {
        setLoading(true);
        setError(null);
        try {
            await pluginManager.uninstallPlugin(pluginId);
            loadPlugins();
            if (selectedPlugin === pluginId) {
                setSelectedPlugin(null);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(`Ошибка удаления плагина: ${errorMessage}`);
            console.error('Ошибка удаления плагина:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // Включение плагина
    const handleEnablePlugin = async (pluginId) => {
        setLoading(true);
        setError(null);
        try {
            await pluginManager.enablePlugin(pluginId);
            loadPlugins();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(`Ошибка включения плагина: ${errorMessage}`);
            console.error('Ошибка включения плагина:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // Отключение плагина
    const handleDisablePlugin = async (pluginId) => {
        setLoading(true);
        setError(null);
        try {
            await pluginManager.disablePlugin(pluginId);
            loadPlugins();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка отключения плагина');
        }
        finally {
            setLoading(false);
        }
    };
    // Обновление плагина
    const handleUpdatePlugin = async (pluginId) => {
        setLoading(true);
        setError(null);
        try {
            await pluginManager.updatePlugin(pluginId);
            loadPlugins();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка обновления плагина');
        }
        finally {
            setLoading(false);
        }
    };
    // Проверка обновлений
    const handleCheckUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            // const updates = await pluginManager.checkAllUpdates();
            // console.log('Доступные обновления:', updates);
            // Здесь можно показать уведомления о доступных обновлениях
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка проверки обновлений');
        }
        finally {
            setLoading(false);
        }
    };
    // Автообновление всех плагинов
    const handleAutoUpdateAll = async () => {
        setLoading(true);
        setError(null);
        try {
            await pluginManager.autoUpdateAll();
            loadPlugins();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка автообновления');
        }
        finally {
            setLoading(false);
        }
    };
    const getPluginStatusIcon = (plugin) => {
        if (plugin.isUpdating) {
            return _jsx(RefreshCw, { className: "w-4 h-4 animate-spin plugin-manager-icon-warning" });
        }
        if (plugin.isEnabled) {
            return _jsx(CheckCircle, { className: "w-4 h-4 plugin-manager-icon-success" });
        }
        return _jsx(Pause, { className: "w-4 h-4 plugin-manager-icon-secondary" });
    };
    const getPluginStatusText = (plugin) => {
        if (plugin.isUpdating)
            return 'Обновляется';
        if (plugin.isEnabled)
            return 'Включен';
        return 'Отключен';
    };
    return (_jsxs("div", { className: cn("plugin-manager", className), children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2 plugin-manager-title", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043B\u0430\u0433\u0438\u043D\u0430\u043C\u0438" }), _jsx("p", { className: "text-sm plugin-manager-description", children: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430, \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043B\u0430\u0433\u0438\u043D\u043E\u0432" })] }), error && (_jsx("div", { className: "mb-4 p-3 rounded-lg border border-red-200 bg-red-50", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-600" }), _jsx("span", { className: "text-sm text-red-600", children: error })] }) })), _jsxs("div", { className: "mb-6 flex flex-wrap gap-3", children: [_jsxs("button", { onClick: handleCheckUpdates, disabled: loading, className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 plugin-manager-button-secondary", children: [_jsx(RefreshCw, { className: cn("w-4 h-4", loading && "animate-spin") }), _jsx("span", { children: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" })] }), _jsxs("button", { onClick: handleAutoUpdateAll, disabled: loading, className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 plugin-manager-button-primary", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0432\u0441\u0435" })] })] }), _jsx("div", { className: "space-y-3", children: plugins.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-4 plugin-manager-empty-icon" }), _jsx("p", { className: "text-lg font-medium mb-2 plugin-manager-empty-title", children: "\u041F\u043B\u0430\u0433\u0438\u043D\u044B \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B" }), _jsx("p", { className: "text-sm plugin-manager-empty-description", children: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u043F\u043B\u0430\u0433\u0438\u043D\u044B \u0434\u043B\u044F \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438" })] })) : (plugins.map((plugin) => (_jsx("div", { className: cn("p-4 rounded-lg border transition-all duration-200", selectedPlugin === plugin.id && "ring-2 ring-black", plugin.isEnabled ? "bg-green-50 border-green-200" : "bg-black border-black"), children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [getPluginStatusIcon(plugin), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold plugin-manager-plugin-name", children: plugin.name }), _jsxs("p", { className: "text-sm plugin-manager-plugin-version", children: ["v", plugin.version, " \u2022 ", plugin.author] })] })] }), _jsx("p", { className: "text-sm mb-3 plugin-manager-plugin-description", children: plugin.description }), _jsxs("div", { className: "flex items-center space-x-4 text-xs plugin-manager-plugin-meta", children: [_jsx("span", { className: cn("px-2 py-1 rounded", plugin.isEnabled
                                                    ? "plugin-manager-status-enabled"
                                                    : "plugin-manager-status-disabled"), children: getPluginStatusText(plugin) }), plugin.lastUpdate && (_jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: ["\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D ", new Date(plugin.lastUpdate).toLocaleDateString()] })] })), plugin.dependencies && plugin.dependencies.length > 0 && (_jsxs("span", { children: ["\u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438: ", plugin.dependencies.length] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [plugin.isEnabled ? (_jsx("button", { onClick: () => handleDisablePlugin(plugin.id), disabled: loading, className: "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-disable", title: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", "aria-label": "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", children: _jsx(Pause, { className: "w-4 h-4" }) })) : (_jsx("button", { onClick: () => handleEnablePlugin(plugin.id), disabled: loading, className: "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-enable", title: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", "aria-label": "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", children: _jsx(Play, { className: "w-4 h-4" }) })), plugin.updateUrl && (_jsx("button", { onClick: () => handleUpdatePlugin(plugin.id), disabled: loading || plugin.isUpdating, className: "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-update", title: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", "aria-label": "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", children: _jsx(RefreshCw, { className: cn("w-4 h-4", plugin.isUpdating && "animate-spin") }) })), _jsx("button", { onClick: () => handleUninstallPlugin(plugin.id), disabled: loading, className: "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-delete", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043B\u0430\u0433\u0438\u043D", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, plugin.id)))) }), plugins.length > 0 && (_jsxs("div", { className: "mt-6 p-4 rounded-lg border plugin-manager-stats-container", children: [_jsx("h4", { className: "text-sm font-medium mb-2 plugin-manager-stats-title", children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsx("div", { children: _jsxs("span", { className: "font-medium plugin-manager-stats-total", children: ["\u0412\u0441\u0435\u0433\u043E: ", plugins.length] }) }), _jsx("div", { children: _jsxs("span", { className: "font-medium plugin-manager-stats-enabled", children: ["\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E: ", plugins.filter(p => p.isEnabled).length] }) }), _jsx("div", { children: _jsxs("span", { className: "font-medium plugin-manager-stats-disabled", children: ["\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E: ", plugins.filter(p => !p.isEnabled).length] }) }), _jsx("div", { children: _jsxs("span", { className: "font-medium plugin-manager-stats-updating", children: ["\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F: ", plugins.filter(p => p.isUpdating).length] }) })] })] }))] }));
};
export default PluginManagerComponent;
//# sourceMappingURL=PluginManager.js.map