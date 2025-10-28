export interface Store {
    id?: string;
    name: string;
    client_id: string;
    api_key: string;
    remove_from_promotions: boolean;
    unarchive_enabled: boolean;
    manual_run_on_startup: boolean;
    schedule_times: {
        remove: string;
        unarchive: string;
    };
    created_at?: string;
    updated_at?: string;
}
export interface StoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (store: Store) => void;
    store?: Store | null;
    mode: 'add' | 'edit';
}
export interface PromotionResult {
    success: boolean;
    products_removed: number;
    actions_processed: number;
    errors: string[];
}
export interface ArchiveResult {
    success: boolean;
    total_unarchived: number;
    cycles_completed: number;
    stopped_reason: string;
    message: string;
}
export interface SchedulerStatus {
    isRunning: boolean;
    tasksCount: number;
    tasks: string[];
}
export interface LogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    store_name?: string;
    operation?: string;
}
export interface OperationStatus {
    isRunning: boolean;
    operation: string | null;
    progress: number;
    message: string;
    results: unknown[];
}
export interface OzonManagerState {
    stores: Store[];
    selectedStores: string[];
    operationStatus: OperationStatus;
    schedulerStatus: SchedulerStatus;
    logs: string[];
    isLoading: boolean;
    error: string | null;
}
//# sourceMappingURL=types.d.ts.map