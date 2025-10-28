import { usePlatform } from '@/hooks/usePlatform';
import { settingsService } from '@/services/settings';
import { cn } from '@/utils';
import {
    Bell,
    ChevronRight,
    MessageSquare,
    Monitor,
    Palette,
    Settings as SettingsIcon
} from 'lucide-react';
import { memo, type ComponentType, type FC } from 'react';

interface SettingsSubmenuProps {
    isVisible: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const SettingsSubmenu: FC<SettingsSubmenuProps> = memo(({
    isVisible,
    isCollapsed,
    onClose,
    activeCategory,
    onCategoryChange
}) => {
    const { switchSection } = usePlatform();
    const categories = settingsService.getSettingsCategories();

    // Маппинг иконок для категорий
    const categoryIconMap: Record<string, ComponentType<{ className?: string }>> = {
        appearance: Palette,
        interface: Monitor,
        chat: MessageSquare,
        notifications: Bell,
    };

    const handleCategoryClick = (categoryId: string) => {
        onCategoryChange(categoryId);
        switchSection('settings');
        onClose();
    };

    const handleAllSettingsClick = () => {
        onCategoryChange('all');
        switchSection('settings');
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "absolute bg-background border border-border rounded-lg shadow-lg z-50 transition-all duration-200",
            isCollapsed
                ? "right-16 top-0 w-64"
                : "left-0 top-full mt-2 w-full"
        )}>
            {/* Заголовок */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <SettingsIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Настройки</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-surface/50 transition-colors"
                        title="Закрыть меню"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Список категорий */}
            <div className="p-2">
                {/* Кнопка "Все настройки" */}
                <button
                    onClick={handleAllSettingsClick}
                    className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left mb-2",
                        activeCategory === 'all'
                            ? "bg-primary text-button-primary-text shadow-md"
                            : "hover:bg-surface/50 text-white"
                    )}
                >
                    <SettingsIcon className="w-4 h-4" />
                    <div>
                        <div className="font-medium text-sm">Все настройки</div>
                        <div className="text-xs opacity-70">Показать все категории</div>
                    </div>
                </button>

                {/* Разделитель */}
                <div className="h-px gradient-divider my-2"></div>

                {/* Категории */}
                {categories.map((category) => {
                    const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={cn(
                                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left",
                                activeCategory === category.id
                                    ? "bg-primary text-button-primary-text shadow-md"
                                    : "hover:bg-surface/50 text-white"
                            )}
                        >
                            <IconComponent className="w-4 h-4" />
                            <div>
                                <div className="font-medium text-sm">{category.name}</div>
                                <div className="text-xs opacity-70">{category.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

SettingsSubmenu.displayName = 'SettingsSubmenu';
