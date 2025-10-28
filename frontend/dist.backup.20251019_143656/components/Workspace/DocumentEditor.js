import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { Save, X } from 'lucide-react';
import React, { memo, useCallback, useEffect, useState } from 'react';
/**
 * Редактор документов с возможностью редактирования содержимого
 */
export const DocumentEditor = memo(({ isOpen, document, onSave, onClose, className = '' }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    // Обновляем состояние при изменении документа
    useEffect(() => {
        if (document) {
            setTitle(document.title);
            setContent(document.content || '');
            setHasChanges(false);
        }
    }, [document]);
    // Отслеживаем изменения
    useEffect(() => {
        if (document) {
            const hasTitleChanged = title !== document.title;
            const hasContentChanged = content !== (document.content || '');
            setHasChanges(hasTitleChanged || hasContentChanged);
        }
    }, [title, content, document]);
    const handleSave = useCallback(() => {
        if (document && hasChanges) {
            onSave(document.id, title, content);
            setHasChanges(false);
        }
    }, [document, title, content, hasChanges, onSave]);
    const handleClose = useCallback(() => {
        if (hasChanges) {
            const shouldClose = window.confirm('У вас есть несохраненные изменения. Закрыть без сохранения?');
            if (!shouldClose)
                return;
        }
        onClose();
    }, [hasChanges, onClose]);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
        else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    }, [handleClose, handleSave]);
    if (!isOpen || !document)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm", children: _jsxs("div", { className: cn("w-full max-w-4xl h-[80vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col", className), onKeyDown: handleKeyDown, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("h2", { className: "text-lg font-semibold text-primary", children: "\u0420\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430" }), hasChanges && (_jsx("span", { className: "px-2 py-1 text-xs bg-orange-500/20 text-orange-500 rounded-full", children: "\u0415\u0441\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: handleSave, disabled: !hasChanges, className: cn("flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors", hasChanges
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"), title: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C (Ctrl+S)", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] }), _jsxs("button", { onClick: handleClose, className: "flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C (Esc)", children: [_jsx(X, { className: "w-4 h-4" }), _jsx("span", { children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col p-4 space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-secondary", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430" })] }), _jsxs("div", { className: "flex-1 flex flex-col space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-secondary", children: "\u0421\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430" }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), className: "flex-1 w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430..." })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { children: ["\u0421\u0438\u043C\u0432\u043E\u043B\u043E\u0432: ", content.length] }), _jsxs("span", { children: ["\u0421\u043B\u043E\u0432: ", content.split(/\s+/).filter(word => word.length > 0).length] }), _jsxs("span", { children: ["\u0421\u0442\u0440\u043E\u043A: ", content.split('\n').length] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "Ctrl+S \u0434\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F" }), _jsx("span", { children: "Esc \u0434\u043B\u044F \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F" })] })] })] })] }) }));
});
DocumentEditor.displayName = 'DocumentEditor';
//# sourceMappingURL=DocumentEditor.js.map