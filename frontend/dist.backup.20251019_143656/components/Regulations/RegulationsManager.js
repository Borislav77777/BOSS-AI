import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, BookOpen, FileText, MessageSquare, Settings, Shield, Target, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
const RegulationsManager = () => {
    const [activeTab, setActiveTab] = useState('regulations');
    const [expandedRegulation, setExpandedRegulation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const regulations = [
        {
            id: '1',
            title: 'Обработка входящих лидов',
            category: 'leads',
            priority: 'high',
            status: 'active',
            lastUpdated: '2025-01-15',
            content: `Регламент обработки входящих лидов определяет стандарты работы с потенциальными клиентами для обеспечения высокого качества сервиса и максимальной конверсии.

ЦЕЛИ:
- Обеспечить быструю реакцию на входящие заявки
- Квалифицировать лидов по стандарту BANT
- Максимизировать конверсию лид → клиент
- Поддерживать высокий уровень клиентского сервиса`,
            steps: [
                'Время реакции: 5 минут (в рабочее время)',
                'Квалификация по BANT (Budget, Authority, Need, Timeline)',
                'Назначение ответственного менеджера',
                'Создание задачи в CRM',
                'Отправка welcome-письма',
                'Планирование следующего контакта'
            ],
            metrics: {
                compliance: 95,
                efficiency: 88,
                satisfaction: 92
            }
        },
        {
            id: '2',
            title: 'Поддержка клиентов',
            category: 'support',
            priority: 'high',
            status: 'active',
            lastUpdated: '2025-01-14',
            content: `Стандарты поддержки клиентов обеспечивают быстрое и качественное решение вопросов, повышая удовлетворенность и удержание клиентов.

ПРИОРИТЕТЫ ОТВЕТОВ:
- Критический (система не работает): 30 минут
- Высокий (функция не работает): 4 часа
- Средний (вопрос по использованию): 24 часа
- Низкий (улучшение, идея): 7 дней`,
            steps: [
                'Автоматическая классификация тикета по приоритету',
                'Назначение на специалиста соответствующего уровня',
                'Первичный ответ в течение SLA',
                'Диагностика и решение проблемы',
                'Подтверждение решения с клиентом',
                'Закрытие тикета и сбор обратной связи'
            ],
            metrics: {
                compliance: 98,
                efficiency: 85,
                satisfaction: 89
            }
        },
        {
            id: '3',
            title: 'Разработка новых функций',
            category: 'development',
            priority: 'medium',
            status: 'active',
            lastUpdated: '2025-01-13',
            content: `Процесс разработки новых функций обеспечивает качественную и своевременную доставку функциональности, соответствующей потребностям клиентов.

ЭТАПЫ РАЗРАБОТКИ:
1. Сбор и анализ требований
2. Техническое проектирование
3. Разработка и тестирование
4. Code review и QA
5. Развертывание и мониторинг`,
            steps: [
                'Сбор запросов от клиентов и команды',
                'Приоритизация по RICE (Reach, Impact, Confidence, Effort)',
                'Создание технического задания',
                'Разработка в спринтах по 2 недели',
                'Code review (обязательно)',
                'Тестирование (покрытие >80%)',
                'Поэтапный rollout',
                'Мониторинг и сбор метрик'
            ],
            metrics: {
                compliance: 90,
                efficiency: 82,
                satisfaction: 87
            }
        },
        {
            id: '4',
            title: 'Воронки продаж',
            category: 'sales',
            priority: 'high',
            status: 'active',
            lastUpdated: '2025-01-12',
            content: `Автоматизированные воронки продаж обеспечивают систематический подход к конверсии лидов в клиентов с максимальной эффективностью.

СТАДИИ ВОРОНКИ:
1. Лид (новый контакт)
2. Квалифицирован (BANT пройден)
3. Демо назначено
4. Предложение отправлено
5. Переговоры
6. Закрыт (выигран/проигран)`,
            steps: [
                'Автоматическая квалификация лида',
                'Назначение ответственного менеджера',
                'Планирование демонстрации',
                'Подготовка персонализированного предложения',
                'Проведение переговоров',
                'Закрытие сделки или возврат в nurture',
                'Анализ результатов и оптимизация'
            ],
            metrics: {
                compliance: 93,
                efficiency: 91,
                satisfaction: 88
            }
        },
        {
            id: '5',
            title: 'Маркетинг-кампании',
            category: 'marketing',
            priority: 'medium',
            status: 'active',
            lastUpdated: '2025-01-11',
            content: `Процесс создания и запуска маркетинговых кампаний обеспечивает эффективное привлечение и удержание клиентов.

ТИПЫ КАМПАНИЙ:
- Email-рассылки
- Таргетированная реклама
- Контент-маркетинг
- Вебинары и мероприятия
- Партнерские программы`,
            steps: [
                'Определение целей и KPI кампании',
                'Сегментация целевой аудитории',
                'Создание креативов и контента',
                'Настройка каналов доставки',
                'A/B тестирование элементов',
                'Запуск и мониторинг',
                'Анализ результатов и оптимизация'
            ],
            metrics: {
                compliance: 87,
                efficiency: 79,
                satisfaction: 85
            }
        }
    ];
    const filteredRegulations = regulations.filter(regulation => regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regulation.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'leads': return _jsx(Target, { className: "w-5 h-5" });
            case 'support': return _jsx(MessageSquare, { className: "w-5 h-5" });
            case 'development': return _jsx(Settings, { className: "w-5 h-5" });
            case 'sales': return _jsx(TrendingUp, { className: "w-5 h-5" });
            case 'marketing': return _jsx(BarChart3, { className: "w-5 h-5" });
            default: return _jsx(FileText, { className: "w-5 h-5" });
        }
    };
    const getCategoryLabel = (category) => {
        switch (category) {
            case 'leads': return 'Лиды';
            case 'support': return 'Поддержка';
            case 'development': return 'Разработка';
            case 'sales': return 'Продажи';
            case 'marketing': return 'Маркетинг';
            default: return 'Общее';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-900/20';
            case 'draft': return 'text-yellow-400 bg-yellow-900/20';
            case 'archived': return 'text-gray-400 bg-gray-900/20';
            default: return 'text-gray-400 bg-gray-900/20';
        }
    };
    const getTextPreview = (text, maxLength = 150) => {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + '...';
    };
    const toggleRegulationExpansion = (regulationId) => {
        setExpandedRegulation(expandedRegulation === regulationId ? null : regulationId);
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "\u0420\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u044B \u0440\u0430\u0431\u043E\u0442\u044B" }), _jsx("p", { className: "text-gray-300", children: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u044B \u0438 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u044B \u0434\u043B\u044F \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u0440\u0430\u0431\u043E\u0442\u044B \u043A\u043E\u043C\u0430\u043D\u0434\u044B" })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative max-w-md", children: [_jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u0440\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u043E\u0432...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" }), _jsx(FileText, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" })] }) }), _jsx("div", { className: "flex space-x-1 mb-8 bg-white/10 rounded-lg p-1", children: [
                        { id: 'regulations', label: 'Регламенты', icon: FileText },
                        { id: 'templates', label: 'Шаблоны', icon: BookOpen },
                        { id: 'compliance', label: 'Соответствие', icon: Shield }
                    ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === tab.id
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id))) }), activeTab === 'regulations' && (_jsx("div", { className: "space-y-6", children: filteredRegulations.map((regulation) => (_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300", children: [_jsxs("div", { onClick: () => toggleRegulationExpansion(regulation.id), className: "p-6 cursor-pointer", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white", children: getCategoryIcon(regulation.category) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: regulation.title }), _jsx("p", { className: "text-sm text-gray-400", children: getCategoryLabel(regulation.category) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(regulation.priority)}`, children: regulation.priority === 'high' ? 'Высокий' : regulation.priority === 'medium' ? 'Средний' : 'Низкий' }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(regulation.status)}`, children: regulation.status === 'active' ? 'Активен' : regulation.status === 'draft' ? 'Черновик' : 'Архив' })] })] }), _jsx("div", { className: "mb-4", children: _jsx("p", { className: "text-gray-300 text-sm leading-relaxed", children: getTextPreview(regulation.content) }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-400", children: [regulation.metrics.compliance, "%"] }), _jsx("div", { className: "text-xs text-gray-400", children: "\u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-400", children: [regulation.metrics.efficiency, "%"] }), _jsx("div", { className: "text-xs text-gray-400", children: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-400", children: [regulation.metrics.satisfaction, "%"] }), _jsx("div", { className: "text-xs text-gray-400", children: "\u0423\u0434\u043E\u0432\u043B\u0435\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C" })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-400", children: [_jsxs("span", { children: ["\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", regulation.lastUpdated] }), _jsxs("span", { children: [regulation.steps.length, " \u0448\u0430\u0433\u043E\u0432"] }), _jsx("span", { className: "text-purple-400 font-medium", children: expandedRegulation === regulation.id ? 'Свернуть ▼' : 'Развернуть ▶' })] })] }), expandedRegulation === regulation.id && (_jsx("div", { className: "border-t border-white/10 p-6 bg-black/10", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u041F\u043E\u043B\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }), _jsx("div", { className: "bg-black/20 rounded-lg p-4", children: _jsx("p", { className: "text-gray-300 whitespace-pre-wrap", children: regulation.content }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u0428\u0430\u0433\u0438 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F" }), _jsx("div", { className: "space-y-3", children: regulation.steps.map((step, index) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 bg-black/20 rounded-lg", children: [_jsx("div", { className: "w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0", children: index + 1 }), _jsx("span", { className: "text-gray-300", children: step })] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043C\u0435\u0442\u0440\u0438\u043A\u0438" }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-400", children: [regulation.metrics.compliance, "%"] }), _jsx("div", { className: "text-sm text-gray-400", children: "\u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-400", children: [regulation.metrics.efficiency, "%"] }), _jsx("div", { className: "text-sm text-gray-400", children: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-400", children: [regulation.metrics.satisfaction, "%"] }), _jsx("div", { className: "text-sm text-gray-400", children: "\u0423\u0434\u043E\u0432\u043B\u0435\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C" })] })] })] })] }) }))] }, regulation.id))) })), activeTab === 'templates' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-4", children: "\u0413\u043E\u0442\u043E\u0432\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0432" }), _jsx("p", { className: "text-gray-300 mb-6", children: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0433\u043E\u0442\u043E\u0432\u044B\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B \u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0432" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                {
                                    name: 'Шаблон обработки лида',
                                    description: 'Полная процедура работы с новым лидом от первого контакта до квалификации',
                                    category: 'leads',
                                    usage: 95,
                                    steps: [
                                        'Получение заявки (время реакции: 5 мин)',
                                        'Первичный контакт и знакомство',
                                        'Квалификация по BANT',
                                        'Назначение ответственного менеджера',
                                        'Создание карточки в CRM',
                                        'Отправка welcome-письма',
                                        'Планирование следующего контакта'
                                    ],
                                    content: `ШАБЛОН ОБРАБОТКИ ЛИДА

ЦЕЛЬ: Максимизировать конверсию лид → клиент

ВРЕМЯ РЕАКЦИИ: 5 минут (в рабочее время)

ПРОЦЕСС:
1. Получение заявки
   - Проверить источник лида
   - Зафиксировать время поступления
   - Оценить приоритет

2. Первичный контакт
   - Позвонить в течение 5 минут
   - Представиться и узнать цель обращения
   - Задать уточняющие вопросы

3. Квалификация по BANT
   - Budget (бюджет): есть ли выделенный бюджет?
   - Authority (полномочия): принимает ли решения?
   - Need (потребность): какая проблема решается?
   - Timeline (сроки): когда нужно решение?

4. Назначение менеджера
   - Выбрать подходящего специалиста
   - Передать всю информацию
   - Установить сроки следующего контакта

5. CRM и документирование
   - Создать карточку лида
   - Заполнить все поля
   - Добавить заметки и комментарии

6. Welcome-письмо
   - Отправить приветственное письмо
   - Приложить полезные материалы
   - Указать контакты менеджера

7. Планирование
   - Запланировать следующий контакт
   - Подготовить материалы для демо
   - Настроить напоминания`
                                },
                                {
                                    name: 'Шаблон поддержки клиента',
                                    description: 'Стандартная процедура решения проблем клиентов с учетом приоритетов',
                                    category: 'support',
                                    usage: 88,
                                    steps: [
                                        'Классификация тикета по приоритету',
                                        'Назначение на специалиста',
                                        'Первичный ответ в SLA',
                                        'Диагностика проблемы',
                                        'Решение и тестирование',
                                        'Подтверждение с клиентом',
                                        'Закрытие и обратная связь'
                                    ],
                                    content: `ШАБЛОН ПОДДЕРЖКИ КЛИЕНТА

ПРИОРИТЕТЫ SLA:
- Критический: 30 минут
- Высокий: 4 часа
- Средний: 24 часа
- Низкий: 7 дней

ПРОЦЕСС:
1. Классификация тикета
   - Определить тип проблемы
   - Оценить влияние на бизнес
   - Установить приоритет
   - Назначить SLA

2. Назначение специалиста
   - Выбрать эксперта по теме
   - Учесть загрузку команды
   - Уведомить о новом тикете
   - Передать контекст

3. Первичный ответ
   - Подтвердить получение
   - Уточнить детали проблемы
   - Дать временную оценку
   - Предложить временное решение

4. Диагностика
   - Воспроизвести проблему
   - Проверить логи и метрики
   - Изучить похожие случаи
   - Определить корневую причину

5. Решение
   - Разработать фикс
   - Протестировать решение
   - Подготовить инструкции
   - Задокументировать процесс

6. Подтверждение
   - Проверить с клиентом
   - Убедиться в решении
   - Собрать обратную связь
   - Предложить улучшения

7. Закрытие
   - Обновить статус тикета
   - Добавить в базу знаний
   - Отправить итоговое письмо
   - Запланировать follow-up`
                                },
                                {
                                    name: 'Шаблон разработки функции',
                                    description: 'Чек-лист для создания новых возможностей продукта',
                                    category: 'development',
                                    usage: 92,
                                    steps: [
                                        'Сбор и анализ требований',
                                        'Техническое проектирование',
                                        'Разработка в спринтах',
                                        'Code review и QA',
                                        'Тестирование и отладка',
                                        'Развертывание',
                                        'Мониторинг и метрики'
                                    ],
                                    content: `ШАБЛОН РАЗРАБОТКИ ФУНКЦИИ

ЭТАПЫ РАЗРАБОТКИ:
1. Сбор требований
2. Техническое проектирование
3. Разработка и тестирование
4. Code review и QA
5. Развертывание и мониторинг

ПРОЦЕСС:
1. СБОР ТРЕБОВАНИЙ
   - Интервью с заказчиком
   - Анализ пользовательских историй
   - Приоритизация по RICE
   - Создание технического задания
   - Оценка трудозатрат

2. ТЕХНИЧЕСКОЕ ПРОЕКТИРОВАНИЕ
   - Архитектурное решение
   - Выбор технологий
   - Диаграммы и схемы
   - API дизайн
   - План миграции данных

3. РАЗРАБОТКА
   - Создание ветки feature
   - Разработка в спринтах (2 недели)
   - Ежедневные стендапы
   - Промежуточные демо
   - Документирование кода

4. CODE REVIEW И QA
   - Обязательный code review
   - Автоматические тесты (>80%)
   - Ручное тестирование
   - Performance тестирование
   - Security аудит

5. ТЕСТИРОВАНИЕ
   - Unit тесты
   - Integration тесты
   - E2E тесты
   - User acceptance тесты
   - Нагрузочное тестирование

6. РАЗВЕРТЫВАНИЕ
   - Подготовка к релизу
   - Поэтапный rollout
   - Feature flags
   - Rollback план
   - Уведомления пользователей

7. МОНИТОРИНГ
   - Настройка метрик
   - Алерты и уведомления
   - Сбор обратной связи
   - Анализ использования
   - Планирование улучшений`
                                },
                                {
                                    name: 'Шаблон продажной встречи',
                                    description: 'Структура проведения демонстрации и переговоров',
                                    category: 'sales',
                                    usage: 85,
                                    steps: [
                                        'Подготовка к встрече',
                                        'Установление раппорта',
                                        'Выявление потребностей',
                                        'Демонстрация решения',
                                        'Работа с возражениями',
                                        'Закрытие сделки',
                                        'Планирование следующих шагов'
                                    ],
                                    content: `ШАБЛОН ПРОДАЖНОЙ ВСТРЕЧИ

СТРУКТУРА ВСТРЕЧИ (60-90 минут):
1. Подготовка (5 мин)
2. Установление раппорта (10 мин)
3. Выявление потребностей (20 мин)
4. Демонстрация (30 мин)
5. Работа с возражениями (15 мин)
6. Закрытие (10 мин)

ПРОЦЕСС:
1. ПОДГОТОВКА К ВСТРЕЧЕ
   - Изучить профиль клиента
   - Подготовить персонализированную демо
   - Проверить технику
   - Подготовить материалы
   - Настроить CRM

2. УСТАНОВЛЕНИЕ РАППОРТА
   - Представиться и поблагодарить
   - Кратко рассказать о компании
   - Узнать о роли собеседника
   - Установить повестку встречи
   - Создать комфортную атмосферу

3. ВЫЯВЛЕНИЕ ПОТРЕБНОСТЕЙ
   - Какие задачи решаете сейчас?
   - Какие проблемы возникают?
   - Как оцениваете текущее решение?
   - Какие критерии важны при выборе?
   - Какие сроки у проекта?

4. ДЕМОНСТРАЦИЯ РЕШЕНИЯ
   - Показать релевантные функции
   - Связать с выявленными потребностями
   - Продемонстрировать ROI
   - Показать интеграции
   - Ответить на вопросы

5. РАБОТА С ВОЗРАЖЕНИЯМИ
   - Выслушать полностью
   - Уточнить детали
   - Признать правомерность
   - Предложить решение
   - Проверить понимание

6. ЗАКРЫТИЕ СДЕЛКИ
   - Резюмировать ценность
   - Уточнить следующие шаги
   - Обсудить условия
   - Зафиксировать договоренности
   - Назначить следующую встречу

7. ПЛАНИРОВАНИЕ
   - Отправить материалы
   - Обновить CRM
   - Запланировать follow-up
   - Подготовить предложение
   - Координировать с командой`
                                },
                                {
                                    name: 'Шаблон маркетинговой кампании',
                                    description: 'План создания и запуска эффективной маркетинговой кампании',
                                    category: 'marketing',
                                    usage: 78,
                                    steps: [
                                        'Определение целей и KPI',
                                        'Сегментация аудитории',
                                        'Создание контента',
                                        'Настройка каналов',
                                        'A/B тестирование',
                                        'Запуск и мониторинг',
                                        'Анализ и оптимизация'
                                    ],
                                    content: `ШАБЛОН МАРКЕТИНГОВОЙ КАМПАНИИ

ТИПЫ КАМПАНИЙ:
- Email-рассылки
- Таргетированная реклама
- Контент-маркетинг
- Вебинары и мероприятия
- Партнерские программы

ПРОЦЕСС:
1. ОПРЕДЕЛЕНИЕ ЦЕЛЕЙ
   - Бизнес-цели кампании
   - KPI и метрики успеха
   - Бюджет и ресурсы
   - Временные рамки
   - Критерии успеха

2. СЕГМЕНТАЦИЯ АУДИТОРИИ
   - Анализ целевой аудитории
   - Создание персон
   - Сегментация по интересам
   - Выбор каналов коммуникации
   - Персонализация сообщений

3. СОЗДАНИЕ КОНТЕНТА
   - Креативная концепция
   - Копирайтинг
   - Дизайн материалов
   - Видео и изображения
   - Landing pages

4. НАСТРОЙКА КАНАЛОВ
   - Email-платформа
   - Рекламные кабинеты
   - Социальные сети
   - Веб-сайт
   - CRM интеграция

5. A/B ТЕСТИРОВАНИЕ
   - Тестирование заголовков
   - Варианты дизайна
   - Время отправки
   - Call-to-action
   - Целевые страницы

6. ЗАПУСК И МОНИТОРИНГ
   - Поэтапный запуск
   - Отслеживание метрик
   - Настройка алертов
   - Ежедневные отчеты
   - Быстрые корректировки

7. АНАЛИЗ И ОПТИМИЗАЦИЯ
   - Сбор данных
   - Анализ результатов
   - Выявление паттернов
   - Планирование улучшений
   - Документирование learnings`
                                },
                                {
                                    name: 'Шаблон онбординга клиента',
                                    description: 'Процедура введения нового клиента в продукт и процессы',
                                    category: 'support',
                                    usage: 90,
                                    steps: [
                                        'Приветствие и знакомство',
                                        'Настройка аккаунта',
                                        'Обучение основам',
                                        'Настройка интеграций',
                                        'Планирование внедрения',
                                        'Первые результаты',
                                        'Долгосрочная поддержка'
                                    ],
                                    content: `ШАБЛОН ОНБОРДИНГА КЛИЕНТА

ЦЕЛЬ: Максимизировать time-to-value и удержание клиентов

ПРОЦЕСС (30-60 дней):
1. ПРИВЕТСТВИЕ И ЗНАКОМСТВО
   - Персональное приветствие
   - Знакомство с командой
   - Обзор процесса онбординга
   - Установление каналов связи
   - Определение ролей и ответственности

2. НАСТРОЙКА АККАУНТА
   - Создание пользователей
   - Настройка прав доступа
   - Конфигурация системы
   - Импорт данных
   - Тестирование доступа

3. ОБУЧЕНИЕ ОСНОВАМ
   - Вводная сессия (2-4 часа)
   - Демонстрация ключевых функций
   - Практические упражнения
   - Q&A сессия
   - Материалы для самостоятельного изучения

4. НАСТРОЙКА ИНТЕГРАЦИЙ
   - Анализ существующих систем
   - Планирование интеграций
   - Настройка API подключений
   - Тестирование данных
   - Документирование процессов

5. ПЛАНИРОВАНИЕ ВНЕДРЕНИЯ
   - Roadmap внедрения
   - Определение этапов
   - Назначение ответственных
   - Установление чекпоинтов
   - Планирование ресурсов

6. ПЕРВЫЕ РЕЗУЛЬТАТЫ
   - Запуск пилотного проекта
   - Сбор обратной связи
   - Анализ метрик
   - Корректировка процессов
   - Празднование успехов

7. ДОЛГОСРОЧНАЯ ПОДДЕРЖКА
   - Регулярные check-in встречи
   - Расширенное обучение
   - Оптимизация процессов
   - Планирование роста
   - Стратегическое партнерство`
                                }
                            ].map((template, index) => (_jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white", children: getCategoryIcon(template.category) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: template.name }), _jsx("p", { className: "text-sm text-gray-400", children: getCategoryLabel(template.category) })] })] }), _jsx("p", { className: "text-gray-300 mb-4", children: template.description }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-semibold text-white mb-2", children: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u044D\u0442\u0430\u043F\u044B:" }), _jsxs("ul", { className: "text-sm text-gray-300 space-y-1", children: [template.steps.slice(0, 3).map((step, stepIndex) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-2", children: "\u2022" }), step] }, stepIndex))), template.steps.length > 3 && (_jsxs("li", { className: "text-gray-400 text-xs", children: ["+", template.steps.length - 3, " \u044D\u0442\u0430\u043F\u043E\u0432..."] }))] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-400" }), _jsxs("span", { className: "text-sm text-gray-300", children: [template.usage, "% \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F"] })] }), _jsx("button", { className: "px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300", children: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C" })] })] }) }, index))) })] })), activeTab === 'compliance' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "\u041E\u0431\u0449\u0435\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "text-white font-medium", children: "\u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0440\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u0430\u043C" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C \u043F\u043E \u0432\u0441\u0435\u043C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430\u043C" })] }), _jsx("div", { className: "text-2xl font-bold text-green-400", children: "94%" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "text-white font-medium", children: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0432" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u0437\u0430\u0434\u0430\u0447" })] }), _jsx("div", { className: "text-2xl font-bold text-blue-400", children: "87%" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "text-white font-medium", children: "\u0423\u0434\u043E\u0432\u043B\u0435\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u044B" }), _jsx("div", { className: "text-sm text-gray-400", children: "\u041E\u0446\u0435\u043D\u043A\u0430 \u0443\u0434\u043E\u0431\u0441\u0442\u0432\u0430 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0432" })] }), _jsx("div", { className: "text-2xl font-bold text-purple-400", children: "91%" })] })] })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "\u041E\u0431\u043B\u0430\u0441\u0442\u0438 \u0434\u043B\u044F \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F" }), _jsx("div", { className: "space-y-4", children: [
                                        {
                                            area: 'Маркетинг-кампании',
                                            issue: 'Низкая эффективность email-рассылок',
                                            priority: 'high',
                                            action: 'Оптимизировать шаблоны писем'
                                        },
                                        {
                                            area: 'Поддержка клиентов',
                                            issue: 'Долгое время ответа на сложные вопросы',
                                            priority: 'medium',
                                            action: 'Добавить больше FAQ и автоматизацию'
                                        },
                                        {
                                            area: 'Разработка',
                                            issue: 'Частые изменения требований',
                                            priority: 'medium',
                                            action: 'Улучшить процесс сбора требований'
                                        }
                                    ].map((item, index) => (_jsxs("div", { className: "p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-white font-medium", children: item.area }), _jsx("div", { className: "text-sm text-gray-400", children: item.issue })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${item.priority === 'high' ? 'text-red-400 bg-red-900/20' : 'text-yellow-400 bg-yellow-900/20'}`, children: item.priority === 'high' ? 'Высокий' : 'Средний' })] }), _jsx("div", { className: "text-sm text-yellow-300", children: item.action })] }, index))) })] })] }))] }) }));
};
export default RegulationsManager;
//# sourceMappingURL=RegulationsManager.js.map