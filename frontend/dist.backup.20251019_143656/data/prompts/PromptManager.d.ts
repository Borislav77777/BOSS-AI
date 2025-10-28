/**
 * Модульный менеджер промптов
 * Управляет системными и пользовательскими промптами
 */
import { PromptManager as IPromptManager, PromptCategory, PromptFilters, PromptFolder, PromptItem, PromptModule, PromptSearchResult, PromptSource } from './types';
declare class PromptManager implements IPromptManager {
    private modules;
    private quickAccess;
    constructor();
    private loadUserModules;
    private loadSystemModules;
    ensureModulesLoaded(): Promise<void>;
    private loadQuickAccess;
    private saveQuickAccess;
    loadModule(moduleId: string): Promise<PromptModule>;
    saveModule(module: PromptModule): Promise<void>;
    deleteModule(moduleId: string): Promise<void>;
    listModules(source?: PromptSource): Promise<PromptModule[]>;
    searchPrompts(query: string, filters?: PromptFilters): Promise<PromptSearchResult[]>;
    getPrompt(promptId: string): Promise<PromptItem | null>;
    getAllPrompts(): Promise<PromptItem[]>;
    createPrompt(promptData: Omit<PromptItem, 'id' | 'metadata'>): Promise<PromptItem>;
    updatePrompt(promptId: string, updates: Partial<PromptItem>): Promise<PromptItem>;
    deletePrompt(promptId: string): Promise<void>;
    getCategories(moduleId?: string): Promise<PromptCategory[]>;
    getFolders(categoryId?: string): Promise<PromptFolder[]>;
    getPromptsInCategory(categoryId: string): Promise<PromptItem[]>;
    getPromptsInFolder(folderId: string): Promise<PromptItem[]>;
    addToQuickAccess(promptId: string): Promise<void>;
    removeFromQuickAccess(promptId: string): Promise<void>;
    getQuickAccess(): Promise<PromptItem[]>;
    private generateId;
    createUserModule(name: string, description: string): Promise<PromptModule>;
    restoreSystemPrompts(): Promise<void>;
    ensureBossAIGenerationCategory(): Promise<PromptCategory>;
    ensureGeneratedCategory(): Promise<PromptCategory>;
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
    createUserCategory(name: string, description?: string, icon?: string, color?: string): Promise<PromptCategory>;
    createPromptInCategory(categoryId: string, title: string, body: string, description?: string, tags?: string[], currentProject?: string): Promise<PromptItem>;
    movePromptToCategory(promptId: string, newCategoryId: string): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
    mergeGeneratedCategories(): Promise<void>;
}
export declare const promptManager: PromptManager;
export default promptManager;
//# sourceMappingURL=PromptManager.d.ts.map