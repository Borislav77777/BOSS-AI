/**
 * Сервис для управления code splitting
 */

export interface CodeSplittingConfig {
  enablePreloading: boolean;
  enablePrefetching: boolean;
  preloadDelay: number; // в миллисекундах
  prefetchDelay: number; // в миллисекундах
  maxPreloadedModules: number;
  enableIntersectionObserver: boolean;
  enableRouteBasedSplitting: boolean;
}

export interface ModuleInfo {
  name: string;
  path: string;
  size: number;
  loadTime: number;
  isLoaded: boolean;
  isPreloaded: boolean;
  isPrefetched: boolean;
  lastAccessed: Date;
  accessCount: number;
}

class CodeSplittingService {
  private config: CodeSplittingConfig;
  private modules: Map<string, ModuleInfo> = new Map();
  private preloadQueue: string[] = [];
  private prefetchQueue: string[] = [];
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(config: CodeSplittingConfig) {
    this.config = config;
    this.initializeService();
  }

  /**
   * Инициализирует сервис
   */
  private initializeService(): void {
    if (this.config.enableIntersectionObserver) {
      this.setupIntersectionObserver();
    }

    if (this.config.enablePreloading) {
      this.setupPreloading();
    }

    if (this.config.enablePrefetching) {
      this.setupPrefetching();
    }
  }

