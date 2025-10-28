import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle, CheckCircle, Clock, Copy, Edit, Mail, MessageSquare, Phone, Play, Star, Target, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
const SalesScriptsManager = () => {
    const [activeTab, setActiveTab] = useState('scripts');
    const [selectedScript, setSelectedScript] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const scripts = [
        {
            id: '1',
            name: 'Холодный звонок B2B',
            type: 'cold_call',
            industry: 'B2B',
            duration: 300,
            successRate: 25,
            content: `Добрый день, [Имя]! Меня зовут [Ваше имя] из Boss AI.
Мы помогаем компаниям автоматизировать продажи и маркетинг
с помощью искусственного интеллекта.

У вас сейчас есть 2 минуты, чтобы я рассказал, как мы помогли
[Компания-аналог] увеличить конверсию на 47%?

[Пауза для ответа]

Отлично! Вот что Boss AI может для вас сделать:

1. AI-ассистент обработает 80% рутинных запросов автоматически
2. CRM с умным скорингом покажет, на каких лидов тратить время
3. Воронки продаж автоматизируют follow-up и напоминания
4. Аналитика в реальном времени покажет, где теряются клиенты

В среднем наши клиенты видят:
- +35% конверсия лид→клиент
- -50% время на рутину
- +25% средний чек (за счет допродаж)

Результат: рост выручки на 40-60% за первые 3 месяца.

[Работа с возражениями]

Отлично! Я вижу, что Boss AI может реально помочь вашему бизнесу.
Предлагаю так: мы дадим вам 14 дней бесплатного доступа ко всем функциям.
Наш специалист настроит систему под ваши процессы, и вы увидите результаты.
Если не понравится - просто перестанете пользоваться. Риска ноль.

Когда вам удобно начать - в понедельник или среду?`,
            tips: [
                'Используйте имя клиента в начале разговора',
                'Создайте срочность, но не давите',
                'Фокусируйтесь на выгодах, а не на функциях',
                'Слушайте больше, чем говорите',
                'Всегда предлагайте следующий шаг'
            ],
            objections: [
                'Дорого → ROI расчет',
                'Нам ничего не нужно → Вопрос о росте на 40%',
                'Уже используем конкурента → Сравнение преимуществ',
                'Нет времени → 2 минуты демо',
                'Нужно подумать → Ограниченное предложение'
            ],
            isActive: true,
            createdAt: '2025-01-15'
        },
        {
            id: '2',
            name: 'Теплый лид (входящая заявка)',
            type: 'warm_lead',
            industry: 'Все',
            duration: 1800,
            successRate: 60,
            content: `Тема: Ваша заявка на Boss AI - начнем прямо сейчас!

Привет, [Имя]!

Спасибо за интерес к Boss AI! 🚀

Я [Ваше имя], и я помогу вам начать. Вот что дальше:

1. Я забронировал для вас 30-минутную персональную демонстрацию
2. Мы покажем, как Boss AI решит именно ваши задачи
3. Вы получите персональное предложение со скидкой 20%

Выберите удобное время: [Ссылка на календарь]

Или напишите мне в WhatsApp: [Номер]

P.S. Первые 10 клиентов этого месяца получают бонус:
бесплатная настройка системы ($2,000 value) 🎁

До встречи!
[Ваше имя]
[Должность]
Boss AI`,
            tips: [
                'Отвечайте в течение 5 минут',
                'Персонализируйте каждое письмо',
                'Предлагайте конкретные следующие шаги',
                'Используйте социальные доказательства',
                'Создавайте срочность'
            ],
            objections: [],
            isActive: true,
            createdAt: '2025-01-15'
        },
        {
            id: '3',
            name: 'Демонстрация продукта',
            type: 'demo',
            industry: 'Все',
            duration: 1800,
            successRate: 40,
            content: `Структура демонстрации (30 минут):

МИНУТЫ 1-5: ЗНАКОМСТВО
- Представление и благодарность за время
- Уточнение задач и болевых точек клиента
- Постановка целей демонстрации
- Согласование формата

МИНУТЫ 6-20: ДЕМОНСТРАЦИЯ
1. AI-ассистент (5 мин)
   - Показ живого диалога
   - Решение реальной задачи клиента
   - Объяснение принципов работы

2. CRM и воронки (5 мин)
   - Импорт данных клиента
   - Настройка воронки под их процесс
   - AI-скоринг лидов

3. Маркетинг-автоматизация (5 мин)
   - Email-кампании
   - Лид-магниты
   - Аналитика

МИНУТЫ 21-25: ВОПРОСЫ И ВОЗРАЖЕНИЯ
- Активное слушание
- Уточняющие вопросы
- Работа с сомнениями
- Дополнительные функции

МИНУТЫ 26-30: ЗАКРЫТИЕ
- Резюме ценности для клиента
- Предложение тарифа
- Следующие шаги
- Согласование сроков`,
            tips: [
                'Готовьтесь к каждому демо индивидуально',
                'Используйте реальные данные клиента',
                'Показывайте, а не рассказывайте',
                'Задавайте вопросы каждые 2-3 минуты',
                'Всегда заканчивайте конкретным предложением'
            ],
            objections: [],
            isActive: true,
            createdAt: '2025-01-15'
        }
    ];
    const handlePlayScript = (script) => {
        setSelectedScript(script);
        setIsPlaying(true);
        // Симуляция воспроизведения
        setTimeout(() => setIsPlaying(false), script.duration * 100);
    };
    const handleCopyScript = (script) => {
        navigator.clipboard.writeText(script.content);
        // Показать уведомление
    };
    const getScriptTypeIcon = (type) => {
        switch (type) {
            case 'cold_call': return _jsx(Phone, { className: "w-5 h-5" });
            case 'warm_lead': return _jsx(Mail, { className: "w-5 h-5" });
            case 'demo': return _jsx(Play, { className: "w-5 h-5" });
            case 'objection_handling': return _jsx(AlertCircle, { className: "w-5 h-5" });
            case 'closing': return _jsx(Target, { className: "w-5 h-5" });
            default: return _jsx(MessageSquare, { className: "w-5 h-5" });
        }
    };
    const getScriptTypeLabel = (type) => {
        switch (type) {
            case 'cold_call': return 'Холодный звонок';
            case 'warm_lead': return 'Теплый лид';
            case 'demo': return 'Демонстрация';
            case 'objection_handling': return 'Работа с возражениями';
            case 'closing': return 'Закрытие сделки';
            default: return 'Скрипт';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "\u0421\u043A\u0440\u0438\u043F\u0442\u044B \u043F\u0440\u043E\u0434\u0430\u0436" }), _jsx("p", { className: "text-gray-300", children: "\u0413\u043E\u0442\u043E\u0432\u044B\u0435 \u0441\u043A\u0440\u0438\u043F\u0442\u044B \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u044D\u0442\u0430\u043F\u043E\u0432 \u043F\u0440\u043E\u0434\u0430\u0436" })] }), _jsx("div", { className: "flex space-x-1 mb-8 bg-white/10 rounded-lg p-1", children: [
                        { id: 'scripts', label: 'Скрипты', icon: MessageSquare },
                        { id: 'templates', label: 'Шаблоны', icon: Edit },
                        { id: 'analytics', label: 'Аналитика', icon: TrendingUp }
                    ].map((tab) => (_jsxs("button", { type: "button", onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === tab.id
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id))) }), activeTab === 'scripts' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx("div", { className: "space-y-4", children: scripts.map((script) => (_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white", children: getScriptTypeIcon(script.type) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: script.name }), _jsxs("p", { className: "text-sm text-gray-400", children: [getScriptTypeLabel(script.type), " \u2022 ", script.industry] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-current" }), _jsxs("span", { className: "text-sm text-gray-300", children: [script.successRate, "%"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { className: "text-sm text-gray-300", children: [Math.floor(script.duration / 60), "\u043C"] })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { type: "button", onClick: () => handlePlayScript(script), className: "flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300", children: [_jsx(Play, { className: "w-4 h-4" }), _jsx("span", { children: "\u0412\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438" })] }), _jsxs("button", { type: "button", onClick: () => handleCopyScript(script), className: "flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors", children: [_jsx(Copy, { className: "w-4 h-4" }), _jsx("span", { children: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400" }), _jsx("span", { className: "text-sm text-green-400", children: "\u0410\u043A\u0442\u0438\u0432\u0435\u043D" })] })] })] }, script.id))) }), _jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: selectedScript ? (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: selectedScript.name }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-gray-300", children: isPlaying ? 'Воспроизведение...' : 'Готов к воспроизведению' })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u0421\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u0441\u043A\u0440\u0438\u043F\u0442\u0430" }), _jsx("div", { className: "bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto", children: _jsx("pre", { className: "text-sm text-gray-300 whitespace-pre-wrap", children: selectedScript.content }) })] }), selectedScript.tips.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u0421\u043E\u0432\u0435\u0442\u044B \u043F\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044E" }), _jsx("ul", { className: "space-y-2", children: selectedScript.tips.map((tip, index) => (_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-400 mt-1 flex-shrink-0" }), _jsx("span", { className: "text-sm text-gray-300", children: tip })] }, index))) })] })), selectedScript.objections.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-3", children: "\u0420\u0430\u0431\u043E\u0442\u0430 \u0441 \u0432\u043E\u0437\u0440\u0430\u0436\u0435\u043D\u0438\u044F\u043C\u0438" }), _jsx("div", { className: "space-y-2", children: selectedScript.objections.map((objection, index) => (_jsx("div", { className: "bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3", children: _jsx("span", { className: "text-sm text-yellow-300", children: objection }) }, index))) })] }))] })] })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(MessageSquare, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043A\u0440\u0438\u043F\u0442" }), _jsx("p", { className: "text-gray-400", children: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0441\u043A\u0440\u0438\u043F\u0442 \u0441\u043B\u0435\u0432\u0430, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0435\u0433\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435" })] })) })] })), activeTab === 'templates' && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                        {
                            name: 'Email для холодных лидов',
                            description: 'Шаблон для email-рассылок по холодной базе',
                            industry: 'B2B',
                            successRate: 15
                        },
                        {
                            name: 'Скрипт для демо-звонка',
                            description: 'Структура демонстрации продукта',
                            industry: 'Все',
                            successRate: 40
                        },
                        {
                            name: 'Работа с возражениями',
                            description: 'Ответы на типовые возражения клиентов',
                            industry: 'Все',
                            successRate: 60
                        },
                        {
                            name: 'Закрытие сделки',
                            description: 'Техники закрытия и получения согласия',
                            industry: 'Все',
                            successRate: 35
                        },
                        {
                            name: 'Follow-up после встречи',
                            description: 'Письмо после демонстрации или встречи',
                            industry: 'Все',
                            successRate: 25
                        },
                        {
                            name: 'Реактивация клиентов',
                            description: 'Возврат неактивных клиентов',
                            industry: 'Все',
                            successRate: 20
                        }
                    ].map((template, index) => (_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white", children: _jsx(Edit, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: template.name }), _jsx("p", { className: "text-sm text-gray-400", children: template.industry })] })] }), _jsx("p", { className: "text-gray-300 mb-4", children: template.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-current" }), _jsxs("span", { className: "text-sm text-gray-300", children: [template.successRate, "% \u0443\u0441\u043F\u0435\u0445\u0430"] })] }), _jsx("button", { type: "button", className: "px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300", children: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C" })] })] }, index))) })), activeTab === 'analytics' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0441\u043A\u0440\u0438\u043F\u0442\u043E\u0432" }), _jsx("div", { className: "space-y-4", children: [
                                        { name: 'Холодный звонок B2B', successRate: 25, usage: 45, revenue: 125000 },
                                        { name: 'Теплый лид', successRate: 60, usage: 30, revenue: 180000 },
                                        { name: 'Демонстрация', successRate: 40, usage: 25, revenue: 95000 }
                                    ].map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-black/20 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "text-white font-medium", children: metric.name }), _jsxs("div", { className: "text-sm text-gray-400", children: [metric.usage, "% \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-green-400 font-semibold", children: [metric.successRate, "%"] }), _jsxs("div", { className: "text-sm text-gray-400", children: ["$", metric.revenue.toLocaleString()] })] })] }, index))) })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438" }), _jsx("div", { className: "space-y-4", children: [
                                        'Улучшить скрипт холодных звонков - добавить больше персонализации',
                                        'Создать A/B тест для email-шаблонов',
                                        'Добавить больше социальных доказательств в демо',
                                        'Обучить команду работе с возражениями',
                                        'Автоматизировать follow-up после встреч'
                                    ].map((recommendation, index) => (_jsxs("div", { className: "flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-yellow-300", children: recommendation })] }, index))) })] })] }))] }) }));
};
export default SalesScriptsManager;
//# sourceMappingURL=SalesScriptsManager.js.map