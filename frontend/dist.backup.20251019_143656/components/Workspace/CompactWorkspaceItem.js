import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/dateUtils';
import { Archive, File, FileText, Folder, Image, MoreVertical, Music, Send, Video } from 'lucide-react';
import { memo, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';
/**
 * Ультра-компактный компонент элемента рабочего пространства
 * Максимально сжатый дизайн для экономии места
 */
export const CompactWorkspaceItem = memo(({ item, isSelected, isChecked, isNew, onItemClick, onItemAction, onDocumentCheck }) => {
    const [showActions, setShowActions] = useState(false);
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
    return (_jsxs("div", { onClick: handleItemClick, onMouseEnter: () => setShowActions(true), onMouseLeave: () => setShowActions(false), className: cn('workspace-item group relative transition-all cursor-pointer rounded-md border p-2', 'hover:shadow-sm hover:scale-[1.01]', isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface/30', isNew ? 'animate-new-item' : ''), children: [_jsxs("div", { className: "flex items-center gap-2", children: [item.type === 'document' && (_jsx("input", { type: "checkbox", checked: isChecked, onChange: (e) => {
                            e.stopPropagation();
                            onDocumentCheck(item.id, e.target.checked);
                        }, className: "w-3 h-3 text-primary bg-background border-border rounded", title: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442" })), _jsx("div", { className: "text-muted-foreground flex-shrink-0", children: getItemIcon(item.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-xs font-medium truncate text-foreground", children: item.title }), _jsx("span", { className: "text-[10px] text-muted-foreground ml-2 flex-shrink-0", children: formatFileSize(item.size) })] }), item.tags.length > 0 && (_jsx("span", { className: "text-[9px] text-primary bg-primary/10 px-1 py-0.5 rounded", children: item.tags[0] }))] })] }), showActions && (_jsxs("div", { className: "absolute top-1 right-1 flex gap-0.5", children: [_jsx(UnifiedButton, { onClick: (e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'send-to-chat');
                        }, variant: "ghost", size: "sm", className: "w-5 h-5 p-0", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442", children: _jsx(Send, { className: "w-2.5 h-2.5" }) }), _jsx(UnifiedButton, { onClick: (e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'menu');
                        }, variant: "ghost", size: "sm", className: "w-5 h-5 p-0", title: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", children: _jsx(MoreVertical, { className: "w-2.5 h-2.5" }) })] })), isSelected && (_jsx("div", { className: "absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" }))] }));
});
CompactWorkspaceItem.displayName = 'CompactWorkspaceItem';
//# sourceMappingURL=CompactWorkspaceItem.js.map