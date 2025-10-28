import { AnimatedButton } from '@/components/common/AnimatedButton';
import { SettingItem } from '@/components/common/SettingItem';
import { ChatSettings } from '@/components/Settings/SettingsCategories/ChatSettings';
import { usePlatform } from '@/hooks/usePlatform';
import { useSettings } from '@/hooks/useSettings';
import { settingsService } from '@/services/settings';
import { SettingsCategory, SettingsItem, SettingValue } from '@/types';
import { cn } from '@/utils';
import {
    Bell,
    Check,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    MessageSquare,
    Monitor,
    Palette,
    RotateCcw,
    Save,
    Search,
    Settings as SettingsIcon,
    Upload
} from 'lucide-react';
import React, { memo, useState } from 'react';

interface SettingsProps {
    className?: string;
}

/**
 * Компактный компонент для группировки связанных настроек
 */
const CompactSettingsGroup: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}> = ({ title, description, children, className }) => (
    <div className={cn("p-4 settings-card", className)}>
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {description && (
                <p className="text-xs text-text-secondary mt-1">{description}</p>
            )}
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

/**
 * Компонент для группировки булевых настроек в колонки
 */
const BooleanSettingsGrid: React.FC<{
    items: SettingsItem[];
    settings: Record<string, SettingValue>;
    onChange: (key: string, value: SettingValue) => void;
    columns?: 2 | 3;
}> = ({ items, settings, onChange, columns = 2 }) => (
    <div className={cn(
        "grid gap-3",
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
    )}>
        {items.map((item) => (
            <SettingItem
                key={item.id}
                item={{
                    ...item,
                    value: settings[item.id] ?? item.value
                }}
                onChange={onChange}
                className="compact-setting-item"
            />
        ))}
    </div>
);

/**
 * Компонент для скрытия/показа дополнительных настроек
 */
const AdvancedSettingsToggle: React.FC<{
    children: React.ReactNode;
    title?: string;
}> = ({ children, title = "Дополнительные настройки" }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-t pt-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left hover:bg-surface-hover rounded-lg p-2 transition-colors"
            >
                <span className="text-sm font-medium text-text-primary">{title}</span>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                )}
            </button>
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = memo(({ className }) => {
    const { state } = usePlatform();
    const activeCategory = state.layout.activeSettingsCategory;

    const {
        settings,
        showSaveSuccess,
        isLoading,
        searchQuery,
        handleSettingChange,
        handleSave: handleSaveSettings,
        handleReset: handleResetSettings,
        handleExport,
        handleImport,
        searchSettings,
        previewChanges,
    } = useSettings();

    const categories: SettingsCategory[] = settingsService.getSettingsCategories();

    // Маппинг иконок для категорий
    const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        appearance: Palette,
        interface: Monitor,
        chat: MessageSquare,
        notifications: Bell,
    };

    // Функция для рендеринга компактных настроек по категориям
    const renderCompactSettings = (category: SettingsCategory) => {
        const items = category.items;

        // Группируем настройки по типам для компактного отображения
        const themeItems = items.filter(item =>
            ['theme', 'customColor', 'accentsEnabled', 'accentColor', 'useColoredText', 'textColor', 'brightnessOverlay'].includes(item.id)
        );
        const panelSizeItems = items.filter(item =>
            ['sidebarWidth', 'chatWidth'].includes(item.id)
        );
        const booleanItems = items.filter(item =>
            item.type === 'boolean' && !['accentsEnabled', 'useColoredText'].includes(item.id)
        );
        const advancedItems = items.filter(item =>
            !themeItems.includes(item) && !panelSizeItems.includes(item) && !booleanItems.includes(item)
        );

        return (
            <div className="space-y-6">
                {/* Тема и цвета - компактная группа */}
                {themeItems.length > 0 && (
                    <CompactSettingsGroup
                        title="Тема и цвета"
                        description="Настройки внешнего вида и цветовой схемы"
                    >
                        <div className="space-y-4">
                            {/* Основной выбор темы */}
                            {themeItems.find(item => item.id === 'theme') && (
                                <SettingItem
                                    item={{
                                        ...themeItems.find(item => item.id === 'theme')!,
                                        value: settings.theme ?? 'dark'
                                    }}
                                    onChange={handleSettingChange}
                                />
                            )}

                            {/* Дополнительные настройки темы */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {themeItems.filter(item => item.id !== 'theme').map((item) => {
                                    // Скрываем выбор цвета, если тема не "custom"
                                    if (item.id === 'customColor' && settings.theme !== 'custom') {
                                        return null;
                                    }
                                    return (
                                        <SettingItem
                                            key={item.id}
                                            item={{
                                                ...item,
                                                value: settings[item.id] ?? item.value
                                            }}
                                            onChange={handleSettingChange}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </CompactSettingsGroup>
                )}

                {/* Размеры панелей - в одну строку */}
                {panelSizeItems.length > 0 && (
                    <CompactSettingsGroup
                        title="Размеры панелей"
                        description="Настройка ширины боковой панели и чата"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {panelSizeItems.map((item) => (
                                <SettingItem
                                    key={item.id}
                                    item={{
                                        ...item,
                                        value: settings[item.id] ?? item.value
                                    }}
                                    onChange={handleSettingChange}
                                />
                            ))}
                        </div>
                    </CompactSettingsGroup>
                )}

                {/* Булевые настройки - в колонки */}
                {booleanItems.length > 0 && (
                    <CompactSettingsGroup
                        title="Основные настройки"
                        description="Основные параметры интерфейса"
                    >
                        <BooleanSettingsGrid
                            items={booleanItems}
                            settings={settings as Record<string, SettingValue>}
                            onChange={handleSettingChange}
                            columns={3}
                        />
                    </CompactSettingsGroup>
                )}

                {/* Дополнительные настройки - скрыты по умолчанию */}
                {advancedItems.length > 0 && (
                    <AdvancedSettingsToggle title="Дополнительные настройки">
                        <div className="space-y-4">
                            {advancedItems.map((item) => (
                                <SettingItem
                                    key={item.id}
                                    item={{
                                        ...item,
                                        value: settings[item.id] ?? item.value
                                    }}
                                    onChange={handleSettingChange}
                                />
                            ))}
                        </div>
                    </AdvancedSettingsToggle>
                )}
            </div>
        );
    };


    return (
        <div className={cn('flex-1 flex h-full volume-container', className)}>
            {/* Панель поиска и действий */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="p-4 max-w-6xl mx-auto">
                    <div className="flex items-center justify-between gap-4">
                        {/* Поиск по настройкам */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Поиск настроек..."
                                    value={searchQuery}
                                    onChange={(e) => searchSettings(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Действия с настройками */}
                        <div className="flex items-center gap-2">
                            {/* Предварительный просмотр */}
                            <button
                                onClick={() => previewChanges('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
                                title="Предварительный просмотр"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Превью</span>
                            </button>

                            {/* Экспорт */}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
                                title="Экспорт настроек"
                            >
                                <Download className="w-4 h-4" />
                                <span>Экспорт</span>
                            </button>

                            {/* Импорт */}
                            <label className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span>Импорт</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основная область настроек */}
            <div className="flex-1 overflow-y-auto main-content-scrollbar">
                <div className="p-6 max-w-6xl mx-auto settings-content">
                    {activeCategory === 'all' ? (
                        /* Показываем все категории с компактным расположением */
                        <div className="space-y-8">
                            {categories.map((category) => {
                                const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                                return (
                                    <div key={category.id} className="space-y-4">
                                        {/* Заголовок категории */}
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg settings-category-icon">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold settings-category-title">
                                                    {category.name}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Компактные настройки категории */}
                                        {renderCompactSettings(category)}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Показываем только выбранную категорию с компактным расположением */
                        <div>
                            {(() => {
                                const category = categories.find(cat => cat.id === activeCategory);
                                if (!category) return null;

                                const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                                return (
                                    <>
                                        {/* Заголовок категории */}
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg settings-category-icon">
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold settings-category-title">
                                                    {category.name}
                                                </h2>
                                                <p className="text-sm settings-category-description">
                                                    {category.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Компактные настройки категории */}
                                        {category.id === 'chat' ? (
                                            <ChatSettings showAdvanced={false} searchQuery="" category={category} />
                                        ) : (
                                            renderCompactSettings(category)
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Улучшенные действия с настройками */}
                    <div className="mt-12 pt-6 border-t settings-actions">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <AnimatedButton
                                    onClick={handleSaveSettings}
                                    variant="glass"
                                    size="sm"
                                    animationType="glass-shimmer"
                                    className="text-sm volume-button"
                                    disabled={isLoading}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isLoading ? 'Сохранение...' : 'Сохранить настройки'}</span>
                                </AnimatedButton>

                                <AnimatedButton
                                    onClick={handleResetSettings}
                                    variant="glass"
                                    size="sm"
                                    animationType="glass-shimmer"
                                    className="text-sm volume-button"
                                    disabled={isLoading}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Сбросить настройки</span>
                                </AnimatedButton>
                            </div>

                            {/* Индикатор состояния */}
                            <div className="flex items-center space-x-2 text-sm text-text-secondary">
                                {isLoading && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Применение изменений...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Уведомление об успешном сохранении */}
            {showSaveSuccess && (
                <div className="fixed top-4 right-4 flex items-center space-x-3 px-4 py-3 text-white rounded-xl shadow-2xl z-50 animate-bounce-subtle border settings-save-success">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium">Настройки успешно сохранены!</span>
                </div>
            )}
        </div>
    );
});

Settings.displayName = 'Settings';

export default Settings;
