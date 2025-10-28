/**
 * Компонент настроек чата
 */

import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { MessageSquare, Mic, Paperclip, Settings, Timer } from 'lucide-react';
import React from 'react';
import { BooleanSettingsGrid } from '../common/BooleanSettingsGrid';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const ChatSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced: _showAdvanced,
    searchQuery: _searchQuery
}) => {
    const { settings, updateSetting } = useSettings();

    const handleSettingChange = (key: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updateSetting(key, value);
    };

    const chatItems: Array<{ key: string; value: boolean; label: string; type: 'boolean'; icon: React.ComponentType<{ className?: string; }>; onChange: (value: any) => void; }> = [ // eslint-disable-line @typescript-eslint/no-explicit-any
        {
            key: 'showTimestamps',
            label: 'Показывать время',
            type: 'boolean',
            value: settings.showTimestamps as boolean,
            icon: Timer,
            onChange: (value: any) => handleSettingChange('showTimestamps', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'autoScroll',
            label: 'Автопрокрутка',
            type: 'boolean',
            value: settings.autoScroll as boolean,
            icon: Settings,
            onChange: (value: any) => handleSettingChange('autoScroll', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'enableVoice',
            label: 'Голосовые сообщения',
            type: 'boolean',
            value: settings.enableVoice as boolean,
            icon: Mic,
            onChange: (value: any) => handleSettingChange('enableVoice', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'enableFileUpload',
            label: 'Загрузка файлов',
            type: 'boolean',
            value: settings.enableFileUpload as boolean,
            icon: Paperclip,
            onChange: (value: any) => handleSettingChange('enableFileUpload', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'hideChatFunctionButtons',
            label: 'Скрыть кнопки функций',
            type: 'boolean',
            value: settings.hideChatFunctionButtons as boolean,
            icon: MessageSquare,
            onChange: (value: any) => handleSettingChange('hideChatFunctionButtons', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    ];

    return (
        <div className="space-y-4">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-4 h-4 text-primary dark:text-white" />
                <h2 className="text-base font-medium text-text">Чат</h2>
            </div>

            {/* Размеры чата */}
            <CompactSettingsGroup
                title="Размеры чата"
                className="mb-4"
            >
                <SettingItem
                    item={{
                        id: 'chatWidth',
                        name: 'Ширина чата',
                        description: 'Ширина панели чата в пикселях',
                        type: 'number',
                        value: settings.chatWidth || 400,
                        min: 250,
                        max: 2000,
                        step: 10,
                        onChange: (value) => handleSettingChange('chatWidth', value)
                    }}
                    onChange={handleSettingChange}
                />

                <SettingItem
                    item={{
                        id: 'chatInputHeight',
                        name: 'Высота поля ввода',
                        description: 'Высота поля ввода чата в пикселях',
                        type: 'number',
                        value: settings.chatInputHeight || 300,
                        min: 256,
                        max: 800,
                        step: 10,
                        onChange: (value) => handleSettingChange('chatInputHeight', value)
                    }}
                    onChange={handleSettingChange}
                />

                <SettingItem
                    item={{
                        id: 'maxMessages',
                        name: 'Максимум сообщений',
                        description: 'Максимальное количество сообщений в чате',
                        type: 'number',
                        value: settings.maxMessages || 100,
                        min: 50,
                        max: 1000,
                        step: 50,
                        onChange: (value) => handleSettingChange('maxMessages', value)
                    }}
                    onChange={handleSettingChange}
                />
            </CompactSettingsGroup>

            {/* Основные настройки чата */}
            <CompactSettingsGroup
                title="Основные настройки"
                description="Основные параметры чата"
            >
                <BooleanSettingsGrid
                    items={chatItems}
                    onSettingChange={handleSettingChange}
                />
            </CompactSettingsGroup>
        </div>
    );
};
