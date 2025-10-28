
import { usePlatform } from '@/hooks/usePlatform';
import { WorkspaceItem as WorkspaceItemType } from '@/types';
import { cn } from '@/utils';
import {
    Edit3,
    Filter,
    Folder,
    Grid,
    LayoutGrid,
    List,
    Plus,
    Search,
    Send,
    Share2,
    Trash2,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';
import { CompactWorkspaceItem } from './CompactWorkspaceItem';
import { DocumentEditor } from './DocumentEditor';
import { ProjectCanvas } from './ProjectCanvas';
import { WorkspaceItem } from './WorkspaceItem';

interface WorkspaceProps {
    className?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ className }) => {
    const { state, createWorkspaceItem, dispatch, sendMessage } = usePlatform();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [checkedDocuments, setCheckedDocuments] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'ultra-compact' | 'canvas'>('compact');
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
    const [sentToChatIds, setSentToChatIds] = useState<Set<string>>(new Set());
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [editingDocument, setEditingDocument] = useState<{ id: string; title: string; content: string } | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearchClosing, setIsSearchClosing] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const getProjectById = useCallback((id: string | null) => state.workspaceItems.find(i => i.id === id && i.type === 'folder') || null, [state.workspaceItems]);

    // Закрыть поиск при потере фокуса (анимация scale-out), введённый текст сохраняем
    const handleSearchBlur = useCallback(() => {
        setTimeout(() => {
            const container = searchContainerRef.current;
            const active = document.activeElement as HTMLElement | null;
            if (!container || !active || !container.contains(active)) {
                setIsSearchClosing(true);
            }
        }, 0);
    }, []);

    useEffect(() => {
        if (!isSearchClosing) return;
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
        if (!activeProject) return rootProjects;
        const projectPath = `/workspaces/${activeProject.id}/`;
        return items.filter(i => i.path?.startsWith(projectPath));
    }, [items, rootProjects, activeProject]);

    // Мемоизированная фильтрация элементов
    const filteredItems = useMemo(() =>
        currentItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        ), [currentItems, searchQuery]
    );

    // Навигация в проект из сайдбара
    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ projectId: string }>;
            if (custom.detail?.projectId) {
                setActiveProjectId(custom.detail.projectId);
            }
        };
        window.addEventListener('workspace:navigate', handler as EventListener);
        return () => window.removeEventListener('workspace:navigate', handler as EventListener);
    }, [state.workspaceItems]);

    const handleCreateItem = () => {
        // В корне создаём проект, внутри проекта — документ
        if (!activeProject) {
            const newId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newProj = {
                id: newId,
                type: 'folder' as const,
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
            type: 'document' as const,
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
    const handleItemClick = useCallback((itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
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

    const handleItemAction = useCallback((itemId: string, action: string) => {
        const item = state.workspaceItems.find((i) => i.id === itemId);
        if (!item) return;

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
        if (!proj) return;
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
        if (!proj) return;
        const url = proj.url || `${window.location.origin}/workspaces/${proj.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).catch(() => {/* ignore */ });
        }
    }, [activeProjectId, getProjectById]);

    const handleDeleteProject = useCallback(() => {
        const proj = getProjectById(activeProjectId);
        if (!proj) return;
        if (window.confirm(`Удалить проект "${proj.title}"?`)) {
            dispatch({ type: 'REMOVE_WORKSPACE_ITEM', payload: proj.id });
            setActiveProjectId(null);
        }
    }, [activeProjectId, dispatch, getProjectById]);

    const handleItemRename = useCallback((itemId: string, newName: string) => {
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
    const handleDocumentCheck = useCallback((itemId: string, checked: boolean) => {
        setCheckedDocuments(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(itemId);
            } else {
                newSet.delete(itemId);
            }
            return newSet;
        });
    }, []);

    // Прикрепление выбранных документов как контекст в чат
    const handleSendCheckedDocuments = useCallback(() => {
        if (checkedDocuments.size === 0) return;

        const checkedItems = state.workspaceItems.filter(item =>
            checkedDocuments.has(item.id) && item.type === 'document'
        );

        if (checkedItems.length === 0) return;

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
    const handleDocumentSave = useCallback((id: string, title: string, content: string) => {
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

    return (
        <div className={cn('workspace-container liquid-glass-panel flex-1 flex flex-col', className)}>
            {/* Заголовок и панель инструментов */}
            <div className="p-3 liquid-glass-block workspace-header-bg header-with-divider">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-auto">
                        {activeProject ? (
                            <>
                                {/* Breadcrumbs */}
                                <button
                                    className="sidebar-footer-button"
                                    title="Все проекты"
                                    aria-label="Все проекты"
                                    onClick={() => setActiveProjectId(null)}
                                >
                                    <Folder className="w-4 h-4 icon" />
                                </button>
                                <span className="text-xs opacity-60">/</span>
                                <span className="text-sm workspace-title-color">{activeProject.title}</span>
                                <span className="text-xs workspace-subtitle-color">{filteredItems.length}</span>
                            </>
                        ) : (
                            <>
                                <h1 className="text-base font-semibold workspace-title-color leading-none">Проекты</h1>
                                <span className="text-xs workspace-subtitle-color leading-none">{filteredItems.length}</span>
                            </>
                        )}
                    </div>

                    {/* Виды */}
                    <div className="flex rounded-lg p-0.5 workspace-view-container gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn('sidebar-footer-button', viewMode === 'grid' ? 'active' : '')}
                            title="Сетка"
                            aria-label="Переключить вид сетка"
                        >
                            <Grid className="w-3.5 h-3.5 icon" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn('sidebar-footer-button', viewMode === 'list' ? 'active' : '')}
                            title="Список"
                            aria-label="Переключить вид список"
                        >
                            <List className="w-3.5 h-3.5 icon" />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={cn('sidebar-footer-button', viewMode === 'compact' ? 'active' : '')}
                            title="Компактный"
                            aria-label="Переключить компактный вид"
                        >
                            <LayoutGrid className="w-3.5 h-3.5 icon" />
                        </button>
                        <button
                            onClick={() => setViewMode('ultra-compact')}
                            className={cn('sidebar-footer-button', viewMode === 'ultra-compact' ? 'active' : '')}
                            title="Ультра-компактный"
                            aria-label="Переключить ультра-компактный вид"
                        >
                            <Grid className="w-3.5 h-3.5 icon" />
                        </button>
                        <button
                            onClick={() => setViewMode('canvas')}
                            className={cn('sidebar-footer-button', viewMode === 'canvas' ? 'active' : '')}
                            title="Холст"
                            aria-label="Переключить вид холст"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 icon">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                <path d="M9 9h6v6H9z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Кнопка отправки выбранных документов */}
                    {checkedDocuments.size > 0 && (
                        <button
                            onClick={handleSendCheckedDocuments}
                            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            title={`Отправить ${checkedDocuments.size} документов в чат`}
                        >
                            <Send className="w-4 h-4" />
                            <span className="text-sm">Отправить в чат ({checkedDocuments.size})</span>
                        </button>
                    )}



                    {/* Поиск и фильтры */}
                    <div className="flex items-center gap-2" ref={searchContainerRef}>
                        <div className={cn("relative flex items-center", isSearchOpen ? "w-56" : "")}>
                            {!isSearchOpen && (
                                <button
                                    className="sidebar-footer-button"
                                    title="Поиск"
                                    aria-label="Поиск"
                                    onClick={() => {
                                        setIsSearchOpen(true);
                                        requestAnimationFrame(() => searchInputRef.current?.focus());
                                    }}
                                >
                                    <Search className="w-4 h-4 icon" />
                                </button>
                            )}
                            {isSearchOpen && (
                                <div className={cn(
                                    "flex items-center gap-1 w-full",
                                    isSearchClosing ? "animate-scale-out" : "animate-scale-in animate-slide-in-down"
                                )}>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 workspace-search-icon-color" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Поиск файлов..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={handleSearchBlur}
                                            className="w-full pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent workspace-input-styles"
                                        />
                                    </div>
                                    <button
                                        className="sidebar-footer-button"
                                        title="Закрыть поиск"
                                        aria-label="Закрыть поиск"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setIsSearchClosing(true)}
                                    >
                                        <X className="w-4 h-4 icon" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <UnifiedButton
                            variant="ghost"
                            size="sm"
                            className="sidebar-footer-button"
                            title="Фильтры"
                            aria-label="Фильтры"
                        >
                            <Filter className="w-4 h-4 icon" />
                            <span className="sr-only">Фильтры</span>
                        </UnifiedButton>
                    </div>

                    {/* Быстрые действия в проекте */}
                    {activeProject && (
                        <div className="flex items-center gap-1">
                            <UnifiedButton variant="ghost" size="sm" className="sidebar-footer-button" title="Переименовать" aria-label="Переименовать" onClick={handleRenameProject}>
                                <Edit3 className="w-3.5 h-3.5 icon" />
                            </UnifiedButton>
                            <UnifiedButton variant="ghost" size="sm" className="sidebar-footer-button" title="Поделиться" aria-label="Поделиться" onClick={handleShareProject}>
                                <Share2 className="w-3.5 h-3.5 icon" />
                            </UnifiedButton>
                            <UnifiedButton variant="danger" size="sm" className="sidebar-footer-button" title="Удалить" aria-label="Удалить" onClick={handleDeleteProject}>
                                <Trash2 className="w-3.5 h-3.5 icon" />
                            </UnifiedButton>
                        </div>
                    )}

                    {/* Создать */}
                    <UnifiedButton
                        onClick={handleCreateItem}
                        variant="primary"
                        size="sm"
                        className="sidebar-footer-button"
                        title="Создать"
                    >
                        <Plus className="w-4 h-4 icon" />
                    </UnifiedButton>
                </div>
            </div>

            {/* Содержимое рабочего пространства */}
            <div className="p-3 backdrop-blur-sm overflow-y-auto main-content-scrollbar bg-background workspace-content-limited flex-1">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 workspace-empty-icon-bg">
                            <Folder className="w-12 h-12 workspace-empty-icon-color" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 workspace-empty-title">
                            {searchQuery ? 'Ничего не найдено' : activeProject ? 'Нет документов' : 'Нет проектов'}
                        </h3>
                        <p className="mb-6 max-w-md workspace-empty-subtitle">
                            {searchQuery
                                ? 'Попробуйте изменить поисковый запрос'
                                : activeProject ? 'Создайте первый документ в проекте'
                                    : 'Создайте первый проект'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreateItem}
                                className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors workspace-create-button-styles"
                            >
                                <Plus className="w-5 h-5" />
                                <span>{activeProject ? 'Создать документ' : 'Создать проект'}</span>
                            </button>
                        )}
                    </div>
                ) : viewMode === 'canvas' && activeProject ? (
                    <ProjectCanvas
                        project={activeProject}
                        items={filteredItems}
                        onItemClick={(item) => handleItemClick(item.id)}
                        onItemSendToChat={(item: WorkspaceItemType) => {
                            window.dispatchEvent(new CustomEvent('workspace:send-to-chat', {
                                detail: { items: [item] }
                            }));
                        }}
                        onItemDelete={(item: WorkspaceItemType) => {
                            if (window.confirm(`Вы уверены, что хотите удалить ${item.type === 'folder' ? 'проект' : 'документ'} "${item.title}"?`)) {
                                dispatch({
                                    type: 'REMOVE_WORKSPACE_ITEM',
                                    payload: item.id
                                });
                            }
                        }}
                        className="flex-1"
                    />
                ) : (
                    <div
                        className={cn(
                            'workspace-grid grid gap-3',
                            viewMode === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                            viewMode === 'list' && 'grid-cols-1',
                            viewMode === 'compact' && 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6',
                            viewMode === 'ultra-compact' && 'grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'
                        )}
                        data-view-mode={viewMode}
                    >
                        {filteredItems.map((item) => {
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
                                return <CompactWorkspaceItem {...commonProps} />;
                            }

                            return (
                                <WorkspaceItem
                                    {...commonProps}
                                    viewMode={viewMode === 'canvas' ? 'grid' : viewMode}
                                    onItemRename={handleItemRename}
                                    onEditCancel={() => {/* setEditingItem(null) */ }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Редактор документа */}
            <DocumentEditor
                isOpen={editingDocument !== null}
                document={editingDocument}
                onSave={handleDocumentSave}
                onClose={handleDocumentClose}
            />
        </div>
    );
};

export default Workspace;
