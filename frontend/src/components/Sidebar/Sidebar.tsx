import { ProfilePanel } from '@/components/Auth';
import { UnifiedButton } from '@/components/common/UnifiedButton';
import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import {
    Bell,
    Brain,
    Camera,
    Clock,
    Cog,
    Eye,
    File,
    Folder,
    Layout,
    LayoutGrid,
    MessageSquare,
    Mic,
    Monitor,
    Palette,
    Rows,
    ShoppingCart,
    User
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';

interface SidebarProps {
    className?: string;
}

export const Sidebar: FC<SidebarProps> = ({ className }) => {
    const { state, toggleSidebar, switchSection, createWorkspaceItem, setActiveSettingsCategory, toggleChat, dispatch, logout } = usePlatform();
    const [activeItem, setActiveItem] = useState<string>('workspace');
    const [showWidgetsDropdown, setShowWidgetsDropdown] = useState<boolean>(false); // Управление видимостью dropdown виджетов
    const [showProfile, setShowProfile] = useState(false); // Управление видимостью ProfilePanel
    // Убираем showSettingsPanel - теперь используем state.layout.activeSection === 'settings'
    const settingsMenuRef = useRef<HTMLDivElement>(null);
    const widgetsMenuRef = useRef<HTMLDivElement>(null);
    const projectsScrollRef = useRef<HTMLDivElement>(null);
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');
    const editInputRef = useRef<HTMLInputElement>(null);

    const isCollapsed = state.layout.sidebarCollapsed;


    // Убираем обработку клика вне меню - теперь пустой клик ничего не делает

    // Позиционирование выпадающих меню больше не используется (субсписки рендерятся в потоке)

    // Динамическая логика ширины и закругления - используем значение из state.layout.sidebarWidth
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width') as HTMLElement | null;
        if (el) {
            const targetWidth = isCollapsed ? 60 : state.layout.sidebarWidth;
            const borderRadius = isCollapsed ? 12 : 20; // Меньший радиус для свернутого сайдбара
            el.style.setProperty('--sidebar-width', `${targetWidth}px`);
            el.style.setProperty('--sidebar-border-radius', `${borderRadius}px`);
        }
    }, [isCollapsed, state.layout.sidebarWidth]);

    // Получаем элементы рабочего пространства
    const workspaceItems = useMemo(() => state.workspaceItems, [state.workspaceItems]);






    // Создание нового рабочего пространства
    const handleCreateWorkspace = () => {
        const newId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newWorkspace = {
            id: newId,
            type: 'folder' as const,
            title: 'Новое пространство',
            content: '',
            path: '/workspaces/',
            size: 0,
            tags: ['workspace'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Создаем новое рабочее пространство
        createWorkspaceItem(newWorkspace);
    };

    // Обработчик двойного клика для редактирования названия проекта
    const handleProjectDoubleClick = (item: { id: string; title: string }) => {
        if (!isCollapsed) {
            setEditingProject(item.id);
            setEditingTitle(item.title);
            setTimeout(() => {
                editInputRef.current?.focus();
                editInputRef.current?.select();
            }, 0);
        }
    };

    // Сохранение нового названия проекта
    const handleSaveProjectTitle = (itemId: string) => {
        if (editingTitle.trim()) {
            dispatch({
                type: 'UPDATE_WORKSPACE_ITEM',
                payload: {
                    id: itemId,
                    updates: {
                        title: editingTitle.trim()
                    }
                }
            });
        }
        setEditingProject(null);
        setEditingTitle('');
    };

    // Отмена редактирования
    const handleCancelEdit = () => {
        setEditingProject(null);
        setEditingTitle('');
    };

    // Единая функция для входа в настройки
    const handleSettingsEntry = (category: string = 'all') => {
        setActiveSettingsCategory(category);
        switchSection('settings');
        // Больше не используем showSettingsPanel для управления меню
    };

    // Функция для входа в виджеты (резерв на будущее)
    // const handleWidgetsEntry = (widgetType: string = 'all') => {
    //     if (widgetType === 'all') {
    //         dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: [] });
    //     } else {
    //         dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: [widgetType] });
    //     }
    // };

    // Унифицированные помощники для активного состояния и переключения подсветки
    const toggleWidgetCategory = (category: string) => {
        const currentActive: string[] = state.layout.activeWidgetsCategory;

        if (currentActive.includes(category)) {
            // Убираем виджет из активных
            const newActive = currentActive.filter(w => w !== category);
            dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: newActive });
        } else {
            // Добавляем виджет к активным
            const newActive = [...currentActive, category];
            dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: newActive });
        }
    };

    const toggleSettingsCategory = (category: string) => {
        if (state.layout.activeSettingsCategory === category) {
            setActiveSettingsCategory('all');
        } else {
            handleSettingsEntry(category);
        }
    };

    // Функция переключения секции без сброса активного проекта
    const handleSectionSwitch = (section: string) => {
        switchSection(section);
    };

    // Автопрокрутка к активному проекту
    useEffect(() => {
        if (!projectsScrollRef.current) return;
        const container = projectsScrollRef.current;
        const active = container.querySelector('[data-workspace-id="' + activeItem + '"]') as HTMLElement | null;
        if (active) {
            const activeRect = active.getBoundingClientRect();
            const contRect = container.getBoundingClientRect();
            if (activeRect.top < contRect.top + 8 || activeRect.bottom > contRect.bottom - 8) {
                active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeItem]);

    // Переключение чата без сброса активного проекта
    const handleToggleChat = () => {
        toggleChat();
    };

    return (
        <div
            className={cn(
                'h-full liquid-glass-panel transition-[width] duration-150 flex flex-col sidebar-dynamic-width shadow-2xl overflow-y-auto sidebar-scrollbar animate-sidebar-slide-in sidebar-main-container relative volume-container',
                isCollapsed && 'collapsed',
                className
            )}
        >
            {/* Заголовок */}
            <div className={cn(
                "flex items-center animate-sidebar-content sidebar-header",
                isCollapsed ? "p-0 justify-center" : "p-3 justify-center"
            )}>
                {!isCollapsed && (
                    <div className="flex items-center justify-center w-full">
                        {/* Кликабельная кнопка Boss Ai */}
                        <div
                            onClick={toggleSidebar}
                            className="w-full h-12 rounded-lg flex items-center justify-center sidebar-logo cursor-pointer hover:scale-105 transition-transform duration-200 bg-transparent border-none"
                            title="Свернуть панель"
                        >
                            <span
                                className="font-bold text-2xl sidebar-logo-text tracking-widest leading-none boss-ai-text"
                            >Boss Ai</span>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="sidebar-logo-button mx-auto"
                        title="Развернуть панель"
                    >
                        <span
                            className="font-bold text-lg sidebar-logo-text sidebar-service-icon-inverted"
                        >B</span>
                    </button>
                )}
            </div>






            {/* Градиентный разделитель между заголовком и основными кнопками */}
            <div className={cn("gradient-divider", !isCollapsed && "mx-3")}></div>

            {/* Основные кнопки - ChatGPT, Виджеты, Настройки */}
            <div className={cn("sidebar-services-scroll", isCollapsed ? "p-0" : "px-0")}>
                {/* Кнопка Промпты */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <button
                        onClick={(e) => {
                            // Открываем центральную панель Промптов
                            handleSectionSwitch('prompts');
                            requestAnimationFrame(() => {
                                const target = e.currentTarget as HTMLButtonElement | null;
                                if (target && typeof target.blur === 'function') target.blur();
                            });
                            try {
                                window.dispatchEvent(new CustomEvent('prompts:open'));
                            } catch (_) { /* no-op */ }
                        }}
                        className={cn(
                            "sidebar-service-button",
                            isCollapsed && "compact",
                            state.layout.activeSection === 'prompts' && "active"
                        )}
                        title="Библиотека промптов"
                    >
                        <Rows className="icon" />
                        {!isCollapsed && (
                            <div className="service-content">
                                <div className="service-title">Библиотека промптов</div>
                            </div>
                        )}
                    </button>
                </div>




                {/* Кнопка Ozon Manager */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <button
                        onClick={(e) => {
                            if (state.layout.activeSection === 'ozon-manager') {
                                handleSectionSwitch('workspace');
                            } else {
                                handleSectionSwitch('ozon-manager');
                            }
                            requestAnimationFrame(() => {
                                const target = e.currentTarget as HTMLButtonElement | null;
                                if (target && typeof target.blur === 'function') target.blur();
                            });
                        }}
                        className={cn(
                            "sidebar-service-button",
                            isCollapsed && "compact",
                            state.layout.activeSection === 'ozon-manager' && "active"
                        )}
                        title="Ozon Manager"
                    >
                        <ShoppingCart className="icon" />
                        {!isCollapsed && (
                            <div className="service-content">
                                <div className="service-title">Ozon Manager</div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Кнопка настроек с выплывающим меню */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <div className="relative" ref={settingsMenuRef}>
                        <button
                            onClick={(e) => {
                                if (state.layout.activeSection === 'settings') {
                                    handleSectionSwitch('workspace');
                                } else {
                                    handleSettingsEntry('all');
                                }
                                const target = e.currentTarget as HTMLButtonElement | null;
                                requestAnimationFrame(() => {
                                    if (target && typeof target.blur === 'function') target.blur();
                                });
                            }}
                            className={cn(
                                "sidebar-service-button",
                                isCollapsed && "compact",
                                state.layout.activeSection === 'settings' && "active"
                            )}
                            title="Настройки"
                        >
                            <Cog className="icon" />
                            {!isCollapsed && (
                                <div className="service-content">
                                    <div className="service-title">Настройки</div>
                                </div>
                            )}
                        </button>

                        {/* Выпадающее меню для свернутого вида - показываем только если настройки открыты */}
                        {isCollapsed && state.layout.activeSection === 'settings' && (
                            <div className="sidebar-service-dropdown">
                                <button
                                    onClick={() => toggleSettingsCategory('appearance')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'appearance' && "active"
                                    )}
                                    title="Внешний вид"
                                >
                                    <Palette className="icon" />
                                </button>
                                <button
                                    onClick={() => toggleSettingsCategory('interface')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'interface' && "active"
                                    )}
                                    title="Интерфейс"
                                >
                                    <Monitor className="icon" />
                                </button>
                                <button
                                    onClick={() => toggleSettingsCategory('chat')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'chat' && "active"
                                    )}
                                    title="Чат"
                                >
                                    <MessageSquare className="icon" />
                                </button>
                                <button
                                    onClick={() => toggleSettingsCategory('notifications')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'notifications' && "active"
                                    )}
                                    title="Уведомления"
                                >
                                    <Bell className="icon" />
                                </button>
                            </div>
                        )}

                        {state.layout.activeSection === 'settings' && !isCollapsed && (
                            <div className="sidebar-service-dropdown">
                                <button
                                    onClick={() => toggleSettingsCategory('appearance')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'appearance' && "active"
                                    )}
                                >
                                    <Palette className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Внешний вид</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => toggleSettingsCategory('interface')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'interface' && "active"
                                    )}
                                >
                                    <Monitor className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Интерфейс</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => toggleSettingsCategory('chat')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'chat' && "active"
                                    )}
                                >
                                    <MessageSquare className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Чат</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => toggleSettingsCategory('notifications')}
                                    className={cn(
                                        "sidebar-service-item",
                                        state.layout.activeSettingsCategory === 'notifications' && "active"
                                    )}
                                >
                                    <Bell className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Уведомления</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка Виджеты с выплывающим меню */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <div className="relative" ref={widgetsMenuRef}>
                        <button
                            onClick={(e) => {
                                // Переключаем видимость dropdown меню виджетов
                                setShowWidgetsDropdown(!showWidgetsDropdown);
                                const target = e.currentTarget as HTMLButtonElement | null;
                                requestAnimationFrame(() => {
                                    if (target && typeof target.blur === 'function') target.blur();
                                });
                            }}
                            className={cn(
                                "sidebar-service-button",
                                isCollapsed && "compact",
                                (showWidgetsDropdown || (state.layout.activeWidgetsCategory as string[]).length > 0) && "active"
                            )}
                            title="Виджеты"
                        >
                            <LayoutGrid className="icon" />
                            {!isCollapsed && (
                                <div className="service-content">
                                    <div className="service-title">Виджеты</div>
                                </div>
                            )}
                        </button>

                        {/* Выпадающее меню для свернутого вида - показываем только если dropdown открыт */}
                        {isCollapsed && showWidgetsDropdown && (
                            <div className="sidebar-service-dropdown">
                                <button
                                    onClick={() => toggleWidgetCategory('time-widget')}
                                    className={cn(
                                        "sidebar-service-item",
                                        (state.layout.activeWidgetsCategory as string[]).includes('time-widget') && "active"
                                    )}
                                    title="Часы"
                                >
                                    <Clock className="icon" />
                                </button>
                                <button
                                    onClick={() => toggleWidgetCategory('voice-widget')}
                                    className={cn(
                                        "sidebar-service-item",
                                        (state.layout.activeWidgetsCategory as string[]).includes('voice-widget') && "active"
                                    )}
                                    title="Голосовой ввод"
                                >
                                    <Mic className="icon" />
                                </button>
                            </div>
                        )}

                        {/* Развернутый вид — в потоке, смещает элементы ниже */}
                        {showWidgetsDropdown && !isCollapsed && (
                            <div className="sidebar-service-dropdown">
                                <button
                                    onClick={() => {
                                        toggleWidgetCategory('time-widget');
                                        window.dispatchEvent(new CustomEvent('widgets:toggle', { detail: 'time-widget' }));
                                    }}
                                    className={cn(
                                        "sidebar-service-item",
                                        (state.layout.activeWidgetsCategory as string[]).includes('time-widget') && "active"
                                    )}
                                >
                                    <Clock className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Часы</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        toggleWidgetCategory('voice-widget');
                                        window.dispatchEvent(new CustomEvent('widgets:toggle', { detail: 'voice-widget' }));
                                    }}
                                    className={cn(
                                        "sidebar-service-item",
                                        (state.layout.activeWidgetsCategory as string[]).includes('voice-widget') && "active"
                                    )}
                                >
                                    <Mic className="icon" />
                                    <div className="service-content">
                                        <div className="service-title">Голосовой ввод</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка Катя чаты */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <button
                        onClick={(e) => {
                            if (state.layout.activeSection === 'katya-chats') {
                                handleSectionSwitch('workspace');
                            } else {
                                handleSectionSwitch('katya-chats');
                            }
                            requestAnimationFrame(() => {
                                const target = e.currentTarget as HTMLButtonElement | null;
                                if (target && typeof target.blur === 'function') target.blur();
                            });
                        }}
                        className={cn(
                            "sidebar-service-button",
                            isCollapsed && "compact",
                            state.layout.activeSection === 'katya-chats' && "active"
                        )}
                        title="Катя чаты"
                    >
                        <Brain className="icon" />
                        {!isCollapsed && (
                            <div className="service-content">
                                <div className="service-title">Катя чаты</div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Кнопка Фотостудия */}
                <div className={cn(isCollapsed ? "p-0" : "px-3 py-2")}>
                    <button
                        onClick={(e) => {
                            if (state.layout.activeSection === 'photo-studio') {
                                handleSectionSwitch('workspace');
                            } else {
                                handleSectionSwitch('photo-studio');
                            }
                            requestAnimationFrame(() => {
                                const target = e.currentTarget as HTMLButtonElement | null;
                                if (target && typeof target.blur === 'function') target.blur();
                            });
                        }}
                        className={cn(
                            "sidebar-service-button",
                            isCollapsed && "compact",
                            state.layout.activeSection === 'photo-studio' && "active"
                        )}
                        title="Фотостудия"
                    >
                        <Camera className="icon" />
                        {!isCollapsed && (
                            <div className="service-content">
                                <div className="service-title">Фотостудия</div>
                            </div>
                        )}
                    </button>
                </div>




            </div>

            {/* Градиентный разделитель между основными кнопками и проектами */}
            <div className={cn("gradient-divider", !isCollapsed && "mx-3")}></div>

            {/* Проекты (без документов) */}
            <nav className={cn("animate-sidebar-content flex-1 min-h-0 sidebar-projects", isCollapsed ? "p-0" : "p-3 pt-1")}>
                {!isCollapsed && (
                    <div className="flex items-center justify-between mb-2 mt-2">
                        <h3 className="text-sm font-medium sidebar-services-title">Проекты</h3>
                        <UnifiedButton
                            onClick={handleCreateWorkspace}
                            variant="primary"
                            size="sm"
                            className="sidebar-create-button"
                            title="Создать проект"
                        >
                            <span className="text-sm">+</span>
                        </UnifiedButton>
                    </div>
                )}

                <div ref={projectsScrollRef} className="sidebar-workspaces-scroll h-full min-h-0">
                    <ul className={cn("sidebar-nav", isCollapsed ? "space-y-4" : "space-y-5")}>
                        {isCollapsed && (
                            <li>
                                <UnifiedButton
                                    onClick={handleCreateWorkspace}
                                    variant="primary"
                                    size="sm"
                                    className="sidebar-create-button w-full"
                                    title="Создать проект"
                                >
                                    <span className="text-sm">+</span>
                                </UnifiedButton>
                            </li>
                        )}

                        {workspaceItems.filter(item => item.type === 'folder').map((item) => {
                            const getIcon = (type: string) => {
                                switch (type) {
                                    case 'folder': return Folder;
                                    case 'document': return File;
                                    case 'note': return MessageSquare;
                                    case 'image': return Eye;
                                    default: return Layout;
                                }
                            };

                            const IconComponent = getIcon(item.type);
                            return (
                                <li key={item.id}>
                                    <div
                                        data-workspace-id={item.id}
                                        onClick={() => {
                                            setActiveItem(item.id);
                                            handleSectionSwitch('workspace');
                                            try {
                                                window.dispatchEvent(new CustomEvent('workspace:navigate', { detail: { projectId: item.id } }));
                                            } catch (_) {
                                                // no-op
                                            }
                                        }}
                                        className={cn(
                                            "sidebar-service-button transition-all duration-200",
                                            isCollapsed && "compact",
                                            activeItem === item.id && "active"
                                        )}
                                        title={isCollapsed ? item.title : undefined}
                                    >
                                        <div
                                            className={cn(
                                                "sidebar-project-btn flex items-center flex-1 text-left",
                                                isCollapsed ? "justify-center" : "space-x-3"
                                            )}
                                            onDoubleClick={() => handleProjectDoubleClick(item)}
                                        >
                                            <IconComponent className="icon" />
                                            {!isCollapsed && editingProject === item.id ? (
                                                <input
                                                    ref={editInputRef}
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => handleSaveProjectTitle(item.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveProjectTitle(item.id);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="Название проекта"
                                                    aria-label="Редактировать название проекта"
                                                    className="service-content service-title truncate bg-surface border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : !isCollapsed && (
                                                <span className="service-content">
                                                    <span className="service-title truncate">{item.title}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* Градиентный разделитель между проектами и нижней панелью */}
            <div className={cn("gradient-divider", !isCollapsed && "mx-3")}></div>

            {/* Нижняя панель с кнопками - всегда внизу */}
            <div className={cn(
                "mt-auto sidebar-footer",
                isCollapsed ? "p-0 collapsed" : "p-4"
            )}>
                <div className={cn(
                    "flex",
                    isCollapsed ? "flex-col space-y-1" : "items-center justify-between gap-2"
                )}>
                    <button
                        onClick={() => switchSection('notifications')}
                        className={cn(
                            "sidebar-footer-button",
                            state.layout.activeSection === 'notifications' && "active"
                        )}
                        title="Уведомления"
                    >
                        <Bell className="w-4 h-4 icon" />
                    </button>

                    <button
                        onClick={() => {
                            // Исправленная логика: клик по настройкам работает как переключатель настроек
                            if (state.layout.activeSection === 'settings') {
                                // Если настройки открыты - закрываем их
                                handleSectionSwitch('workspace');
                            } else {
                                // Если настройки не открыты - открываем настройки
                                handleSettingsEntry('all');
                                // В свернутой панели НЕ раскрываем панель - только показываем иконки
                            }
                        }}
                        className={cn(
                            "sidebar-footer-button",
                            state.layout.activeSection === 'settings' && "active"
                        )}
                        title="Настройки"
                    >
                        <Cog className="w-4 h-4 icon" />
                    </button>

                    <button
                        onClick={() => setShowProfile(true)}
                        className={cn(
                            "sidebar-footer-button",
                            showProfile && "active"
                        )}
                        title="Профиль"
                        aria-label="Открыть профиль"
                    >
                        {state.authUser?.photo_url ? (
                            <img
                                src={state.authUser.photo_url}
                                alt="Профиль"
                                className="w-4 h-4 rounded-full"
                            />
                        ) : (
                            <User className="w-4 h-4 icon" />
                        )}
                    </button>

                </div>
            </div>

            {/* ProfilePanel */}
            <AnimatePresence>
                {showProfile && state.authUser && (
                    <ProfilePanel
                        user={state.authUser}
                        onClose={() => setShowProfile(false)}
                        onLogout={async () => {
                            await logout();
                            setShowProfile(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
