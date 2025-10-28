import { cn } from '@/utils/cn';
import { Save, X } from 'lucide-react';
import React, { memo, useCallback, useEffect, useState } from 'react';

interface DocumentEditorProps {
    isOpen: boolean;
    document: {
        id: string;
        title: string;
        content: string;
    } | null;
    onSave: (id: string, title: string, content: string) => void;
    onClose: () => void;
    className?: string;
}

/**
 * Редактор документов с возможностью редактирования содержимого
 */
export const DocumentEditor: React.FC<DocumentEditorProps> = memo(({
    isOpen,
    document,
    onSave,
    onClose,
    className = ''
}) => {
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
            if (!shouldClose) return;
        }
        onClose();
    }, [hasChanges, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    }, [handleClose, handleSave]);

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div
                className={cn(
                    "w-full max-w-4xl h-[80vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col",
                    className
                )}
                onKeyDown={handleKeyDown}
            >
                {/* Заголовок */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-primary">Редактор документа</h2>
                        {hasChanges && (
                            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-500 rounded-full">
                                Есть изменения
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className={cn(
                                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                                hasChanges
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                            title="Сохранить (Ctrl+S)"
                        >
                            <Save className="w-4 h-4" />
                            <span>Сохранить</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
                            title="Закрыть (Esc)"
                        >
                            <X className="w-4 h-4" />
                            <span>Закрыть</span>
                        </button>
                    </div>
                </div>

                {/* Содержимое */}
                <div className="flex-1 flex flex-col p-4 space-y-4">
                    {/* Название документа */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary">
                            Название документа
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Введите название документа"
                        />
                    </div>

                    {/* Содержимое документа */}
                    <div className="flex-1 flex flex-col space-y-2">
                        <label className="text-sm font-medium text-secondary">
                            Содержимое документа
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Введите содержимое документа..."
                        />
                    </div>

                    {/* Статистика */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                            <span>Символов: {content.length}</span>
                            <span>Слов: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
                            <span>Строк: {content.split('\n').length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Ctrl+S для сохранения</span>
                            <span>Esc для закрытия</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

DocumentEditor.displayName = 'DocumentEditor';
