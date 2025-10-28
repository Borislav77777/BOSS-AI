import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/utils';
import { Edit3, Filter, Folder, Grid, LayoutGrid, List, Plus, Search, Send, Share2, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';
import { CompactWorkspaceItem } from './CompactWorkspaceItem';
import { DocumentEditor } from './DocumentEditor';
import { ProjectCanvas } from './ProjectCanvas';
import { WorkspaceItem } from './WorkspaceItem';
export const Workspace = ({ className }) => {
    const { state, createWorkspaceItem, dispatch, sendMessage } = usePlatform();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [checkedDocuments, setCheckedDocuments] = useState(new Set());
    const [viewMode, setViewMode] = useState('compact');
    const [newItemIds, setNewItemIds] = useState(new Set());
    const [sentToChatIds, setSentToChatIds] = useState(new Set());
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [editingDocument, setEditingDocument] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearchClosing, setIsSearchClosing] = useState(false);
    const searchContainerRef = useRef(null);
    const searchInputRef = useRef(null);
    const getProjectById = useCallback((id) => state.workspaceItems.find(i => i.id === id && i.type === 'folder') || null, [state.workspaceItems]);
    // Закрыть поиск при потере фокуса (анимация scale-out), введённый текст сохраняем
    const handleSearchBlur = useCallback(() => {
        setTimeout(() => {
            const container = searchContainerRef.current;
            const active = document.activeElement;
            if (!container || !active || !container.contains(active)) {
                setIsSearchClosing(true);
            }
        }, 0);
    }, []);
    useEffect(() => {
        if (!isSearchClosing)
            return;
        const timer = setTimeout(() => {
            setIsSearchOpen(false);
            setIsSearchClosing(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [isSearchClosing]);
    // const [editingItem, setEditingItem] = useState<string | null>(null);
    const items = state.workspaceItems;
    const rootProjects = useMemo(() => items.filter(i => i.type === 'folder'), [items]);
    const activeProject = useMemo(() => items.find(i => i.id === activeProjectId && i.type === 'folder') || null, [items, activeProjectId]);
    const currentItems = useMemo(() => {
        if (!activeProject)
            return rootProjects;
        const projectPath = `/workspaces/${activeProject.id}/`;
        return items.filter(i => i.path?.startsWith(projectPath));
    }, [items, rootProjects, activeProject]);
    // Мемоизированная фильтрация элементов
    const filteredItems = useMemo(() => currentItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))), [currentItems, searchQuery]);
    // Навигация в проект из сайдбара
    useEffect(() => {
        const handler = (e) => {
            const custom = e;
            if (custom.detail?.projectId) {
                setActiveProjectId(custom.detail.projectId);
            }
        };
        window.addEventListener('workspace:navigate', handler);
        return () => window.removeEventListener('workspace:navigate', handler);
    }, [state.workspaceItems]);
    const handleCreateItem = () => {
        // В корне создаём проект, внутри проекта — документ
        if (!activeProject) {
            const newId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newProj = {
                id: newId,
                type: 'folder',
                title: 'Новый проект',
                path: '/workspaces/',
                size: 0,
                tags: ['project'],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            createWorkspaceItem(newProj);
            setNewItemIds(prev => new Set([...prev, newId]));
            setTimeout(() => setNewItemIds(prev => { const s = new Set(prev); s.delete(newId); return s; }), 1000);
            return;
        }
        const newId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
            id: newId,
            type: 'document',
            title: 'Новый документ',
            content: '',
            path: `/workspaces/${activeProject.id}/`,
            size: 0,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        createWorkspaceItem(newItem);
        setNewItemIds(prev => new Set([...prev, newId]));
        setTimeout(() => {
            setNewItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(newId);
                return newSet;
            });
        }, 1000);
    };
    // Мемоизированные обработчики
    const handleItemClick = useCallback((itemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            }
            else {
                newSet.add(itemId);
            }
            return newSet;
        });
        const clicked = state.workspaceItems.find(i => i.id === itemId);
        if (clicked?.type === 'folder') {
            console.log('Workspace: Setting active project to:', clicked.id, clicked.title);
            setActiveProjectId(clicked.id);
            // Отправляем событие для других компонентов
            window.dispatchEvent(new CustomEvent('workspace:navigate', {
                detail: { projectId: clicked.id }
            }));
            console.log('Workspace: Sent workspace:navigate event with projectId:', clicked.id);
        }
    }, [state.workspaceItems]);
    const handleItemAction = useCallback((itemId, action) => {
        const item = state.workspaceItems.find((i) => i.id === itemId);
        if (!item)
            return;
        switch (action) {
            case action && action.startsWith('set-emoji:') ? action : '': {
                const emoji = action.replace('set-emoji:', '');
                dispatch({ type: 'UPDATE_WORKSPACE_ITEM', payload: { id: itemId, updates: { emoji } } });
                break;
            }
            case 'download':
                // Создаем временную ссылку для скачивания
                if (item.type === 'file') {
                    const link = document.createElement('a');
                    link.href = item.url || '#';
                    link.download = item.name || item.title;
                    link.click();
                }
                break;
            case 'edit-document':
                // Открываем редактор документа
                if (item.type === 'document') {
                    setEditingDocument({
                        id: item.id,
                        title: item.title,
                        content: item.content || ''
                    });
                }
                break;
            case 'send-to-chat': {
                // Отправляем элемент в чат через ChatContextService
                const sendItem = state.workspaceItems.find(i => i.id === itemId);
                if (sendItem) {
                    window.dispatchEvent(new CustomEvent('workspace:send-to-chat', {
                        detail: { items: [sendItem] }
                    }));
                    // Визуализация отправки в чат
                    setSentToChatIds(prev => new Set([...prev, itemId]));
                    // Автоматически снимаем подсветку через 1.2с
                    setTimeout(() => {
                        setSentToChatIds(prev => {
                            const next = new Set(prev);
                            next.delete(itemId);
                            return next;
                        });
                    }, 1200);
                }
                break;
            }
            case 'delete':
                // Подтверждение удаления с учётом типа элемента
                if (window.confirm(`Вы уверены, что хотите удалить ${item.type === 'folder' ? 'проект' : 'документ'} "${item.title}"?`)) {
                    dispatch({
                        type: 'REMOVE_WORKSPACE_ITEM',
                        payload: itemId
                    });
                }
                break;
            case 'share':
                // Копируем ссылку в буфер обмена
                if (navigator.clipboard && item.url) {
                    navigator.clipboard.writeText(item.url).catch(() => {
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = item.url || '';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                    });
                }
                break;
            case 'rename':
                // Включаем режим редактирования названия
                // setEditingItem(itemId);
                break;
            default:
                break;
        }
    }, [state.workspaceItems, dispatch]);
    // Быстрые действия для проекта (переиспользуют логику выше)
    const handleRenameProject = useCallback(() => {
        const proj = getProjectById(activeProjectId);
        if (!proj)
            return;
        const name = window.prompt('Новое имя проекта', proj.title);
        const trimmed = (name || '').trim();
        if (!trimmed) {
            return; // пустые имена не принимаем
        }
        if (!window.confirm(`Переименовать проект в "${trimmed}"?`)) {
            return;
        }
        dispatch({
            type: 'UPDATE_WORKSPACE_ITEM',
            payload: { id: proj.id, updates: { title: trimmed, updatedAt: new Date() } }
        });
    }, [activeProjectId, dispatch, getProjectById]);
    const handleShareProject = useCallback(() => {
        const proj = getProjectById(activeProjectId);
        if (!proj)
            return;
        const url = proj.url || `${window.location.origin}/workspaces/${proj.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).catch(() => { });
        }
    }, [activeProjectId, getProjectById]);
    const handleDeleteProject = useCallback(() => {
        const proj = getProjectById(activeProjectId);
        if (!proj)
            return;
        if (window.confirm(`Удалить проект "${proj.title}"?`)) {
            dispatch({ type: 'REMOVE_WORKSPACE_ITEM', payload: proj.id });
            setActiveProjectId(null);
        }
    }, [activeProjectId, dispatch, getProjectById]);
    const handleItemRename = useCallback((itemId, newName) => {
        const trimmed = (newName || '').trim();
        if (!trimmed) {
            return; // запрет пустых имён
        }
        if (!window.confirm(`Переименовать в "${trimmed}"?`)) {
            return;
        }
        dispatch({
            type: 'UPDATE_WORKSPACE_ITEM',
            payload: {
                id: itemId,
                updates: {
                    title: trimmed,
                    updatedAt: new Date()
                }
            }
        });
        // setEditingItem(null);
    }, [dispatch]);
    // Обработчик галочек для документов
    const handleDocumentCheck = useCallback((itemId, checked) => {
        setCheckedDocuments(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(itemId);
            }
            else {
                newSet.delete(itemId);
            }
            return newSet;
        });
    }, []);
    // Прикрепление выбранных документов как контекст в чат
    const handleSendCheckedDocuments = useCallback(() => {
        if (checkedDocuments.size === 0)
            return;
        const checkedItems = state.workspaceItems.filter(item => checkedDocuments.has(item.id) && item.type === 'document');
        if (checkedItems.length === 0)
            return;
        // Прикрепляем документы как контекст (правильная логика)
        window.dispatchEvent(new CustomEvent('workspace:send-to-chat', {
            detail: { items: checkedItems }
        }));
        // Визуализация отправки в чат
        checkedItems.forEach(item => {
            setSentToChatIds(prev => new Set([...prev, item.id]));
        });
        // Автоматически снимаем подсветку через 1.2с
        setTimeout(() => {
            setSentToChatIds(prev => {
                const next = new Set(prev);
                checkedItems.forEach(item => next.delete(item.id));
                return next;
            });
        }, 1200);
        // Очищаем выбранные документы
        setCheckedDocuments(new Set());
    }, [checkedDocuments, state.workspaceItems]);
    // Обработчики редактора документа
    const handleDocumentSave = useCallback((id, title, content) => {
        dispatch({
            type: 'UPDATE_WORKSPACE_ITEM',
            payload: {
                id,
                updates: {
                    title,
                    content,
                    updatedAt: new Date()
                }
            }
        });
        setEditingDocument(null);
    }, [dispatch]);
    const handleDocumentClose = useCallback(() => {
        setEditingDocument(null);
    }, []);
    // const getItemIcon = (type: string) => {
    //     const IconComponent = getItemIconType(type);
    //     return <IconComponent className="w-5 h-5" />;
    // };
    return (_jsxs("div", { className: cn('workspace-container liquid-glass-panel flex-1 flex flex-col', className), children: [_jsx("div", { className: "p-3 liquid-glass-block workspace-header-bg header-with-divider", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-2 mr-auto", children: activeProject ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "sidebar-footer-button", title: "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B", "aria-label": "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B", onClick: () => setActiveProjectId(null), children: _jsx(Folder, { className: "w-4 h-4 icon" }) }), _jsx("span", { className: "text-xs opacity-60", children: "/" }), _jsx("span", { className: "text-sm workspace-title-color", children: activeProject.title }), _jsx("span", { className: "text-xs workspace-subtitle-color", children: filteredItems.length })] })) : (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-base font-semibold workspace-title-color leading-none", children: "\u041F\u0440\u043E\u0435\u043A\u0442\u044B" }), _jsx("span", { className: "text-xs workspace-subtitle-color leading-none", children: filteredItems.length })] })) }), _jsxs("div", { className: "flex rounded-lg p-0.5 workspace-view-container gap-1", children: [_jsx("button", { onClick: () => setViewMode('grid'), className: cn('sidebar-footer-button', viewMode === 'grid' ? 'active' : ''), title: "\u0421\u0435\u0442\u043A\u0430", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0438\u0434 \u0441\u0435\u0442\u043A\u0430", children: _jsx(Grid, { className: "w-3.5 h-3.5 icon" }) }), _jsx("button", { onClick: () => setViewMode('list'), className: cn('sidebar-footer-button', viewMode === 'list' ? 'active' : ''), title: "\u0421\u043F\u0438\u0441\u043E\u043A", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0438\u0434 \u0441\u043F\u0438\u0441\u043E\u043A", children: _jsx(List, { className: "w-3.5 h-3.5 icon" }) }), _jsx("button", { onClick: () => setViewMode('compact'), className: cn('sidebar-footer-button', viewMode === 'compact' ? 'active' : ''), title: "\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0432\u0438\u0434", children: _jsx(LayoutGrid, { className: "w-3.5 h-3.5 icon" }) }), _jsx("button", { onClick: () => setViewMode('ultra-compact'), className: cn('sidebar-footer-button', viewMode === 'ultra-compact' ? 'active' : ''), title: "\u0423\u043B\u044C\u0442\u0440\u0430-\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0443\u043B\u044C\u0442\u0440\u0430-\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0432\u0438\u0434", children: _jsx(Grid, { className: "w-3.5 h-3.5 icon" }) }), _jsx("button", { onClick: () => setViewMode('canvas'), className: cn('sidebar-footer-button', viewMode === 'canvas' ? 'active' : ''), title: "\u0425\u043E\u043B\u0441\u0442", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0438\u0434 \u0445\u043E\u043B\u0441\u0442", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-3.5 h-3.5 icon", children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), _jsx("path", { d: "M9 9h6v6H9z" })] }) })] }), checkedDocuments.size > 0 && (_jsxs("button", { onClick: handleSendCheckedDocuments, className: "flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors", title: `Отправить ${checkedDocuments.size} документов в чат`, children: [_jsx(Send, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm", children: ["\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442 (", checkedDocuments.size, ")"] })] })), _jsxs("div", { className: "flex items-center gap-2", ref: searchContainerRef, children: [_jsxs("div", { className: cn("relative flex items-center", isSearchOpen ? "w-56" : ""), children: [!isSearchOpen && (_jsx("button", { className: "sidebar-footer-button", title: "\u041F\u043E\u0438\u0441\u043A", "aria-label": "\u041F\u043E\u0438\u0441\u043A", onClick: () => {
                                                setIsSearchOpen(true);
                                                requestAnimationFrame(() => searchInputRef.current?.focus());
                                            }, children: _jsx(Search, { className: "w-4 h-4 icon" }) })), isSearchOpen && (_jsxs("div", { className: cn("flex items-center gap-1 w-full", isSearchClosing ? "animate-scale-out" : "animate-scale-in animate-slide-in-down"), children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 workspace-search-icon-color" }), _jsx("input", { ref: searchInputRef, type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u0444\u0430\u0439\u043B\u043E\u0432...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onBlur: handleSearchBlur, className: "w-full pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent workspace-input-styles" })] }), _jsx("button", { className: "sidebar-footer-button", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0438\u0441\u043A", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0438\u0441\u043A", onMouseDown: (e) => e.preventDefault(), onClick: () => setIsSearchClosing(true), children: _jsx(X, { className: "w-4 h-4 icon" }) })] }))] }), _jsxs(UnifiedButton, { variant: "ghost", size: "sm", className: "sidebar-footer-button", title: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B", "aria-label": "\u0424\u0438\u043B\u044C\u0442\u0440\u044B", children: [_jsx(Filter, { className: "w-4 h-4 icon" }), _jsx("span", { className: "sr-only", children: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B" })] })] }), activeProject && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(UnifiedButton, { variant: "ghost", size: "sm", className: "sidebar-footer-button", title: "\u041F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C", "aria-label": "\u041F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C", onClick: handleRenameProject, children: _jsx(Edit3, { className: "w-3.5 h-3.5 icon" }) }), _jsx(UnifiedButton, { variant: "ghost", size: "sm", className: "sidebar-footer-button", title: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F", "aria-label": "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F", onClick: handleShareProject, children: _jsx(Share2, { className: "w-3.5 h-3.5 icon" }) }), _jsx(UnifiedButton, { variant: "danger", size: "sm", className: "sidebar-footer-button", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", onClick: handleDeleteProject, children: _jsx(Trash2, { className: "w-3.5 h-3.5 icon" }) })] })), _jsx(UnifiedButton, { onClick: handleCreateItem, variant: "primary", size: "sm", className: "sidebar-footer-button", title: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C", children: _jsx(Plus, { className: "w-4 h-4 icon" }) })] }) }), _jsx("div", { className: "p-3 backdrop-blur-sm overflow-y-auto main-content-scrollbar bg-background workspace-content-limited flex-1", children: filteredItems.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center", children: [_jsx("div", { className: "w-24 h-24 rounded-full flex items-center justify-center mb-6 workspace-empty-icon-bg", children: _jsx(Folder, { className: "w-12 h-12 workspace-empty-icon-color" }) }), _jsx("h3", { className: "text-xl font-semibold mb-2 workspace-empty-title", children: searchQuery ? 'Ничего не найдено' : activeProject ? 'Нет документов' : 'Нет проектов' }), _jsx("p", { className: "mb-6 max-w-md workspace-empty-subtitle", children: searchQuery
                                ? 'Попробуйте изменить поисковый запрос'
                                : activeProject ? 'Создайте первый документ в проекте'
                                    : 'Создайте первый проект' }), !searchQuery && (_jsxs("button", { onClick: handleCreateItem, className: "flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors workspace-create-button-styles", children: [_jsx(Plus, { className: "w-5 h-5" }), _jsx("span", { children: activeProject ? 'Создать документ' : 'Создать проект' })] }))] })) : viewMode === 'canvas' && activeProject ? (_jsx(ProjectCanvas, { project: activeProject, items: filteredItems, onItemClick: (item) => handleItemClick(item.id), onItemSendToChat: (item) => {
                        window.dispatchEvent(new CustomEvent('workspace:send-to-chat', {
                            detail: { items: [item] }
                        }));
                    }, onItemDelete: (item) => {
                        if (window.confirm(`Вы уверены, что хотите удалить ${item.type === 'folder' ? 'проект' : 'документ'} "${item.title}"?`)) {
                            dispatch({
                                type: 'REMOVE_WORKSPACE_ITEM',
                                payload: item.id
                            });
                        }
                    }, className: "flex-1" })) : (_jsx("div", { className: cn('workspace-grid grid gap-3', viewMode === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', viewMode === 'list' && 'grid-cols-1', viewMode === 'compact' && 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6', viewMode === 'ultra-compact' && 'grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'), "data-view-mode": viewMode, children: filteredItems.map((item) => {
                        const commonProps = {
                            key: item.id,
                            item,
                            isSelected: selectedItems.has(item.id),
                            isChecked: checkedDocuments.has(item.id),
                            isNew: newItemIds.has(item.id) || sentToChatIds.has(item.id),
                            onItemClick: handleItemClick,
                            onItemAction: handleItemAction,
                            onDocumentCheck: handleDocumentCheck
                        };
                        if (viewMode === 'ultra-compact') {
                            return _jsx(CompactWorkspaceItem, { ...commonProps });
                        }
                        return (_jsx(WorkspaceItem, { ...commonProps, viewMode: viewMode === 'canvas' ? 'grid' : viewMode, onItemRename: handleItemRename, onEditCancel: () => { } }));
                    }) })) }), _jsx(DocumentEditor, { isOpen: editingDocument !== null, document: editingDocument, onSave: handleDocumentSave, onClose: handleDocumentClose })] }));
};
export default Workspace;
//# sourceMappingURL=Workspace.js.map