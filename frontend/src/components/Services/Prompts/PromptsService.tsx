import { UnifiedService } from '@/components/common';
import { usePlatform } from '@/hooks/usePlatform';
import React, { useCallback, useMemo, useState } from 'react';
import { promptManager } from '../../../data/prompts/PromptManager';
import { PromptCategory, PromptFolder, PromptItem } from '../../../data/prompts/types';
import { GPTSettingsPanel } from './GPTSettingsPanel';

type Tab = { id: string; title: string };

// Типы для навигации
type NavigationLevel = 'categories' | 'category' | 'folder' | 'prompt';
type NavigationState = {
    level: NavigationLevel;
    categoryId?: string;
    folderId?: string;
    promptId?: string;
};

export const PromptsService: React.FC = () => {
    const { state } = usePlatform();
    const [categories, setCategories] = useState<PromptCategory[]>([]);
    const [folders, setFolders] = useState<PromptFolder[]>([]);
    const [prompts, setPrompts] = useState<PromptItem[]>([]);
    const [quick, setQuick] = useState<PromptItem[]>([]);
    const [isImproving, setIsImproving] = useState(false);
    const [improvementRequest, setImprovementRequest] = useState('');

    // Состояния для создания
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [showCreatePrompt, setShowCreatePrompt] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newPromptTitle, setNewPromptTitle] = useState('');
    const [newPromptBody, setNewPromptBody] = useState('');

    // Состояние навигации
    const [navigation, setNavigation] = useState<NavigationState>({
        level: 'categories',
        categoryId: undefined,
        folderId: undefined,
        promptId: undefined
    });

    // Состояние выбранного промпта для правой панели
    const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

    // Состояние для отслеживания активного проекта
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // Состояние для счетчиков промптов в категориях
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

    // Состояние для фильтра избранного

    // Получение текущего проекта
    const getCurrentProject = useCallback(() => {
        if (activeProjectId) {
            const activeProject = state.workspaceItems.find(item =>
                item.id === activeProjectId && item.type === 'folder'
            );
            return activeProject?.title || null;
        }
        return null;
    }, [state.workspaceItems, activeProjectId]);

    // Слушатель событий для получения активного проекта
    React.useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ projectId: string }>;
            console.log('PromptsService received workspace:navigate event:', custom.detail);
            if (custom.detail?.projectId) {
                setActiveProjectId(custom.detail.projectId);
                console.log('Set activeProjectId to:', custom.detail.projectId);
            }
        };
        window.addEventListener('workspace:navigate', handler as EventListener);
        return () => window.removeEventListener('workspace:navigate', handler as EventListener);
    }, []);

    // Обработчик для открытия промпта из чата
    React.useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ promptId: string }>;
            if (custom.detail?.promptId) {
                navigateToPrompt(custom.detail.promptId);
            }
        };
        window.addEventListener('prompts:open', handler as EventListener);
        return () => window.removeEventListener('prompts:open', handler as EventListener);
    }, []);

    const loadData = useCallback(async () => {
        try {
            console.log('[PromptsService] Loading data...');
            const [categoriesData, foldersData, quickData] = await Promise.all([
                promptManager.getCategories(),
                promptManager.getFolders(),
                promptManager.getQuickAccess()
            ]);

            console.log('[PromptsService] Initial data loaded:', {
                categories: categoriesData.length,
                folders: foldersData.length,
                quick: quickData.length,
                quickIds: quickData.map(q => q.id)
            });


            // Объединяем категории "Сгенерированные" и "Boss AI Generation"
            let updatedCategoriesData = categoriesData;
            try {
                await promptManager.mergeGeneratedCategories();
                // Перезагружаем категории после объединения
                updatedCategoriesData = await promptManager.getCategories();
            } catch (error) {
                console.error('Failed to merge generated categories:', error);
            }

            // Создаем категорию "Избранное" если её нет
            let categoriesWithFavorites = [...updatedCategoriesData];
            const favoritesCategory = updatedCategoriesData.find((c: any) => c.title === 'Избранное');
            if (!favoritesCategory) {
                try {
                    await promptManager.createUserCategory('Избранное');
                    // Перезагружаем категории после создания
                    const updatedCategories = await promptManager.getCategories();
                    categoriesWithFavorites = updatedCategories;
                } catch (error) {
                    console.error('Failed to create favorites category:', error);
                }
            }

            console.log('[PromptsService] Final data loaded:', {
                categories: categoriesWithFavorites.length,
                folders: foldersData.length,
                quick: quickData.length,
                quickIds: quickData.map(q => q.id)
            });

            setCategories(categoriesWithFavorites);
            setFolders(foldersData);
            setQuick(quickData);

            // Загружаем промпты для текущей категории
            if (navigation.categoryId) {
                const currentCategory = categoriesWithFavorites.find(c => c.id === navigation.categoryId);
                console.log('[PromptsService] Current category:', currentCategory?.title);
                if (currentCategory?.title === 'Избранное') {
                    // Для категории "Избранное" показываем все избранные промпты
                    const allPrompts = await promptManager.getAllPrompts();
                    console.log(`[PromptsService] Total prompts loaded: ${allPrompts.length}`);
                    console.log(`[PromptsService] Quick access items: ${quickData.length}`, quickData.map(q => q.id));
                    const favoritePrompts = allPrompts.filter(p => quickData.some(q => q.id === p.id));
                    console.log(`[PromptsService] Filtered favorite prompts: ${favoritePrompts.length}`);
                    console.log(`[PromptsService] Favorite prompts details:`, favoritePrompts.map(p => ({ id: p.id, title: p.title })));
                    setPrompts(favoritePrompts);
                } else {
                    const categoryPrompts = await promptManager.getPromptsInCategory(navigation.categoryId);
                    setPrompts(categoryPrompts);
                }
            } else if (navigation.folderId) {
                const folderPrompts = await promptManager.getPromptsInFolder(navigation.folderId);
                setPrompts(folderPrompts);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }, [navigation.categoryId, navigation.folderId]);

    // Загрузка счетчиков промптов для категорий
    const loadCategoryCounts = useCallback(async () => {
        try {
            const counts: Record<string, number> = {};
            for (const category of categories) {
                if (category.title === 'Избранное') {
                    // Для категории "Избранное" считаем количество избранных промптов
                    // Получаем все промпты и фильтруем по избранным
                    const allPrompts = await promptManager.getAllPrompts();
                    const favoritePrompts = allPrompts.filter(p => quick.some(q => q.id === p.id));
                    counts[category.id] = favoritePrompts.length;
                    console.log(`[PromptsService] Favorites count: ${favoritePrompts.length} (quick: ${quick.length})`);
                } else {
                    const categoryPrompts = await promptManager.getPromptsInCategory(category.id);
                    counts[category.id] = categoryPrompts.length;
                }
            }
            setCategoryCounts(counts);
        } catch (error) {
            console.error('Failed to load category counts:', error);
        }
    }, [categories, quick]);

    // Загрузка данных при монтировании
    React.useEffect(() => {
        console.log('[PromptsService] Component mounted, loading data...');
        loadData();
    }, [loadData]);

    // Отладочная информация о состоянии
    React.useEffect(() => {
        console.log('[PromptsService] State updated:', {
            categories: categories.length,
            quick: quick.length,
            prompts: prompts.length,
            navigation: navigation
        });
    }, [categories, quick, prompts, navigation]);

    // Загрузка счетчиков при изменении категорий
    React.useEffect(() => {
        if (categories.length > 0) {
            loadCategoryCounts();
        }
    }, [categories, loadCategoryCounts]);

    const categoryTabs: Tab[] = useMemo(() => categories
        .sort((a, b) => a.order - b.order)
        .map(c => ({ id: c.id, title: c.title })), [categories]);

    // Функции навигации
    const navigateToCategory = async (categoryId: string) => {
        console.log(`[PromptsService] Navigating to category: ${categoryId}`);
        setNavigation({
            level: 'category',
            categoryId,
            folderId: undefined,
            promptId: undefined
        });
        // Сбрасываем выбранный промпт при переходе в категории
        setSelectedPrompt(null);

        // Загружаем промпты категории
        try {
            const currentCategory = categories.find(c => c.id === categoryId);
            console.log(`[PromptsService] Current category: ${currentCategory?.title}`);
            if (currentCategory?.title === 'Избранное') {
                // Для категории "Избранное" показываем все избранные промпты
                console.log(`[PromptsService] Loading favorites, quick state:`, quick.map(q => ({ id: q.id, title: q.title })));
                const allPrompts = await promptManager.getAllPrompts();
                console.log(`[PromptsService] Total prompts for favorites: ${allPrompts.length}`);
                console.log(`[PromptsService] Quick access items: ${quick.length}`, quick.map(q => q.id));
                const favoritePrompts = allPrompts.filter(p => quick.some(q => q.id === p.id));
                console.log(`[PromptsService] Filtered favorite prompts: ${favoritePrompts.length}`);
                console.log(`[PromptsService] Favorite prompts details:`, favoritePrompts.map(p => ({ id: p.id, title: p.title })));
                setPrompts(favoritePrompts);
                console.log(`[PromptsService] Loaded ${favoritePrompts.length} favorite prompts`);
            } else {
                const categoryPrompts = await promptManager.getPromptsInCategory(categoryId);
                setPrompts(categoryPrompts);
                console.log(`[PromptsService] Loaded ${categoryPrompts.length} prompts for category: ${currentCategory?.title}`);
            }
        } catch (error) {
            console.error('Failed to load category prompts:', error);
        }
    };

    const navigateToFolder = async (folderId: string) => {
        setNavigation({
            level: 'folder',
            categoryId: navigation.categoryId,
            folderId,
            promptId: undefined
        });
        setSelectedPrompt(null);

        // Загружаем промпты папки
        try {
            const folderPrompts = await promptManager.getPromptsInFolder(folderId);
            setPrompts(folderPrompts);
        } catch (error) {
            console.error('Failed to load folder prompts:', error);
        }
    };

    const navigateToPrompt = async (promptId: string) => {
        try {
            const prompt = await promptManager.getPrompt(promptId);
            if (prompt) {
                setNavigation({
                    level: 'prompt',
                    categoryId: prompt.categoryId,
                    folderId: prompt.folderId,
                    promptId
                });
                setSelectedPrompt(prompt);
            }
        } catch (error) {
            console.error('Failed to load prompt:', error);
        }
    };

    const navigateBack = async () => {
        if (navigation.level === 'prompt') {
            if (navigation.folderId) {
                setNavigation({
                    level: 'folder',
                    categoryId: navigation.categoryId,
                    folderId: navigation.folderId,
                    promptId: undefined
                });
                const folderPrompts = await promptManager.getPromptsInFolder(navigation.folderId);
                setPrompts(folderPrompts);
            } else {
                setNavigation({
                    level: 'category',
                    categoryId: navigation.categoryId,
                    folderId: undefined,
                    promptId: undefined
                });
                const categoryPrompts = await promptManager.getPromptsInCategory(navigation.categoryId!);
                setPrompts(categoryPrompts);
            }
            setSelectedPrompt(null);
        } else if (navigation.level === 'folder') {
            setNavigation({
                level: 'category',
                categoryId: navigation.categoryId,
                folderId: undefined,
                promptId: undefined
            });
            const categoryPrompts = await promptManager.getPromptsInCategory(navigation.categoryId!);
            setPrompts(categoryPrompts);
        } else if (navigation.level === 'category') {
            setNavigation({
                level: 'categories',
                categoryId: undefined,
                folderId: undefined,
                promptId: undefined
            });
            setPrompts([]);
        }
    };

    // Получение текущих данных в зависимости от уровня навигации
    const currentCategory = useMemo(() =>
        navigation.categoryId ? categories.find(c => c.id === navigation.categoryId) : null,
        [categories, navigation.categoryId]
    );

    const currentFolder = useMemo(() =>
        navigation.folderId ? folders.find(f => f.id === navigation.folderId) : null,
        [folders, navigation.folderId]
    );

    const visibleFolders = useMemo(() => {
        if (navigation.level !== 'category' || !navigation.categoryId) return [];
        return folders
            .filter(f => f.categoryId === navigation.categoryId)
            .sort((a, b) => a.order - b.order);
    }, [folders, navigation]);

    const visiblePrompts = useMemo(() => {
        if (navigation.level === 'categories') return [];

        let filteredPrompts = prompts;

        if (navigation.categoryId) {
            filteredPrompts = filteredPrompts.filter(p => p.categoryId === navigation.categoryId);
        }

        if (navigation.folderId) {
            filteredPrompts = filteredPrompts.filter(p => p.folderId === navigation.folderId);
        } else if (navigation.level === 'category') {
            filteredPrompts = filteredPrompts.filter(p => !p.folderId);
        }

        return filteredPrompts.sort((a, b) => a.title.localeCompare(b.title));
    }, [prompts, navigation]);

    // Новые функции
    const restoreSystemPrompts = async () => {
        try {
            await promptManager.restoreSystemPrompts();
            await loadData();
            alert('Системные промпты восстановлены!');
        } catch (error) {
            console.error('Failed to restore system prompts:', error);
            alert('Ошибка при восстановлении системных промптов');
        }
    };



    const improvePrompt = async () => {
        if (!improvementRequest.trim()) return;

        setIsImproving(true);
        try {
            const result = await promptManager.improvePrompt(improvementRequest);

            // Отправляем улучшенный промпт в чат
            window.dispatchEvent(new CustomEvent('chat:improve-prompt', {
                detail: {
                    originalPrompt: improvementRequest,
                    improvedPrompt: result.improvedPrompt,
                    suggestions: result.suggestions,
                    explanation: result.explanation
                }
            }));

            // Перезагружаем данные для отображения сохраненного промпта
            await loadData();

            setImprovementRequest('');
            alert('Промпт улучшен, сохранен в категорию "Сгенерированные" и отправлен в чат!');
        } catch (error) {
            console.error('Failed to improve prompt:', error);
            alert('Ошибка при улучшении промпта');
        } finally {
            setIsImproving(false);
        }
    };

    const deletePrompt = async (promptId: string) => {
        if (!confirm('Удалить этот промпт?')) return;

        try {
            await promptManager.deletePrompt(promptId);
            await loadData();
            if (selectedPrompt?.id === promptId) {
                setSelectedPrompt(null);
                navigateBack();
            }
        } catch (error) {
            console.error('Failed to delete prompt:', error);
            alert('Ошибка при удалении промпта');
        }
    };

    const deleteFolder = async (folderId: string) => {
        if (!confirm('Удалить эту папку и все промпты в ней?')) return;

        try {
            // Удаляем все промпты в папке
            const folderPrompts = await promptManager.getPromptsInFolder(folderId);
            for (const prompt of folderPrompts) {
                await promptManager.deletePrompt(prompt.id);
            }

            // Удаляем папку (нужно добавить метод в PromptManager)
            await loadData();
        } catch (error) {
            console.error('Failed to delete folder:', error);
            alert('Ошибка при удалении папки');
        }
    };

    const deleteCategory = async (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        // Нельзя удалять системные категории и категорию "Избранное"
        if (category.system) {
            alert('Нельзя удалять системные категории');
            return;
        }

        if (category.title === 'Избранное') {
            alert('Нельзя удалять категорию "Избранное"');
            return;
        }

        if (!confirm(`Удалить категорию "${category.title}" и все промпты в ней?`)) return;

        try {
            await promptManager.deleteCategory(categoryId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Ошибка при удалении категории');
        }
    };

    // Создание новой категории
    const createCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            await promptManager.createUserCategory(newCategoryName.trim());
            setNewCategoryName('');
            setShowCreateCategory(false);
            await loadData();
            alert('Категория создана!');
        } catch (error) {
            console.error('Failed to create category:', error);
            alert('Ошибка при создании категории');
        }
    };

    // Создание нового промпта
    const createPrompt = async () => {
        if (!newPromptTitle.trim() || !newPromptBody.trim()) return;

        try {
            const categoryId = navigation.categoryId;
            if (!categoryId) {
                alert('Выберите категорию для создания промпта');
                return;
            }

            const currentProject = getCurrentProject();
            console.log('Creating prompt with project:', currentProject, 'activeProjectId:', activeProjectId);

            await promptManager.createPromptInCategory(
                categoryId,
                newPromptTitle.trim(),
                newPromptBody.trim(),
                undefined,
                undefined,
                currentProject || undefined
            );

            setNewPromptTitle('');
            setNewPromptBody('');
            setShowCreatePrompt(false);
            await loadData();
            alert('Промпт создан!' + (currentProject ? ` Тег проекта "${currentProject}" добавлен.` : ' (проект не определен)'));
        } catch (error) {
            console.error('Failed to create prompt:', error);
            alert('Ошибка при создании промпта');
        }
    };

    const toggleQuick = async (promptId: string) => {
        try {
            const isInQuick = quick.some(p => p.id === promptId);
            console.log(`[PromptsService] Toggling quick access for prompt ${promptId}, currently in quick: ${isInQuick}`);
            console.log(`[PromptsService] Current quick state:`, quick.map(q => ({ id: q.id, title: q.title })));

            if (isInQuick) {
                // Убираем из избранного
                await promptManager.removeFromQuickAccess(promptId);
                console.log(`[PromptsService] Removed prompt ${promptId} from quick access`);
            } else {
                // Добавляем в избранное
                await promptManager.addToQuickAccess(promptId);
                console.log(`[PromptsService] Added prompt ${promptId} to quick access`);
            }

            // Обновляем локальное состояние
            const updatedQuick = await promptManager.getQuickAccess();
            console.log(`[PromptsService] Updated quick access: ${updatedQuick.length} items`);
            console.log(`[PromptsService] Updated quick access details:`, updatedQuick.map(q => ({ id: q.id, title: q.title })));
            setQuick(updatedQuick);

            // Обновляем счетчики категорий
            await loadCategoryCounts();

            // Если мы находимся в категории "Избранное", обновляем список промптов
            const currentCategory = categories.find(c => c.id === navigation.categoryId);
            if (currentCategory?.title === 'Избранное') {
                const allPrompts = await promptManager.getAllPrompts();
                const favoritePrompts = allPrompts.filter(p => updatedQuick.some(q => q.id === p.id));
                setPrompts(favoritePrompts);
                console.log(`[PromptsService] Updated favorites list: ${favoritePrompts.length} prompts`);
                console.log(`[PromptsService] Updated favorites details:`, favoritePrompts.map(p => ({ id: p.id, title: p.title })));
            }

            // Принудительно обновляем UI
            setTimeout(() => {
                setQuick([...updatedQuick]);
            }, 100);

            console.log(`[PromptsService] Toggled quick access for prompt ${promptId}, isInQuick: ${!isInQuick}`);
        } catch (error) {
            console.error('Failed to toggle quick access:', error);
            alert('Ошибка при добавлении в избранное. Попробуйте еще раз.');
        }
    };

    const sendToChat = (prompt: PromptItem) => {
        // Отправляем промпт в чат с настройками
        window.dispatchEvent(new CustomEvent('chat:insert-prompt', {
            detail: {
                id: prompt.id,
                body: prompt.body,
                title: prompt.title,
                settings: prompt.settings
            }
        }));

        // Показываем уведомление
        console.log(`Промпт "${prompt.title}" отправлен в чат${prompt.settings ? ' с настройками' : ''}`);
    };

    const copyPromptText = async (prompt: PromptItem) => {
        try {
            await navigator.clipboard.writeText(prompt.body);
            console.log(`Промпт "${prompt.title}" скопирован в буфер обмена`);
            // Можно добавить уведомление о копировании
        } catch (error) {
            console.error('Failed to copy prompt text:', error);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = prompt.body;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log(`Промпт "${prompt.title}" скопирован в буфер обмена (fallback)`);
        }
    };

    // Обработка клика по тегу проекта
    const handleProjectTagClick = (projectTag: string) => {
        const projectName = projectTag.replace('project:', '');
        // Отправляем событие для перехода в проект
        window.dispatchEvent(new CustomEvent('workspace:navigate', {
            detail: { projectName }
        }));
    };


    // Функция для получения хлебных крошек
    const getBreadcrumbs = () => {
        const crumbs = [];

        if (navigation.level === 'categories') {
            crumbs.push({ label: 'Все категории', count: categories.length });
        } else if (navigation.level === 'category' && currentCategory) {
            crumbs.push({ label: 'Все категории', count: categories.length });
            crumbs.push({ label: currentCategory.title, count: visiblePrompts.length + visibleFolders.length });
        } else if (navigation.level === 'folder' && currentFolder) {
            crumbs.push({ label: 'Все категории', count: categories.length });
            crumbs.push({ label: currentCategory?.title || '', count: 0 });
            crumbs.push({ label: currentFolder.title, count: visiblePrompts.length });
        } else if (navigation.level === 'prompt' && selectedPrompt) {
            crumbs.push({ label: 'Все категории', count: categories.length });
            crumbs.push({ label: currentCategory?.title || '', count: 0 });
            if (currentFolder) {
                crumbs.push({ label: currentFolder.title, count: 0 });
            }
            crumbs.push({ label: selectedPrompt.title, count: 0 });
        }

        return crumbs;
    };

    return (
        <UnifiedService id="prompts-service" title="Промпты" icon="🗂" status="inactive">
            <div className="flex gap-4 h-full">
                {/* Левая панель - навигация и содержимое */}
                <div className="flex-1">
                    {/* Улучшение промптов - базовая функция сервиса */}
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                className="platform-input flex-1"
                                placeholder="✨ Улучшить промпт..."
                                value={improvementRequest}
                                onChange={e => setImprovementRequest(e.target.value)}
                                disabled={isImproving}
                            />
                            <button
                                className="prompts-action-button primary"
                                onClick={improvePrompt}
                                disabled={isImproving || !improvementRequest.trim()}
                                title="Улучшить промпт и отправить в чат"
                            >
                                {isImproving ? 'Улучшаю...' : 'Улучшить'}
                            </button>
                        </div>
                    </div>
                    {/* Панель управления - упрощенная */}
                    <div className="prompts-management-bar">
                        {/* Хлебные крошки */}
                        <div className="prompts-breadcrumbs">
                            {getBreadcrumbs().map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <span className="prompts-breadcrumb-item">/</span>}
                                    <span
                                        className={`${index === getBreadcrumbs().length - 1 ? 'prompts-breadcrumb-current' : 'prompts-breadcrumb-item'} ${index < getBreadcrumbs().length - 1 ? 'clickable' : ''}`}
                                        onClick={() => {
                                            if (index === 0) {
                                                setNavigation({ level: 'categories', categoryId: undefined, folderId: undefined, promptId: undefined });
                                                setSelectedPrompt(null); // Сбрасываем выбранный промпт при переходе к категориям
                                            } else if (index === 1 && navigation.level !== 'categories') {
                                                navigateToCategory(navigation.categoryId!);
                                            } else if (index === 2 && navigation.level === 'prompt' && navigation.folderId) {
                                                navigateToFolder(navigation.folderId);
                                            }
                                        }}
                                    >
                                        {crumb.label}
                                    </span>
                                    {crumb.count > 0 && (
                                        <span className="prompts-breadcrumb-count">{crumb.count}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Кнопки действий - только необходимые */}
                        <div className="prompts-actions">
                            <button
                                className={`prompt-favorite-button ${navigation.categoryId && categories.find(c => c.id === navigation.categoryId)?.title === 'Избранное' ? 'favorited' : ''}`}
                                onClick={() => {
                                    const favoritesCategory = categories.find(c => c.title === 'Избранное');
                                    if (favoritesCategory) {
                                        navigateToCategory(favoritesCategory.id);
                                    }
                                }}
                                title={`Открыть избранные промпты (${quick.length})`}
                            >
                                <span>★</span>
                                {quick.length > 0 && (
                                    <span className="favorite-count">{quick.length}</span>
                                )}
                            </button>
                            <button
                                className="prompts-action-button"
                                onClick={restoreSystemPrompts}
                                title="Восстановить системные промпты"
                            >
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                    <path d="M21 3v5h-5" />
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                    <path d="M3 21v-5h5" />
                                </svg>
                            </button>
                            {navigation.level === 'categories' && (
                                <button
                                    className="create-document-button"
                                    onClick={() => setShowCreateCategory(true)}
                                    title="Создать категорию"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14" />
                                        <path d="M5 12h14" />
                                    </svg>
                                    <span>Создать категорию</span>
                                </button>
                            )}
                            {navigation.level === 'category' && (
                                <button
                                    className="create-document-button"
                                    onClick={() => setShowCreatePrompt(true)}
                                    title="Создать промпт"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10,9 9,9 8,9" />
                                    </svg>
                                    <span>Создать промпт</span>
                                </button>
                            )}
                        </div>
                    </div>




                    {/* Модальное окно создания категории */}
                    {showCreateCategory && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-surface rounded-lg p-6 w-96 max-w-full mx-4">
                                <h3 className="text-lg font-semibold mb-4">Создать категорию</h3>
                                <div className="space-y-4">
                                    <input
                                        className="platform-input w-full"
                                        placeholder="Название категории"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && createCategory()}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            className="prompts-action-button"
                                            onClick={() => {
                                                setShowCreateCategory(false);
                                                setNewCategoryName('');
                                            }}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            className="prompts-action-button primary"
                                            onClick={createCategory}
                                            disabled={!newCategoryName.trim()}
                                        >
                                            Создать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Модальное окно создания промпта */}
                    {showCreatePrompt && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-surface rounded-lg p-6 w-96 max-w-full mx-4 max-h-[80vh] overflow-y-auto">
                                <h3 className="text-lg font-semibold mb-4">Создать промпт</h3>
                                <div className="space-y-4">
                                    <input
                                        className="platform-input w-full"
                                        placeholder="Название промпта"
                                        value={newPromptTitle}
                                        onChange={e => setNewPromptTitle(e.target.value)}
                                    />
                                    <textarea
                                        className="platform-input w-full min-h-[200px] resize-none"
                                        placeholder="Текст промпта"
                                        value={newPromptBody}
                                        onChange={e => setNewPromptBody(e.target.value)}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            className="prompts-action-button"
                                            onClick={() => {
                                                setShowCreatePrompt(false);
                                                setNewPromptTitle('');
                                                setNewPromptBody('');
                                            }}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            className="prompts-action-button primary"
                                            onClick={createPrompt}
                                            disabled={!newPromptTitle.trim() || !newPromptBody.trim()}
                                        >
                                            Создать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Отображение выбранного промпта под навигацией */}
                    {selectedPrompt && (
                        <div className="prompt-detail-view">
                            <div className="prompt-detail-header">
                                <h2 className="prompt-detail-title">Промпт</h2>
                                <div className="prompt-detail-actions">
                                    <button
                                        className={`prompt-favorite-button ${quick.some(p => p.id === selectedPrompt.id) ? 'favorited' : ''}`}
                                        onClick={() => toggleQuick(selectedPrompt.id)}
                                        title={quick.some(p => p.id === selectedPrompt.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                                    >
                                        <span>{quick.some(p => p.id === selectedPrompt.id) ? '★' : '☆'}</span>
                                    </button>
                                    <button
                                        className="copy-button"
                                        onClick={() => copyPromptText(selectedPrompt)}
                                        title="Копировать текст промпта"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                        <span>Копировать</span>
                                    </button>
                                    <button
                                        className="chat-send-button"
                                        onClick={() => sendToChat(selectedPrompt)}
                                        title="Отправить в чат"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                        <span className="text-sm">В чат</span>
                                    </button>
                                    <button
                                        className="platform-button-base platform-button-danger px-3 py-1.5 text-sm rounded-md sidebar-footer-button"
                                        onClick={() => deletePrompt(selectedPrompt.id)}
                                        title="Удалить промпт"
                                    >
                                        <span className="platform-button-content">
                                            <svg className="w-3.5 h-3.5 icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                <line x1="14" x2="14" y1="11" y2="17" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="prompt-detail-content">
                                {/* Название */}
                                <div className="prompt-detail-section">
                                    <label className="prompt-detail-section-label">Название</label>
                                    <div className="prompt-detail-section-content prompt-title">
                                        <input
                                            className="w-full bg-transparent border-none outline-none text-base font-medium"
                                            value={selectedPrompt.title}
                                            onChange={async (e) => {
                                                try {
                                                    await promptManager.updatePrompt(selectedPrompt.id, { title: e.target.value });
                                                    setSelectedPrompt({ ...selectedPrompt, title: e.target.value });
                                                } catch (error) {
                                                    console.error('Failed to update prompt title:', error);
                                                }
                                            }}
                                            placeholder="Введите название промпта..."
                                        />
                                    </div>
                                </div>

                                {/* Текст промпта */}
                                <div className="prompt-detail-section">
                                    <label className="prompt-detail-section-label">Текст промпта</label>
                                    <div className="prompt-detail-section-content prompt-body">
                                        <textarea
                                            className="w-full h-full bg-transparent border-none outline-none resize-none"
                                            value={selectedPrompt.body}
                                            onChange={async (e) => {
                                                try {
                                                    await promptManager.updatePrompt(selectedPrompt.id, { body: e.target.value });
                                                    setSelectedPrompt({ ...selectedPrompt, body: e.target.value });
                                                } catch (error) {
                                                    console.error('Failed to update prompt body:', error);
                                                }
                                            }}
                                            placeholder="Введите текст промпта..."
                                        />
                                    </div>
                                </div>

                                {/* Теги */}
                                <div className="prompt-detail-section">
                                    <label className="prompt-detail-section-label">Теги</label>
                                    <div className="prompt-detail-section-content prompt-tags">
                                        <div className="prompt-detail-tags-list">
                                            {selectedPrompt.tags.map((tag, index) => (
                                                <div key={index} className="prompt-detail-tag-item">
                                                    <span
                                                        className={`prompt-detail-tag ${tag.startsWith('project:') ? 'project-tag' : ''}`}
                                                        onClick={tag.startsWith('project:') ? () => handleProjectTagClick(tag) : undefined}
                                                        title={tag.startsWith('project:') ? `Перейти в проект: ${tag.replace('project:', '')}` : undefined}
                                                    >
                                                        {tag.startsWith('project:') ? tag.replace('project:', '') : tag}
                                                    </span>
                                                    <button
                                                        className="prompt-detail-tag-remove"
                                                        onClick={async () => {
                                                            try {
                                                                const updatedTags = selectedPrompt.tags.filter((_, i) => i !== index);
                                                                await promptManager.updatePrompt(selectedPrompt.id, { tags: updatedTags });
                                                                setSelectedPrompt({ ...selectedPrompt, tags: updatedTags });
                                                            } catch (error) {
                                                                console.error('Failed to remove tag:', error);
                                                            }
                                                        }}
                                                        title="Удалить тег"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            className="w-full mt-2 bg-transparent border-none outline-none text-sm"
                                            placeholder="Добавить тег и нажать Enter..."
                                            onKeyPress={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const input = e.target as HTMLInputElement;
                                                    const newTag = input.value.trim();
                                                    if (newTag && !selectedPrompt.tags.includes(newTag)) {
                                                        try {
                                                            const updatedTags = [...selectedPrompt.tags, newTag];
                                                            await promptManager.updatePrompt(selectedPrompt.id, { tags: updatedTags });
                                                            setSelectedPrompt({ ...selectedPrompt, tags: updatedTags });
                                                            input.value = '';
                                                        } catch (error) {
                                                            console.error('Failed to update prompt tags:', error);
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Панель настроек GPT */}
                            <GPTSettingsPanel
                                settings={selectedPrompt.settings}
                                onChange={async (settings) => {
                                    try {
                                        await promptManager.updatePrompt(selectedPrompt.id, { settings });
                                        setSelectedPrompt({ ...selectedPrompt, settings });
                                    } catch (error) {
                                        console.error('Failed to update prompt settings:', error);
                                    }
                                }}
                            />

                        </div>
                    )}

                    {/* Содержимое в зависимости от уровня навигации */}
                    <div className="prompts-main-content">
                        {navigation.level === 'categories' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Категории</h2>
                                <div className="space-y-2">
                                    {categoryTabs.map(tab => {
                                        const count = categoryCounts[tab.id] || 0;
                                        const category = categories.find(c => c.id === tab.id);
                                        const canDelete = category && !category.system && category.title !== 'Избранное';

                                        return (
                                            <div
                                                key={tab.id}
                                                className="flex items-center justify-between p-3 bg-transparent rounded-lg hover:bg-hover transition-colors"
                                            >
                                                <button
                                                    className="flex-1 text-left"
                                                    onClick={() => navigateToCategory(tab.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="category-name">{tab.title}</span>
                                                        <span className="category-count">{count}</span>
                                                    </div>
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        className="platform-button-base platform-button-danger px-3 py-1.5 text-sm rounded-md sidebar-footer-button ml-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteCategory(tab.id);
                                                        }}
                                                        title="Удалить категорию"
                                                    >
                                                        <span className="platform-button-content">
                                                            <svg className="w-3.5 h-3.5 icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M3 6h18" />
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                                <line x1="14" x2="14" y1="11" y2="17" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {navigation.level === 'category' && (
                            <div className="space-y-4">
                                {/* Папки в категории */}
                                {visibleFolders.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-text mb-3">Папки</h3>
                                        <div className="space-y-2">
                                            {visibleFolders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    className="flex items-center justify-between p-3 bg-transparent rounded-lg hover:bg-hover transition-colors"
                                                >
                                                    <div
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => navigateToFolder(folder.id)}
                                                    >
                                                        <h3 className="prompt-title">📁 {folder.title}</h3>
                                                        <p className="prompt-text">
                                                            {prompts.filter(p => p.folderId === folder.id).length} промптов
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="platform-button-base platform-button-danger px-3 py-1.5 text-sm rounded-md sidebar-footer-button"
                                                        onClick={() => deleteFolder(folder.id)}
                                                        title="Удалить папку"
                                                    >
                                                        <span className="platform-button-content">
                                                            <svg className="w-3.5 h-3.5 icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M3 6h18" />
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                                <line x1="14" x2="14" y1="11" y2="17" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Промпты в категории */}
                                <div>
                                    <h3 className="text-sm font-medium text-text mb-3">
                                        Промпты ({visiblePrompts.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {visiblePrompts.map(prompt => (
                                            <div
                                                key={prompt.id}
                                                className="flex items-center justify-between p-3 bg-transparent rounded-lg hover:bg-hover transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className="prompt-favorite-indicator"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleQuick(prompt.id);
                                                        }}
                                                        title={quick.some(p => p.id === prompt.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                                                    >
                                                        <span className={quick.some(p => p.id === prompt.id) ? '' : 'not-favorited'}>
                                                            {quick.some(p => p.id === prompt.id) ? '★' : '☆'}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => navigateToPrompt(prompt.id)}
                                                    >
                                                        <h3 className="prompt-title truncate" title={prompt.title}>
                                                            {prompt.title}
                                                        </h3>
                                                        <p className="prompt-text line-clamp-2">
                                                            {prompt.body || 'Пустой промпт'}
                                                        </p>
                                                        {prompt.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {prompt.tags.slice(0, 2).map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className={`prompt-tags ${tag.startsWith('project:') ? 'cursor-pointer hover:bg-primary/20' : ''}`}
                                                                        onClick={tag.startsWith('project:') ? () => handleProjectTagClick(tag) : undefined}
                                                                        title={tag.startsWith('project:') ? `Перейти в проект: ${tag.replace('project:', '')}` : undefined}
                                                                    >
                                                                        {tag.startsWith('project:') ? tag.replace('project:', '') : tag}
                                                                    </span>
                                                                ))}
                                                                {prompt.tags.length > 2 && (
                                                                    <span className="prompt-text">
                                                                        +{prompt.tags.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="chat-send-button"
                                                        onClick={() => sendToChat(prompt)}
                                                        title="Отправить в чат"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                                            <path d="M22 2 11 13" />
                                                        </svg>
                                                        <span className="text-sm">В чат</span>
                                                    </button>
                                                    <button
                                                        className="platform-button-base platform-button-danger px-3 py-1.5 text-sm rounded-md sidebar-footer-button"
                                                        onClick={() => deletePrompt(prompt.id)}
                                                        title="Удалить промпт"
                                                    >
                                                        <span className="platform-button-content">
                                                            <svg className="w-3.5 h-3.5 icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M3 6h18" />
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                                <line x1="14" x2="14" y1="11" y2="17" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {navigation.level === 'folder' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-text mb-3">
                                    Промпты в папке ({visiblePrompts.length})
                                </h3>
                                <div className="space-y-2">
                                    {visiblePrompts.map(prompt => (
                                        <div
                                            key={prompt.id}
                                            className="flex items-center justify-between p-3 bg-transparent rounded-lg border border-border hover:bg-hover transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div
                                                    className="prompt-favorite-indicator"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleQuick(prompt.id);
                                                    }}
                                                    title={quick.some(p => p.id === prompt.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                                                >
                                                    <span className={quick.some(p => p.id === prompt.id) ? '' : 'not-favorited'}>
                                                        {quick.some(p => p.id === prompt.id) ? '★' : '☆'}
                                                    </span>
                                                </div>
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => navigateToPrompt(prompt.id)}
                                                >
                                                    <h3 className="prompt-title truncate" title={prompt.title}>
                                                        {prompt.title}
                                                    </h3>
                                                    <p className="prompt-text line-clamp-2">
                                                        {prompt.body || 'Пустой промпт'}
                                                    </p>
                                                    {prompt.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {prompt.tags.slice(0, 2).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className={`prompt-tags ${tag.startsWith('project:') ? 'cursor-pointer hover:bg-primary/20' : ''}`}
                                                                    onClick={tag.startsWith('project:') ? () => handleProjectTagClick(tag) : undefined}
                                                                    title={tag.startsWith('project:') ? `Перейти в проект: ${tag.replace('project:', '')}` : undefined}
                                                                >
                                                                    {tag.startsWith('project:') ? tag.replace('project:', '') : tag}
                                                                </span>
                                                            ))}
                                                            {prompt.tags.length > 2 && (
                                                                <span className="prompt-text">
                                                                    +{prompt.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="chat-send-button"
                                                    onClick={() => sendToChat(prompt)}
                                                    title="Отправить в чат"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="m22 2-7 20-4-9-9-4Z" />
                                                        <path d="M22 2 11 13" />
                                                    </svg>
                                                    <span className="text-sm">В чат</span>
                                                </button>
                                                <button
                                                    className="platform-button-base platform-button-danger px-3 py-1.5 text-sm rounded-md sidebar-footer-button"
                                                    onClick={() => deletePrompt(prompt.id)}
                                                    title="Удалить промпт"
                                                >
                                                    <span className="platform-button-content">
                                                        <svg className="w-3.5 h-3.5 icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                            <line x1="10" x2="10" y1="11" y2="17" />
                                                            <line x1="14" x2="14" y1="11" y2="17" />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </UnifiedService>
    );
};

export default PromptsService;
