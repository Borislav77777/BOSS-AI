/**
 * Модульный менеджер промптов
 * Управляет системными и пользовательскими промптами
 */

import {
  PromptManager as IPromptManager,
  PromptCategory,
  PromptFilters,
  PromptFolder,
  PromptItem,
  PromptModule,
  PromptSearchResult,
  PromptSource
} from './types';

const NS = 'promptsManager';

class PromptManager implements IPromptManager {
  private modules: Map<string, PromptModule> = new Map();
  private quickAccess: Set<string> = new Set();

  constructor() {
    this.loadQuickAccess();
    // Загружаем системные модули асинхронно
    this.loadSystemModules().catch(error => {
      console.error('Failed to load system modules in constructor:', error);
    });
  }

  // Загрузка пользовательских модулей
  private async loadUserModules(): Promise<void> {
    try {
      console.log('[PromptManager] Loading user modules...');
      // Ищем все пользовательские модули в localStorage
      const keys = Object.keys(localStorage);
      const userModuleKeys = keys.filter(key => key.startsWith(`${NS}:module:`));

      for (const key of userModuleKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const module = JSON.parse(stored);
            this.modules.set(module.id, module);
            console.log(`[PromptManager] User module ${module.id} loaded successfully`);
          }
        } catch (error) {
          console.warn(`Failed to load user module from ${key}:`, error);
        }
      }

