/**
 * Модуль настроек внешнего вида
 */
import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';
export declare class AppearanceSettings implements SettingsModule {
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
    getAvailableThemes(): string[];
    getFontSizeRange(): {
        min: number;
        max: number;
    };
    isThemeSupported(theme: string): boolean;
}
//# sourceMappingURL=AppearanceSettings.d.ts.map