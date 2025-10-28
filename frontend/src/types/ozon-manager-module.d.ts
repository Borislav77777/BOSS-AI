/**
 * Type declarations for Ozon Manager API Module
 */
declare module '../../../../public/services/modules/ozon-manager/index.js' {
  interface OzonManagerModule {
    isInitialized: boolean;
    apiUrl: string;
    authToken: string | null;

    initialize(): Promise<boolean>;
    authenticate(): Promise<boolean>;

    // Store operations
    getStores(): Promise<unknown>;
    addStore(storeData: unknown): Promise<unknown>;
    updateStore(storeName: string, storeData: unknown): Promise<unknown>;
    removeStore(storeName: string): Promise<unknown>;
    testStoreConnection(storeName: string): Promise<unknown>;

    // Promotions operations
    removeFromPromotions(storeNames: string[]): Promise<unknown>;

    // Archive operations
    unarchiveProducts(storeNames: string[]): Promise<unknown>;

    // Scheduler operations
    getSchedulerStatus(): Promise<unknown>;
    reloadSchedule(): Promise<unknown>;

    // Logs operations
    getLogs(): Promise<unknown>;

    // Utilities
    checkHealth(): Promise<unknown>;
    getModuleInfo(): unknown;
    setApiUrl(url: string): void;
    setAuthToken(token: string): void;
  }

  const ozonManagerModule: OzonManagerModule;
  export default ozonManagerModule;
}
