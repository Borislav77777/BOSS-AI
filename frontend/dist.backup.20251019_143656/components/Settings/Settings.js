import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { SettingItem } from '@/components/common/SettingItem';
import { ChatSettings } from '@/components/Settings/SettingsCategories/ChatSettings';
import { usePlatform } from '@/hooks/usePlatform';
import { useSettings } from '@/hooks/useSettings';
import { settingsService } from '@/services/settings';
import { cn } from '@/utils';
import { Bell, Check, ChevronDown, ChevronUp, Download, Eye, MessageSquare, Monitor, Palette, RotateCcw, Save, Search, Settings as SettingsIcon, Upload } from 'lucide-react';
import React, { memo, useState } from 'react';
/**
 * Компактный компонент для группировки связанных настроек
 */
const CompactSettingsGroup = ({ title, description, children, className }) => (_jsxs("div", { className: cn("p-4 settings-card", className), children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-semibold text-text-primary", children: title }), description && (_jsx("p", { className: "text-xs text-text-secondary mt-1", children: description }))] }), _jsx("div", { className: "space-y-3", children: children })] }));
/**
 * Компонент для группировки булевых настроек в колонки
 */
const BooleanSettingsGrid = ({ items, settings, onChange, columns = 2 }) => (_jsx("div", { className: cn("grid gap-3", columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"), children: items.map((item) => (_jsx(SettingItem, { item: {
            ...item,
            value: settings[item.id] ?? item.value
        }, onChange: onChange, className: "compact-setting-item" }, item.id))) }));
/**
 * Компонент для скрытия/показа дополнительных настроек
 */
