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
 * Реестр плагинов
 */
interface PluginRegistry {
    [pluginId: string]: Plugin;
}

/**
 * Менеджер плагинов с автообновлением
 */
export class PluginManager {
    private plugins: PluginRegistry = {};
    private updateCheckInterval: NodeJS.Timeout | null = null;
    private readonly UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа
    private readonly PLUGINS_STORAGE_KEY = 'barsukov_plugins';
    private readonly PLUGIN_REGISTRY_URL = '/api/plugins/registry.json';

    constructor() {
        this.loadPluginsFromStorage();
        this.startUpdateChecker();
    }

    /**
     * Устанавливает плагин
     */
    async installPlugin(pluginUrl: string): Promise<Plugin> {
        try {
            // console.log(`Установка плагина из ${pluginUrl}`);

            // Загружаем манифест плагина
            const manifest = await this.loadPluginManifest(pluginUrl);

            // Проверяем совместимость
            this.validatePluginCompatibility(manifest);

            // Проверяем зависимости
            await this.checkPluginDependencies(manifest);

            // Загружаем конфигурацию сервиса
            const config = await this.loadPluginConfig(pluginUrl);

            // Загружаем модуль плагина
            const module = await this.loadPluginModule(pluginUrl);

            // Создаем объект плагина
            const plugin: Plugin = {
                id: manifest.id,
                name: manifest.name,
                version: manifest.version,
                description: manifest.description,
                author: manifest.author,
                config,
                module,
                isInstalled: true,
                isEnabled: false,
                isUpdating: false,
                lastUpdate: new Date(),
                updateUrl: manifest.updateUrl,
                dependencies: manifest.dependencies ? Object.keys(manifest.dependencies) : [],
                manifest
            };

            // Сохраняем плагин
            this.plugins[plugin.id] = plugin;
            this.savePluginsToStorage();

            // console.log(`Плагин ${plugin.name} успешно установлен`);
            return plugin;

        } catch (error) {
            console.error(`Ошибка установки плагина из ${pluginUrl}:`, error);
            throw error;
        }
    }

    /**
     * Удаляет плагин
     */
    async uninstallPlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins[pluginId];
        if (!plugin) {
            throw new Error(`Плагин ${pluginId} не найден`);
        }

        if (plugin.isEnabled) {
            await this.disablePlugin(pluginId);
        }

        // Вызываем cleanup если есть
        if (plugin.module.module && plugin.module.module.cleanup) {
            try {
                await plugin.module.module.cleanup();
            } catch (error) {
                console.error(`Ошибка при очистке плагина ${pluginId}:`, error);
            }
        }

        delete this.plugins[pluginId];
        this.savePluginsToStorage();

