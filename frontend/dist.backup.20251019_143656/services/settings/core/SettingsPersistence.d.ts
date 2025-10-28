/**
 * Модуль персистентности настроек
 */
import { SettingValue } from '@/types';
import { SettingsPersistence } from '../types/SettingsTypes';
export declare class SettingsPersistenceImpl implements SettingsPersistence {
    private static readonly SETTINGS_KEY;
    private static readonly VERSION_KEY;
    private static readonly CURRENT_VERSION;
    load(): Promise<Record<string, SettingValue>>;
    save(settings: Record<string, SettingValue>): Promise<void>;
    migrate(settings: Record<string, SettingValue>, oldVersion: string | null): Record<string, SettingValue>;
    getVersion(): string;
    setVersion(version: string): void;
    clear(): void;
    export(): string;
    import(settingsJson: string): boolean;
    getStorageSize(): number;
    isStorageAvailable(): boolean;
}
//# sourceMappingURL=SettingsPersistence.d.ts.map