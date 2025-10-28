/**
 * Типы для модульной архитектуры SettingsService
 */
import { SettingsCategory, SettingValue, UserPreferences } from '@/types';
export interface SettingsState {
    settings: Record<string, SettingValue>;
    version: string;
    isLoaded: boolean;
}
export interface SettingsActions {
    getSetting: (key: string) => SettingValue;
    setSetting: (key: string, value: SettingValue) => Promise<void>;
    getAllSettings: () => Record<string, SettingValue>;
    resetSettings: () => void;
    subscribe: (key: string, callback: (value: SettingValue) => void) => () => void;
    getUserPreferences: () => UserPreferences;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
    getSettingsCategories: () => SettingsCategory[];
    exportSettings: () => string;
    importSettings: (settingsJson: string) => boolean;
}
export interface SettingsValidator {
    validate: (key: string, value: SettingValue) => boolean;
    getValidationRules: () => Record<string, (value: SettingValue) => boolean>;
}
export interface SettingsPersistence {
    load: () => Promise<Record<string, SettingValue>>;
    save: (settings: Record<string, SettingValue>) => Promise<void>;
    migrate: (settings: Record<string, SettingValue>, oldVersion: string | null) => Record<string, SettingValue>;
    getVersion: () => string;
    setVersion: (version: string) => void;
}
export interface SettingsDefaults {
    getDefaults: () => Record<string, SettingValue>;
    getCategoryDefaults: (category: string) => Record<string, SettingValue>;
    mergeWithDefaults: (settings: Record<string, SettingValue>) => Record<string, SettingValue>;
}
export interface SettingsNotifications {
    notify: (key: string, value: SettingValue) => void;
    notifyAll: () => void;
    subscribe: (key: string, callback: (value: SettingValue) => void) => () => void;
    unsubscribe: (key: string, callback: (value: SettingValue) => void) => void;
}
export interface SettingsModule {
    name: string;
    category: string;
    settings: Record<string, SettingValue>;
    validators: Record<string, (value: SettingValue) => boolean>;
    dependencies?: string[];
}
export interface SettingsMigration {
    fromVersion: string;
    toVersion: string;
    migrate: (settings: Record<string, SettingValue>) => Record<string, SettingValue>;
}
//# sourceMappingURL=SettingsTypes.d.ts.map