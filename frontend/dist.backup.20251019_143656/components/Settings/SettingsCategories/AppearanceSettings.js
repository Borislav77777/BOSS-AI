import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент настроек внешнего вида
 */
import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { Palette } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
export const AppearanceSettings = ({ showAdvanced, searchQuery: _searchQuery }) => {
    const { settings, updateSetting } = useSettings();
    const appearanceItems = [
        {
            id: 'animations',
            name: 'Анимации',
            description: 'Плавно',
            type: 'boolean',
            value: settings.animations,
            onChange: (value) => handleSettingChange('animations', value)
        }
    ];
    const handleSettingChange = (key, value) => {
        updateSetting(key, value);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Palette, { className: "w-4 h-4 text-primary dark:text-white" }) }), _jsx("div", { children: _jsx("h2", { className: "text-lg font-semibold text-text", children: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434" }) })] }), _jsx(CompactSettingsGroup, { title: "\u0422\u0435\u043C\u0430", className: "mb-6", children: _jsx(SettingItem, { item: {
                        id: 'theme',
                        name: 'Цветовая тема',
                        description: 'Схема',
                        type: 'select',
                        value: settings.theme || 'dark',
                        options: [
                            { value: 'light', label: 'Светлая' },
                            { value: 'dark', label: 'Темная' }
                        ],
                        onChange: (value) => handleSettingChange('theme', value)
                    }, onChange: handleSettingChange }) }), _jsx(CompactSettingsGroup, { title: "\u0410\u043D\u0438\u043C\u0430\u0446\u0438\u0438", className: "mb-6", children: _jsx(SettingItem, { item: appearanceItems[0], onChange: handleSettingChange }) }), showAdvanced && (_jsx(CompactSettingsGroup, { title: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", description: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E", className: "mb-6", children: _jsx("div", { className: "text-sm text-text-secondary", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E \u0432\u0438\u0434\u0430 \u0431\u0443\u0434\u0443\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432 \u0431\u0443\u0434\u0443\u0449\u0438\u0445 \u0432\u0435\u0440\u0441\u0438\u044F\u0445." }) }))] }));
};
//# sourceMappingURL=AppearanceSettings.js.map