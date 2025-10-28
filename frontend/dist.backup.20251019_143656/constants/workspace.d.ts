/**
 * Константы для рабочего пространства
 */
export declare const WORKSPACE: {
    readonly LAYOUTS: {
        readonly GRID: "grid";
        readonly LIST: "list";
        readonly COMPACT: "compact";
    };
    readonly ITEMS: {
        readonly GRID_ITEM_SIZE: 200;
        readonly GRID_ITEM_MIN_SIZE: 150;
        readonly GRID_ITEM_MAX_SIZE: 300;
        readonly LIST_ITEM_HEIGHT: 60;
        readonly COMPACT_ITEM_HEIGHT: 40;
    };
    readonly PAGINATION: {
        readonly ITEMS_PER_PAGE: 20;
        readonly LOAD_MORE_COUNT: 10;
    };
    readonly SEARCH: {
        readonly MIN_QUERY_LENGTH: 2;
        readonly DEBOUNCE_DELAY: 300;
        readonly MAX_RESULTS: 100;
    };
    readonly FILES: {
        readonly MAX_UPLOAD_SIZE: number;
        readonly ALLOWED_EXTENSIONS: readonly [".txt", ".md", ".json", ".csv", ".xml", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".rar", ".7z"];
        readonly PREVIEW_MAX_SIZE: number;
    };
    readonly DRAG_DROP: {
        readonly DRAG_OVER_CLASS: "drag-over";
        readonly DRAG_ACTIVE_CLASS: "drag-active";
        readonly DROP_ZONE_CLASS: "drop-zone";
    };
};
export type WorkspaceConstants = typeof WORKSPACE;
//# sourceMappingURL=workspace.d.ts.map