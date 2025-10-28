/**
 * Компонент для отображения сообщений чата
 */

import React from 'react';
import { ChatMessagesProps } from '../types';
import { MessageBubble } from './MessageBubble';

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    isProcessing,
    onRetryMessage,
    onDeleteMessage
}) => {
    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-text mb-2">Начните общение</h3>
                    <p className="text-text-secondary">Отправьте сообщение или используйте голосовой ввод</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
            <div className="p-6 space-y-4">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id || index}
                        message={message}
                        onRetry={() => onRetryMessage(message.id)}
                        onDelete={() => onDeleteMessage(message.id)}
                    />
                ))}

                {/* Индикатор обработки */}
                {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2 text-text-secondary">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                            <span className="text-sm">Обработка...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
