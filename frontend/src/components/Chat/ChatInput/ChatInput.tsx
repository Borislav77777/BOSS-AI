/**
 * Компонент поля ввода чата
 */

import { cn } from '@/utils';
import { Mic, Paperclip, Send } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatInputProps } from '../types';
import { ChatInputResizer } from './ChatInputResizer';

export const ChatInput: React.FC<ChatInputProps> = ({
    onInputResize,
    onSendMessage,
    onVoiceRecord,
    onVoiceStop,
    onFileUpload,
    isRecording,
    isProcessing
}) => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const filePickerRef = useRef<HTMLInputElement>(null);

    // Поддержка вставки промптов из сервиса "Промпты"
    useEffect(() => {
        const onInsertPrompt = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id?: string; body?: string } | undefined;
            const text = detail?.body || '';
            if (text) {
                setInputValue(prev => (prev ? `${prev}\n${text}` : text));
                textareaRef.current?.focus();
            }
        };
        window.addEventListener('chat:insert-prompt', onInsertPrompt as EventListener);
        return () => {
            window.removeEventListener('chat:insert-prompt', onInsertPrompt as EventListener);
        };
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        // Убираем автоматическое изменение высоты для фиксации нижней границы
    }, []);

    const handleSend = useCallback(() => {
        if (inputValue.trim() && !isProcessing) {
            onSendMessage(inputValue.trim());
            setInputValue('');
            // Убираем сброс высоты для фиксации нижней границы
        }
    }, [inputValue, onSendMessage, isProcessing]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleVoiceToggle = useCallback(() => {
        if (isRecording) {
            onVoiceStop();
        } else {
            onVoiceRecord();
        }
    }, [isRecording, onVoiceRecord, onVoiceStop]);

    const handlePickFiles = useCallback(() => {
        filePickerRef.current?.click();
    }, []);

    const handleFilesChosen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(onFileUpload);
            e.target.value = '';
        }
    }, [onFileUpload]);

    return (
        <div className="liquid-glass-block relative flex flex-col chat-input-container chat-input-absolute">
            {/* Регулировщик высоты поля ввода */}
            <ChatInputResizer onResize={onInputResize} />

            {/* Маленькая полоска над окном ввода */}
            <div className="header-divider-small"></div>

            <div className="p-6 flex-1 flex flex-col relative">
                {/* Градиентный разделитель сверху */}
                <div className="absolute top-0 left-0 right-0 h-px gradient-divider"></div>

                {/* Поле ввода */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Отправить сообщение или @agent для ИИ-помощника"
                            className={cn(
                                "w-full h-full px-5 pt-4 pb-16 pr-20 backdrop-blur-sm border rounded-2xl",
                                "focus:outline-none focus:ring-2 transition-all duration-200 shadow-lg",
                                "resize-none chat-textarea relative z-10",
                                "bg-surface/50 text-text placeholder-text-secondary",
                                "focus:ring-primary/50 focus:border-primary/50"
                            )}
                            disabled={isProcessing}
                            rows={3}
                        />

                        {/* Скрытый файловый инпут */}
                        <input
                            ref={filePickerRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFilesChosen}
                            aria-label="Выберите файлы для загрузки"
                            title="Выберите файлы для загрузки"
                        />

                        {/* Кнопки управления */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                            {/* Кнопка загрузки файла */}
                            <button
                                type="button"
                                onClick={handlePickFiles}
                                className={cn(
                                    "px-3 py-2 rounded-xl transition-all duration-200 border",
                                    "hover:bg-surface-hover text-text-secondary hover:text-text-primary",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                                )}
                                title="Загрузить файл"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>

                            {/* Кнопка голосового ввода */}
                            <button
                                type="button"
                                onClick={handleVoiceToggle}
                                className={cn(
                                    "px-3 py-2 rounded-xl transition-all duration-200 border",
                                    "hover:bg-surface-hover text-text-secondary hover:text-text-primary",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                    isRecording && "bg-primary text-background"
                                )}
                                title={isRecording ? "Остановить запись" : "Голосовой ввод"}
                            >
                                <Mic className="w-5 h-5" />
                            </button>

                            {/* Кнопка отправки */}
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isProcessing}
                                className={cn(
                                    "px-4 py-2 rounded-xl transition-all duration-200 border",
                                    "bg-primary text-background hover:bg-primary-hover",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                title="Отправить сообщение"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
