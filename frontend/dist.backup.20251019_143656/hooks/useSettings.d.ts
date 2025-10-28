import { SettingValue } from '@/types';
/**
 * УЛУЧШЕННЫЙ хук для работы с настройками
 * Полная интеграция с SettingsService + улучшенный UX
 */
export declare const useSettings: () => {
    settings: Record<string, SettingValue>;
    hasUnsavedChanges: any;
    showSaveSuccess: any;
    isLoading: any;
    searchQuery: any;
    handleSettingChange: any;
    updateSetting: any;
    handleSave: any;
    handleReset: any;
    handleExport: any;
    handleImport: any;
    searchSettings: any;
    previewChanges: any;
};
//# sourceMappingURL=useSettings.d.ts.map