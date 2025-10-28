import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { usePlatform } from '@/hooks/usePlatform';
import { bossAI } from '@/services/BarsukovAI';
import { chatContextService } from '@/services/ChatContextService';
import { notificationService } from '@/services/NotificationService';
import { serviceManager } from '@/services/ServiceManager';
import { cn, formatTime } from '@/utils';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UnifiedButton } from '../common/UnifiedButton';
import { ChatButtons } from './ChatButtons';
import { ContextButtons } from './ContextButtons';
import { PromptSettingsButton } from './PromptSettingsButton';
// GPT_MODELS removed - models are now handled by services
export const Chat = ({ className, onInputResize }) => {
    const { state, sendMessage, updateSettings } = usePlatform();
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatButtonsBottomGroups, setChatButtonsBottomGroups] = useState([]);
    const [activeButtonId, setActiveButtonId] = useState(null);
    const [activeModeInfo, setActiveModeInfo] = useState(null);
    const [availableModes, setAvailableModes] = useState([]);
    const [activeMode] = useState(null);
    const fileInputRef = useRef(null);
    const [isButtonsPanelCollapsed, setIsButtonsPanelCollapsed] = useState(false);
    const buttonsPanelRef = useRef(null);
    const [buttonsPanelHeight, setButtonsPanelHeight] = useState(0);
    // selectedModel removed - model selection is now handled by services
    const [selectedService] = useState('ai-assistant');
    const [availableServices, setAvailableServices] = useState([]);
    const [chatContext, setChatContext] = useState({
        attachedItems: [],
        userLocation: 'workspace'
    });
    const [promptSettings, setPromptSettings] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const messages = useMemo(() => state.activeChat?.messages || [], [state.activeChat?.messages]);
    // Получаем модели/режимы выбранного сервиса
    const selectedServiceData = useMemo(() => {
        return availableServices.find(service => service.id === selectedService);
    }, [availableServices, selectedService]);
    // Получаем кнопки для выбранного сервиса
    const serviceButtons = useMemo(() => {
        if (!selectedServiceData?.models)
            return [];
        return selectedServiceData.models.map((model) => ({
            id: model.id,
            name: model.name,
            description: model.description,
            icon: 'Brain',
            color: model.cost === 'low' ? 'green' : model.cost === 'medium' ? 'yellow' : 'red',
            action: `select-model-${model.id}`,
            isEnabled: true
        }));
    }, [selectedServiceData]);
    // Зарезервировано для будущей интеграции карт иконок, сейчас не используется
    // Обработчик скролла для показа/скрытия стрелки с плавной анимацией
    const handleScroll = (e) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
        // Очищаем возможный таймаут (если был ранее)
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        // Мгновенно показываем/скрываем без задержек — плавность обеспечит CSS
        setShowScrollButton(!isAtBottom);
        // Отладка для проверки работы скроллбара
        console.log('Scroll event:', {
            scrollTop: target.scrollTop,
            scrollHeight: target.scrollHeight,
            clientHeight: target.clientHeight,
            isAtBottom,
            showScrollButton: !isAtBottom
        });
    };
    // Функция прокрутки вниз с защитой от повторного нажатия
    const scrollToBottom = useCallback(() => {
        if (isScrolling) {
            console.log('Прокрутка уже выполняется, игнорируем нажатие');
            return;
        }
        console.log('Кнопка прокрутки нажата!'); // Отладка
        setIsScrolling(true);
        setShowScrollButton(false); // Скрываем стрелку сразу
        const container = messagesContainerRef.current;
        if (container) {
            // Принудительная прокрутка вниз
            container.scrollTop = container.scrollHeight;
            // Дополнительная проверка через небольшую задержку
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 10);
        }
        else if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
        // Разрешаем повторное нажатие через 1 секунду
        setTimeout(() => {
            setIsScrolling(false);
        }, 1000);
    }, [isScrolling]);
    // Надёжная автопрокрутка: учитывает фактическую высоту новых элементов после layout
    useLayoutEffect(() => {
        if (state.settings.autoScroll === false)
            return;
        const container = messagesContainerRef.current;
        if (!container)
            return;
        // Двойной rAF гарантирует, что layout/paint завершены
        const id1 = requestAnimationFrame(() => {
            const id2 = requestAnimationFrame(() => {
                // Принудительная прокрутка вниз
                container.scrollTop = container.scrollHeight;
                // Дополнительная проверка через небольшую задержку
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 10);
            });
            // Cleanup внутреннего кадра
            return () => cancelAnimationFrame(id2);
        });
        return () => cancelAnimationFrame(id1);
    }, [messages.length, state.settings.autoScroll]);
    // Очистка таймаута при размонтировании
    useEffect(() => {
        const timeoutRef = scrollTimeoutRef.current;
        return () => {
            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }
        };
    }, []);
    // Отладка состояния стрелки
    useEffect(() => {
        console.log('Состояние стрелки изменилось:', showScrollButton);
    }, [showScrollButton]);
    // Следим за высотой панели кнопок и применяем динамический отступ к сообщениям
    useEffect(() => {
        if (!buttonsPanelRef.current) {
            setButtonsPanelHeight(0);
            return;
        }
        const el = buttonsPanelRef.current;
        const update = () => setButtonsPanelHeight(el.offsetHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            ro.disconnect();
        };
    }, [isButtonsPanelCollapsed, state.settings.hideChatFunctionButtons, chatButtonsBottomGroups.length]);
    // Устанавливаем CSS переменную для динамического отступа
    useEffect(() => {
        const messagesContainer = messagesContainerRef.current;
        if (messagesContainer) {
            const paddingValue = buttonsPanelHeight > 0 && !isButtonsPanelCollapsed ? Math.max(0, buttonsPanelHeight - 75) : 0;
            messagesContainer.style.setProperty('--chat-buttons-panel-height', `${paddingValue}px`);
        }
    }, [buttonsPanelHeight, isButtonsPanelCollapsed]);
    // При появлении панели кнопок сразу прокручиваем вниз,
    // чтобы скроллбар оказался у нижней границы и сообщения были вплотную к панели
    useEffect(() => {
        if (!isButtonsPanelCollapsed && buttonsPanelHeight > 0) {
            const container = messagesContainerRef.current;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [isButtonsPanelCollapsed, buttonsPanelHeight]);
    // Загрузка чат кнопок от сервисов (только BOTTOM)
    useEffect(() => {
        const grouped = serviceManager.getChatButtonsGrouped();
        // Добавляем кнопки режимов Boss Ai
        const modeButtons = availableModes.map(mode => ({
            serviceId: 'boss-ai',
            serviceName: 'Boss Ai',
            serviceIcon: 'Brain',
            buttons: [{
                    id: mode.id,
                    name: mode.name,
                    description: mode.description,
                    icon: mode.icon,
                    color: 'blue',
                    action: mode.id,
                    isEnabled: true
                }]
        }));
        setChatButtonsBottomGroups([...grouped.bottom, ...modeButtons]);
    }, [state.services, availableModes]);
    // Загрузка доступных режимов
    useEffect(() => {
        const modes = bossAI.getAvailableModes();
        setAvailableModes(modes);
    }, []);
    // Получение доступных чат-сервисов (только те, у которых есть чат-функциональность)
    useEffect(() => {
        const updateServices = () => {
            try {
                const services = serviceManager.getActiveServices();
                // Фильтруем только сервисы с чат-функциональностью
                const chatServices = services.filter(service => {
                    const hasChatButtons = service.config.chatButtons && service.config.chatButtons.length > 0;
                    const hasChatFunctions = service.config.chatFunctions && service.config.chatFunctions.length > 0;
                    const hasChatTools = service.config.tools && service.config.tools.some(tool => tool.isChatFunction);
                    const hasChatApi = !!service.config.chatApiBaseUrl;
                    return hasChatButtons || hasChatFunctions || hasChatTools || hasChatApi;
                });
                setAvailableServices(chatServices.map(service => ({
                    id: service.config.id,
                    name: service.config.name,
                    description: service.config.description,
                    icon: service.config.icon,
                    isActive: service.config.isActive,
                    models: service.config.configuration?.models || []
                })));
            }
            catch (error) {
                console.error('Ошибка получения сервисов:', error);
            }
        };
        updateServices();
    }, [state.services]);
    // Фокус на поле ввода при загрузке
    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    // Установка высоты поля ввода через JavaScript
    useEffect(() => {
        const inputContainer = document.querySelector('.chat-input-dynamic-height');
        if (inputContainer) {
            const height = Math.max(256, Math.min(800, state.layout.chatInputHeight));
            inputContainer.style.height = `${height}px`;
        }
    }, [state.layout.chatInputHeight]);
    // Установка CSS переменной для ширины чата
    useEffect(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.setProperty('--chat-width', `${state.layout.chatWidth}px`);
        }
    }, [state.layout.chatWidth]);
    // Установка CSS переменной для высоты поля ввода чата
    useEffect(() => {
        const chatInputContainer = document.querySelector('.chat-input-dynamic-height');
        if (chatInputContainer) {
            const height = Math.max(256, Math.min(800, state.layout.chatInputHeight));
            chatInputContainer.style.setProperty('--chat-input-height-value', `${height}px`);
        }
    }, [state.layout.chatInputHeight]);
    // Обработчик для вставки промптов в чат
    useEffect(() => {
        const handleInsertPrompt = (e) => {
            const customEvent = e;
            if (customEvent.detail?.body) {
                const promptText = customEvent.detail.body;
                // Если в поле ввода уже есть текст, добавляем промпт с новой строки
                if (inputValue.trim()) {
                    setInputValue(prev => prev + '\n\n' + promptText);
                }
                else {
                    setInputValue(promptText);
                }
                // Устанавливаем настройки промпта если они есть
                if (customEvent.detail.settings) {
                    setPromptSettings({
                        id: customEvent.detail.id,
                        title: customEvent.detail.title,
                        settings: customEvent.detail.settings
                    });
                }
                // Фокусируемся на поле ввода
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
                console.log('Inserted prompt into chat:', customEvent.detail.title, customEvent.detail.settings ? 'with settings' : '');
            }
        };
        window.addEventListener('chat:insert-prompt', handleInsertPrompt);
        return () => window.removeEventListener('chat:insert-prompt', handleInsertPrompt);
    }, [inputValue]);
    // Обработчик прикрепления документов из AI юриста
    useEffect(() => {
        const handleAttachDocument = (event) => {
            const customEvent = event;
            if (customEvent.detail) {
                const { title, content, contractType } = customEvent.detail;
                // Добавляем документ в контекст чата
                chatContextService.attachContext({
                    id: `contract-${contractType}-${Date.now()}`,
                    type: 'document',
                    title: title,
                    content: content,
                    icon: '📄',
                    removable: true,
                    source: 'manual',
                    metadata: {
                        contractType: contractType
                    }
                });
                // Показываем уведомление
                notificationService.success('Документ прикреплен', `Договор "${title}" добавлен в чат`);
                console.log('Attached document to chat:', title, contractType);
            }
        };
        window.addEventListener('chat:attach-document', handleAttachDocument);
        return () => window.removeEventListener('chat:attach-document', handleAttachDocument);
    }, []);
    // Функции для работы с настройками промпта
    const handleRemovePromptSettings = useCallback(() => {
        setPromptSettings(null);
    }, []);
    const handleOpenPrompt = useCallback(() => {
        if (promptSettings) {
            // Отправляем событие для открытия промпта в сервисе
            window.dispatchEvent(new CustomEvent('prompts:open', {
                detail: { promptId: promptSettings.id }
            }));
        }
    }, [promptSettings]);
    // Подписка на изменения контекста чата
    useEffect(() => {
        const unsubscribe = chatContextService.subscribe((context) => {
            setChatContext(context);
        });
        return unsubscribe;
    }, []);
    // Высота теперь управляется контейнером, useEffect не нужен
    // Обработчик удаления контекста
    const handleRemoveContext = useCallback((id) => {
        chatContextService.detachContext(id);
    }, []);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) {
            return;
        }
        const userMessage = inputValue.trim();
        // Если активен режим, обрабатываем через Boss Ai
        if (activeMode) {
            try {
                const response = await bossAI.processRequest(activeMode.id, userMessage);
                sendMessage(userMessage); // Отправляем сообщение пользователя
                sendMessage(`🤖 ${response.response}`); // Отправляем ответ AI
                // Показываем предложения
                if (response.suggestions.length > 0) {
                    sendMessage(`💡 Предложения: ${response.suggestions.join(', ')}`);
                }
            }
            catch (error) {
                console.error('Ошибка обработки через Boss Ai:', error);
                sendMessage(userMessage); // Fallback - обычная отправка
            }
        }
        else {
            // Обычная отправка сообщения
            sendMessage(userMessage);
            // Автопрокрутка после отправки
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
        setInputValue('');
        setIsTyping(false);
        // после отправки прокрутка в самый низ
        scrollToBottom();
    }, [inputValue, sendMessage, activeMode, scrollToBottom]);
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setInputValue(value);
        // Не показываем индикатор «думает» при наборе пользователем
        setIsTyping(false);
        // Отключаем автоматическое изменение высоты textarea
        // Высота теперь управляется только через регулировщик
        // const textarea = e.target;
        // textarea.style.height = '100%'; // Фиксируем высоту
        // Вызываем callback для уведомления родительского компонента
        if (onInputResize) {
            onInputResize(e);
        }
    }, [onInputResize]);
    const handleMicClick = useCallback(() => {
        // Открываем внешний виджет голосового ввода (запись ведет виджет)
        const event = new CustomEvent('widgets:toggle', { detail: 'voice-widget' });
        window.dispatchEvent(event);
    }, []);
    const handleAttachmentClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);
    const handleToggleFunctionButtons = useCallback(() => {
        const newValue = !state.settings.hideChatFunctionButtons;
        updateSettings('hideChatFunctionButtons', newValue);
        notificationService.info('Кнопки функций', newValue ? 'Кнопки функций скрыты' : 'Кнопки функций показаны');
    }, [state.settings.hideChatFunctionButtons, updateSettings]);
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);
    // Функция для генерации placeholder текстов на основе кнопки
    const generatePlaceholderText = (button) => {
        const buttonName = button.name.toLowerCase();
        const buttonDescription = button.description?.toLowerCase() || '';
        // Mapping для различных типов кнопок
        if (buttonName.includes('briefly') || buttonName.includes('summary') || buttonDescription.includes('кратк')) {
            return '📝 Режим кратких ответов - введите запрос';
        }
        if (buttonName.includes('improve') || buttonDescription.includes('улучш')) {
            return '✨ Режим улучшения - введите текст для улучшения';
        }
        if (buttonName.includes('in-depth') || buttonName.includes('research') || buttonDescription.includes('глубок')) {
            return '🔍 Режим глубокого исследования - опишите тему';
        }
        if (buttonName.includes('content') || buttonName.includes('generation') || buttonDescription.includes('генерац')) {
            return '✍️ Режим генерации контента - опишите что создать';
        }
        if (buttonName.includes('legal') || buttonDescription.includes('юрид')) {
            return '⚖️ Юридическая консультация - опишите вопрос';
        }
        if (buttonName.includes('contract') || buttonName.includes('создан') || buttonDescription.includes('договор')) {
            return '📄 Создание договора - укажите тип и детали';
        }
        if (buttonName.includes('task') || buttonName.includes('создан') || buttonDescription.includes('задач')) {
            return '✅ Создание задачи - опишите задачу';
        }
        // Fallback на основе описания или имени
        return `🎯 Режим "${button.name}" - ${button.description || 'введите запрос'}`;
    };
    const handleChatButtonClick = async (button, serviceId) => {
        try {
            const buttonKey = `${serviceId}-${button.id}`;
            // Проверяем, если нажата уже активная кнопка → деактивировать
            if (activeButtonId === buttonKey && activeModeInfo?.buttonId === buttonKey) {
                setActiveButtonId(null);
                setActiveModeInfo(null);
                return;
            }
            // Если нажата другая кнопка → активировать её
            const placeholderText = generatePlaceholderText(button);
            setActiveButtonId(buttonKey);
            setActiveModeInfo({
                buttonId: buttonKey,
                placeholder: placeholderText
            });
            // НЕ отправляем сообщения в чат и НЕ выполняем serviceManager.executeChatButton()
            return;
        }
        catch (error) {
            // Улучшенная обработка ошибок выполнения чат кнопок
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            console.error('Ошибка выполнения чат кнопки:', error);
            // Отправляем сообщение об ошибке
            sendMessage(`❌ Ошибка выполнения функции: ${button.name}`);
            // Показываем более информативное уведомление
            notificationService.error('Ошибка выполнения команды', `Не удалось выполнить команду "${button.name}". ${errorMessage}`, {
                metadata: {
                    button: button.name,
                    action: button.action,
                    serviceId: serviceId,
                    error: errorMessage,
                    timestamp: new Date().toISOString()
                }
            });
            // Сбрасываем активную кнопку
            setActiveButtonId(null);
        }
    };
    const handleToggleButtonsPanel = useCallback(() => {
        setIsButtonsPanelCollapsed(!isButtonsPanelCollapsed);
    }, [isButtonsPanelCollapsed]);
    const handleFileUpload = useCallback((files) => {
        try {
            // Валидация файлов
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['image/', 'text/', 'application/pdf'];
            const validFiles = files.filter(file => {
                const isValidSize = file.size <= maxFileSize;
                const isValidType = allowedTypes.some(type => file.type.startsWith(type));
                return isValidSize && isValidType;
            });
            if (validFiles.length !== files.length) {
                notificationService.warning('Некоторые файлы не загружены', 'Проверьте размер (макс. 10MB) и тип файлов');
            }
            if (validFiles.length > 0) {
                // Здесь будет логика загрузки файлов
                notificationService.success('Файлы загружены', `Загружено ${validFiles.length} файлов`);
            }
        }
        catch (error) {
            console.error('Ошибка загрузки файлов:', error);
            notificationService.error('Ошибка загрузки', 'Не удалось загрузить файлы');
        }
    }, []);
    const handleFileInputChange = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(Array.from(files));
        }
        // Сброс input для возможности повторного выбора того же файла
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFileUpload]);
    // Микрофон: логика записи/транскрипции удалена — теперь это делает внешний виджет
    return (_jsxs("div", { className: cn('flex flex-col h-full chat-panel liquid-glass-panel relative', className), children: [_jsx("div", { className: "py-2 px-4 liquid-glass-block flex items-center justify-between relative overflow-hidden chat-header", children: _jsx("div", { className: "flex items-center space-x-2 relative z-10", children: activeMode ? (_jsxs(_Fragment, { children: [_jsxs("h3", { className: "font-semibold text-sm", children: ["\uD83C\uDFAF ", activeMode.name] }), _jsx("span", { className: "text-xs text-text-secondary", children: activeMode.description })] })) : state.layout.activeService ? (_jsxs(_Fragment, { children: [_jsxs("h3", { className: "font-semibold text-sm", children: ["\u0421\u0435\u0440\u0432\u0438\u0441: ", state.layout.activeService] }), _jsx("span", { className: "text-xs text-text-secondary", children: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0447\u0435\u0440\u0435\u0437 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441" })] })) : (_jsxs("div", { className: "flex items-center space-x-4 relative z-10", children: [_jsx("h3", { className: "font-bold text-base", children: "\u26A1 Boss AI" }), _jsxs("span", { className: "text-xs text-text-secondary", children: ["\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u041E\u0421 \u0441 AI \u043E\u0442", ' ', _jsx("a", { href: "https://t.me/Borislav_Barsukov", target: "_blank", rel: "noopener noreferrer", className: "text-text-secondary hover:underline transition-colors", children: "@Borislav_Barsukov" })] })] })) }) }), _jsxs("div", { className: cn("flex-1 p-6 space-y-6 chat-messages overflow-y-auto chat-scrollbar", chatButtonsBottomGroups.length > 0 && !state.settings.hideChatFunctionButtons && "chat-messages-with-buttons"), onScroll: handleScroll, ref: messagesContainerRef, children: [messages.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center h-full text-center chat-interactive", children: _jsx("div", { className: "flex flex-col gap-4 justify-center items-center animate-scale-in", children: serviceButtons.length > 0 && !state.settings.hideChatFunctionButtons && (_jsxs("div", { className: "w-full max-w-2xl", children: [_jsxs("div", { className: "text-sm text-text-secondary mb-3", children: ["\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0436\u0438\u043C \u0434\u043B\u044F ", selectedServiceData?.name, ":"] }), _jsx(ChatButtons, { buttons: serviceButtons, onClick: handleChatButtonClick })] })) }) })) : (messages.map((message) => (_jsx("div", { className: cn('flex mb-2 animate-fade-in chat-interactive', message.sender === 'user' ? 'justify-end' : 'justify-start'), children: _jsx("div", { className: cn('max-w-xs lg:max-w-md px-4 py-0.5 rounded-xl transition-all duration-300 shadow-xl backdrop-blur-sm relative', 'hover:shadow-2xl transform-gpu', message.sender === 'user' ? 'message-user' :
                                message.sender === 'system' ? 'message-system' : 'message-assistant'), children: _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: cn('flex items-center mb-0 opacity-80 text-[10px] font-semibold', message.sender === 'user' ? 'flex-row-reverse justify-end gap-2 text-right' : 'justify-between'), children: [_jsx("span", { children: message.sender === 'user' ? 'U' : message.sender === 'system' ? 'Boss Ai' : 'AI' }), state.settings.showTimestamps && (_jsx("span", { children: formatTime(message.timestamp) }))] }), _jsx("p", { className: cn("text-xs leading-tight whitespace-pre-wrap font-medium", message.sender === 'user' && 'text-right'), children: message.content })] }) }) }, message.id)))), isTyping && (_jsxs("div", { className: "flex items-end space-x-4 mb-6 animate-fade-in", role: "status", "aria-live": "polite", "aria-label": "AI \u043F\u0435\u0447\u0430\u0442\u0430\u0435\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435", children: [_jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-lg backdrop-blur-sm bg-gradient-to-br from-surface to-card-bg text-text shadow-border", children: "AI" }), _jsx("div", { className: "px-4 py-2 rounded-lg border shadow-lg typing-indicator", children: _jsxs("div", { className: "flex space-x-1", "aria-hidden": "true", children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-bounce typing-dot" }), _jsx("div", { className: "w-2 h-2 rounded-full animate-bounce delay-100 typing-dot" }), _jsx("div", { className: "w-2 h-2 rounded-full animate-bounce delay-200 typing-dot" })] }) })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "relative flex flex-col chat-input-container chat-input-dynamic-height chat-input-absolute", "data-chat-input-height": Math.max(256, Math.min(800, state.layout.chatInputHeight)), children: [_jsx("button", { onClick: scrollToBottom, className: `chat-scroll-button chat-scroll-button-input absolute w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer z-50 backdrop-blur-sm transition-all duration-200 ${showScrollButton
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none is-hidden'} ${isScrolling ? 'opacity-50 cursor-not-allowed' : ''}`, title: isScrolling ? "Прокрутка выполняется..." : "Прокрутить вниз", disabled: isScrolling, children: "\u2193" }), _jsx("div", { className: "select-none w-full relative z-50 pointer-events-auto m-0 p-0 chat-resize-handle absolute top-0 left-0 right-0", onMouseDown: onInputResize, title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0432\u044B\u0441\u043E\u0442\u0443 \u043F\u043E\u043B\u044F \u0432\u0432\u043E\u0434\u0430" }), chatButtonsBottomGroups.length > 0 && !state.settings.hideChatFunctionButtons && (_jsx("div", { ref: buttonsPanelRef, className: `chat-buttons-panel-collapse ${isButtonsPanelCollapsed
                            ? 'chat-buttons-panel-collapsed'
                            : 'chat-buttons-panel-expanded'}`, children: _jsxs("div", { className: "px-6 pt-2 pb-6 mb-2", children: [_jsx(ChatButtons, { groups: chatButtonsBottomGroups, onClick: handleChatButtonClick, activeButtonId: activeButtonId }), _jsx("div", { className: "w-full gradient-divider-wide mt-4 cursor-pointer hover:opacity-50 transition-opacity duration-200 relative flex items-center justify-end", onClick: handleToggleButtonsPanel, title: isButtonsPanelCollapsed ? "Показать выбор режима" : "Скрыть выбор режима", children: _jsx("span", { className: "text-xs text-white hover:text-gray-100 transition-colors duration-200 pointer-events-none pr-4", children: isButtonsPanelCollapsed ? "Показать выбор режима" : "Скрыть выбор режима" }) })] }) })), chatButtonsBottomGroups.length > 0 && !state.settings.hideChatFunctionButtons && isButtonsPanelCollapsed && (_jsx("div", { className: "px-6 pt-1 pb-1", children: _jsx("div", { className: "w-full gradient-divider-wide cursor-pointer hover:opacity-50 transition-opacity duration-200 relative flex items-center justify-end", onClick: handleToggleButtonsPanel, title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u044B\u0431\u043E\u0440 \u0440\u0435\u0436\u0438\u043C\u0430", children: _jsx("span", { className: "text-xs text-white hover:text-gray-100 transition-colors duration-200 pointer-events-none pr-4", children: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u044B\u0431\u043E\u0440 \u0440\u0435\u0436\u0438\u043C\u0430" }) }) })), _jsx("div", { className: "flex-1 flex flex-col relative", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex-1 flex flex-col relative z-10", children: [_jsx(ContextButtons, { contextButtons: chatContext.attachedItems, onRemoveContext: handleRemoveContext, className: "px-6 pt-4" }), promptSettings && (_jsx("div", { className: "px-6 pt-2", children: _jsx(PromptSettingsButton, { promptId: promptSettings.id, promptTitle: promptSettings.title, settings: promptSettings.settings, onRemove: handleRemovePromptSettings, onOpenPrompt: handleOpenPrompt }) })), _jsx("div", { className: "flex-1 relative", children: _jsxs("div", { className: "relative h-full", children: [_jsx("textarea", { ref: inputRef, value: inputValue, onChange: handleInputChange, onKeyPress: handleKeyPress, placeholder: activeModeInfo?.placeholder || "Введите сообщение или используйте голосовой ввод", className: cn("w-full h-full pr-24 pl-6 pt-6 pb-6 backdrop-blur-sm border-2 border-border/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all duration-300 shadow-xl resize-none chat-textarea relative z-10 bg-surface/80", activeModeInfo && "active-mode"), disabled: false, rows: 4 }), _jsxs("div", { className: "absolute right-2 flex items-center gap-3 z-30 pointer-events-auto chat-input-tools-bottom", children: [_jsx("div", { className: "input-tools", children: _jsx(ChatButtons, { compactMode: "ultra-compact", buttons: [
                                                                { id: 'attach-file', name: 'Файл', icon: 'Paperclip', description: 'Прикрепить файл', action: 'attach', isEnabled: true },
                                                                { id: 'prompts', name: 'Промпты', icon: 'Grid', description: 'Заготовленные промпты', action: 'prompts', isEnabled: true },
                                                                { id: 'web-search', name: 'Поиск', icon: 'Search', description: 'Поиск в интернете', action: 'web-search', isEnabled: true },
                                                                { id: 'toggle-panel', name: state.settings.hideChatFunctionButtons ? 'Показать' : 'Скрыть', icon: state.settings.hideChatFunctionButtons ? 'EyeOff' : 'Eye', description: state.settings.hideChatFunctionButtons ? 'Показать кнопки функций' : 'Скрыть кнопки функций', action: 'toggle-panel', isEnabled: true },
                                                                { id: 'voice-input', name: 'Голос', icon: 'Mic', description: 'Голосовой ввод', action: 'voice', isEnabled: true }
                                                            ], onClick: (button) => {
                                                                switch (button.action) {
                                                                    case 'attach':
                                                                        handleAttachmentClick();
                                                                        break;
                                                                    case 'prompts': {
                                                                        const event = new CustomEvent('prompts:open');
                                                                        window.dispatchEvent(event);
                                                                        notificationService.info('Заготовленные промпты', 'Открыта панель с готовыми шаблонами');
                                                                        break;
                                                                    }
                                                                    case 'web-search': {
                                                                        const webEvent = new CustomEvent('web-search:open');
                                                                        window.dispatchEvent(webEvent);
                                                                        notificationService.info('Поиск в интернете', 'Открыт поиск в интернете');
                                                                        break;
                                                                    }
                                                                    case 'toggle-panel':
                                                                        handleToggleFunctionButtons();
                                                                        break;
                                                                    case 'voice':
                                                                        handleMicClick();
                                                                        break;
                                                                }
                                                            } }) }), _jsx(UnifiedButton, { type: "button", variant: "primary", size: "sm", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C", className: cn('chat-send-button rounded-lg p-0 w-[44px] h-[44px] min-w-[44px] min-h-[44px] leading-none flex items-center justify-center', !inputValue.trim() && 'opacity-50 cursor-not-allowed'), disabled: !inputValue.trim(), onClick: () => {
                                                            if (inputValue.trim()) {
                                                                sendMessage(inputValue);
                                                                setInputValue('');
                                                                scrollToBottom();
                                                            }
                                                        }, children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "m22 2-7 20-4-9-9-4Z" }), _jsx("path", { d: "M22 2 11 13" })] }) })] })] }) })] }) }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*,text/*,application/pdf", onChange: handleFileInputChange, className: "hidden", "aria-label": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438" })] })] }));
};
export default Chat;
//# sourceMappingURL=Chat.js.map