import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// interface CanvasConnection {
//     id: string;
//     from: string;
//     to: string;
//     type: 'reference' | 'dependency' | 'related';
// }
export const ProjectCanvas = ({ project, items, onItemClick, onItemSendToChat, onItemDelete, className = '' }) => {
    const [canvasItems, setCanvasItems] = useState([]);
    // const [connections, setConnections] = useState<CanvasConnection[]>([]);
    // const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewMode, setViewMode] = useState('canvas');
    const canvasRef = useRef(null);
    // Инициализация элементов холста
    useEffect(() => {
        const canvasItems = items.map((item, index) => ({
            id: item.id,
            x: 50 + (index % 4) * 200,
            y: 50 + Math.floor(index / 4) * 150,
            width: 180,
            height: 120,
            type: item.type,
            title: item.title,
            content: item.content,
            isSelected: false,
            isDragging: false
        }));
        setCanvasItems(canvasItems);
    }, [items]);
    // Обработка клика по элементу
    const handleItemClick = useCallback((item) => {
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemClick(workspaceItem);
        }
    }, [items, onItemClick]);
    // Обработка отправки в чат
    const handleSendToChat = useCallback((item, e) => {
        e.stopPropagation();
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemSendToChat(workspaceItem);
        }
    }, [items, onItemSendToChat]);
    // Обработка удаления
    const handleDelete = useCallback((item, e) => {
        e.stopPropagation();
        const workspaceItem = items.find(i => i.id === item.id);
        if (workspaceItem) {
            onItemDelete(workspaceItem);
        }
    }, [items, onItemDelete]);
    // Обработка начала перетаскивания
    const handleMouseDown = useCallback((item, e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - item.x, y: e.clientY - item.y });
        setCanvasItems(prev => prev.map(i => i.id === item.id ? { ...i, isDragging: true } : i));
    }, []);
    // Обработка перетаскивания
    const handleMouseMove = useCallback((e) => {
        if (!isDragging)
            return;
        setCanvasItems(prev => prev.map(item => item.isDragging ? {
            ...item,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        } : item));
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
    const getItemIcon = (type) => {
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
    const getItemColor = (type) => {
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
    return (_jsxs("div", { className: cn('project-canvas-container h-full flex flex-col', className), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-text", children: ["\u0425\u043E\u043B\u0441\u0442 \u043F\u0440\u043E\u0435\u043A\u0442\u0430: ", project.title] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-sm text-text-secondary", children: [items.length, " \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"] }) })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "flex rounded-lg p-0.5 bg-surface border border-border", children: [_jsx("button", { onClick: () => setViewMode('canvas'), className: cn('px-3 py-1.5 text-sm rounded-md transition-colors', viewMode === 'canvas'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-text-secondary hover:text-text'), children: "\u0425\u043E\u043B\u0441\u0442" }), _jsx("button", { onClick: () => setViewMode('grid'), className: cn('px-3 py-1.5 text-sm rounded-md transition-colors', viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-text-secondary hover:text-text'), children: "\u0421\u0435\u0442\u043A\u0430" }), _jsx("button", { onClick: () => setViewMode('list'), className: cn('px-3 py-1.5 text-sm rounded-md transition-colors', viewMode === 'list'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-text-secondary hover:text-text'), children: "\u0421\u043F\u0438\u0441\u043E\u043A" })] }) })] }), _jsx("div", { ref: canvasRef, className: "flex-1 relative overflow-auto bg-gradient-to-br from-surface/50 to-surface/30", style: { minHeight: '400px' }, children: viewMode === 'canvas' ? (
                // Режим холста
                _jsx("div", { className: "relative w-full h-full", style: { minWidth: '800px', minHeight: '600px' }, children: canvasItems.map((item) => (_jsxs("div", { className: cn('absolute cursor-pointer transition-all duration-200 rounded-lg border-2 p-3', getItemColor(item.type), item.isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-md hover:shadow-lg', item.isSelected ? 'ring-2 ring-primary ring-offset-2' : ''), style: {
                            left: item.x,
                            top: item.y,
                            width: item.width,
                            height: item.height
                        }, onClick: () => handleItemClick(item), onMouseDown: (e) => handleMouseDown(item, e), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: getItemIcon(item.type) }), _jsx("span", { className: "font-medium text-sm truncate", children: item.title })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: (e) => handleSendToChat(item, e), className: "p-1 rounded hover:bg-black/10 transition-colors", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "m22 2-7 20-4-9-9-4Z" }), _jsx("path", { d: "M22 2 11 13" })] }) }), _jsx("button", { onClick: (e) => handleDelete(item, e), className: "p-1 rounded hover:bg-red-100 transition-colors", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "18", x2: "6", y1: "6", y2: "18" }), _jsx("line", { x1: "6", x2: "18", y1: "6", y2: "18" })] }) })] })] }), item.content && (_jsxs("div", { className: "text-xs text-text-secondary line-clamp-3", children: [item.content.substring(0, 100), "..."] })), _jsx("div", { className: "absolute bottom-2 left-2 right-2", children: _jsx("div", { className: "text-xs text-text-secondary", children: item.type }) })] }, item.id))) })) : viewMode === 'grid' ? (
                // Режим сетки
                _jsx("div", { className: "p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: items.map((item) => (_jsxs("div", { className: cn('p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg', getItemColor(item.type)), onClick: () => onItemClick(item), children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-lg", children: getItemIcon(item.type) }), _jsx("span", { className: "font-medium text-sm truncate", children: item.title })] }), item.content && (_jsxs("div", { className: "text-xs text-text-secondary line-clamp-2", children: [item.content.substring(0, 80), "..."] }))] }, item.id))) })) : (
                // Режим списка
                _jsx("div", { className: "p-4 space-y-2", children: items.map((item) => (_jsx("div", { className: cn('p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md', getItemColor(item.type)), onClick: () => onItemClick(item), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg", children: getItemIcon(item.type) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: item.title }), item.content && (_jsxs("div", { className: "text-xs text-text-secondary", children: [item.content.substring(0, 100), "..."] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                onItemSendToChat(item);
                                            }, className: "p-1 rounded hover:bg-black/10 transition-colors", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "m22 2-7 20-4-9-9-4Z" }), _jsx("path", { d: "M22 2 11 13" })] }) }), _jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                onItemDelete(item);
                                            }, className: "p-1 rounded hover:bg-red-100 transition-colors", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "18", x2: "6", y1: "6", y2: "18" }), _jsx("line", { x1: "6", x2: "18", y1: "6", y2: "18" })] }) })] })] }) }, item.id))) })) })] }));
};
//# sourceMappingURL=ProjectCanvas.js.map