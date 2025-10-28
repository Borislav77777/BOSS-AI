import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент настроек поведения
 */
import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { Bell, Save, Type, Zap } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
export const BehaviorSettings = ({ showAdvanced, searchQuery: _searchQuery }) => {
    const { settings, updateSetting } = useSettings();
    const handleSettingChange = (key, value) => {
        updateSetting(key, value);
    };
    const behaviorItems = [
        {
            key: 'animations',
            label: 'Анимации',
            type: 'boolean',
            value: settings.animations,
            icon: Zap,
            onChange: (value) => handleSettingChange('animations', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'autoSave',
            label: 'Автосохранение',
            type: 'boolean',
            value: settings.autoSave,
            icon: Save,
            onChange: (value) => handleSettingChange('autoSave', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'useColoredText',
            label: 'Цветной текст',
            type: 'boolean',
            value: settings.useColoredText,
            icon: Type,
            onChange: (value) => handleSettingChange('useColoredText', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Bell, { className: "w-4 h-4 text-primary dark:text-white" }) }), _jsx("div", { children: _jsx("h2", { className: "text-lg font-semibold text-text", children: "\u041F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435" }) })] }), _jsx(CompactSettingsGroup, { title: "\u0417\u0432\u0443\u043A\u0438 \u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", className: "mb-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: behaviorItems.filter(item => ['sounds', 'notifications'].includes(item.key)).map((item) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(item.icon, { className: "w-4 h-4 text-text-secondary" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("div", { className: "text-sm font-medium text-text", children: item.label }) }), _jsx("div", { className: "flex-shrink-0", children: _jsx(SettingItem, { item: {
                                        id: item.key,
                                        name: '',
                                        description: '',
                                        type: 'boolean',
                                        value: item.value || false,
                                        onChange: (value) => item.onChange(value)
                                    }, onChange: handleSettingChange, className: "!p-0" }) })] }, item.key))) }) }), _jsxs(CompactSettingsGroup, { title: "\u0410\u0432\u0442\u043E\u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435", className: "mb-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: behaviorItems.filter(item => item.key === 'autoSave').map((item) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(item.icon, { className: "w-4 h-4 text-text-secondary" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("div", { className: "text-sm font-medium text-text", children: item.label }) }), _jsx("div", { className: "flex-shrink-0", children: _jsx(SettingItem, { item: {
                                            id: item.key,
                                            name: '',
                                            description: '',
                                            type: 'boolean',
                                            value: item.value || false,
                                            onChange: (value) => item.onChange(value)
                                        }, onChange: handleSettingChange, className: "!p-0" }) })] }, item.key))) }), _jsx("div", { className: "mt-4", children: _jsx(SettingItem, { item: {
                                id: 'autoSaveInterval',
                                name: 'Интервал автосохранения',
                                type: 'select',
                                value: settings.autoSaveInterval || 5000,
                                options: [
                                    { value: 1000, label: '1 секунда' },
                                    { value: 5000, label: '5 секунд' },
                                    { value: 10000, label: '10 секунд' },
                                    { value: 30000, label: '30 секунд' },
                                    { value: 60000, label: '1 минута' }
                                ],
                                onChange: (value) => handleSettingChange('autoSaveInterval', value)
                            }, onChange: handleSettingChange }) })] }), showAdvanced && (_jsx(CompactSettingsGroup, { title: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", className: "mb-6", children: _jsx("div", { className: "text-sm text-text-secondary", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u0431\u0443\u0434\u0443\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432 \u0431\u0443\u0434\u0443\u0449\u0438\u0445 \u0432\u0435\u0440\u0441\u0438\u044F\u0445." }) }))] }));
};
//# sourceMappingURL=BehaviorSettings.js.map