const AdvancedSettingsToggle = ({ children, title = "Дополнительные настройки" }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (_jsxs("div", { className: "border-t pt-4", children: [_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "flex items-center justify-between w-full text-left hover:bg-surface-hover rounded-lg p-2 transition-colors", children: [_jsx("span", { className: "text-sm font-medium text-text-primary", children: title }), isExpanded ? (_jsx(ChevronUp, { className: "w-4 h-4 text-text-secondary" })) : (_jsx(ChevronDown, { className: "w-4 h-4 text-text-secondary" }))] }), isExpanded && (_jsx("div", { className: "mt-4 space-y-3", children: children }))] }));
};
export const Settings = memo(({ className }) => {
    const { state } = usePlatform();
    const activeCategory = state.layout.activeSettingsCategory;
    const { settings, showSaveSuccess, isLoading, searchQuery, handleSettingChange, handleSave: handleSaveSettings, handleReset: handleResetSettings, handleExport, handleImport, searchSettings, previewChanges, } = useSettings();
    const categories = settingsService.getSettingsCategories();
    // Маппинг иконок для категорий
    const categoryIconMap = {
        appearance: Palette,
        interface: Monitor,
        chat: MessageSquare,
        notifications: Bell,
    };
    // Функция для рендеринга компактных настроек по категориям
    const renderCompactSettings = (category) => {
        const items = category.items;
        // Группируем настройки по типам для компактного отображения
        const themeItems = items.filter(item => ['theme', 'customColor', 'accentsEnabled', 'accentColor', 'useColoredText', 'textColor', 'brightnessOverlay'].includes(item.id));
        const panelSizeItems = items.filter(item => ['sidebarWidth', 'chatWidth'].includes(item.id));
        const booleanItems = items.filter(item => item.type === 'boolean' && !['accentsEnabled', 'useColoredText'].includes(item.id));
        const advancedItems = items.filter(item => !themeItems.includes(item) && !panelSizeItems.includes(item) && !booleanItems.includes(item));
        return (_jsxs("div", { className: "space-y-6", children: [themeItems.length > 0 && (_jsx(CompactSettingsGroup, { title: "\u0422\u0435\u043C\u0430 \u0438 \u0446\u0432\u0435\u0442\u0430", description: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E \u0432\u0438\u0434\u0430 \u0438 \u0446\u0432\u0435\u0442\u043E\u0432\u043E\u0439 \u0441\u0445\u0435\u043C\u044B", children: _jsxs("div", { className: "space-y-4", children: [themeItems.find(item => item.id === 'theme') && (_jsx(SettingItem, { item: {
                                    ...themeItems.find(item => item.id === 'theme'),
                                    value: settings.theme ?? 'dark'
                                }, onChange: handleSettingChange })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: themeItems.filter(item => item.id !== 'theme').map((item) => {
                                    // Скрываем выбор цвета, если тема не "custom"
                                    if (item.id === 'customColor' && settings.theme !== 'custom') {
                                        return null;
                                    }
                                    return (_jsx(SettingItem, { item: {
                                            ...item,
                                            value: settings[item.id] ?? item.value
                                        }, onChange: handleSettingChange }, item.id));
                                }) })] }) })), panelSizeItems.length > 0 && (_jsx(CompactSettingsGroup, { title: "\u0420\u0430\u0437\u043C\u0435\u0440\u044B \u043F\u0430\u043D\u0435\u043B\u0435\u0439", description: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0448\u0438\u0440\u0438\u043D\u044B \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u043F\u0430\u043D\u0435\u043B\u0438 \u0438 \u0447\u0430\u0442\u0430", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: panelSizeItems.map((item) => (_jsx(SettingItem, { item: {
                                ...item,
                                value: settings[item.id] ?? item.value
                            }, onChange: handleSettingChange }, item.id))) }) })), booleanItems.length > 0 && (_jsx(CompactSettingsGroup, { title: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", description: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430", children: _jsx(BooleanSettingsGrid, { items: booleanItems, settings: settings, onChange: handleSettingChange, columns: 3 }) })), advancedItems.length > 0 && (_jsx(AdvancedSettingsToggle, { title: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: _jsx("div", { className: "space-y-4", children: advancedItems.map((item) => (_jsx(SettingItem, { item: {
                                ...item,
                                value: settings[item.id] ?? item.value
                            }, onChange: handleSettingChange }, item.id))) }) }))] }));
    };
    return (_jsxs("div", { className: cn('flex-1 flex h-full volume-container', className), children: [_jsx("div", { className: "sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border", children: _jsx("div", { className: "p-4 max-w-6xl mx-auto", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A...", value: searchQuery, onChange: (e) => searchSettings(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => previewChanges('theme', settings.theme === 'dark' ? 'light' : 'dark'), className: "flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors", title: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", children: [_jsx(Eye, { className: "w-4 h-4" }), _jsx("span", { children: "\u041F\u0440\u0435\u0432\u044C\u044E" })] }), _jsxs("button", { onClick: handleExport, className: "flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors", title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442" })] }), _jsxs("label", { className: "flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors cursor-pointer", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { children: "\u0418\u043C\u043F\u043E\u0440\u0442" }), _jsx("input", { type: "file", accept: ".json", onChange: handleImport, className: "hidden" })] })] })] }) }) }), _jsx("div", { className: "flex-1 overflow-y-auto main-content-scrollbar", children: _jsxs("div", { className: "p-6 max-w-6xl mx-auto settings-content", children: [activeCategory === 'all' ? (
                        /* Показываем все категории с компактным расположением */
                        _jsx("div", { className: "space-y-8", children: categories.map((category) => {
                                const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg settings-category-icon", children: _jsx(IconComponent, { className: "w-4 h-4" }) }), _jsx("div", { children: _jsx("h2", { className: "text-lg font-bold settings-category-title", children: category.name }) })] }), renderCompactSettings(category)] }, category.id));
                            }) })) : (
                        /* Показываем только выбранную категорию с компактным расположением */
                        _jsx("div", { children: (() => {
                                const category = categories.find(cat => cat.id === activeCategory);
                                if (!category)
                                    return null;
                                const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg settings-category-icon", children: _jsx(IconComponent, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold settings-category-title", children: category.name }), _jsx("p", { className: "text-sm settings-category-description", children: category.description })] })] }), category.id === 'chat' ? (_jsx(ChatSettings, { showAdvanced: false, searchQuery: "", category: category })) : (renderCompactSettings(category))] }));
                            })() })), _jsx("div", { className: "mt-12 pt-6 border-t settings-actions", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(AnimatedButton, { onClick: handleSaveSettings, variant: "glass", size: "sm", animationType: "glass-shimmer", className: "text-sm volume-button", disabled: isLoading, children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: isLoading ? 'Сохранение...' : 'Сохранить настройки' })] }), _jsxs(AnimatedButton, { onClick: handleResetSettings, variant: "glass", size: "sm", animationType: "glass-shimmer", className: "text-sm volume-button", disabled: isLoading, children: [_jsx(RotateCcw, { className: "w-4 h-4" }), _jsx("span", { children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" })] })] }), _jsx("div", { className: "flex items-center space-x-2 text-sm text-text-secondary", children: isLoading && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439..." })] })) })] }) })] }) }), showSaveSuccess && (_jsxs("div", { className: "fixed top-4 right-4 flex items-center space-x-3 px-4 py-3 text-white rounded-xl shadow-2xl z-50 animate-bounce-subtle border settings-save-success", children: [_jsx("div", { className: "w-5 h-5 bg-white/20 rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-3 h-3" }) }), _jsx("span", { className: "font-medium", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B!" })] }))] }));
});
Settings.displayName = 'Settings';
export default Settings;
//# sourceMappingURL=Settings.js.map