import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент настроек макета
 */
import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { MessageSquare, Monitor, Sidebar } from 'lucide-react';
import React from 'react';
import { BooleanSettingsGrid } from '../common/BooleanSettingsGrid';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
export const LayoutSettings = ({ showAdvanced, searchQuery: _searchQuery }) => {
    const { settings, updateSetting } = useSettings();
    const layoutItems = [
        {
            key: 'sidebarCollapsed',
            title: 'Свернутый сайдбар',
            description: 'Свернуть боковую панель по умолчанию - скрывает левую панель навигации',
            type: 'boolean',
            value: settings.sidebarCollapsed,
            icon: Sidebar
        },
        {
            key: 'chatVisible',
            title: 'Видимость чата',
            description: 'Показывать панель чата по умолчанию - отображает правую панель чата',
            type: 'boolean',
            value: settings.chatVisible,
            icon: MessageSquare
        },
        {
            key: 'workspaceLayout',
            title: 'Макет рабочего пространства',
            description: 'Сетка или список для проектов',
            type: 'boolean',
            value: settings.workspaceLayout === 'grid',
            icon: Monitor
        }
    ];
    const handleSettingChange = (key, value) => {
        updateSetting(key, value);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Monitor, { className: "w-4 h-4 text-primary dark:text-white" }), _jsx("h2", { className: "text-base font-medium text-text", children: "\u041C\u0430\u043A\u0435\u0442" })] }), _jsxs(CompactSettingsGroup, { title: "\u0420\u0430\u0437\u043C\u0435\u0440\u044B \u043F\u0430\u043D\u0435\u043B\u0435\u0439", className: "mb-4", children: [_jsx(SettingItem, { item: {
                            id: 'chatWidth',
                            name: 'Ширина чата',
                            description: 'Ширина панели чата в пикселях',
                            type: 'number',
                            value: settings.chatWidth || 400,
                            min: 250,
                            max: 2000,
                            step: 10,
                            onChange: (value) => handleSettingChange('chatWidth', value)
                        }, onChange: handleSettingChange }), _jsx(SettingItem, { item: {
                            id: 'chatInputHeight',
                            name: 'Высота поля ввода',
                            description: 'Высота поля ввода чата в пикселях',
                            type: 'number',
                            value: settings.chatInputHeight || 300,
                            min: 256,
                            max: 800,
                            step: 10,
                            onChange: (value) => handleSettingChange('chatInputHeight', value)
                        }, onChange: handleSettingChange }), _jsx(SettingItem, { item: {
                            id: 'sidebarWidth',
                            name: 'Ширина сайдбара',
                            description: 'Ширина боковой панели в пикселях',
                            type: 'number',
                            value: settings.sidebarWidth || 300,
                            min: 256,
                            max: 600,
                            step: 10,
                            onChange: (value) => handleSettingChange('sidebarWidth', value)
                        }, onChange: handleSettingChange })] }), _jsx(CompactSettingsGroup, { title: "\u0412\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u0435\u0439", className: "mb-4", children: _jsx(BooleanSettingsGrid, { items: layoutItems, onSettingChange: handleSettingChange }) }), showAdvanced && (_jsx(CompactSettingsGroup, { title: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", className: "mb-6", children: _jsx("div", { className: "text-sm text-text-secondary", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u0430\u043A\u0435\u0442\u0430 \u0431\u0443\u0434\u0443\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432 \u0431\u0443\u0434\u0443\u0449\u0438\u0445 \u0432\u0435\u0440\u0441\u0438\u044F\u0445." }) }))] }));
};
//# sourceMappingURL=LayoutSettings.js.map