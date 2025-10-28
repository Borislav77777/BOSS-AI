/**
 * Модульная версия Chat компонента
 */

import { cn } from '@/utils';
import React from 'react';
import { ChatControls } from './ChatControls/ChatControls';
import { ChatInput } from './ChatInput/ChatInput';
import { ChatMessages } from './ChatMessages/ChatMessages';
import { useChat } from './hooks/useChat';
import { ChatProps } from './types';

const GPT_MODELS = [
    {
        id: 'gpt-5-nano',
        name: 'GPT-5 Nano',
        description: 'Быстрая и экономичная модель GPT-5',
        cost: 'low',
        isDefault: true
    },
    {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini',
        description: 'Компактная версия GPT-5',
        cost: 'medium'
    },
    {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Самая мощная модель GPT-5',
        cost: 'high'
    }
];

export const ChatModular: React.FC<ChatProps> = ({ className, onInputResize }) => {
    const { chatState, chatActions } = useChat();

    return (
        <div className={cn(
            "h-full flex flex-col bg-background",
            className
        )}>
            {/* Заголовок чата */}
            <div className="flex-shrink-0 p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text">Чат</h2>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-text-secondary">Онлайн</span>
                    </div>
                </div>
            </div>

            {/* Основная область чата */}
            <div className="flex-1 flex min-h-0">
                {/* Сообщения */}
                <div className="flex-1 flex flex-col min-h-0">
                    <ChatMessages
                        messages={chatState.messages}
                        isProcessing={chatState.isProcessing}
                        onRetryMessage={chatActions.retryMessage}
                        onDeleteMessage={chatActions.deleteMessage}
                    />
                </div>

                {/* Панель управления */}
                <div className="w-80 border-l border-border bg-surface/50 p-4">
                    <ChatControls
                        onServiceSelect={chatActions.selectService}
                        onModelSelect={chatActions.selectModel}
                        onButtonClick={() => {}} // TODO: реализовать обработку кнопок
                        selectedService={chatState.selectedService}
                        selectedModel={chatState.selectedModel}
                        availableServices={[]} // TODO: получить из контекста
                        availableModels={GPT_MODELS}
                    />
                </div>
            </div>

            {/* Поле ввода */}
            <div className="flex-shrink-0">
                <ChatInput
                    onInputResize={onInputResize}
                    onSendMessage={chatActions.sendMessage}
                    onVoiceRecord={chatActions.startVoiceRecord}
                    onVoiceStop={chatActions.stopVoiceRecord}
                    onFileUpload={chatActions.uploadFile}
                    isRecording={chatState.isRecording}
                    isProcessing={chatState.isProcessing}
                />
            </div>
        </div>
    );
};
