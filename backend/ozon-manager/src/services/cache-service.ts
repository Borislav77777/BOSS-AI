/**
 * Boss AI Platform - Ozon Manager Cache Service
 * Кэширование данных магазинов и API responses
 */

import { cache, ozonManagerLogger } from "@boss-ai/shared";

const { redisClient } = cache;

export interface StoreCacheData {
  id: string;
  name: string;
  apiKey: string;
  clientId: string;
  isActive: boolean;
  lastUpdated: string;
}

export interface ApiResponseCacheData {
  endpoint: string;
  data: any;
  timestamp: string;
  ttl: number;
}

/**
 * Cache Service для Ozon Manager
 */
export class CacheService {
  private readonly STORES_CACHE_KEY = "stores";
  private readonly STORES_TTL = 300; // 5 minutes
  private readonly API_RESPONSE_TTL = 60; // 1 minute
  private readonly API_RESPONSE_PREFIX = "api-response";

  constructor() {
    this.initializeCache();
  }

  /**
   * Инициализация кэша
   */
  private async initializeCache(): Promise<void> {
    try {
      await redisClient.connect();
      const isConnected = await redisClient.ping();

      if (isConnected) {
        ozonManagerLogger.info("Cache service initialized successfully");
      } else {
        ozonManagerLogger.warn(
          "Cache service: Redis connection failed, using fallback"
        );
      }
    } catch (error) {
      ozonManagerLogger.error(
        "Cache service initialization failed",
        error as Error
      );
    }
  }

