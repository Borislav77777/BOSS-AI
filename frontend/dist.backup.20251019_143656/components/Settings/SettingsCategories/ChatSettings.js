import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент настроек чата
 */
import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { MessageSquare, Mic, Paperclip, Settings, Timer } from 'lucide-react';
import React from 'react';
import { BooleanSettingsGrid } from '../common/BooleanSettingsGrid';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
export const ChatSettings = ({ showAdvanced: _showAdvanced, searchQuery: _searchQuery }) => {
    const { settings, updateSetting } = useSettings();
    const handleSettingChange = (key, value) => {
        updateSetting(key, value);
    };
    const chatItems = [
        {
            key: 'showTimestamps',
            label: 'Показывать время',
            type: 'boolean',
            value: settings.showTimestamps,
            icon: Timer,
            onChange: (value) => handleSettingChange('showTimestamps', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'autoScroll',
            label: 'Автопрокрутка',
            type: 'boolean',
            value: settings.autoScroll,
            icon: Settings,
            onChange: (value) => handleSettingChange('autoScroll', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'enableVoice',
            label: 'Голосовые сообщения',
            type: 'boolean',
            value: settings.enableVoice,
            icon: Mic,
            onChange: (value) => handleSettingChange('enableVoice', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'enableFileUpload',
            label: 'Загрузка файлов',
            type: 'boolean',
            value: settings.enableFileUpload,
            icon: Paperclip,
            onChange: (value) => handleSettingChange('enableFileUpload', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'hideChatFunctionButtons',
            label: 'Скрыть кнопки функций',
            type: 'boolean',
            value: settings.hideChatFunctionButtons,
            icon: MessageSquare,
            onChange: (value) => handleSettingChange('hideChatFunctionButtons', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(MessageSquare, { className: "w-4 h-4 text-primary dark:text-white" }), _jsx("h2", { className: "text-base font-medium text-text", children: "\u0427\u0430\u0442" })] }), _jsxs(CompactSettingsGroup, { title: "\u0420\u0430\u0437\u043C\u0435\u0440\u044B \u0447\u0430\u0442\u0430", className: "mb-4", children: [_jsx(SettingItem, { item: {
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
                            id: 'maxMessages',
                            name: 'Максимум сообщений',
                            description: 'Максимальное количество сообщений в чате',
                            type: 'number',
                            value: settings.maxMessages || 100,
                            min: 50,
                            max: 1000,
                            step: 50,
                            onChange: (value) => handleSettingChange('maxMessages', value)
                        }, onChange: handleSettingChange })] }), _jsx(CompactSettingsGroup, { title: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", description: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0447\u0430\u0442\u0430", children: _jsx(BooleanSettingsGrid, { items: chatItems, onSettingChange: handleSettingChange }) })] }));
};
//# sourceMappingURL=ChatSettings.js.map