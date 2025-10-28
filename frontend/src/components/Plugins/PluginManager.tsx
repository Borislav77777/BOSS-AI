import { Plugin, pluginManager } from '@/services/PluginManager';
import { cn } from '@/utils/cn';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Package,
    Pause,
    Play,
    RefreshCw,
    Trash2
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface PluginManagerProps {
    className?: string;
}

/**
 * Компонент управления плагинами
 */
export const PluginManagerComponent: React.FC<PluginManagerProps> = ({ className }) => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

    // Загружаем список плагинов
    const loadPlugins = useCallback(() => {
        try {
            const pluginList = pluginManager.getPlugins();
            setPlugins(pluginList);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки списка плагинов');
            console.error('Ошибка загрузки плагинов:', err);
        }
    }, []);

    useEffect(() => {
        loadPlugins();
    }, [loadPlugins]);

    // Удаление плагина
    const handleUninstallPlugin = async (pluginId: string) => {
        setLoading(true);
        setError(null);

        try {
            await pluginManager.uninstallPlugin(pluginId);
            loadPlugins();
            if (selectedPlugin === pluginId) {
                setSelectedPlugin(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(`Ошибка удаления плагина: ${errorMessage}`);
            console.error('Ошибка удаления плагина:', err);
        } finally {
            setLoading(false);
        }
    };

    // Включение плагина
    const handleEnablePlugin = async (pluginId: string) => {
        setLoading(true);
        setError(null);

        try {
            await pluginManager.enablePlugin(pluginId);
            loadPlugins();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(`Ошибка включения плагина: ${errorMessage}`);
            console.error('Ошибка включения плагина:', err);
        } finally {
            setLoading(false);
        }
    };

    // Отключение плагина
    const handleDisablePlugin = async (pluginId: string) => {
        setLoading(true);
        setError(null);

        try {
            await pluginManager.disablePlugin(pluginId);
            loadPlugins();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка отключения плагина');
        } finally {
            setLoading(false);
        }
    };

    // Обновление плагина
    const handleUpdatePlugin = async (pluginId: string) => {
        setLoading(true);
        setError(null);

        try {
            await pluginManager.updatePlugin(pluginId);
            loadPlugins();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка обновления плагина');
        } finally {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка проверки обновлений');
        } finally {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка автообновления');
        } finally {
            setLoading(false);
        }
    };

    const getPluginStatusIcon = (plugin: Plugin) => {
        if (plugin.isUpdating) {
            return <RefreshCw className="w-4 h-4 animate-spin plugin-manager-icon-warning" />;
        }
        if (plugin.isEnabled) {
            return <CheckCircle className="w-4 h-4 plugin-manager-icon-success" />;
        }
        return <Pause className="w-4 h-4 plugin-manager-icon-secondary" />;
    };

    const getPluginStatusText = (plugin: Plugin) => {
        if (plugin.isUpdating) return 'Обновляется';
        if (plugin.isEnabled) return 'Включен';
        return 'Отключен';
    };

    return (
        <div className={cn("plugin-manager", className)}>
            {/* Заголовок */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 plugin-manager-title">
                    Управление плагинами
                </h2>
                <p className="text-sm plugin-manager-description">
                    Установка, настройка и обновление плагинов
                </p>
            </div>

            {/* Ошибки */}
            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{error}</span>
                    </div>
                </div>
            )}

            {/* Действия */}
            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    onClick={handleCheckUpdates}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 plugin-manager-button-secondary"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    <span>Проверить обновления</span>
                </button>

                <button
                    onClick={handleAutoUpdateAll}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 plugin-manager-button-primary"
                >
                    <Download className="w-4 h-4" />
                    <span>Обновить все</span>
                </button>
            </div>

            {/* Список плагинов */}
            <div className="space-y-3">
                {plugins.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto mb-4 plugin-manager-empty-icon" />
                        <p className="text-lg font-medium mb-2 plugin-manager-empty-title">
                            Плагины не установлены
                        </p>
                        <p className="text-sm plugin-manager-empty-description">
                            Установите плагины для расширения функциональности
                        </p>
                    </div>
                ) : (
                    plugins.map((plugin) => (
                        <div
                            key={plugin.id}
                            className={cn(
                                "p-4 rounded-lg border transition-all duration-200",
                                selectedPlugin === plugin.id && "ring-2 ring-black",
                                plugin.isEnabled ? "bg-green-50 border-green-200" : "bg-black border-black"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        {getPluginStatusIcon(plugin)}
                                        <div>
                                            <h3 className="text-lg font-semibold plugin-manager-plugin-name">
                                                {plugin.name}
                                            </h3>
                                            <p className="text-sm plugin-manager-plugin-version">
                                                v{plugin.version} • {plugin.author}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3 plugin-manager-plugin-description">
                                        {plugin.description}
                                    </p>

                                    <div className="flex items-center space-x-4 text-xs plugin-manager-plugin-meta">
                                        <span className={cn(
                                            "px-2 py-1 rounded",
                                            plugin.isEnabled
                                                ? "plugin-manager-status-enabled"
                                                : "plugin-manager-status-disabled"
                                        )}>
                                            {getPluginStatusText(plugin)}
                                        </span>

                                        {plugin.lastUpdate && (
                                            <span className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Обновлен {new Date(plugin.lastUpdate).toLocaleDateString()}</span>
                                            </span>
                                        )}

                                        {plugin.dependencies && plugin.dependencies.length > 0 && (
                                            <span>
                                                Зависимости: {plugin.dependencies.length}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    {plugin.isEnabled ? (
                                        <button
                                            onClick={() => handleDisablePlugin(plugin.id)}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-disable"
                                            title="Отключить плагин"
                                            aria-label="Отключить плагин"
                                        >
                                            <Pause className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEnablePlugin(plugin.id)}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-enable"
                                            title="Включить плагин"
                                            aria-label="Включить плагин"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                    )}

                                    {plugin.updateUrl && (
                                        <button
                                            onClick={() => handleUpdatePlugin(plugin.id)}
                                            disabled={loading || plugin.isUpdating}
                                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-update"
                                            title="Обновить плагин"
                                            aria-label="Обновить плагин"
                                        >
                                            <RefreshCw className={cn("w-4 h-4", plugin.isUpdating && "animate-spin")} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleUninstallPlugin(plugin.id)}
                                        disabled={loading}
                                        className="px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 plugin-manager-button-delete"
                                        title="Удалить плагин"
                                        aria-label="Удалить плагин"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Статистика */}
            {plugins.length > 0 && (
                <div className="mt-6 p-4 rounded-lg border plugin-manager-stats-container">
                    <h4 className="text-sm font-medium mb-2 plugin-manager-stats-title">
                        Статистика
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium plugin-manager-stats-total">
                                Всего: {plugins.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium plugin-manager-stats-enabled">
                                Включено: {plugins.filter(p => p.isEnabled).length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium plugin-manager-stats-disabled">
                                Отключено: {plugins.filter(p => !p.isEnabled).length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium plugin-manager-stats-updating">
                                Обновляется: {plugins.filter(p => p.isUpdating).length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PluginManagerComponent;
