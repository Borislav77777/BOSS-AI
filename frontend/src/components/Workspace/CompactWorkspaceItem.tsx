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
import { memo, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';

interface CompactWorkspaceItemProps {
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
    onItemClick: (itemId: string) => void;
    onItemAction: (itemId: string, action: string) => void;
    onDocumentCheck: (itemId: string, checked: boolean) => void;
}

/**
 * Ультра-компактный компонент элемента рабочего пространства
 * Максимально сжатый дизайн для экономии места
 */
export const CompactWorkspaceItem = memo<CompactWorkspaceItemProps>(({
    item,
    isSelected,
    isChecked,
    isNew,
    onItemClick,
    onItemAction,
    onDocumentCheck
}) => {
    const [showActions, setShowActions] = useState(false);

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

    return (
        <div
            onClick={handleItemClick}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={cn(
                'workspace-item group relative transition-all cursor-pointer rounded-md border p-2',
                'hover:shadow-sm hover:scale-[1.01]',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface/30',
                isNew ? 'animate-new-item' : ''
            )}
        >
            {/* Минимальный контент */}
            <div className="flex items-center gap-2">
                {/* Чекбокс для документов */}
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

                {/* Иконка */}
                <div className="text-muted-foreground flex-shrink-0">
                    {getItemIcon(item.type)}
                </div>

                {/* Название и размер */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium truncate text-foreground">
                            {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                            {formatFileSize(item.size)}
                        </span>
                    </div>

                    {/* Тег - только один */}
                    {item.tags.length > 0 && (
                        <span className="text-[9px] text-primary bg-primary/10 px-1 py-0.5 rounded">
                            {item.tags[0]}
                        </span>
                    )}
                </div>
            </div>

            {/* Минимальные действия */}
            {showActions && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                    <UnifiedButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'send-to-chat');
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-5 h-5 p-0"
                        title="Отправить в чат"
                    >
                        <Send className="w-2.5 h-2.5" />
                    </UnifiedButton>

                    <UnifiedButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'menu');
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-5 h-5 p-0"
                        title="Действия"
                    >
                        <MoreVertical className="w-2.5 h-2.5" />
                    </UnifiedButton>
                </div>
            )}

            {/* Индикатор выбора */}
            {isSelected && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
        </div>
    );
});

CompactWorkspaceItem.displayName = 'CompactWorkspaceItem';
