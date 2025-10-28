/**
 * Типы для модульной архитектуры Settings компонента
 */
import { SettingsCategory, SettingValue } from '@/types';
export interface SettingsProps {
    className?: string;
}
export interface SettingsState {
    searchQuery: string;
    showAdvanced: boolean;
    selectedCategory: string | null;
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
export interface SettingsLayoutProps {
    children: React.ReactNode;
    className?: string;
}
export interface SettingsHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
}
export interface SettingsSidebarProps {
    categories: SettingsCategory[];
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
}
export interface SettingsContentProps {
    selectedCategory: string | null;
    showAdvanced: boolean;
    searchQuery: string;
}
export interface SettingsCategoryProps {
    category: SettingsCategory;
    showAdvanced: boolean;
    searchQuery: string;
}
export interface CompactSettingsGroupProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}
export interface BooleanSettingsGridProps {
    items: Array<{
        key: string;
        value: boolean;
        label: string;
        type: 'boolean';
        icon: React.ComponentType<{
            className?: string;
        }>;
        onChange: (value: any) => void;
    }>;
    onSettingChange: (key: string, value: SettingValue) => void;
}
export interface AdvancedSettingsToggleProps {
    children: React.ReactNode;
}
export interface SettingsSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
}
export interface SettingsActionsProps {
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
    isExporting: boolean;
    isImporting: boolean;
}
//# sourceMappingURL=types.d.ts.map