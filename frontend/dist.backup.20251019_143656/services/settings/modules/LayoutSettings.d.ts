/**
 * Модуль настроек макета
 */
import { SettingValue } from '@/types';
import { SettingsModule } from '../types/SettingsTypes';
export declare class LayoutSettings implements SettingsModule {
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
    getChatWidthRange(): {
        min: number;
        max: number;
    };
    getChatInputHeightRange(): {
        min: number;
        max: number;
    };
    getSidebarWidthRange(): {
        min: number;
        max: number;
    };
    getChatWidth(): number;
    getChatInputHeight(): number;
    getSidebarWidth(): number;
    isSidebarCollapsed(): boolean;
    isChatVisible(): boolean;
    toggleSidebarCollapsed(): void;
    toggleChatVisible(): void;
}
//# sourceMappingURL=LayoutSettings.d.ts.map