  /**
   * Кэширование списка магазинов
   */
  async cacheStores(stores: StoreCacheData[]): Promise<boolean> {
    try {
      const cacheData = {
        stores,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      const success = await redisClient.set(this.STORES_CACHE_KEY, cacheData, {
        ttl: this.STORES_TTL,
        prefix: "ozon-manager",
      });

      if (success) {
        ozonManagerLogger.info(`Cached ${stores.length} stores`, {
          operation: "cache_stores",
          count: stores.length,
          ttl: this.STORES_TTL,
        });
      }

      return success;
    } catch (error) {
      ozonManagerLogger.error("Failed to cache stores", error as Error);
      return false;
    }
  }

  /**
   * Получение списка магазинов из кэша
   */
  async getCachedStores(): Promise<StoreCacheData[] | null> {
    try {
      const cachedData = await redisClient.get<{
        stores: StoreCacheData[];
        timestamp: string;
        version: string;
      }>(this.STORES_CACHE_KEY, {
        prefix: "ozon-manager",
      });

      if (cachedData && cachedData.stores) {
        ozonManagerLogger.debug("Retrieved stores from cache", {
          operation: "get_cached_stores",
          count: cachedData.stores.length,
          timestamp: cachedData.timestamp,
        });
        return cachedData.stores;
      }

      return null;
    } catch (error) {
      ozonManagerLogger.error("Failed to get cached stores", error as Error);
      return null;
    }
  }

  /**
   * Кэширование API ответа
   */
  async cacheApiResponse(
    endpoint: string,
    data: any,
    ttl: number = this.API_RESPONSE_TTL
  ): Promise<boolean> {
    try {
      const cacheKey = `${this.API_RESPONSE_PREFIX}:${endpoint}`;
      const cacheData: ApiResponseCacheData = {
        endpoint,
        data,
        timestamp: new Date().toISOString(),
        ttl,
      };

      const success = await redisClient.set(cacheKey, cacheData, {
        ttl,
        prefix: "ozon-manager",
      });

      if (success) {
        ozonManagerLogger.debug(`Cached API response for ${endpoint}`, {
          operation: "cache_api_response",
          endpoint,
          ttl,
        });
      }

      return success;
    } catch (error) {
      ozonManagerLogger.error("Failed to cache API response", error as Error, {
        endpoint,
      });
      return false;
    }
  }

  /**
   * Получение API ответа из кэша
   */
  async getCachedApiResponse(endpoint: string): Promise<any | null> {
    try {
      const cacheKey = `${this.API_RESPONSE_PREFIX}:${endpoint}`;
      const cachedData = await redisClient.get<ApiResponseCacheData>(cacheKey, {
        prefix: "ozon-manager",
      });

      if (cachedData && cachedData.data) {
        ozonManagerLogger.debug(
          `Retrieved API response from cache for ${endpoint}`,
          {
            operation: "get_cached_api_response",
            endpoint,
            timestamp: cachedData.timestamp,
          }
        );
        return cachedData.data;
      }

      return null;
    } catch (error) {
      ozonManagerLogger.error(
        "Failed to get cached API response",
        error as Error,
        {
          endpoint,
        }
      );
      return null;
    }
  }

  /**
   * Инвалидация кэша магазинов
   */
  async invalidateStoresCache(): Promise<boolean> {
    try {
      const success = await redisClient.delete(
        this.STORES_CACHE_KEY,
        "ozon-manager"
      );

      if (success) {
        ozonManagerLogger.info("Stores cache invalidated", {
          operation: "invalidate_stores_cache",
        });
      }

      return success;
    } catch (error) {
      ozonManagerLogger.error(
        "Failed to invalidate stores cache",
        error as Error
      );
      return false;
    }
  }

  /**
   * Инвалидация кэша API ответов
   */
  async invalidateApiResponseCache(endpoint?: string): Promise<boolean> {
    try {
      if (endpoint) {
        const cacheKey = `${this.API_RESPONSE_PREFIX}:${endpoint}`;
        const success = await redisClient.delete(cacheKey, "ozon-manager");

        if (success) {
          ozonManagerLogger.info(
            `API response cache invalidated for ${endpoint}`,
            {
              operation: "invalidate_api_response_cache",
              endpoint,
            }
          );
        }

        return success;
      } else {
        // Инвалидация всех API ответов
        const pattern = `${this.API_RESPONSE_PREFIX}:*`;
        const deletedCount = await redisClient.deletePattern(
          pattern,
          "ozon-manager"
        );

        ozonManagerLogger.info(
          `API response cache invalidated (${deletedCount} entries)`,
          {
            operation: "invalidate_all_api_response_cache",
            deletedCount,
          }
        );

        return deletedCount > 0;
      }
    } catch (error) {
      ozonManagerLogger.error(
        "Failed to invalidate API response cache",
        error as Error
      );
      return false;
    }
  }

  /**
   * Получение статистики кэша
   */
  async getCacheStats(): Promise<any> {
    try {
      const stats = redisClient.getStats();
      const info = await redisClient.getInfo();

      return {
        stats,
        redisInfo: info
          ? {
              connected: true,
              memory: this.extractMemoryInfo(info),
              keyspace: this.extractKeyspaceInfo(info),
            }
          : {
              connected: false,
            },
      };
    } catch (error) {
      ozonManagerLogger.error("Failed to get cache stats", error as Error);
      return {
        stats: redisClient.getStats(),
        redisInfo: { connected: false },
      };
    }
  }

  /**
   * Очистка всего кэша Ozon Manager
   */
  async clearAllCache(): Promise<boolean> {
    try {
      const storesDeleted = await redisClient.delete(
        this.STORES_CACHE_KEY,
        "ozon-manager"
      );
      const apiDeleted = await redisClient.deletePattern(
        `${this.API_RESPONSE_PREFIX}:*`,
        "ozon-manager"
      );

      ozonManagerLogger.info("All cache cleared", {
        operation: "clear_all_cache",
        storesDeleted,
        apiResponsesDeleted: apiDeleted,
      });

      return true;
    } catch (error) {
      ozonManagerLogger.error("Failed to clear all cache", error as Error);
      return false;
    }
  }

  /**
   * Проверка здоровья кэша
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: any;
  }> {
    try {
      const isConnected = await redisClient.ping();

      if (!isConnected) {
        return {
          status: "unhealthy",
          details: {
            error: "Redis connection failed",
            fallback: true,
          },
        };
      }

      const stats = redisClient.getStats();
      const errorRate =
        stats.errors /
        (stats.hits + stats.misses + stats.sets + stats.deletes + 1);

      if (errorRate > 0.1) {
        // 10% error rate
        return {
          status: "degraded",
          details: {
            errorRate,
            stats,
          },
        };
      }

      return {
        status: "healthy",
        details: {
          stats,
          connected: true,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          error: error.message,
          fallback: true,
        },
      };
    }
  }

  /**
   * Извлечение информации о памяти из Redis INFO
   */
  private extractMemoryInfo(info: string): any {
    const lines = info.split("\n");
    const memoryInfo: any = {};

    lines.forEach((line) => {
      if (line.startsWith("used_memory:")) {
        memoryInfo.used = line.split(":")[1].trim();
      } else if (line.startsWith("used_memory_human:")) {
        memoryInfo.usedHuman = line.split(":")[1].trim();
      } else if (line.startsWith("maxmemory:")) {
        memoryInfo.max = line.split(":")[1].trim();
      }
    });

    return memoryInfo;
  }

  /**
   * Извлечение информации о keyspace из Redis INFO
   */
  private extractKeyspaceInfo(info: string): any {
    const lines = info.split("\n");
    const keyspaceInfo: any = {};

    lines.forEach((line) => {
      if (line.startsWith("db0:")) {
        const parts = line.split(":")[1].split(",");
        parts.forEach((part) => {
          const [key, value] = part.split("=");
          if (key && value) {
            keyspaceInfo[key.trim()] = parseInt(value.trim());
          }
        });
      }
    });

    return keyspaceInfo;
  }
}

/**
 * Глобальный экземпляр Cache Service
 */
export const cacheService = new CacheService();

export default CacheService;
