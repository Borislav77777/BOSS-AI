import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePlatform } from '@/hooks/usePlatform';
import { settingsService } from '@/services/settings';
import { cn } from '@/utils';
import { Bell, ChevronRight, MessageSquare, Monitor, Palette, Settings as SettingsIcon } from 'lucide-react';
import { memo } from 'react';
export const SettingsSubmenu = memo(({ isVisible, isCollapsed, onClose, activeCategory, onCategoryChange }) => {
    const { switchSection } = usePlatform();
    const categories = settingsService.getSettingsCategories();
    // Маппинг иконок для категорий
    const categoryIconMap = {
        appearance: Palette,
        interface: Monitor,
        chat: MessageSquare,
        notifications: Bell,
    };
    const handleCategoryClick = (categoryId) => {
        onCategoryChange(categoryId);
        switchSection('settings');
        onClose();
    };
    const handleAllSettingsClick = () => {
        onCategoryChange('all');
        switchSection('settings');
        onClose();
    };
    if (!isVisible)
        return null;
    return (_jsxs("div", { className: cn("absolute bg-background border border-border rounded-lg shadow-lg z-50 transition-all duration-200", isCollapsed
            ? "right-16 top-0 w-64"
            : "left-0 top-full mt-2 w-full"), children: [_jsx("div", { className: "p-3 border-b border-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(SettingsIcon, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded hover:bg-surface/50 transition-colors", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E", children: _jsx(ChevronRight, { className: "w-3 h-3" }) })] }) }), _jsxs("div", { className: "p-2", children: [_jsxs("button", { onClick: handleAllSettingsClick, className: cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left mb-2", activeCategory === 'all'
                            ? "bg-primary text-button-primary-text shadow-md"
                            : "hover:bg-surface/50 text-white"), children: [_jsx(SettingsIcon, { className: "w-4 h-4" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: "\u0412\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("div", { className: "text-xs opacity-70", children: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" })] })] }), _jsx("div", { className: "h-px gradient-divider my-2" }), categories.map((category) => {
                        const IconComponent = categoryIconMap[category.id] || SettingsIcon;
                        return (_jsxs("button", { onClick: () => handleCategoryClick(category.id), className: cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left", activeCategory === category.id
                                ? "bg-primary text-button-primary-text shadow-md"
                                : "hover:bg-surface/50 text-white"), children: [_jsx(IconComponent, { className: "w-4 h-4" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: category.name }), _jsx("div", { className: "text-xs opacity-70", children: category.description })] })] }, category.id));
                    })] })] }));
});
SettingsSubmenu.displayName = 'SettingsSubmenu';
//# sourceMappingURL=SettingsSubmenu.js.map