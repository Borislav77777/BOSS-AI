import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/dateUtils';
import { Archive, File, FileText, Folder, Image, MoreVertical, Music, Send, Video } from 'lucide-react';
import React, { memo, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';
/**
 * Мемоизированный компонент элемента рабочего пространства
 * Предотвращает ненужные перерендеры при изменении других элементов
 */
export const WorkspaceItem = memo(({ item, isSelected, isChecked, isNew, viewMode, onItemClick, onItemAction, onDocumentCheck }) => {
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const getItemIcon = (type) => {
        const iconProps = { className: "w-3 h-3" };
        switch (type) {
            case 'document':
                return _jsx(FileText, { ...iconProps });
            case 'folder':
                return _jsx(Folder, { ...iconProps });
            case 'image':
                return _jsx(Image, { ...iconProps });
            case 'video':
                return _jsx(Video, { ...iconProps });
            case 'audio':
                return _jsx(Music, { ...iconProps });
            case 'archive':
                return _jsx(Archive, { ...iconProps });
            default:
                return _jsx(File, { ...iconProps });
        }
    };
    const handleItemClick = () => {
        onItemClick(item.id);
    };
    const handleActionClick = (e) => {
        e.stopPropagation();
        onItemAction(item.id, 'menu');
    };
    const emojis = ['📁', '📝', '📷', '🎵', '🎬', '🚀', '⭐', '🔥', '💡', '✅', '🧠', '⚙️', '🌈', '🧪', '🏷️'];
    return (_jsxs("div", { onClick: handleItemClick, onMouseEnter: () => setShowActions(true), onMouseLeave: () => setShowActions(false), className: cn('workspace-item group relative transition-all cursor-pointer rounded-lg border', 'hover:shadow-md hover:scale-[1.02]', isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface/50', isNew ? 'animate-new-item' : ''), children: [_jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [item.type === 'document' && (_jsx("input", { type: "checkbox", checked: isChecked, onChange: (e) => {
                                    e.stopPropagation();
                                    onDocumentCheck(item.id, e.target.checked);
                                }, className: "w-3 h-3 text-primary bg-background border-border rounded", title: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442" })), _jsx("div", { className: "text-muted-foreground", children: getItemIcon(item.type) }), _jsx("button", { className: "text-sm hover:bg-surface-hover rounded px-1 py-0.5 transition-colors", onClick: (e) => {
                                    e.stopPropagation();
                                    setShowEmojiPicker(!showEmojiPicker);
                                }, title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u044D\u043C\u043E\u0434\u0437\u0438", children: item.emoji || '🏷️' }), _jsx("h4", { className: "text-sm font-medium truncate text-foreground flex-1", children: item.title })] }), showEmojiPicker && (_jsx("div", { className: "absolute top-12 left-2 z-20 p-2 bg-surface border border-border rounded-lg shadow-lg", children: _jsx("div", { className: "grid grid-cols-5 gap-1", children: emojis.map((emoji) => (_jsx("button", { className: "p-1 hover:bg-surface-hover rounded text-xs", onClick: (e) => {
                                    e.stopPropagation();
                                    onItemAction(item.id, `set-emoji:${emoji}`);
                                    setShowEmojiPicker(false);
                                }, children: emoji }, emoji))) }) })), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: formatFileSize(item.size) }), viewMode !== 'compact' && (_jsx("span", { children: item.updatedAt.toLocaleDateString() }))] }), item.tags.length > 0 && (_jsx("div", { className: "mt-2", children: _jsxs("span", { className: "inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary", children: [item.tags[0], item.tags.length > 1 && ` +${item.tags.length - 1}`] }) }))] }), showActions && (_jsxs("div", { className: "absolute top-2 right-2 flex gap-1", children: [_jsx(UnifiedButton, { onClick: (e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'send-to-chat');
                        }, variant: "ghost", size: "sm", className: "w-6 h-6 p-0", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442", children: _jsx(Send, { className: "w-3 h-3" }) }), _jsx(UnifiedButton, { onClick: handleActionClick, variant: "ghost", size: "sm", className: "w-6 h-6 p-0", title: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", children: _jsx(MoreVertical, { className: "w-3 h-3" }) })] })), isSelected && (_jsx("div", { className: "absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" }))] }));
});
WorkspaceItem.displayName = 'WorkspaceItem';
//# sourceMappingURL=WorkspaceItem.js.map