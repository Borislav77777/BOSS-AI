/**
 * Холст проекта - визуальное рабочее пространство
 * Позволяет работать с элементами проекта в интерактивном режиме
 */

import { WorkspaceItem } from '@/types';
import { cn } from '@/utils/cn';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectCanvasProps {
    project: WorkspaceItem;
    items: WorkspaceItem[];
    onItemClick: (item: WorkspaceItem) => void;
    onItemSendToChat: (item: WorkspaceItem) => void;
    onItemDelete: (item: WorkspaceItem) => void;
    className?: string;
}

interface CanvasItem {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'document' | 'image' | 'file' | 'note';
    title: string;
    content?: string;
    isSelected: boolean;
    isDragging: boolean;
}

// interface CanvasConnection {
//     id: string;
//     from: string;
//     to: string;
//     type: 'reference' | 'dependency' | 'related';
// }

export const ProjectCanvas: React.FC<ProjectCanvasProps> = ({
    project,
    items,
    onItemClick,
    onItemSendToChat,
    onItemDelete,
    className = ''
}) => {
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    // const [connections, setConnections] = useState<CanvasConnection[]>([]);
    // const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewMode, setViewMode] = useState<'canvas' | 'grid' | 'list'>('canvas');
    const canvasRef = useRef<HTMLDivElement>(null);

    // Инициализация элементов холста
    useEffect(() => {
        const canvasItems: CanvasItem[] = items.map((item, index) => ({
            id: item.id,
            x: 50 + (index % 4) * 200,
            y: 50 + Math.floor(index / 4) * 150,
            width: 180,
            height: 120,
            type: item.type as 'document' | 'image' | 'file' | 'note',
            title: item.title,
            content: item.content,
            isSelected: false,
            isDragging: false
        }));
        setCanvasItems(canvasItems);
    }, [items]);

    // Обработка клика по элементу
    const handleItemClick = useCallback((item: CanvasItem) => {
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemClick(workspaceItem);
        }
    }, [items, onItemClick]);

    // Обработка отправки в чат
    const handleSendToChat = useCallback((item: CanvasItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemSendToChat(workspaceItem);
        }
    }, [items, onItemSendToChat]);

    // Обработка удаления
    const handleDelete = useCallback((item: CanvasItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemDelete(workspaceItem);
        }
    }, [items, onItemDelete]);

    // Обработка начала перетаскивания
    const handleMouseDown = useCallback((item: CanvasItem, e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - item.x, y: e.clientY - item.y });

        setCanvasItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isDragging: true } : i
        ));
    }, []);

    // Обработка перетаскивания
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        setCanvasItems(prev => prev.map(item =>
            item.isDragging ? {
                ...item,
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            } : item
        ));
    }, [isDragging, dragStart]);

    // Обработка окончания перетаскивания
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setCanvasItems(prev => prev.map(item => ({ ...item, isDragging: false })));
    }, []);

    // Подписка на события мыши
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Получение иконки для типа элемента
    const getItemIcon = (type: string) => {
        switch (type) {
            case 'document':
                return '📄';
            case 'image':
                return '🖼️';
            case 'file':
                return '📁';
            case 'note':
                return '📝';
            default:
                return '📄';
        }
    };

    // Получение цвета для типа элемента
    const getItemColor = (type: string) => {
        switch (type) {
            case 'document':
                return 'bg-blue-100 border-blue-200 text-blue-800';
            case 'image':
                return 'bg-purple-100 border-purple-200 text-purple-800';
            case 'file':
                return 'bg-gray-100 border-gray-200 text-gray-800';
            case 'note':
                return 'bg-green-100 border-green-200 text-green-800';
            default:
                return 'bg-gray-100 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className={cn('project-canvas-container h-full flex flex-col', className)}>
            {/* Панель управления */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-text">
                        Холст проекта: {project.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">
                            {items.length} элементов
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Переключатель режимов */}
                    <div className="flex rounded-lg p-0.5 bg-surface border border-border">
                        <button
                            onClick={() => setViewMode('canvas')}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                viewMode === 'canvas'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-text-secondary hover:text-text'
                            )}
                        >
                            Холст
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-text-secondary hover:text-text'
                            )}
                        >
                            Сетка
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                viewMode === 'list'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-text-secondary hover:text-text'
                            )}
                        >
                            Список
                        </button>
                    </div>
                </div>
            </div>

            {/* Область холста */}
            <div
                ref={canvasRef}
                className="flex-1 relative overflow-auto bg-gradient-to-br from-surface/50 to-surface/30"
                style={{ minHeight: '400px' }}
            >
                {viewMode === 'canvas' ? (
                    // Режим холста
                    <div className="relative w-full h-full" style={{ minWidth: '800px', minHeight: '600px' }}>
                        {canvasItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'absolute cursor-pointer transition-all duration-200 rounded-lg border-2 p-3',
                                    getItemColor(item.type),
                                    item.isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-md hover:shadow-lg',
                                    item.isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                                )}
                                style={{
                                    left: item.x,
                                    top: item.y,
                                    width: item.width,
                                    height: item.height
                                }}
                                onClick={() => handleItemClick(item)}
                                onMouseDown={(e) => handleMouseDown(item, e)}
                            >
                                {/* Заголовок элемента */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getItemIcon(item.type)}</span>
                                        <span className="font-medium text-sm truncate">{item.title}</span>
                                    </div>

                                    {/* Кнопки действий */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleSendToChat(item, e)}
                                            className="p-1 rounded hover:bg-black/10 transition-colors"
                                            title="Отправить в чат"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m22 2-7 20-4-9-9-4Z"></path>
                                                <path d="M22 2 11 13"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item, e)}
                                            className="p-1 rounded hover:bg-red-100 transition-colors"
                                            title="Удалить"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" x2="6" y1="6" y2="18"></line>
                                                <line x1="6" x2="18" y1="6" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Содержимое элемента */}
                                {item.content && (
                                    <div className="text-xs text-text-secondary line-clamp-3">
                                        {item.content.substring(0, 100)}...
                                    </div>
                                )}

                                {/* Теги */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="text-xs text-text-secondary">
                                        {item.type}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : viewMode === 'grid' ? (
                    // Режим сетки
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg',
                                    getItemColor(item.type)
                                )}
                                onClick={() => onItemClick(item)}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{getItemIcon(item.type)}</span>
                                    <span className="font-medium text-sm truncate">{item.title}</span>
                                </div>
                                {item.content && (
                                    <div className="text-xs text-text-secondary line-clamp-2">
                                        {item.content.substring(0, 80)}...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Режим списка
                    <div className="p-4 space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                                    getItemColor(item.type)
                                )}
                                onClick={() => onItemClick(item)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{getItemIcon(item.type)}</span>
                                        <div>
                                            <div className="font-medium text-sm">{item.title}</div>
                                            {item.content && (
                                                <div className="text-xs text-text-secondary">
                                                    {item.content.substring(0, 100)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onItemSendToChat(item);
                                            }}
                                            className="p-1 rounded hover:bg-black/10 transition-colors"
                                            title="Отправить в чат"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m22 2-7 20-4-9-9-4Z"></path>
                                                <path d="M22 2 11 13"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onItemDelete(item);
                                            }}
                                            className="p-1 rounded hover:bg-red-100 transition-colors"
                                            title="Удалить"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" x2="6" y1="6" y2="18"></line>
                                                <line x1="6" x2="18" y1="6" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
