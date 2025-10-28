import * as fs from "fs";
import * as path from "path";
import { StoreConfig } from "../types";
import { Logger } from "../utils/logger";
import { cacheService } from "./cache-service";

/**
 * Сервис для управления конфигурацией магазинов
 * Портировано из Python config_manager.py
 */
export class ConfigService {
  private configPath: string;
  private stores: Map<string, StoreConfig> = new Map();
  private logger: Logger;

  constructor(configPath?: string, logger?: Logger) {
    this.logger = logger || new Logger();
    this.configPath = configPath || "./data/config.json";
    this.loadConfig();
  }

  /**
   * Загружает конфигурацию из файла
   */
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        const config = JSON.parse(data);

        if (config.stores && Array.isArray(config.stores)) {
          this.stores.clear();
          for (const store of config.stores) {
            this.stores.set(store.name, store);
          }
          this.logger.logInfo(`Загружено магазинов: ${this.stores.size}`);
        }
      } else {
        this.logger.logInfo("Файл конфигурации не найден, создаем новый");
        this.saveConfig();
      }
    } catch (error: any) {
      this.logger.logError(
        `Ошибка загрузки конфигурации: ${error.message}`,
        error
      );
    }
  }

  /**
   * Сохраняет конфигурацию в файл
   */
  private saveConfig(): void {
    try {
      // Создаем директорию если не существует
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const config = {
        stores: Array.from(this.stores.values()),
        global_settings: {
          autostart_enabled: false,
        },
      };

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.logger.logInfo(
        `Конфигурация сохранена: ${this.stores.size} магазинов`
      );
    } catch (error: any) {
      this.logger.logError(
        `Ошибка сохранения конфигурации: ${error.message}`,
        error
      );
    }
  }

  /**
   * Получает все магазины с кэшированием
   */
  async getAllStores(): Promise<StoreConfig[]> {
    try {
      // Сначала пытаемся получить из кэша
      const cachedStores = await cacheService.getCachedStores();
      if (cachedStores && cachedStores.length > 0) {
        this.logger.logInfo(
          `Получено ${cachedStores.length} магазинов из кэша`
        );
        return cachedStores.map((store) => ({
          id: store.id,
          name: store.name,
          api_key: store.apiKey,
          client_id: store.clientId,
          is_active: store.isActive,
          created_at: store.lastUpdated,
          updated_at: store.lastUpdated,
        }));
      }

      // Если в кэше нет, загружаем из файла
      const stores = Array.from(this.stores.values());

      // Кэшируем результат
      const cacheData = stores.map((store) => ({
        id: store.id,
        name: store.name,
        apiKey: store.api_key,
        clientId: store.client_id,
        isActive: store.is_active,
        lastUpdated: store.updated_at || store.created_at,
      }));

      await cacheService.cacheStores(cacheData);

      this.logger.logInfo(
        `Загружено ${stores.length} магазинов из файла и закэшировано`
      );
      return stores;
    } catch (error: any) {
      this.logger.logError("Ошибка получения магазинов с кэшированием", error);
      // Fallback к обычному методу
      return Array.from(this.stores.values());
    }
  }

  /**
   * Получает магазин по имени
   */
  getStore(name: string): StoreConfig | undefined {
    return this.stores.get(name);
  }

  /**
   * Добавляет новый магазин
   */
  async addStore(store: StoreConfig): Promise<boolean> {
    try {
      if (this.stores.has(store.name)) {
        this.logger.logWarning(
          `Магазин с именем '${store.name}' уже существует`
        );
        return false;
      }

      // Генерируем ID если не указан
      if (!store.id) {
        store.id = `store_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      // Добавляем временные метки
      const now = new Date().toISOString();
      store.created_at = now;
      store.updated_at = now;

      this.stores.set(store.name, store);
      this.saveConfig();

      // Инвалидируем кэш магазинов
      await cacheService.invalidateStoresCache();

      this.logger.logInfo(`Добавлен магазин: ${store.name}`);
      return true;
    } catch (error: any) {
      this.logger.logError(
        `Ошибка добавления магазина: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * Обновляет существующий магазин
   */
  updateStore(name: string, store: StoreConfig): boolean {
    try {
      if (!this.stores.has(name)) {
        this.logger.logWarning(`Магазин с именем '${name}' не найден`);
        return false;
      }

      // Сохраняем ID и временные метки
      const existingStore = this.stores.get(name)!;
      store.id = existingStore.id;
      store.created_at = existingStore.created_at;
      store.updated_at = new Date().toISOString();

      this.stores.set(name, store);
      this.saveConfig();

      this.logger.logInfo(`Обновлен магазин: ${name}`);
      return true;
    } catch (error: any) {
      this.logger.logError(
        `Ошибка обновления магазина: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * Удаляет магазин
   */
  removeStore(name: string): boolean {
    try {
      if (!this.stores.has(name)) {
        this.logger.logWarning(`Магазин с именем '${name}' не найден`);
        return false;
      }

      this.stores.delete(name);
      this.saveConfig();

      this.logger.logInfo(`Удален магазин: ${name}`);
      return true;
    } catch (error: any) {
      this.logger.logError(`Ошибка удаления магазина: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Проверяет существует ли магазин
   */
  hasStore(name: string): boolean {
    return this.stores.has(name);
  }

  /**
   * Получает количество магазинов
   */
  getStoreCount(): number {
    return this.stores.size;
  }

  /**
   * Экспортирует конфигурацию
   */
  exportConfig(): any {
    return {
      stores: Array.from(this.stores.values()),
      global_settings: {
        autostart_enabled: false,
      },
    };
  }

  /**
   * Импортирует конфигурацию
   */
  importConfig(config: any): boolean {
    try {
      if (!config.stores || !Array.isArray(config.stores)) {
        this.logger.logError("Неверный формат конфигурации");
        return false;
      }

      this.stores.clear();
      for (const store of config.stores) {
        this.stores.set(store.name, store);
      }

      this.saveConfig();
      this.logger.logInfo(`Импортировано магазинов: ${this.stores.size}`);
      return true;
    } catch (error: any) {
      this.logger.logError(
        `Ошибка импорта конфигурации: ${error.message}`,
        error
      );
      return false;
    }
  }
}
