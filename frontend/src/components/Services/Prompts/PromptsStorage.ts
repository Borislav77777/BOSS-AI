export type PromptCategory = { id: string; title: string; order: number; system?: boolean };
export type PromptFolder = { id: string; title: string; categoryId: string | null; order: number; userOwned: boolean };
export type PromptItem = { id: string; title: string; body: string; tags: string[]; categoryId?: string | null; folderId?: string | null; updatedAt: string };

const NS = 'promptsService';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {}
}

export const PromptsStorage = {
  getCategories(): PromptCategory[] {
    return read<PromptCategory[]>('categories', []);
  },
  setCategories(categories: PromptCategory[]) {
    write('categories', categories);
  },
  getFolders(): PromptFolder[] {
    return read<PromptFolder[]>('folders', []);
  },
  setFolders(folders: PromptFolder[]) {
    write('folders', folders);
  },
  getPrompts(): PromptItem[] {
    return read<PromptItem[]>('prompts', []);
  },
  setPrompts(prompts: PromptItem[]) {
    write('prompts', prompts);
  },
  getQuickAccess(): string[] {
    return read<string[]>('quick', []);
  },
  setQuickAccess(ids: string[]) {
    write('quick', ids);
  }
};

export function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