  /**
   * Динамически загружает модуль
   */
  public async loadModule<T = unknown>(
    modulePath: string,
    moduleName: string,
    _options: {
      preload?: boolean;
      prefetch?: boolean;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Проверяем, не загружен ли уже модуль
      if (this.modules.has(moduleName) && this.modules.get(moduleName)!.isLoaded) {
        this.updateModuleAccess(moduleName);
        return this.getCachedModule<T>(moduleName);
      }

      // Загружаем модуль
      const module = await import(/* @vite-ignore */ modulePath);
      const loadTime = performance.now() - startTime;

      // Сохраняем информацию о модуле
      this.modules.set(moduleName, {
        name: moduleName,
        path: modulePath,
        size: this.estimateModuleSize(module),
        loadTime,
        isLoaded: true,
        isPreloaded: false,
        isPrefetched: false,
        lastAccessed: new Date(),
        accessCount: 1
      });

      // Кэшируем модуль
      this.cacheModule(moduleName, module);

      return module.default || module;
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Предзагружает модуль
   */
  public async preloadModule(modulePath: string, moduleName: string): Promise<void> {
    if (!this.config.enablePreloading) {
      return;
    }

    // Проверяем лимит предзагруженных модулей
    if (this.getPreloadedModulesCount() >= this.config.maxPreloadedModules) {
      return;
    }

    // Проверяем, не загружен ли уже модуль
    if (this.modules.has(moduleName) && this.modules.get(moduleName)!.isLoaded) {
      return;
    }

    try {
      // Добавляем в очередь предзагрузки
      this.preloadQueue.push(moduleName);

      // Загружаем модуль
      const module = await import(/* @vite-ignore */ modulePath);

      // Обновляем информацию о модуле
      const moduleInfo = this.modules.get(moduleName) || {
        name: moduleName,
        path: modulePath,
        size: 0,
        loadTime: 0,
        isLoaded: false,
        isPreloaded: false,
        isPrefetched: false,
        lastAccessed: new Date(),
        accessCount: 0
      };

      moduleInfo.isPreloaded = true;
      moduleInfo.size = this.estimateModuleSize(module);
      this.modules.set(moduleName, moduleInfo);

      // Кэшируем модуль
      this.cacheModule(moduleName, module);

      // Удаляем из очереди
      this.preloadQueue = this.preloadQueue.filter(name => name !== moduleName);
    } catch (error) {
      console.error(`Failed to preload module ${moduleName}:`, error);
    }
  }

  /**
   * Предзагружает модуль (только метаданные)
   */
  public async prefetchModule(modulePath: string, moduleName: string): Promise<void> {
    if (!this.config.enablePrefetching) {
      return;
    }

    // Проверяем, не загружен ли уже модуль
    if (this.modules.has(moduleName) && this.modules.get(moduleName)!.isLoaded) {
      return;
    }

    try {
      // Добавляем в очередь предзагрузки
      this.prefetchQueue.push(moduleName);

      // Создаем ссылку на модуль для предзагрузки
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = modulePath;
      document.head.appendChild(link);

      // Обновляем информацию о модуле
      const moduleInfo = this.modules.get(moduleName) || {
        name: moduleName,
        path: modulePath,
        size: 0,
        loadTime: 0,
        isLoaded: false,
        isPreloaded: false,
        isPrefetched: false,
        lastAccessed: new Date(),
        accessCount: 0
      };

      moduleInfo.isPrefetched = true;
      this.modules.set(moduleName, moduleInfo);

      // Удаляем из очереди
      this.prefetchQueue = this.prefetchQueue.filter(name => name !== moduleName);
    } catch (error) {
      console.error(`Failed to prefetch module ${moduleName}:`, error);
    }
  }

  /**
   * Загружает модуль по требованию
   */
  public async loadModuleOnDemand<T = unknown>(
    modulePath: string,
    moduleName: string,
    trigger: () => boolean,
    options: {
      preload?: boolean;
      prefetch?: boolean;
    } = {}
  ): Promise<T | null> {
    // Предзагружаем, если нужно
    if (options.preload) {
      this.preloadModule(modulePath, moduleName);
    }

    // Предзагружаем метаданные, если нужно
    if (options.prefetch) {
      this.prefetchModule(modulePath, moduleName);
    }

    // Ждем триггера
    if (trigger()) {
      return this.loadModule<T>(modulePath, moduleName);
    }

    return null;
  }

  /**
   * Получает информацию о модуле
   */
  public getModuleInfo(moduleName: string): ModuleInfo | null {
    return this.modules.get(moduleName) || null;
  }

  /**
   * Получает все модули
   */
  public getAllModules(): ModuleInfo[] {
    return Array.from(this.modules.values());
  }

  /**
   * Получает статистику загрузки
   */
  public getLoadingStats(): {
    totalModules: number;
    loadedModules: number;
    preloadedModules: number;
    prefetchedModules: number;
    averageLoadTime: number;
    totalSize: number;
  } {
    const modules = Array.from(this.modules.values());

    return {
      totalModules: modules.length,
      loadedModules: modules.filter(m => m.isLoaded).length,
      preloadedModules: modules.filter(m => m.isPreloaded).length,
      prefetchedModules: modules.filter(m => m.isPrefetched).length,
      averageLoadTime: modules.length > 0
        ? modules.reduce((sum, m) => sum + m.loadTime, 0) / modules.length
        : 0,
      totalSize: modules.reduce((sum, m) => sum + m.size, 0)
    };
  }

  /**
   * Очищает кэш модулей
   */
  public clearCache(): void {
    this.modules.clear();
    this.preloadQueue = [];
    this.prefetchQueue = [];
  }

  /**
   * Останавливает сервис
   */
  public stop(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  /**
   * Настраивает Intersection Observer
   */
  private setupIntersectionObserver(): void {
    if (!window.IntersectionObserver) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const moduleName = entry.target.getAttribute('data-module-name');
            const modulePath = entry.target.getAttribute('data-module-path');

            if (moduleName && modulePath) {
              this.preloadModule(modulePath, moduleName);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  /**
   * Настраивает предзагрузку
   */
  private setupPreloading(): void {
    // Здесь можно добавить логику для автоматической предзагрузки
    // на основе пользовательского поведения
  }

  /**
   * Настраивает предзагрузку метаданных
   */
  private setupPrefetching(): void {
    // Здесь можно добавить логику для автоматической предзагрузки метаданных
    // на основе пользовательского поведения
  }

  /**
   * Обновляет информацию о доступе к модулю
   */
  private updateModuleAccess(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (module) {
      module.lastAccessed = new Date();
      module.accessCount++;
    }
  }

  /**
   * Получает количество предзагруженных модулей
   */
  private getPreloadedModulesCount(): number {
    return Array.from(this.modules.values()).filter(m => m.isPreloaded).length;
  }

  /**
   * Оценивает размер модуля
   */
  private estimateModuleSize(module: unknown): number {
    // Простая оценка размера модуля
    return JSON.stringify(module).length * 2; // Примерная оценка в байтах
  }

  /**
   * Кэширует модуль
   */
  private cacheModule(_moduleName: string, _module: unknown): void {
    // Здесь можно добавить логику кэширования
    // Например, в localStorage или IndexedDB
  }

  /**
   * Получает кэшированный модуль
   */
  private getCachedModule<T>(moduleName: string): T {
    // Здесь можно добавить логику получения из кэша
    throw new Error(`Module ${moduleName} not found in cache`);
  }
}

// Создаем экземпляр сервиса
export const codeSplittingService = new CodeSplittingService({
  enablePreloading: true,
  enablePrefetching: true,
  preloadDelay: 1000, // 1 секунда
  prefetchDelay: 500, // 0.5 секунды
  maxPreloadedModules: 10,
  enableIntersectionObserver: true,
  enableRouteBasedSplitting: true
});
