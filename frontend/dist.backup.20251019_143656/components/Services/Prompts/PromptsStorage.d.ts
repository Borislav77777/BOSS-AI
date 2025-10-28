export type PromptCategory = {
    id: string;
    title: string;
    order: number;
    system?: boolean;
};
export type PromptFolder = {
    id: string;
    title: string;
    categoryId: string | null;
    order: number;
    userOwned: boolean;
};
export type PromptItem = {
    id: string;
    title: string;
    body: string;
    tags: string[];
    categoryId?: string | null;
    folderId?: string | null;
    updatedAt: string;
};
export declare const PromptsStorage: {
    getCategories(): PromptCategory[];
    setCategories(categories: PromptCategory[]): void;
    getFolders(): PromptFolder[];
    setFolders(folders: PromptFolder[]): void;
    getPrompts(): PromptItem[];
    setPrompts(prompts: PromptItem[]): void;
    getQuickAccess(): string[];
    setQuickAccess(ids: string[]): void;
};
export declare function uid(prefix: string): string;
//# sourceMappingURL=PromptsStorage.d.ts.map