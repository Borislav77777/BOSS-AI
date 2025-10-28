/**
 * Boss AI Platform - Redis Client Wrapper
 * Централизованный Redis клиент с кэшированием и управлением соединениями
 */

import { createClient, RedisClientType } from "redis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

/**
 * Redis Client Wrapper для Boss AI Platform
 */
export class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor(
    private options: {
      url?: string;
      host?: string;
      port?: number;
      password?: string;
      db?: number;
      prefix?: string;
    } = {}
  ) {
    this.client = createClient({
      url:
        options.url ||
        `redis://${options.host || "localhost"}:${options.port || 6379}`,
      password: options.password,
      database: options.db || 0,
    });

    this.setupEventHandlers();
  }

  /**
   * Настройка обработчиков событий Redis
   */
  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      this.isConnected = true;
      console.log("✅ Redis connected");
    });

    this.client.on("error", (error) => {
      this.isConnected = false;
      this.stats.errors++;
      console.error("❌ Redis error:", error);
    });

    this.client.on("end", () => {
      this.isConnected = false;
      console.log("🔌 Redis disconnected");
    });

    this.client.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });
  }

  /**
   * Подключение к Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Отключение от Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
    }
  }

  /**
   * Проверка соединения
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      return false;
    }
  }

  /**
   * Получение значения из кэша
   */
  async get<T = any>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.client.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;

      if (options.serialize !== false) {
        return JSON.parse(value);
      }

      return value as T;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis GET error:", error);
      return null;
    }
  }

  /**
   * Установка значения в кэш
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      let serializedValue: string;

      if (options.serialize !== false) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value as string;
      }

      if (options.ttl) {
        await this.client.setEx(fullKey, options.ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis SET error:", error);
      return false;
    }
  }

  /**
   * Удаление значения из кэша
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.client.del(fullKey);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis DELETE error:", error);
      return false;
    }
  }

  /**
   * Удаление всех ключей по паттерну
   */
  async deletePattern(pattern: string, prefix?: string): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, prefix);
      const keys = await this.client.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      this.stats.deletes += result;
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis DELETE PATTERN error:", error);
      return 0;
    }
  }

  /**
   * Проверка существования ключа
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  /**
   * Установка TTL для ключа
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.client.expire(fullKey, ttl);
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis EXPIRE error:", error);
      return false;
    }
  }

  /**
   * Получение TTL ключа
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = this.buildKey(key, prefix);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.stats.errors++;
      console.error("Redis TTL error:", error);
      return -1;
    }
  }

  /**
   * Получение всех ключей по паттерну
   */
  async keys(pattern: string, prefix?: string): Promise<string[]> {
    try {
      const fullPattern = this.buildKey(pattern, prefix);
      return await this.client.keys(fullPattern);
    } catch (error) {
      this.stats.errors++;
      console.error("Redis KEYS error:", error);
      return [];
    }
  }

  /**
   * Очистка всего кэша
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis FLUSHALL error:", error);
      return false;
    }
  }

  /**
   * Получение статистики кэша
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Сброс статистики
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Получение информации о Redis
   */
  async getInfo(): Promise<any> {
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      this.stats.errors++;
      console.error("Redis INFO error:", error);
      return null;
    }
  }

  /**
   * Построение полного ключа с префиксом
   */
  private buildKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.options.prefix || "boss-ai";
    return `${keyPrefix}:${key}`;
  }

  /**
   * Получение сырого Redis клиента
   */
  getRawClient(): RedisClientType {
    return this.client;
  }
}

/**
 * Глобальный экземпляр Redis клиента
 */
export const redisClient = new RedisClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  prefix: "boss-ai",
});

/**
 * Создание нового экземпляра Redis клиента
 */
export function createRedisClient(options?: {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  prefix?: string;
}): RedisClient {
  return new RedisClient(options);
}

export default RedisClient;
