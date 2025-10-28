const NS = 'promptsService';
function read(key, fallback) {
    try {
        const raw = localStorage.getItem(`${NS}:${key}`);
        return raw ? JSON.parse(raw) : fallback;
    }
    catch {
        return fallback;
    }
}
function write(key, value) {
    try {
        localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
    }
    catch { }
}
export const PromptsStorage = {
    getCategories() {
        return read('categories', []);
    },
    setCategories(categories) {
        write('categories', categories);
    },
    getFolders() {
        return read('folders', []);
    },
    setFolders(folders) {
        write('folders', folders);
    },
    getPrompts() {
        return read('prompts', []);
    },
    setPrompts(prompts) {
        write('prompts', prompts);
    },
    getQuickAccess() {
        return read('quick', []);
    },
    setQuickAccess(ids) {
        write('quick', ids);
    }
};
export function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
//# sourceMappingURL=PromptsStorage.js.map