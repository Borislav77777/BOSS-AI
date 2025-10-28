import { ServiceConfig, ServiceModule } from '@/types/services';
/**
 * Интерфейс для плагина
 */
export interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    config: ServiceConfig;
    module: ServiceModule;
    isInstalled: boolean;
    isEnabled: boolean;
    isUpdating: boolean;
    lastUpdate?: Date;
    updateUrl?: string;
    dependencies?: string[];
    manifest?: PluginManifest;
}
/**
 * Манифест плагина
 */
export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    homepage?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    updateUrl?: string;
    minPlatformVersion?: string;
    maxPlatformVersion?: string;
    compatibility?: {
        browsers?: string[];
        node?: string;
    };
}
/**
 * Менеджер плагинов с автообновлением
 */
export declare class PluginManager {
    private plugins;
    private updateCheckInterval;
    private readonly UPDATE_CHECK_INTERVAL;
    private readonly PLUGINS_STORAGE_KEY;
    private readonly PLUGIN_REGISTRY_URL;
    constructor();
    /**
     * Устанавливает плагин
     */
    installPlugin(pluginUrl: string): Promise<Plugin>;
    /**
     * Удаляет плагин
     */
    uninstallPlugin(pluginId: string): Promise<void>;
    /**
     * Включает плагин
     */
    enablePlugin(pluginId: string): Promise<void>;
    /**
     * Отключает плагин
     */
    disablePlugin(pluginId: string): Promise<void>;
    /**
     * Обновляет плагин
     */
    updatePlugin(pluginId: string): Promise<void>;
    /**
     * Проверяет обновления для всех плагинов
     */
    checkAllUpdates(): Promise<{
        [pluginId: string]: boolean;
    }>;
    /**
     * Автоматически обновляет все плагины
     */
    autoUpdateAll(): Promise<void>;
    /**
     * Получает список всех плагинов
     */
    getPlugins(): Plugin[];
    /**
     * Получает плагин по ID
     */
    getPlugin(pluginId: string): Plugin | undefined;
    /**
     * Получает включенные плагины
     */
    getEnabledPlugins(): Plugin[];
    /**
     * Загружает манифест плагина
     */
    private loadPluginManifest;
    /**
     * Загружает конфигурацию плагина
     */
    private loadPluginConfig;
    /**
     * Загружает модуль плагина
     */
    private loadPluginModule;
    /**
     * Проверяет совместимость плагина
     */
    private validatePluginCompatibility;
    /**
     * Проверяет зависимости плагина
     */
    private checkPluginDependencies;
    /**
     * Проверяет наличие обновлений для плагина
     */
    private checkForUpdates;
    /**
     * Загружает плагины из локального хранилища
     */
    private loadPluginsFromStorage;
    /**
     * Сохраняет плагины в локальное хранилище
     */
    private savePluginsToStorage;
    /**
     * Запускает автоматическую проверку обновлений
     */
    private startUpdateChecker;
    /**
     * Останавливает автоматическую проверку обновлений
     */
    stopUpdateChecker(): void;
    /**
     * Очищает все плагины
     */
    clearAllPlugins(): Promise<void>;
    /**
     * Получает статистику плагинов
     */
    getPluginStats(): {
        total: number;
        enabled: number;
        disabled: number;
        updating: number;
        withUpdates: number;
    };
}
export declare const pluginManager: PluginManager;
//# sourceMappingURL=PluginManager.d.ts.map