        // console.log(`Плагин ${plugin.name} удален`);
    }

    /**
     * Включает плагин
     */
    async enablePlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins[pluginId];
        if (!plugin) {
            throw new Error(`Плагин ${pluginId} не найден`);
        }

        if (plugin.isEnabled) {
            return;
        }

        // Проверяем зависимости
        await this.checkPluginDependencies(plugin.manifest!);

        // Инициализируем модуль
        if (plugin.module.module && plugin.module.module.initialize) {
            await plugin.module.module.initialize();
        }

        plugin.isEnabled = true;
        plugin.module.isLoaded = true;
        this.savePluginsToStorage();

        // console.log(`Плагин ${plugin.name} включен`);
    }

    /**
     * Отключает плагин
     */
    async disablePlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins[pluginId];
        if (!plugin) {
            throw new Error(`Плагин ${pluginId} не найден`);
        }

        if (!plugin.isEnabled) {
            return;
        }

        // Вызываем cleanup
        if (plugin.module.module && plugin.module.module.cleanup) {
            try {
                await plugin.module.module.cleanup();
            } catch (error) {
                console.error(`Ошибка при отключении плагина ${pluginId}:`, error);
            }
        }

        plugin.isEnabled = false;
        plugin.module.isLoaded = false;
        this.savePluginsToStorage();

        // console.log(`Плагин ${plugin.name} отключен`);
    }

    /**
     * Обновляет плагин
     */
    async updatePlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins[pluginId];
        if (!plugin) {
            throw new Error(`Плагин ${pluginId} не найден`);
        }

        if (!plugin.updateUrl) {
            throw new Error(`Плагин ${pluginId} не поддерживает автообновление`);
        }

        plugin.isUpdating = true;
        this.savePluginsToStorage();

        try {
            // console.log(`Обновление плагина ${plugin.name}...`);

            // Проверяем доступность обновления
            const updateInfo = await this.checkForUpdates(pluginId);
            if (!updateInfo.hasUpdate) {
                // console.log(`Плагин ${plugin.name} уже актуальный`);
                return;
            }

            // Создаем бэкап текущего плагина
            const backup = { ...plugin };

            try {
                // Загружаем новую версию
                const newPlugin = await this.installPlugin(plugin.updateUrl);

                // Проверяем, что это тот же плагин
                if (newPlugin.id !== pluginId) {
                    throw new Error('ID плагина не совпадает');
                }

                // Если плагин был включен, включаем новую версию
                if (backup.isEnabled) {
                    await this.enablePlugin(pluginId);
                }

                // console.log(`Плагин ${plugin.name} обновлен с версии ${backup.version} до ${newPlugin.version}`);

            } catch (error) {
                // Восстанавливаем из бэкапа
                this.plugins[pluginId] = backup;
                this.savePluginsToStorage();
                throw error;
            }

        } finally {
            plugin.isUpdating = false;
            this.savePluginsToStorage();
        }
    }

    /**
     * Проверяет обновления для всех плагинов
     */
    async checkAllUpdates(): Promise<{ [pluginId: string]: boolean }> {
        const results: { [pluginId: string]: boolean } = {};

        for (const pluginId of Object.keys(this.plugins)) {
            try {
                const updateInfo = await this.checkForUpdates(pluginId);
                results[pluginId] = updateInfo.hasUpdate;
            } catch (error) {
                console.error(`Ошибка проверки обновлений для плагина ${pluginId}:`, error);
                results[pluginId] = false;
            }
        }

        return results;
    }

    /**
     * Автоматически обновляет все плагины
     */
    async autoUpdateAll(): Promise<void> {
        const updates = await this.checkAllUpdates();
        const pluginsToUpdate = Object.keys(updates).filter(pluginId => updates[pluginId]);

        if (pluginsToUpdate.length === 0) {
            // console.log('Нет доступных обновлений плагинов');
            return;
        }

        // console.log(`Найдено ${pluginsToUpdate.length} обновлений плагинов`);

        for (const pluginId of pluginsToUpdate) {
            try {
                await this.updatePlugin(pluginId);
            } catch (error) {
                console.error(`Ошибка автообновления плагина ${pluginId}:`, error);
            }
        }
    }

    /**
     * Получает список всех плагинов
     */
    getPlugins(): Plugin[] {
        return Object.values(this.plugins);
    }

    /**
     * Получает плагин по ID
     */
    getPlugin(pluginId: string): Plugin | undefined {
        return this.plugins[pluginId];
    }

    /**
     * Получает включенные плагины
     */
    getEnabledPlugins(): Plugin[] {
        return Object.values(this.plugins).filter(plugin => plugin.isEnabled);
    }

    /**
     * Загружает манифест плагина
     */
    private async loadPluginManifest(pluginUrl: string): Promise<PluginManifest> {
        const manifestUrl = `${pluginUrl}/manifest.json`;
        const response = await fetch(manifestUrl);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить манифест: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Загружает конфигурацию плагина
     */
    private async loadPluginConfig(pluginUrl: string): Promise<ServiceConfig> {
        const configUrl = `${pluginUrl}/config.json`;
        const response = await fetch(configUrl);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить конфигурацию: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Загружает модуль плагина
     */
    private async loadPluginModule(pluginUrl: string): Promise<ServiceModule> {
        const moduleUrl = `${pluginUrl}/index.js`;

        try {
            // Используем динамический импорт
            const module = await import(/* @vite-ignore */ moduleUrl);

            return {
                config: {} as ServiceConfig, // Будет установлена позже
                module: module.default || module,
                isLoaded: false
            };
        } catch (error) {
            throw new Error(`Не удалось загрузить модуль плагина: ${error}`);
        }
    }

    /**
     * Проверяет совместимость плагина
     */
    private validatePluginCompatibility(_manifest: PluginManifest): void {
        // Здесь можно добавить проверки совместимости версий
        // Например, проверка minPlatformVersion, maxPlatformVersion
        // console.log(`Проверка совместимости плагина ${manifest.name}`);
    }

    /**
     * Проверяет зависимости плагина
     */
    private async checkPluginDependencies(manifest: PluginManifest): Promise<void> {
        if (!manifest.dependencies) {
            return;
        }

        // for (const [depName, depVersion] of Object.entries(manifest.dependencies)) {
        //     // Здесь можно добавить проверку зависимостей
        //     // console.log(`Проверка зависимости ${depName}@${depVersion}`);
        // }
    }

    /**
     * Проверяет наличие обновлений для плагина
     */
    private async checkForUpdates(pluginId: string): Promise<{ hasUpdate: boolean; latestVersion?: string }> {
        const plugin = this.plugins[pluginId];
        if (!plugin || !plugin.updateUrl) {
            return { hasUpdate: false };
        }

        try {
            const manifestUrl = `${plugin.updateUrl}/manifest.json`;
            const response = await fetch(manifestUrl);

            if (!response.ok) {
                return { hasUpdate: false };
            }

            const latestManifest = await response.json();
            const hasUpdate = latestManifest.version !== plugin.version;

            return {
                hasUpdate,
                latestVersion: latestManifest.version
            };
        } catch (error) {
            console.error(`Ошибка проверки обновлений для плагина ${pluginId}:`, error);
            return { hasUpdate: false };
        }
    }

    /**
     * Загружает плагины из локального хранилища
     */
    private loadPluginsFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.PLUGINS_STORAGE_KEY);
            if (stored) {
                const pluginsData = JSON.parse(stored);
                this.plugins = pluginsData;
                // console.log(`Загружено ${Object.keys(this.plugins).length} плагинов из хранилища`);
            }
        } catch (error) {
            console.error('Ошибка загрузки плагинов из хранилища:', error);
        }
    }

    /**
     * Сохраняет плагины в локальное хранилище
     */
    private savePluginsToStorage(): void {
        try {
            localStorage.setItem(this.PLUGINS_STORAGE_KEY, JSON.stringify(this.plugins));
        } catch (error) {
            console.error('Ошибка сохранения плагинов в хранилище:', error);
        }
    }

    /**
     * Запускает автоматическую проверку обновлений
     */
    private startUpdateChecker(): void {
        // Проверяем обновления при запуске
        this.autoUpdateAll();

        // Устанавливаем периодическую проверку
        this.updateCheckInterval = setInterval(() => {
            this.autoUpdateAll();
        }, this.UPDATE_CHECK_INTERVAL);
    }

    /**
     * Останавливает автоматическую проверку обновлений
     */
    stopUpdateChecker(): void {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
        }
    }

    /**
     * Очищает все плагины
     */
    async clearAllPlugins(): Promise<void> {
        for (const pluginId of Object.keys(this.plugins)) {
            await this.uninstallPlugin(pluginId);
        }
    }

    /**
     * Получает статистику плагинов
     */
    getPluginStats(): {
        total: number;
        enabled: number;
        disabled: number;
        updating: number;
        withUpdates: number;
    } {
        const plugins = Object.values(this.plugins);
        return {
            total: plugins.length,
            enabled: plugins.filter(p => p.isEnabled).length,
            disabled: plugins.filter(p => !p.isEnabled).length,
            updating: plugins.filter(p => p.isUpdating).length,
            withUpdates: 0 // Будет обновлено при проверке обновлений
        };
    }
}

// Создаем единственный экземпляр менеджера плагинов
export const pluginManager = new PluginManager();
