import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент поля ввода чата
 */
import { cn } from '@/utils';
import { Mic, Paperclip, Send } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatInputResizer } from './ChatInputResizer';
export const ChatInput = ({ onInputResize, onSendMessage, onVoiceRecord, onVoiceStop, onFileUpload, isRecording, isProcessing }) => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef(null);
    const filePickerRef = useRef(null);
    // Поддержка вставки промптов из сервиса "Промпты"
    useEffect(() => {
        const onInsertPrompt = (e) => {
            const detail = e.detail;
            const text = detail?.body || '';
            if (text) {
                setInputValue(prev => (prev ? `${prev}\n${text}` : text));
                textareaRef.current?.focus();
            }
        };
        window.addEventListener('chat:insert-prompt', onInsertPrompt);
        return () => {
            window.removeEventListener('chat:insert-prompt', onInsertPrompt);
        };
    }, []);
    const handleInputChange = useCallback((e) => {
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
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);
    const handleVoiceToggle = useCallback(() => {
        if (isRecording) {
            onVoiceStop();
        }
        else {
            onVoiceRecord();
        }
    }, [isRecording, onVoiceRecord, onVoiceStop]);
    const handlePickFiles = useCallback(() => {
        filePickerRef.current?.click();
    }, []);
    const handleFilesChosen = useCallback((e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(onFileUpload);
            e.target.value = '';
        }
    }, [onFileUpload]);
    return (_jsxs("div", { className: "liquid-glass-block relative flex flex-col chat-input-container chat-input-absolute", children: [_jsx(ChatInputResizer, { onResize: onInputResize }), _jsx("div", { className: "header-divider-small" }), _jsxs("div", { className: "p-6 flex-1 flex flex-col relative", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-px gradient-divider" }), _jsx("div", { className: "flex-1 flex flex-col", children: _jsxs("div", { className: "flex-1 relative", children: [_jsx("textarea", { ref: textareaRef, value: inputValue, onChange: handleInputChange, onKeyPress: handleKeyPress, placeholder: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 @agent \u0434\u043B\u044F \u0418\u0418-\u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A\u0430", className: cn("w-full h-full px-5 pt-4 pb-16 pr-20 backdrop-blur-sm border rounded-2xl", "focus:outline-none focus:ring-2 transition-all duration-200 shadow-lg", "resize-none chat-textarea relative z-10", "bg-surface/50 text-text placeholder-text-secondary", "focus:ring-primary/50 focus:border-primary/50"), disabled: isProcessing, rows: 3 }), _jsx("input", { ref: filePickerRef, type: "file", multiple: true, className: "hidden", onChange: handleFilesChosen, "aria-label": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438", title: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438" }), _jsxs("div", { className: "absolute bottom-4 right-4 flex items-center gap-2 z-20", children: [_jsx("button", { type: "button", onClick: handlePickFiles, className: cn("px-3 py-2 rounded-xl transition-all duration-200 border", "hover:bg-surface-hover text-text-secondary hover:text-text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50"), title: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B", children: _jsx(Paperclip, { className: "w-5 h-5" }) }), _jsx("button", { type: "button", onClick: handleVoiceToggle, className: cn("px-3 py-2 rounded-xl transition-all duration-200 border", "hover:bg-surface-hover text-text-secondary hover:text-text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50", isRecording && "bg-primary text-background"), title: isRecording ? "Остановить запись" : "Голосовой ввод", children: _jsx(Mic, { className: "w-5 h-5" }) }), _jsx("button", { type: "button", onClick: handleSend, disabled: !inputValue.trim() || isProcessing, className: cn("px-4 py-2 rounded-xl transition-all duration-200 border", "bg-primary text-background hover:bg-primary-hover", "focus:outline-none focus:ring-2 focus:ring-primary/50", "disabled:opacity-50 disabled:cursor-not-allowed"), title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435", children: _jsx(Send, { className: "w-5 h-5" }) })] })] }) })] })] }));
};
//# sourceMappingURL=ChatInput.js.map