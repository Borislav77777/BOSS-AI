/**
 * Компонент пузырька сообщения
 */

import { cn, formatTime } from '@/utils';
import { Copy, RotateCcw, Trash2 } from 'lucide-react';
import React from 'react';

interface MessageBubbleProps {
    message: any;
    onRetry: () => void;
    onDelete: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    onRetry,
    onDelete
}) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
    };

    return (
        <div className={cn(
            "flex",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                isUser && "bg-primary text-background",
                isAssistant && "bg-surface border border-border",
                isSystem && "bg-surface-hover border border-border"
            )}>
                {/* Содержимое сообщения */}
                <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                    </p>
                </div>

                {/* Метаданные сообщения */}
                <div className={cn(
                    "flex items-center justify-between mt-2 text-xs",
                    isUser ? "text-background/70" : "text-text-secondary"
                )}>
                    <span>{formatTime(message.timestamp)}</span>

                    {/* Действия с сообщением */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="p-1 rounded hover:bg-surface-hover transition-colors"
                            title="Копировать"
                        >
                            <Copy className="w-3 h-3" />
                        </button>

                        {isAssistant && (
                            <button
                                onClick={onRetry}
                                className="p-1 rounded hover:bg-surface-hover transition-colors"
                                title="Повторить"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </button>
                        )}

                        <button
                            onClick={onDelete}
                            className="p-1 rounded hover:bg-surface-hover transition-colors text-red-500"
                            title="Удалить"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
