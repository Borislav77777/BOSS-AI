/**
 * Настройки GPT-5 Nano для промптов
 * Основано на официальных параметрах OpenAI API
 */
export interface GPTSettings {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
    stream?: boolean;
    model?: string;
    user?: string;
}
export interface PromptWithSettings {
    id: string;
    title: string;
    body: string;
    settings?: GPTSettings;
    tags: string[];
    categoryId: string;
    folderId?: string;
    originalCategoryId?: string;
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
export declare const PRESET_SETTINGS: Record<string, GPTSettings>;
export declare function validateGPTSettings(settings: GPTSettings): {
    valid: boolean;
    errors: string[];
};
export declare function formatGPTSettings(settings: GPTSettings): string;
//# sourceMappingURL=gpt-settings.d.ts.map