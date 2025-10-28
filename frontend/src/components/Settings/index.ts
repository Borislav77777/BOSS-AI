// Оригинальный компонент
export { default as Settings } from './Settings';

// Модульная версия
export { SettingsModular } from './SettingsModular';

// Компоненты макета
export { SettingsContent } from './SettingsLayout/SettingsContent';
export { SettingsHeader } from './SettingsLayout/SettingsHeader';
export { SettingsSidebar } from './SettingsLayout/SettingsSidebar';

// Категории настроек
export { AdvancedSettings } from './SettingsCategories/AdvancedSettings';
export { AppearanceSettings } from './SettingsCategories/AppearanceSettings';
export { BehaviorSettings } from './SettingsCategories/BehaviorSettings';
export { LayoutSettings } from './SettingsCategories/LayoutSettings';
export { SystemSettings } from './SettingsCategories/SystemSettings';

// Общие компоненты
export { BooleanSettingsGrid } from './common/BooleanSettingsGrid';
export { CompactSettingsGroup } from './common/CompactSettingsGroup';

// Хуки
export { useSettingsState } from './hooks/useSettingsState';

// Типы
export * from './types';
