/**
 * Модуль настроек поведения
 */
import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';
export declare class BehaviorSettings implements SettingsModule {
    name: string;
    category: string;
    dependencies: string[];
    settings: Record<string, SettingValue>;
    validators: Record<string, (value: SettingValue) => boolean>;
    getSetting(key: string): SettingValue | undefined;
    setSetting(key: string, value: SettingValue): boolean;
    getAllSettings(): Record<string, SettingValue>;
    resetSettings(): void;
    validateSetting(key: string, value: SettingValue): boolean;
    getAutoSaveIntervalRange(): {
        min: number;
        max: number;
    };
    getAutoSaveIntervalOptions(): Array<{
        value: number;
        label: string;
    }>;
    isAutoSaveEnabled(): boolean;
    getAutoSaveInterval(): number;
    areSoundsEnabled(): boolean;
    areNotificationsEnabled(): boolean;
}
//# sourceMappingURL=BehaviorSettings.d.ts.map