      console.log(`[PromptManager] User modules loaded. Total modules: ${this.modules.size}`);
    } catch (error) {
      console.error('Failed to load user modules:', error);
    }
  }

  // Загрузка системных модулей
  private async loadSystemModules(): Promise<void> {
    try {
      console.log('[PromptManager] Loading system modules...');
      // Загружаем системные модули
      const systemModules = [
        'ai-assistant',
        'business',
        'creative',
        'education',
        'productivity'
      ];

      for (const moduleId of systemModules) {
        try {
          console.log(`[PromptManager] Loading module: ${moduleId}`);
          // Попробуем сначала import, если не работает - fetch
          try {
            const module = await import(`./system/${moduleId}.json`);
            const moduleData = module.default || module;
            this.modules.set(moduleId, moduleData);
            console.log(`[PromptManager] Module ${moduleId} loaded successfully via import`);
          } catch (importError) {
            console.log(`[PromptManager] Import failed for ${moduleId}, trying fetch...`);
            const response = await fetch(`/src/data/prompts/system/${moduleId}.json`);
            if (response.ok) {
              const moduleData = await response.json();
              this.modules.set(moduleId, moduleData);
              console.log(`[PromptManager] Module ${moduleId} loaded successfully via fetch`);
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }
        } catch (error) {
          console.warn(`Failed to load system module ${moduleId}:`, error);
        }
      }

      console.log(`[PromptManager] System modules loaded. Total modules: ${this.modules.size}`);
    } catch (error) {
      console.error('Failed to load system modules:', error);
    }
  }

  // Проверка готовности модулей
  async ensureModulesLoaded(): Promise<void> {
    if (this.modules.size === 0) {
      console.log('[PromptManager] No modules loaded, waiting for system modules...');
      // Ждем загрузки системных модулей
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.modules.size === 0) {
        console.log('[PromptManager] Still no modules, retrying load...');
        await this.loadSystemModules();
      }
    }

    // Загружаем пользовательские модули
    await this.loadUserModules();
  }

  // Загрузка быстрого доступа
  private loadQuickAccess(): void {
    try {
      const stored = localStorage.getItem(`${NS}:quickAccess`);
      console.log(`[PromptManager] Loading quick access from localStorage:`, stored);
      if (stored) {
        const ids = JSON.parse(stored);
        this.quickAccess = new Set(ids);
        console.log(`[PromptManager] Loaded quick access IDs:`, [...this.quickAccess]);
      } else {
        console.log(`[PromptManager] No quick access data found in localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load quick access:', error);
    }
  }

  // Сохранение быстрого доступа
  private saveQuickAccess(): void {
    try {
      const ids = [...this.quickAccess];
      console.log(`[PromptManager] Saving quick access to localStorage:`, ids);
      localStorage.setItem(`${NS}:quickAccess`, JSON.stringify(ids));
      console.log(`[PromptManager] Quick access saved successfully`);
    } catch (error) {
      console.warn('Failed to save quick access:', error);
    }
  }

  // Модули
  async loadModule(moduleId: string): Promise<PromptModule> {
    if (this.modules.has(moduleId)) {
      return this.modules.get(moduleId)!;
    }

    // Попытка загрузить пользовательский модуль
    try {
      const stored = localStorage.getItem(`${NS}:module:${moduleId}`);
      if (stored) {
        const module = JSON.parse(stored);
        this.modules.set(moduleId, module);
        return module;
      }
    } catch (error) {
      console.warn(`Failed to load module ${moduleId}:`, error);
    }

    throw new Error(`Module ${moduleId} not found`);
  }

  async saveModule(module: PromptModule): Promise<void> {
    this.modules.set(module.id, module);

    if (module.source === 'user') {
      try {
        localStorage.setItem(`${NS}:module:${module.id}`, JSON.stringify(module));
      } catch (error) {
        console.warn(`Failed to save module ${module.id}:`, error);
      }
    }
  }

  async deleteModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (module && module.source === 'user') {
      this.modules.delete(moduleId);
      try {
        localStorage.removeItem(`${NS}:module:${moduleId}`);
      } catch (error) {
        console.warn(`Failed to delete module ${moduleId}:`, error);
      }
    }
  }

  async listModules(source?: PromptSource): Promise<PromptModule[]> {
    const modules = Array.from(this.modules.values());
    return source ? modules.filter(m => m.source === source) : modules;
  }

  // Поиск промптов
  async searchPrompts(query: string, filters?: PromptFilters): Promise<PromptSearchResult[]> {
    const results: PromptSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const module of this.modules.values()) {
      // Применяем фильтры к модулю
      if (filters?.source && module.source !== filters.source) continue;
      if (filters?.moduleId && module.id !== filters.moduleId) continue;

      for (const prompt of module.prompts) {
        // Применяем фильтры к промпту
        if (filters?.categoryId && prompt.categoryId !== filters.categoryId) continue;
        if (filters?.folderId && prompt.folderId !== filters.folderId) continue;
        if (filters?.system !== undefined && prompt.system !== filters.system) continue;
        if (filters?.tags && !filters.tags.some(tag => prompt.tags.includes(tag))) continue;

        // Поиск по тексту
        const searchText = `${prompt.title} ${prompt.body} ${prompt.description || ''} ${prompt.tags.join(' ')}`.toLowerCase();

        if (searchText.includes(queryLower)) {
          const category = module.categories.find(c => c.id === prompt.categoryId);
          const folder = prompt.folderId ? module.folders.find(f => f.id === prompt.folderId) : undefined;

          // Вычисляем релевантность
          let relevance = 0;
          if (prompt.title.toLowerCase().includes(queryLower)) relevance += 10;
          if (prompt.tags.some(tag => tag.toLowerCase().includes(queryLower))) relevance += 5;
          if (prompt.body.toLowerCase().includes(queryLower)) relevance += 3;
          if (prompt.description?.toLowerCase().includes(queryLower)) relevance += 2;

          results.push({
            prompt,
            module,
            category: category!,
            folder,
            relevance
          });
        }
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Промпты
  async getPrompt(promptId: string): Promise<PromptItem | null> {
    console.log(`[PromptManager] getPrompt called for ID: ${promptId}`);
    console.log(`[PromptManager] Available modules:`, Array.from(this.modules.keys()));

    for (const module of this.modules.values()) {
      console.log(`[PromptManager] Searching in module: ${module.id}, prompts: ${module.prompts.length}`);
      const prompt = module.prompts.find(p => p.id === promptId);
      if (prompt) {
        console.log(`[PromptManager] Found prompt in module ${module.id}: ${prompt.title}`);
        return prompt;
      }
    }

    console.log(`[PromptManager] Prompt not found: ${promptId}`);
    return null;
  }

  async getAllPrompts(): Promise<PromptItem[]> {
    await this.ensureModulesLoaded();
    const allPrompts: PromptItem[] = [];
    for (const module of this.modules.values()) {
      allPrompts.push(...module.prompts);
    }
    return allPrompts;
  }

  async createPrompt(promptData: Omit<PromptItem, 'id' | 'metadata'>): Promise<PromptItem> {
    const module = this.modules.get(promptData.moduleId);
    if (!module) {
      throw new Error(`Module ${promptData.moduleId} not found`);
    }

    const prompt: PromptItem = {
      ...promptData,
      id: this.generateId('prompt'),
      metadata: {
        author: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usage: 0,
        rating: 0
      }
    };

    module.prompts.push(prompt);
    await this.saveModule(module);

    return prompt;
  }

  async updatePrompt(promptId: string, updates: Partial<PromptItem>): Promise<PromptItem> {
    for (const module of this.modules.values()) {
      const promptIndex = module.prompts.findIndex(p => p.id === promptId);
      if (promptIndex !== -1) {
        const prompt = module.prompts[promptIndex];
        const updatedPrompt = {
          ...prompt,
          ...updates,
          metadata: {
            ...prompt.metadata,
            updatedAt: new Date().toISOString()
          }
        };

        module.prompts[promptIndex] = updatedPrompt;
        await this.saveModule(module);
        return updatedPrompt;
      }
    }

    throw new Error(`Prompt ${promptId} not found`);
  }

  async deletePrompt(promptId: string): Promise<void> {
    for (const module of this.modules.values()) {
      const promptIndex = module.prompts.findIndex(p => p.id === promptId);
      if (promptIndex !== -1) {
        module.prompts.splice(promptIndex, 1);
        await this.saveModule(module);
        this.quickAccess.delete(promptId);
        this.saveQuickAccess();
        return;
      }
    }

    throw new Error(`Prompt ${promptId} not found`);
  }

  // Категории и папки
  async getCategories(moduleId?: string): Promise<PromptCategory[]> {
    await this.ensureModulesLoaded();
    console.log(`[PromptManager] getCategories called. ModuleId: ${moduleId}, Total modules: ${this.modules.size}`);
    const categories: PromptCategory[] = [];

    for (const module of this.modules.values()) {
      if (moduleId && module.id !== moduleId) continue;
      console.log(`[PromptManager] Processing module ${module.id} with ${module.categories.length} categories`);
      categories.push(...module.categories);
    }

    console.log(`[PromptManager] Returning ${categories.length} categories`);
    return categories.sort((a, b) => a.order - b.order);
  }

  async getFolders(categoryId?: string): Promise<PromptFolder[]> {
    await this.ensureModulesLoaded();
    console.log(`[PromptManager] getFolders called. CategoryId: ${categoryId}, Total modules: ${this.modules.size}`);
    const folders: PromptFolder[] = [];

    for (const module of this.modules.values()) {
      console.log(`[PromptManager] Processing module ${module.id} with ${module.folders.length} folders`);
      for (const folder of module.folders) {
        if (categoryId && folder.categoryId !== categoryId) continue;
        folders.push(folder);
      }
    }

    console.log(`[PromptManager] Returning ${folders.length} folders`);
    return folders.sort((a, b) => a.order - b.order);
  }

  async getPromptsInCategory(categoryId: string): Promise<PromptItem[]> {
    const prompts: PromptItem[] = [];

    for (const module of this.modules.values()) {
      for (const prompt of module.prompts) {
        if (prompt.categoryId === categoryId && !prompt.folderId) {
          prompts.push(prompt);
        }
      }
    }

    return prompts.sort((a, b) => a.order - b.order);
  }

  async getPromptsInFolder(folderId: string): Promise<PromptItem[]> {
    const prompts: PromptItem[] = [];

    for (const module of this.modules.values()) {
      for (const prompt of module.prompts) {
        if (prompt.folderId === folderId) {
          prompts.push(prompt);
        }
      }
    }

    return prompts.sort((a, b) => a.order - b.order);
  }

  // Быстрый доступ
  async addToQuickAccess(promptId: string): Promise<void> {
    console.log(`[PromptManager] Adding to quick access: ${promptId}`);
    this.quickAccess.add(promptId);
    console.log(`[PromptManager] Quick access Set after add:`, [...this.quickAccess]);
    this.saveQuickAccess();
  }

  async removeFromQuickAccess(promptId: string): Promise<void> {
    console.log(`[PromptManager] Removing from quick access: ${promptId}`);
    this.quickAccess.delete(promptId);
    console.log(`[PromptManager] Quick access Set after remove:`, [...this.quickAccess]);
    this.saveQuickAccess();
  }

  async getQuickAccess(): Promise<PromptItem[]> {
    console.log('[PromptManager] getQuickAccess called, quickAccess Set:', [...this.quickAccess]);
    const prompts: PromptItem[] = [];

    for (const promptId of this.quickAccess) {
      console.log(`[PromptManager] Looking for prompt with ID: ${promptId}`);
      const prompt = await this.getPrompt(promptId);
      if (prompt) {
        console.log(`[PromptManager] Found prompt: ${prompt.title} (${prompt.id})`);
        prompts.push(prompt);
      } else {
        console.log(`[PromptManager] Prompt not found for ID: ${promptId}`);
      }
    }

    console.log(`[PromptManager] getQuickAccess returning ${prompts.length} prompts:`, prompts.map(p => ({ id: p.id, title: p.title })));
    return prompts;
  }

  // Утилиты
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // Создание пользовательского модуля
  async createUserModule(name: string, description: string): Promise<PromptModule> {
    const moduleId = this.generateId('module');
    const module: PromptModule = {
      id: moduleId,
      name,
      version: '1.0.0',
      description,
      source: 'user',
      categories: [],
      folders: [],
      prompts: [],
      metadata: {
        author: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        dependencies: []
      }
    };

    await this.saveModule(module);
    return module;
  }

  // Восстановление системных промптов
  async restoreSystemPrompts(): Promise<void> {
    try {
      // Очищаем только системные модули
      const systemModules = ['ai-assistant', 'business'];
      for (const moduleId of systemModules) {
        this.modules.delete(moduleId);
      }

      // Перезагружаем системные модули
      await this.loadSystemModules();

      console.log('System prompts restored successfully');
    } catch (error) {
      console.error('Failed to restore system prompts:', error);
      throw error;
    }
  }

  // Создание категории "Boss AI Generation" для автогенерированных промптов
  async ensureBossAIGenerationCategory(): Promise<PromptCategory> {
    // Ищем существующую категорию
    const categories = await this.getCategories();
    let bossCategory = categories.find(c => c.title === 'Boss AI Generation');

    if (!bossCategory) {
      // Создаем пользовательский модуль для автогенерированных промптов
      let bossModule = Array.from(this.modules.values()).find(m => m.name === 'Boss AI Generation');

      if (!bossModule) {
        bossModule = await this.createUserModule('Boss AI Generation', 'Автоматически сгенерированные промпты');
      }

      // Создаем категорию
      const categoryId = this.generateId('category');
      bossCategory = {
        id: categoryId,
        title: 'Boss AI Generation',
        description: 'Автоматически сгенерированные промпты',
        order: 999,
        icon: '🤖',
        color: '#8B5CF6',
        system: false,
        moduleId: bossModule.id
      };

      bossModule.categories.push(bossCategory);
      await this.saveModule(bossModule);
    }

    return bossCategory;
  }

  // Создание категории "Сгенерированные" для улучшенных промптов
  async ensureGeneratedCategory(): Promise<PromptCategory> {
    // Ищем существующую категорию
    const categories = await this.getCategories();
    let generatedCategory = categories.find(c => c.title === 'Сгенерированные');

    if (!generatedCategory) {
      // Создаем пользовательский модуль для улучшенных промптов
      let generatedModule = Array.from(this.modules.values()).find(m => m.name === 'Сгенерированные');

      if (!generatedModule) {
        generatedModule = await this.createUserModule('Сгенерированные', 'Улучшенные и сгенерированные промпты');
      }

      // Создаем категорию
      const categoryId = this.generateId('category');
      generatedCategory = {
        id: categoryId,
        title: 'Сгенерированные',
        description: 'Улучшенные и сгенерированные промпты',
        order: 998,
        icon: '✨',
        color: '#10b981',
        system: false,
        moduleId: generatedModule.id
      };

      // Добавляем в модуль
      generatedModule.categories.push(generatedCategory);
      await this.saveModule(generatedModule);
    }

    return generatedCategory;
  }

  // Генерация промпта через AI
  async generatePrompt(userRequest: string): Promise<PromptItem> {
    try {
      // Получаем или создаем категорию для автогенерированных промптов
      const category = await this.ensureBossAIGenerationCategory();

      // Здесь должен быть вызов к GPT API
      // Пока используем заглушку
      const generatedTitle = `Сгенерированный промпт: ${userRequest.slice(0, 50)}...`;
      const generatedBody = `Промпт для: ${userRequest}

Инструкции:
1. ${userRequest}
2. Будь точным и полезным
3. Предоставь детальный ответ

Контекст: Пользователь запросил помощь с: ${userRequest}`;

      // Создаем промпт
      const prompt = await this.createPrompt({
        title: generatedTitle,
        body: generatedBody,
        description: `Автоматически сгенерированный промпт для: ${userRequest}`,
        tags: ['автогенерация', 'boss-ai', 'пользовательский'],
        categoryId: category.id,
        order: Date.now(),
        system: false,
        moduleId: category.moduleId
      });

      return prompt;
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      throw error;
    }
  }

  // Улучшение промпта через AI
  async improvePrompt(originalPrompt: string, context?: string): Promise<{
    improvedPrompt: string;
    suggestions: string[];
    explanation: string;
    savedPrompt?: PromptItem;
  }> {
    try {
      // Здесь должен быть вызов к GPT API для улучшения промпта
      // Пока используем заглушку

      const improvedPrompt = `${originalPrompt}

Дополнительные инструкции:
- Будь максимально точным и конкретным
- Предоставь пошаговое решение
- Включи примеры если необходимо
- Учитывай контекст: ${context || 'общий'}

Формат ответа:
1. Анализ задачи
2. Пошаговое решение
3. Примеры и пояснения
4. Рекомендации`;

      const suggestions = [
        'Добавить конкретные примеры',
        'Уточнить формат ответа',
        'Включить критерии качества',
        'Добавить контекстные ограничения'
      ];

      const explanation = `Промпт был улучшен для большей точности и структурированности. Добавлены четкие инструкции по формату ответа и критериям качества.`;

      // Сохраняем улучшенный промпт в категорию "Сгенерированные"
      const category = await this.ensureGeneratedCategory();
      const savedPrompt = await this.createPrompt({
        title: `Улучшенный промпт: ${originalPrompt.slice(0, 50)}...`,
        body: improvedPrompt,
        description: `Автоматически улучшенный промпт`,
        tags: ['улучшенный', 'ai-генерация', 'пользовательский'],
        categoryId: category.id,
        order: Date.now(),
        system: false,
        moduleId: category.moduleId
      });

      return {
        improvedPrompt,
        suggestions,
        explanation,
        savedPrompt
      };
    } catch (error) {
      console.error('Failed to improve prompt:', error);
      throw error;
    }
  }

  // Валидация улучшенного промпта
  async validateImprovedPrompt(improvedPrompt: string, userFeedback?: string): Promise<{
    isValid: boolean;
    finalPrompt: string;
    message: string;
  }> {
    try {
      let finalPrompt = improvedPrompt;
      let message = 'Промпт готов к использованию!';

      if (userFeedback) {
        // Если пользователь дал обратную связь, интегрируем её
        finalPrompt = `${improvedPrompt}

Дополнительные требования пользователя:
${userFeedback}

Учти эти требования при выполнении задачи.`;
        message = 'Промпт обновлен с учетом ваших дополнений!';
      }

      return {
        isValid: true,
        finalPrompt,
        message
      };
    } catch (error) {
      console.error('Failed to validate improved prompt:', error);
      throw error;
    }
  }

  // Создание пользовательской категории
  async createUserCategory(name: string, description?: string, icon?: string, color?: string): Promise<PromptCategory> {
    try {
      // Проверяем, не существует ли уже категория с таким названием
      const existingCategories = await this.getCategories();
      const existingCategory = existingCategories.find(c => c.title === name);
      if (existingCategory) {
        console.log(`[PromptManager] Category "${name}" already exists, returning existing one`);
        return existingCategory;
      }

      // Создаем пользовательский модуль если его нет
      let userModule = Array.from(this.modules.values()).find(m => m.name === 'Пользовательские');

      if (!userModule) {
        userModule = await this.createUserModule('Пользовательские', 'Пользовательские категории и промпты');
      }

      // Создаем категорию
      const categoryId = this.generateId('category');
      const category: PromptCategory = {
        id: categoryId,
        title: name,
        description: description || `Пользовательская категория: ${name}`,
        order: Date.now(),
        icon: icon || '📁',
        color: color || '#6b7280',
        system: false,
        moduleId: userModule.id
      };

      // Добавляем в модуль
      userModule.categories.push(category);
      await this.saveModule(userModule);

      console.log(`[PromptManager] Created new category: "${name}"`);
      return category;
    } catch (error) {
      console.error('Failed to create user category:', error);
      throw error;
    }
  }

  // Создание промпта в категории
  async createPromptInCategory(categoryId: string, title: string, body: string, description?: string, tags?: string[], currentProject?: string): Promise<PromptItem> {
    try {
      const category = (await this.getCategories()).find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Добавляем тег проекта если он указан
      const promptTags = [...(tags || ['пользовательский'])];
      if (currentProject) {
        const projectTag = `project:${currentProject}`;
        if (!promptTags.includes(projectTag)) {
          promptTags.push(projectTag);
        }
      }

      const prompt = await this.createPrompt({
        title,
        body,
        description: description || `Пользовательский промпт: ${title}`,
        tags: promptTags,
        categoryId,
        order: Date.now(),
        system: false,
        moduleId: category.moduleId
      });

      return prompt;
    } catch (error) {
      console.error('Failed to create prompt in category:', error);
      throw error;
    }
  }

  // Перемещение промпта в другую категорию
  async movePromptToCategory(promptId: string, newCategoryId: string): Promise<void> {
    try {
      const prompt = await this.getPrompt(promptId);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const newCategory = (await this.getCategories()).find(c => c.id === newCategoryId);
      if (!newCategory) {
        throw new Error('Category not found');
      }

      // Сохраняем оригинальную категорию если её нет
      if (!prompt.originalCategoryId) {
        prompt.originalCategoryId = prompt.categoryId;
      }

      // Обновляем категорию промпта
      prompt.categoryId = newCategoryId;
      prompt.folderId = undefined; // Убираем из папки при перемещении

      // Сохраняем изменения
      await this.updatePrompt(promptId, {
        categoryId: newCategoryId,
        folderId: undefined,
        originalCategoryId: prompt.originalCategoryId
      });

      console.log(`[PromptManager] Moved prompt "${prompt.title}" to category "${newCategory.title}"`);
    } catch (error) {
      console.error('Failed to move prompt to category:', error);
      throw error;
    }
  }

  // Удаление категории
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const category = (await this.getCategories()).find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Нельзя удалять системные категории
      if (category.system) {
        throw new Error('Cannot delete system categories');
      }

      // Нельзя удалять категорию "Избранное"
      if (category.title === 'Избранное') {
        throw new Error('Cannot delete favorites category');
      }

      // Находим модуль с этой категорией
      const module = Array.from(this.modules.values()).find(m => m.id === category.moduleId);
      if (!module) {
        throw new Error('Module not found');
      }

      // Удаляем все промпты в этой категории
      const categoryPrompts = module.prompts.filter(p => p.categoryId === categoryId);
      for (const prompt of categoryPrompts) {
        await this.deletePrompt(prompt.id);
      }

      // Удаляем категорию из модуля
      const categoryIndex = module.categories.findIndex(c => c.id === categoryId);
      if (categoryIndex !== -1) {
        module.categories.splice(categoryIndex, 1);
        await this.saveModule(module);
      }

      console.log(`[PromptManager] Deleted category "${category.title}" and ${categoryPrompts.length} prompts`);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }


  // Объединение категорий "Сгенерированные" и "Boss AI Generation"
  async mergeGeneratedCategories(): Promise<void> {
    try {
      const allCategories = await this.getCategories();
      const generatedCategories = allCategories.filter(c =>
        c.title === 'Сгенерированные' || c.title === 'Boss AI Generation'
      );

      if (generatedCategories.length <= 1) {
        console.log('[PromptManager] No duplicate generated categories found');
        return;
      }

      console.log(`[PromptManager] Found ${generatedCategories.length} generated categories, merging...`);

      // Оставляем категорию "Сгенерированные", объединяем с "Boss AI Generation"
      const keepCategory = generatedCategories.find(c => c.title === 'Сгенерированные') || generatedCategories[0];
      const mergeCategories = generatedCategories.filter(c => c.id !== keepCategory.id);

      for (const category of mergeCategories) {
        try {
          // Находим модуль с этой категорией
          const module = Array.from(this.modules.values()).find(m => m.id === category.moduleId);
          if (module) {
            // Перемещаем все промпты в основную категорию
            const categoryPrompts = module.prompts.filter(p => p.categoryId === category.id);
            for (const prompt of categoryPrompts) {
              prompt.categoryId = keepCategory.id;
              prompt.moduleId = keepCategory.moduleId;
            }

            // Удаляем категорию из модуля
            const categoryIndex = module.categories.findIndex(c => c.id === category.id);
            if (categoryIndex !== -1) {
              module.categories.splice(categoryIndex, 1);
              await this.saveModule(module);
            }
          }
          console.log(`[PromptManager] Merged category "${category.title}" into "${keepCategory.title}"`);
        } catch (error) {
          console.error(`Failed to merge category ${category.id}:`, error);
        }
      }

      console.log(`[PromptManager] Merge completed. Kept category: ${keepCategory.title}`);
    } catch (error) {
      console.error('Failed to merge generated categories:', error);
      throw error;
    }
  }
}

// Экспортируем синглтон
export const promptManager = new PromptManager();
export default promptManager;
