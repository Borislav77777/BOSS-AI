/**
 * Хук для управления состоянием Settings компонента
 */

import { usePlatform } from '@/hooks/usePlatform';
import { useSettings } from '@/hooks/useSettings';
import { useCallback, useState } from 'react';

export const useSettingsState = () => {
  const { updateSetting } = useSettings();
  const { state, setActiveSettingsCategory } = usePlatform();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Используем категорию из PlatformContext
  const selectedCategory = state.layout.activeSettingsCategory;

  const handleToggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setActiveSettingsCategory(category || 'all');
  }, [setActiveSettingsCategory]);

  const handleSettingChange = useCallback((key: string, value: string | number | boolean) => {
    updateSetting(key, value);
  }, [updateSetting]);

  const settingsState: SettingsState = {
    searchQuery: searchQuery,
    showAdvanced,
    selectedCategory: selectedCategory || 'all',
    isExporting: isExporting,
    isImporting: isImporting
  };

  const handleExportSettings = useCallback(async () => {
    setIsExporting(true);
    try {
      const settings = JSON.stringify(state.settings, null, 2);
      const blob = new Blob([settings], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'barsukov-platform-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта настроек:', error);
    } finally {
      setIsExporting(false);
    }
  }, [state.settings]);

  const handleImportSettings = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      Object.entries(settings).forEach(([key, value]) => {
        updateSetting(key, value as string | number | boolean);
      });
    } catch (error) {
      console.error('Ошибка импорта настроек:', error);
    } finally {
      setIsImporting(false);
    }
  }, [updateSetting]);

  const handleResetSettings = useCallback(() => {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      const defaultSettings = {
        theme: 'light',
        fontSize: 'medium',
        sidebarCollapsed: false,
        sidebarWidth: 280
      };
      Object.entries(defaultSettings).forEach(([key, value]) => {
        updateSetting(key, value);
      });
    }
  }, [updateSetting]);

  const settingsActions: SettingsActions = {
    setSearchQuery: setSearchQuery,
    toggleAdvanced: handleToggleAdvanced,
    selectCategory: handleCategorySelect,
    exportSettings: handleExportSettings,
    importSettings: handleImportSettings,
    resetSettings: handleResetSettings
  };

  return {
    settingsState,
    settingsActions,
    handleSettingChange
  };
};

// Типы для совместимости
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
