/**
 * Модуль настроек по умолчанию
 */
import { SettingValue } from '@/types';
import { SettingsDefaults } from '../types/SettingsTypes';
export declare class SettingsDefaultsImpl implements SettingsDefaults {
    private defaultSettings;
    constructor();
    private initializeDefaults;
    getDefaults(): Record<string, SettingValue>;
    getCategoryDefaults(category: string): Record<string, SettingValue>;
    mergeWithDefaults(settings: Record<string, SettingValue>): Record<string, SettingValue>;
    getDefaultValue(key: string): SettingValue | undefined;
    hasDefault(key: string): boolean;
    addDefault(key: string, value: SettingValue): void;
    removeDefault(key: string): void;
    resetDefaults(): void;
    getDefaultKeys(): string[];
    getDefaultKeysByCategory(category: string): string[];
}
//# sourceMappingURL=SettingsDefaults.d.ts.map