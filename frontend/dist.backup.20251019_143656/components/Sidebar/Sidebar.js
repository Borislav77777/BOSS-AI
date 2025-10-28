import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UnifiedButton } from '@/components/common/UnifiedButton';
import { ProfilePanel } from '@/components/Auth';
import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import { Bell, Building, Camera, Clock, Cog, Eye, File, FileText, Folder, Layout, LayoutGrid, MessageSquare, Mic, Monitor, Palette, Rows, Scale, Shield, ShoppingCart, Target, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
export const Sidebar = ({ className }) => {
    const { state, toggleSidebar, switchSection, createWorkspaceItem, setActiveSettingsCategory, toggleChat, dispatch, logout } = usePlatform();
    const [activeItem, setActiveItem] = useState('workspace');
    const [activeAILawyerTab, setActiveAILawyerTab] = useState('guide'); // Отслеживание активной вкладки AI-Юриста
    const [showWidgetsDropdown, setShowWidgetsDropdown] = useState(false); // Управление видимостью dropdown виджетов
    const [showProfile, setShowProfile] = useState(false); // Управление видимостью ProfilePanel
    // Убираем showSettingsPanel - теперь используем state.layout.activeSection === 'settings'
    const settingsMenuRef = useRef(null);
    const widgetsMenuRef = useRef(null);
    const projectsScrollRef = useRef(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const editInputRef = useRef(null);
    const isCollapsed = state.layout.sidebarCollapsed;
    // Обработчик событий для переключения вкладок AI-Юриста
    useEffect(() => {
        const handleAILawyerTabSwitch = (event) => {
            const tabId = event.detail;
            setActiveAILawyerTab(tabId);
        };
        window.addEventListener('ai-lawyer:switch-tab', handleAILawyerTabSwitch);
        return () => {
            window.removeEventListener('ai-lawyer:switch-tab', handleAILawyerTabSwitch);
        };
    }, []);
    // Убираем обработку клика вне меню - теперь пустой клик ничего не делает
    // Позиционирование выпадающих меню больше не используется (субсписки рендерятся в потоке)
    // Динамическая логика ширины и закругления - используем значение из state.layout.sidebarWidth
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width');
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
            type: 'folder',
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
    const handleProjectDoubleClick = (item) => {
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
    const handleSaveProjectTitle = (itemId) => {
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
    const handleSettingsEntry = (category = 'all') => {
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
    const toggleWidgetCategory = (category) => {
        const currentActive = state.layout.activeWidgetsCategory;
        if (currentActive.includes(category)) {
            // Убираем виджет из активных
            const newActive = currentActive.filter(w => w !== category);
            dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: newActive });
        }
        else {
            // Добавляем виджет к активным
            const newActive = [...currentActive, category];
            dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: newActive });
        }
    };
    const toggleSettingsCategory = (category) => {
        if (state.layout.activeSettingsCategory === category) {
            setActiveSettingsCategory('all');
        }
        else {
            handleSettingsEntry(category);
        }
    };
    // Функция переключения секции без сброса активного проекта
    const handleSectionSwitch = (section) => {
        switchSection(section);
    };
    // Автопрокрутка к активному проекту
    useEffect(() => {
        if (!projectsScrollRef.current)
            return;
        const container = projectsScrollRef.current;
        const active = container.querySelector('[data-workspace-id="' + activeItem + '"]');
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
    return (_jsxs("div", { className: cn('h-full liquid-glass-panel transition-[width] duration-150 flex flex-col sidebar-dynamic-width shadow-2xl overflow-y-auto sidebar-scrollbar animate-sidebar-slide-in sidebar-main-container relative volume-container', isCollapsed && 'collapsed', className), children: [_jsxs("div", { className: cn("flex items-center animate-sidebar-content sidebar-header", isCollapsed ? "p-0 justify-center" : "p-3 justify-center"), children: [!isCollapsed && (_jsx("div", { className: "flex items-center justify-center w-full", children: _jsx("div", { onClick: toggleSidebar, className: "w-full h-12 rounded-lg flex items-center justify-center sidebar-logo cursor-pointer hover:scale-105 transition-transform duration-200 bg-transparent border-none", title: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C", children: _jsx("span", { className: "font-bold text-2xl sidebar-logo-text tracking-widest leading-none boss-ai-text", children: "Boss Ai" }) }) })), isCollapsed && (_jsx("button", { onClick: toggleSidebar, className: "sidebar-logo-button mx-auto", title: "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C", children: _jsx("span", { className: "font-bold text-lg sidebar-logo-text sidebar-service-icon-inverted", children: "B" }) }))] }), _jsx("div", { className: cn("gradient-divider", !isCollapsed && "mx-3") }), _jsxs("div", { className: cn("sidebar-services-scroll", isCollapsed ? "p-0" : "px-0"), children: [_jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                // Открываем центральную панель Промптов
                                handleSectionSwitch('prompts');
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                                try {
                                    window.dispatchEvent(new CustomEvent('prompts:open'));
                                }
                                catch (_) { /* no-op */ }
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'prompts' && "active"), title: "\u0411\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432", children: [_jsx(Rows, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0411\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432" }) }))] }) }), _jsxs("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: [_jsxs("button", { onClick: (e) => {
                                    // Toggle: если уже активен, вернуться к workspace
                                    if (state.layout.activeSection === 'ai-lawyer') {
                                        handleSectionSwitch('workspace');
                                    }
                                    else {
                                        handleSectionSwitch('ai-lawyer');
                                        // Автоматически открываем чат при переходе к AI-юристу
                                        if (!state.layout.chatVisible) {
                                            handleToggleChat();
                                        }
                                    }
                                    requestAnimationFrame(() => {
                                        const target = e.currentTarget;
                                        if (target && typeof target.blur === 'function')
                                            target.blur();
                                    });
                                }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'ai-lawyer' && "active"), title: "AI-\u042E\u0440\u0438\u0441\u0442", children: [_jsx(Scale, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "AI-\u042E\u0440\u0438\u0441\u0442" }) }))] }), isCollapsed && state.layout.activeSection === 'ai-lawyer' && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsx("button", { onClick: () => {
                                            setActiveAILawyerTab('guide');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'guide' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'guide' && "active"), title: "\u0413\u0438\u0434 & \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430", children: _jsx(Target, { className: "icon" }) }), _jsx("button", { onClick: () => {
                                            setActiveAILawyerTab('consultation');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'consultation' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'consultation' && "active"), title: "\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F", children: _jsx(Scale, { className: "icon" }) }), _jsx("button", { onClick: () => {
                                            setActiveAILawyerTab('documents');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'documents' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'documents' && "active"), title: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B", children: _jsx(FileText, { className: "icon" }) }), _jsx("button", { onClick: () => {
                                            setActiveAILawyerTab('compliance');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'compliance' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'compliance' && "active"), title: "152-\u0424\u0417 \u0438 \u043A\u043E\u043C\u043F\u043B\u0430\u0435\u043D\u0441", children: _jsx(Shield, { className: "icon" }) })] })), !isCollapsed && state.layout.activeSection === 'ai-lawyer' && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsxs("button", { onClick: () => {
                                            setActiveAILawyerTab('guide');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'guide' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'guide' && "active"), children: [_jsx(Target, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0413\u0438\u0434 & \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430" }) })] }), _jsxs("button", { onClick: () => {
                                            setActiveAILawyerTab('consultation');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'consultation' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'consultation' && "active"), children: [_jsx(Scale, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F" }) })] }), _jsxs("button", { onClick: () => {
                                            setActiveAILawyerTab('documents');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'documents' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'documents' && "active"), children: [_jsx(FileText, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B" }) })] }), _jsxs("button", { onClick: () => {
                                            setActiveAILawyerTab('compliance');
                                            const event = new CustomEvent('ai-lawyer:switch-tab', { detail: 'compliance' });
                                            window.dispatchEvent(event);
                                        }, className: cn("sidebar-service-item", activeAILawyerTab === 'compliance' && "active"), children: [_jsx(Shield, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "152-\u0424\u0417 \u0438 \u043A\u043E\u043C\u043F\u043B\u0430\u0435\u043D\u0441" }) })] })] }))] }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                if (state.layout.activeSection === 'ozon-manager') {
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    handleSectionSwitch('ozon-manager');
                                }
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'ozon-manager' && "active"), title: "Ozon Manager", children: [_jsx(ShoppingCart, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "Ozon Manager" }) }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("div", { className: "relative", ref: settingsMenuRef, children: [_jsxs("button", { onClick: (e) => {
                                        if (state.layout.activeSection === 'settings') {
                                            handleSectionSwitch('workspace');
                                        }
                                        else {
                                            handleSettingsEntry('all');
                                        }
                                        const target = e.currentTarget;
                                        requestAnimationFrame(() => {
                                            if (target && typeof target.blur === 'function')
                                                target.blur();
                                        });
                                    }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'settings' && "active"), title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: [_jsx(Cog, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }) }))] }), isCollapsed && state.layout.activeSection === 'settings' && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsx("button", { onClick: () => toggleSettingsCategory('appearance'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'appearance' && "active"), title: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434", children: _jsx(Palette, { className: "icon" }) }), _jsx("button", { onClick: () => toggleSettingsCategory('interface'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'interface' && "active"), title: "\u0418\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441", children: _jsx(Monitor, { className: "icon" }) }), _jsx("button", { onClick: () => toggleSettingsCategory('chat'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'chat' && "active"), title: "\u0427\u0430\u0442", children: _jsx(MessageSquare, { className: "icon" }) }), _jsx("button", { onClick: () => toggleSettingsCategory('notifications'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'notifications' && "active"), title: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", children: _jsx(Bell, { className: "icon" }) })] })), state.layout.activeSection === 'settings' && !isCollapsed && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsxs("button", { onClick: () => toggleSettingsCategory('appearance'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'appearance' && "active"), children: [_jsx(Palette, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434" }) })] }), _jsxs("button", { onClick: () => toggleSettingsCategory('interface'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'interface' && "active"), children: [_jsx(Monitor, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0418\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441" }) })] }), _jsxs("button", { onClick: () => toggleSettingsCategory('chat'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'chat' && "active"), children: [_jsx(MessageSquare, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0427\u0430\u0442" }) })] }), _jsxs("button", { onClick: () => toggleSettingsCategory('notifications'), className: cn("sidebar-service-item", state.layout.activeSettingsCategory === 'notifications' && "active"), children: [_jsx(Bell, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }) })] })] }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("div", { className: "relative", ref: widgetsMenuRef, children: [_jsxs("button", { onClick: (e) => {
                                        // Переключаем видимость dropdown меню виджетов
                                        setShowWidgetsDropdown(!showWidgetsDropdown);
                                        const target = e.currentTarget;
                                        requestAnimationFrame(() => {
                                            if (target && typeof target.blur === 'function')
                                                target.blur();
                                        });
                                    }, className: cn("sidebar-service-button", isCollapsed && "compact", (showWidgetsDropdown || state.layout.activeWidgetsCategory.length > 0) && "active"), title: "\u0412\u0438\u0434\u0436\u0435\u0442\u044B", children: [_jsx(LayoutGrid, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0412\u0438\u0434\u0436\u0435\u0442\u044B" }) }))] }), isCollapsed && showWidgetsDropdown && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsx("button", { onClick: () => toggleWidgetCategory('time-widget'), className: cn("sidebar-service-item", state.layout.activeWidgetsCategory.includes('time-widget') && "active"), title: "\u0427\u0430\u0441\u044B", children: _jsx(Clock, { className: "icon" }) }), _jsx("button", { onClick: () => toggleWidgetCategory('voice-widget'), className: cn("sidebar-service-item", state.layout.activeWidgetsCategory.includes('voice-widget') && "active"), title: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0432\u0432\u043E\u0434", children: _jsx(Mic, { className: "icon" }) })] })), showWidgetsDropdown && !isCollapsed && (_jsxs("div", { className: "sidebar-service-dropdown", children: [_jsxs("button", { onClick: () => {
                                                toggleWidgetCategory('time-widget');
                                                window.dispatchEvent(new CustomEvent('widgets:toggle', { detail: 'time-widget' }));
                                            }, className: cn("sidebar-service-item", state.layout.activeWidgetsCategory.includes('time-widget') && "active"), children: [_jsx(Clock, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0427\u0430\u0441\u044B" }) })] }), _jsxs("button", { onClick: () => {
                                                toggleWidgetCategory('voice-widget');
                                                window.dispatchEvent(new CustomEvent('widgets:toggle', { detail: 'voice-widget' }));
                                            }, className: cn("sidebar-service-item", state.layout.activeWidgetsCategory.includes('voice-widget') && "active"), children: [_jsx(Mic, { className: "icon" }), _jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0432\u0432\u043E\u0434" }) })] })] }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                if (state.layout.activeSection === 'photo-studio') {
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    handleSectionSwitch('photo-studio');
                                }
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'photo-studio' && "active"), title: "\u0424\u043E\u0442\u043E\u0441\u0442\u0443\u0434\u0438\u044F", children: [_jsx(Camera, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0424\u043E\u0442\u043E\u0441\u0442\u0443\u0434\u0438\u044F" }) }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                // Toggle: если уже активен, вернуться к workspace
                                if (state.layout.activeSection === 'corporate') {
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    handleSectionSwitch('corporate');
                                }
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'corporate' && "active"), title: "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442", children: [_jsx(Building, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442" }) }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                // Toggle: если уже активен, вернуться к workspace
                                if (state.layout.activeSection === 'sales-scripts') {
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    handleSectionSwitch('sales-scripts');
                                }
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'sales-scripts' && "active"), title: "\u0421\u043A\u0440\u0438\u043F\u0442\u044B \u043F\u0440\u043E\u0434\u0430\u0436", children: [_jsx(MessageSquare, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0421\u043A\u0440\u0438\u043F\u0442\u044B \u043F\u0440\u043E\u0434\u0430\u0436" }) }))] }) }), _jsx("div", { className: cn(isCollapsed ? "p-0" : "px-3 py-2"), children: _jsxs("button", { onClick: (e) => {
                                // Toggle: если уже активен, вернуться к workspace
                                if (state.layout.activeSection === 'regulations') {
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    handleSectionSwitch('regulations');
                                }
                                requestAnimationFrame(() => {
                                    const target = e.currentTarget;
                                    if (target && typeof target.blur === 'function')
                                        target.blur();
                                });
                            }, className: cn("sidebar-service-button", isCollapsed && "compact", state.layout.activeSection === 'regulations' && "active"), title: "\u0420\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u044B \u0440\u0430\u0431\u043E\u0442\u044B", children: [_jsx(FileText, { className: "icon" }), !isCollapsed && (_jsx("div", { className: "service-content", children: _jsx("div", { className: "service-title", children: "\u0420\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u044B" }) }))] }) })] }), _jsx("div", { className: cn("gradient-divider", !isCollapsed && "mx-3") }), _jsxs("nav", { className: cn("animate-sidebar-content flex-1 min-h-0 sidebar-projects", isCollapsed ? "p-0" : "p-3 pt-1"), children: [!isCollapsed && (_jsxs("div", { className: "flex items-center justify-between mb-2 mt-2", children: [_jsx("h3", { className: "text-sm font-medium sidebar-services-title", children: "\u041F\u0440\u043E\u0435\u043A\u0442\u044B" }), _jsx(UnifiedButton, { onClick: handleCreateWorkspace, variant: "primary", size: "sm", className: "sidebar-create-button", title: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442", children: _jsx("span", { className: "text-sm", children: "+" }) })] })), _jsx("div", { ref: projectsScrollRef, className: "sidebar-workspaces-scroll h-full min-h-0", children: _jsxs("ul", { className: cn("sidebar-nav", isCollapsed ? "space-y-4" : "space-y-5"), children: [isCollapsed && (_jsx("li", { children: _jsx(UnifiedButton, { onClick: handleCreateWorkspace, variant: "primary", size: "sm", className: "sidebar-create-button w-full", title: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442", children: _jsx("span", { className: "text-sm", children: "+" }) }) })), workspaceItems.filter(item => item.type === 'folder').map((item) => {
                                    const getIcon = (type) => {
                                        switch (type) {
                                            case 'folder': return Folder;
                                            case 'document': return File;
                                            case 'note': return MessageSquare;
                                            case 'image': return Eye;
                                            default: return Layout;
                                        }
                                    };
                                    const IconComponent = getIcon(item.type);
                                    return (_jsx("li", { children: _jsx("div", { "data-workspace-id": item.id, onClick: () => {
                                                setActiveItem(item.id);
                                                handleSectionSwitch('workspace');
                                                try {
                                                    window.dispatchEvent(new CustomEvent('workspace:navigate', { detail: { projectId: item.id } }));
                                                }
                                                catch (_) {
                                                    // no-op
                                                }
                                            }, className: cn("sidebar-service-button transition-all duration-200", isCollapsed && "compact", activeItem === item.id && "active"), title: isCollapsed ? item.title : undefined, children: _jsxs("div", { className: cn("sidebar-project-btn flex items-center flex-1 text-left", isCollapsed ? "justify-center" : "space-x-3"), onDoubleClick: () => handleProjectDoubleClick(item), children: [_jsx(IconComponent, { className: "icon" }), !isCollapsed && editingProject === item.id ? (_jsx("input", { ref: editInputRef, type: "text", value: editingTitle, onChange: (e) => setEditingTitle(e.target.value), onBlur: () => handleSaveProjectTitle(item.id), onKeyDown: (e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSaveProjectTitle(item.id);
                                                            }
                                                            else if (e.key === 'Escape') {
                                                                handleCancelEdit();
                                                            }
                                                        }, onClick: (e) => e.stopPropagation(), placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u0430", "aria-label": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u0430", className: "service-content service-title truncate bg-surface border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })) : !isCollapsed && (_jsx("span", { className: "service-content", children: _jsx("span", { className: "service-title truncate", children: item.title }) }))] }) }) }, item.id));
                                })] }) })] }), _jsx("div", { className: cn("gradient-divider", !isCollapsed && "mx-3") }), _jsx("div", { className: cn("mt-auto sidebar-footer", isCollapsed ? "p-0 collapsed" : "p-4"), children: _jsxs("div", { className: cn("flex", isCollapsed ? "flex-col space-y-1" : "items-center justify-between gap-2"), children: [_jsx("button", { onClick: () => switchSection('notifications'), className: cn("sidebar-footer-button", state.layout.activeSection === 'notifications' && "active"), title: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", children: _jsx(Bell, { className: "w-4 h-4 icon" }) }), _jsx("button", { onClick: () => {
                                // Исправленная логика: клик по настройкам работает как переключатель настроек
                                if (state.layout.activeSection === 'settings') {
                                    // Если настройки открыты - закрываем их
                                    handleSectionSwitch('workspace');
                                }
                                else {
                                    // Если настройки не открыты - открываем настройки
                                    handleSettingsEntry('all');
                                    // В свернутой панели НЕ раскрываем панель - только показываем иконки
                                }
                            }, className: cn("sidebar-footer-button", state.layout.activeSection === 'settings' && "active"), title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: _jsx(Cog, { className: "w-4 h-4 icon" }) }), _jsx("button", { onClick: () => setShowProfile(true), className: cn("sidebar-footer-button", showProfile && "active"), title: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C", "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C", children: state.authUser?.photo_url ? (_jsx("img", { src: state.authUser.photo_url, alt: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C", className: "w-4 h-4 rounded-full" })) : (_jsx(User, { className: "w-4 h-4 icon" })) })] }) }), _jsx(AnimatePresence, { children: showProfile && state.authUser && (_jsx(ProfilePanel, { user: state.authUser, onClose: () => setShowProfile(false), onLogout: async () => {
                        await logout();
                        setShowProfile(false);
                    } })) })] }));
};
//# sourceMappingURL=Sidebar.js.map