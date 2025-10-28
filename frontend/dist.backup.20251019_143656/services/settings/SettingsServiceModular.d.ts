/**
 * Модульная версия SettingsService
 */
import { SettingsCategory, SettingValue, UserPreferences } from '@/types';
export declare class SettingsServiceModular {
    private static instance;
    private validator;
    private persistence;
    private defaults;
    private notifications;
    private appearanceSettings;
    private behaviorSettings;
    private layoutSettings;
    private state;
    private constructor();
    static getInstance(): SettingsServiceModular;
    private initializeModules;
    private initializeState;
    private loadSettings;
    getSetting(key: string): SettingValue;
    setSetting(key: string, value: SettingValue): Promise<void>;
    getAllSettings(): Record<string, SettingValue>;
    resetSettings(): void;
    subscribe(key: string, callback: (value: SettingValue) => void): () => void;
    getUserPreferences(): UserPreferences;
    updateUserPreferences(preferences: Partial<UserPreferences>): void;
    getSettingsCategories(): SettingsCategory[];
    exportSettings(): string;
    importSettings(settingsJson: string): boolean;
    getAppearanceSettings(): Record<string, SettingValue>;
    getBehaviorSettings(): Record<string, SettingValue>;
    getLayoutSettings(): Record<string, SettingValue>;
    validateSetting(key: string, value: SettingValue): boolean;
    validateAllSettings(): Record<string, boolean>;
    getInvalidSettings(): string[];
    saveSettings(): Promise<void>;
    loadSettingsFromStorage(): Promise<void>;
    getSubscribersCount(key: string): number;
    getAllSubscribersCount(): number;
    getSubscribedKeys(): string[];
    isLoaded(): boolean;
    getVersion(): string;
    getStorageSize(): number;
    isStorageAvailable(): boolean;
}
//# sourceMappingURL=SettingsServiceModular.d.ts.map