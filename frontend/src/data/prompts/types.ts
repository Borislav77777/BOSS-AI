/**
 * Модульная система хранения промптов
 * Разделяет системные и пользовательские промпты
 */

export type PromptSource = 'system' | 'user';

export interface PromptModule {
  id: string;
  name: string;
  version: string;
  description: string;
  source: PromptSource;
  categories: PromptCategory[];
  folders: PromptFolder[];
  prompts: PromptItem[];
  metadata: {
    author?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    dependencies?: string[];
  };
}

export interface PromptCategory {
  id: string;
  title: string;
  description?: string;
  order: number;
  icon?: string;
  color?: string;
  system?: boolean;
  moduleId: string;
}

export interface PromptFolder {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  order: number;
  icon?: string;
  system?: boolean;
  moduleId: string;
}

import { GPTSettings } from '../../types/gpt-settings';

export interface PromptItem {
  id: string;
  title: string;
  body: string;
  description?: string;
  tags: string[];
  categoryId: string;
  folderId?: string;
  originalCategoryId?: string; // Для отслеживания оригинальной категории при перемещении в избранное
  settings?: GPTSettings; // Настройки GPT для промпта
  order: number;
  system?: boolean;
  moduleId: string;
  metadata: {
    author?: string;
    createdAt: string;
    updatedAt: string;
    usage?: number;
    rating?: number;
  };
}

export interface PromptSearchResult {
  prompt: PromptItem;
  module: PromptModule;
  category: PromptCategory;
  folder?: PromptFolder;
  relevance: number;
}

export interface PromptManager {
  // Модули
  loadModule(moduleId: string): Promise<PromptModule>;
  saveModule(module: PromptModule): Promise<void>;
  deleteModule(moduleId: string): Promise<void>;
  listModules(source?: PromptSource): Promise<PromptModule[]>;

  // Промпты
  searchPrompts(query: string, filters?: PromptFilters): Promise<PromptSearchResult[]>;
  getPrompt(promptId: string): Promise<PromptItem | null>;
  createPrompt(prompt: Omit<PromptItem, 'id' | 'metadata'>): Promise<PromptItem>;
  updatePrompt(promptId: string, updates: Partial<PromptItem>): Promise<PromptItem>;
  deletePrompt(promptId: string): Promise<void>;

  // Категории и папки
  getCategories(moduleId?: string): Promise<PromptCategory[]>;
  getFolders(categoryId?: string): Promise<PromptFolder[]>;
  getPromptsInCategory(categoryId: string): Promise<PromptItem[]>;
  getPromptsInFolder(folderId: string): Promise<PromptItem[]>;

  // Быстрый доступ
  addToQuickAccess(promptId: string): Promise<void>;
  removeFromQuickAccess(promptId: string): Promise<void>;
  getQuickAccess(): Promise<PromptItem[]>;

  // Пользовательские модули
  createUserModule(name: string, description: string): Promise<PromptModule>;
  restoreSystemPrompts(): Promise<void>;
  ensureBossAIGenerationCategory(): Promise<PromptCategory>;
  ensureGeneratedCategory(): Promise<PromptCategory>;

  // AI функции
  generatePrompt(userRequest: string): Promise<PromptItem>;
  improvePrompt(originalPrompt: string, context?: string): Promise<{
    improvedPrompt: string;
    suggestions: string[];
    explanation: string;
    savedPrompt?: PromptItem;
  }>;
  validateImprovedPrompt(improvedPrompt: string, userFeedback?: string): Promise<{
    isValid: boolean;
    finalPrompt: string;
    message: string;
  }>;

  // Создание пользовательских элементов
  createUserCategory(name: string, description?: string, icon?: string, color?: string): Promise<PromptCategory>;
  createPromptInCategory(categoryId: string, title: string, body: string, description?: string, tags?: string[], currentProject?: string): Promise<PromptItem>;
  deleteCategory(categoryId: string): Promise<void>;
  mergeGeneratedCategories(): Promise<void>;
}

export interface PromptFilters {
  source?: PromptSource;
  categoryId?: string;
  folderId?: string;
  tags?: string[];
  system?: boolean;
  moduleId?: string;
}
