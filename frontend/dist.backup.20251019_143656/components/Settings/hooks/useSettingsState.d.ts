/**
 * Хук для управления состоянием Settings компонента
 */
export declare const useSettingsState: () => {
    settingsState: SettingsState;
    settingsActions: SettingsActions;
    handleSettingChange: any;
};
export interface SettingsState {
    searchQuery: string;
    showAdvanced: boolean;
    selectedCategory: string;
    isExporting: boolean;
    isImporting: boolean;
}
export interface SettingsActions {
    setSearchQuery: (query: string) => void;
    toggleAdvanced: () => void;
    selectCategory: (category: string | null) => void;
    exportSettings: () => void;
    importSettings: (file: File) => void;
    resetSettings: () => void;
}
//# sourceMappingURL=useSettingsState.d.ts.map