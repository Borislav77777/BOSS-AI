import { SettingsCategory, SettingValue, UserPreferences } from '@/types';
export declare class SettingsService {
    private static instance;
    private settings;
    private listeners;
    private constructor();
    static getInstance(): SettingsService;
    private static readonly SETTINGS_VERSION;
    private loadSettings;
    private migrateSettings;
    private saveSettings;
    private getDefaultSettings;
    getSetting(key: string): SettingValue;
    private validateSetting;
    setSetting(key: string, value: SettingValue): Promise<void>;
    getAllSettings(): Record<string, SettingValue>;
    resetSettings(): void;
    subscribe(key: string, callback: (value: SettingValue) => void): () => void;
    private notifyListeners;
    private notifyAllListeners;
    getUserPreferences(): UserPreferences;
    updateUserPreferences(preferences: Partial<UserPreferences>): void;
    getSettingsCategories(): SettingsCategory[];
    exportSettings(): string;
    importSettings(settingsJson: string): boolean;
}
export declare const settingsService: SettingsService;
//# sourceMappingURL=SettingsService.d.ts.map