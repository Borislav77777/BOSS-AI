import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/dateUtils';
import {
    Archive,
    File,
    FileText,
    Folder,
    Image,
    MoreVertical,
    Music,
    Send,
    Video
} from 'lucide-react';
import React, { memo, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';

interface WorkspaceItemProps {
    item: {
        id: string;
        type: string;
        title: string;
        size: number;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    };
    isSelected: boolean;
    isChecked: boolean;
    isNew: boolean;
    viewMode: 'grid' | 'list' | 'compact';
    onItemClick: (itemId: string) => void;
    onItemAction: (itemId: string, action: string) => void;
    onItemRename: (itemId: string, newName: string) => void;
    onDocumentCheck: (itemId: string, checked: boolean) => void;
    onEditCancel: () => void;
}

/**
 * Мемоизированный компонент элемента рабочего пространства
 * Предотвращает ненужные перерендеры при изменении других элементов
 */
export const WorkspaceItem = memo<WorkspaceItemProps>(({
    item,
    isSelected,
    isChecked,
    isNew,
    viewMode,
    onItemClick,
    onItemAction,
    onDocumentCheck
}) => {
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const getItemIcon = (type: string) => {
        const iconProps = { className: "w-3 h-3" };

        switch (type) {
            case 'document':
                return <FileText {...iconProps} />;
            case 'folder':
                return <Folder {...iconProps} />;
            case 'image':
                return <Image {...iconProps} />;
            case 'video':
                return <Video {...iconProps} />;
            case 'audio':
                return <Music {...iconProps} />;
            case 'archive':
                return <Archive {...iconProps} />;
            default:
                return <File {...iconProps} />;
        }
    };

    const handleItemClick = () => {
        onItemClick(item.id);
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onItemAction(item.id, 'menu');
    };

    const emojis = ['📁', '📝', '📷', '🎵', '🎬', '🚀', '⭐', '🔥', '💡', '✅', '🧠', '⚙️', '🌈', '🧪', '🏷️'];

    return (
        <div
            onClick={handleItemClick}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={cn(
                'workspace-item group relative transition-all cursor-pointer rounded-lg border',
                'hover:shadow-md hover:scale-[1.02]',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface/50',
                isNew ? 'animate-new-item' : ''
            )}
        >
            {/* Компактный контент */}
            <div className="p-3">
                {/* Заголовок с иконкой и эмодзи */}
                <div className="flex items-center gap-2 mb-2">
                    {item.type === 'document' && (
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                                e.stopPropagation();
                                onDocumentCheck(item.id, e.target.checked);
                            }}
                            className="w-3 h-3 text-primary bg-background border-border rounded"
                            title="Выбрать документ"
                        />
                    )}

                    <div className="text-muted-foreground">{getItemIcon(item.type)}</div>

                    <button
                        className="text-sm hover:bg-surface-hover rounded px-1 py-0.5 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEmojiPicker(!showEmojiPicker);
                        }}
                        title="Изменить эмодзи"
                    >
                        {(item as { emoji?: string }).emoji || '🏷️'}
                    </button>

                    <h4 className="text-sm font-medium truncate text-foreground flex-1">
                        {item.title}
                    </h4>
                </div>

                {/* Emoji picker - компактный */}
                {showEmojiPicker && (
                    <div className="absolute top-12 left-2 z-20 p-2 bg-surface border border-border rounded-lg shadow-lg">
                        <div className="grid grid-cols-5 gap-1">
                            {emojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    className="p-1 hover:bg-surface-hover rounded text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onItemAction(item.id, `set-emoji:${emoji}`);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Информация о файле */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(item.size)}</span>
                    {viewMode !== 'compact' && (
                        <span>{item.updatedAt.toLocaleDateString()}</span>
                    )}
                </div>

                {/* Теги - только один в компактном режиме */}
                {item.tags.length > 0 && (
                    <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {item.tags[0]}
                            {item.tags.length > 1 && ` +${item.tags.length - 1}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Компактные действия - появляются при hover */}
            {showActions && (
                <div className="absolute top-2 right-2 flex gap-1">
                    <UnifiedButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'send-to-chat');
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        title="Отправить в чат"
                    >
                        <Send className="w-3 h-3" />
                    </UnifiedButton>

                    <UnifiedButton
                        onClick={handleActionClick}
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        title="Действия"
                    >
                        <MoreVertical className="w-3 h-3" />
                    </UnifiedButton>
                </div>
            )}

            {/* Индикатор выбора */}
            {isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
        </div>
    );
});

WorkspaceItem.displayName = 'WorkspaceItem';
