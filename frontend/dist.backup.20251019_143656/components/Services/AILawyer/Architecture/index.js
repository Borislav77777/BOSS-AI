import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useMemo, useState } from 'react';
import { DiagramContainer } from './components/DiagramContainer';
import { DiagramControls } from './components/DiagramControls';
import { DiagramError } from './components/DiagramError';
import { DiagramLegend } from './components/DiagramLegend';
import { useDiagramControls } from './hooks/useDiagramControls';
import { useDiagramRender } from './hooks/useDiagramRender';
import { useDiagramZoom } from './hooks/useDiagramZoom';
import { GPT5Integration } from './modules/GPT5IntegrationConfig';
import { InputSystem } from './modules/InputSystemConfig';
import { RaptorEngine } from './modules/raptorEngineModule';
import './styles/Architecture.css';
/**
 * Главный компонент модульной архитектуры диаграммы
 * Исправляет проблему исчезновения диаграммы
 */
export const ModularArchitectureDiagram = () => {
    const [activeModule, setActiveModule] = useState(null);
    const [showAllModules, setShowAllModules] = useState(true);
    const { zoom, isFullscreen, zoomIn, zoomOut, resetZoom, toggleFullscreen } = useDiagramZoom();
    const { showLegend, showMinimap, toggleLegend, toggleMinimap, resetControls } = useDiagramControls();
    // Объединяем все модули в единую диаграмму
    const fullDiagramCode = useMemo(() => {
        if (showAllModules) {
            return `
        flowchart TD
        %% ====== ЧИТАЕМОСТЬ/ЦВЕТА ГРУПП ======
        classDef input fill:#a7f3d0,stroke:#059669,stroke-width:2px,color:#111827
        classDef infra fill:#0b1f3b,stroke:#60a5fa,stroke-width:2px,color:#eaf2ff
        classDef service fill:#0f172a,stroke:#374151,stroke-width:2px,color:#f8fafc
        classDef queue fill:#0c1f16,stroke:#22c55e,stroke-width:2px,color:#dcfce7
        classDef raptor fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#111827
        classDef gpt5 fill:#2b0b3b,stroke:#8b5cf6,stroke-width:2px,color:#f5eaff
        %% ================ СИСТЕМА ВХОДА ================ %%
        USER(("👤 Пользователь")) -->|"Сообщение/Голос/Файл"| NGINX_LB["⚖️ Nginx Load Balancer<br>• Распределение нагрузки<br>• Health checks<br>• SSL termination<br>• Rate limiting"]

        NGINX_LB --> BOT["🤖 Telegram Бот<br>• Redis FSM<br>• Rate limiting<br>• Голосовые команды"]
        NGINX_LB --> WEB_SERVICE["🌐 Веб-сервис<br>• Next.js 14<br>• WebSockets<br>• PWA поддержка"]
        NGINX_LB --> MOBILE_APP["📱 Мобильное приложение<br>• React Native<br>• Push-уведомления<br>• Оффлайн-режим"]

        BOT --> REDIS_QUEUE["📬 Redis Queue<br>• Очередь запросов<br>• Приоритизация<br>• Rate limiting"]
        WEB_SERVICE --> REDIS_QUEUE
        MOBILE_APP --> REDIS_QUEUE

        REDIS_QUEUE --> WORKER_POOL["⚙️ Worker Pool<br>• Параллельная обработка<br>• Автоматическое масштабирование<br>• Мониторинг состояния"]

        WORKER_POOL --> ROUTER["🧭 Маршрутизатор<br>FastAPI + Pydantic v2<br>• Idempotency keys<br>• Умная валидация"]

        %% ================ RAPTOR ENGINE ================ %%
        subgraph RAPTOR_SYSTEM["🌳 RAPTOR ENGINE"]
            ROUTER --> ENHANCED_QPROC["🧠 Расширенный обработчик<br>• SlangDictionary<br>• ContextAnalyzer<br>• SynonymExpander<br>• LegalTerminologyManager"]

            ENHANCED_QPROC --> RAPTOR_ENGINE["🌳 RAPTOR Engine<br>• Рекурсивная кластеризация<br>• Древовидная организация<br>• Генерация абстракций<br>• Оптимизированный поиск"]

            RAPTOR_ENGINE --> RAPTOR_TREE["🌳 RAPTOR Tree<br>• Иерархическая структура<br>• Рекурсивные узлы<br>• Абстракции по уровням"]

            RAPTOR_ENGINE --> RAPTOR_CLUSTERING["🔗 RAPTOR Clustering<br>• K-means кластеризация<br>• Семантическое группирование<br>• Адаптивные пороги"]
        end

        %% ================ GPT-5 INTEGRATION ================ %%
        subgraph GPT5_SYSTEM["🚀 GPT-5 SYSTEM"]
            ENHANCED_QPROC --> INTELLIGENT_ROUTER["🚀 Intelligent Router<br>• Анализ сложности запросов<br>• Выбор оптимальной модели<br>• Управление бюджетом<br>• Адаптивная маршрутизация"]

            INTELLIGENT_ROUTER --> GPT5_NANO["⚡ GPT-5 Nano<br>• 80% запросов<br>• Простые вопросы<br>• Быстрые ответы<br>• Время: 1-2 сек"]

            INTELLIGENT_ROUTER --> GPT5_MINI["🚀 GPT-5 Mini<br>• 15% запросов<br>• Средние задачи<br>• Баланс скорости/качества<br>• Время: 2-3 сек"]

            INTELLIGENT_ROUTER --> GPT5_STANDARD["🎯 GPT-5 Standard<br>• 5% запросов<br>• Сложные рассуждения<br>• Максимальное качество<br>• Время: 3-5 сек"]

            GPT5_NANO --> RESPONSE_GENERATOR["📝 Генератор ответов<br>• Форматирование ответов<br>• Структурированный вывод<br>• Контекстная адаптация"]

            GPT5_MINI --> RESPONSE_GENERATOR
            GPT5_STANDARD --> RESPONSE_GENERATOR

            RESPONSE_GENERATOR --> RESULT_CACHE["💾 Result Cache<br>• Кэш ответов GPT-5<br>• TTL настройки<br>• Инвалидация<br>• Статистика попаданий"]
        end

        %% ================ ДАННЫЕ И МОНИТОРИНГ ================ %%
        subgraph DATA["🗄️ ДАННЫЕ"]
            POSTGRES[(🐘 PostgreSQL)]
            QDRANT[(🔍 Qdrant Vector DB)]
            MINIO[(🗄️ MinIO S3)]
        end

        subgraph MON["📊 МОНИТОРИНГ"]
            SIGNOZ["🔍 SigNoz"]
        end

        %% Связи с данными и метриками
        ENHANCED_QPROC -->|"метаданные"| POSTGRES
        ENHANCED_QPROC -->|"векторы"| QDRANT
        ENHANCED_QPROC -->|"файлы"| MINIO
        RESPONSE_GENERATOR -->|"метрики"| SIGNOZ
        WORKER_POOL -->|"метрики"| SIGNOZ

        %% ================ СТИЛИЗАЦИЯ ================ %%
        %% ====== НАЗНАЧЕНИЕ КЛАССОВ ======
        class USER input
        class NGINX_LB input
        class BOT,WEB_SERVICE,MOBILE_APP,WORKER_POOL,ROUTER input
        class REDIS_QUEUE input
        class RESULT_CACHE queue
        class RAPTOR_ENGINE,RAPTOR_TREE,RAPTOR_CLUSTERING raptor
        class GPT5_NANO,GPT5_MINI,GPT5_STANDARD,INTELLIGENT_ROUTER gpt5
        class POSTGRES,QDRANT,MINIO db
        class SIGNOZ monitor
      `;
        }
        else if (activeModule) {
            // Показываем только выбранный модуль
            const modules = [InputSystem, RaptorEngine, GPT5Integration];
            const module = modules.find(m => m.id === activeModule);
            console.log('Selected module:', activeModule, 'Found module:', module);
            if (module?.mermaidCode) {
                const diagramCode = `flowchart TD\n${module.mermaidCode}`;
                console.log('Generated diagram code:', diagramCode);
                return diagramCode;
            }
            return '';
        }
        return '';
    }, [showAllModules, activeModule]);
    const { diagramRef, isLoading, error, performance, isRendered, forceRerender } = useDiagramRender(fullDiagramCode);
    // Обновляем зум в CSS переменной
    React.useEffect(() => {
        if (diagramRef.current) {
            diagramRef.current.style.setProperty('--zoom-level', zoom.toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom]);
    const handleModuleSelect = (moduleId) => {
        setActiveModule(moduleId);
        setShowAllModules(false);
    };
    const handleShowAll = () => {
        setActiveModule(null);
        setShowAllModules(true);
    };
    const handleDownload = () => {
        const svg = diagramRef.current?.querySelector('svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ai-lawyer-architecture.svg';
            link.click();
            URL.revokeObjectURL(url);
        }
    };
    return (_jsxs("div", { className: `modular-architecture-diagram ${isFullscreen ? 'fullscreen' : ''}`, children: [_jsx(DiagramControls, { zoom: zoom, isFullscreen: isFullscreen, showLegend: showLegend, showMinimap: showMinimap, onZoomIn: zoomIn, onZoomOut: zoomOut, onResetZoom: resetZoom, onToggleFullscreen: toggleFullscreen, onToggleLegend: toggleLegend, onToggleMinimap: toggleMinimap, onDownload: handleDownload, onRerender: forceRerender, onResetControls: resetControls }), _jsxs("div", { className: "diagram-content", children: [_jsxs("div", { className: "modules-panel", children: [_jsx("h3", { children: "\u041C\u043E\u0434\u0443\u043B\u0438 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u044B" }), _jsxs("div", { className: "modules-list", children: [_jsx("button", { onClick: handleShowAll, className: `module-button ${showAllModules ? 'active' : ''}`, children: "\uD83C\uDFD7\uFE0F \u041F\u043E\u043B\u043D\u0430\u044F \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430" }), _jsx("button", { onClick: () => handleModuleSelect('input-system'), className: `module-button ${activeModule === 'input-system' ? 'active' : ''}`, children: "\uD83D\uDEAA \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0432\u0445\u043E\u0434\u0430" }), _jsx("button", { onClick: () => handleModuleSelect('raptor-engine'), className: `module-button ${activeModule === 'raptor-engine' ? 'active' : ''}`, children: "\uD83C\uDF33 RAPTOR Engine" }), _jsx("button", { onClick: () => handleModuleSelect('gpt5-integration'), className: `module-button ${activeModule === 'gpt5-integration' ? 'active' : ''}`, children: "\uD83D\uDE80 GPT-5 Integration" })] })] }), _jsxs("div", { className: "diagram-area", children: [_jsx(DiagramContainer, { ref: diagramRef, zoom: zoom, isLoading: isLoading, isRendered: isRendered }), error && _jsx(DiagramError, { error: error, onRetry: forceRerender }), performance && (_jsx("div", { className: "performance-info", children: _jsxs("small", { children: ["\u0420\u0435\u043D\u0434\u0435\u0440: ", performance.renderTime.toFixed(0), "\u043C\u0441 | \u0423\u0437\u043B\u044B: ", performance.nodeCount, " | \u0421\u0432\u044F\u0437\u0438: ", performance.connectionCount] }) })), _jsxs("div", { className: "investor-sections", id: "investor-metrics", children: [_jsx("h3", { children: "\u0426\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u0431\u0438\u0437\u043D\u0435\u0441\u0430" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u0439:" }), " RAPTOR + GPT\u2011\u0440\u043E\u0443\u0442\u0438\u043D\u0433 \u0441\u043E\u043A\u0440\u0430\u0449\u0430\u044E\u0442 \u0432\u0440\u0435\u043C\u044F \u0434\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u0421\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0442\u0440\u0430\u0442:" }), " \u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u044D\u0448\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u0443\u044E\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441\u0430"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043E\u0442\u0432\u0435\u0442\u043E\u0432:" }), " rerank \u0438 \u0438\u0435\u0440\u0430\u0440\u0445\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u043F\u043E\u0432\u044B\u0448\u0430\u044E\u0442 \u0440\u0435\u043B\u0435\u0432\u0430\u043D\u0442\u043D\u043E\u0441\u0442\u044C"] })] }), _jsx("h3", { children: "SLO/SLI \u0438 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u043C\u0435\u0442\u0440\u0438\u043A\u0438" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "p95 \u043B\u0430\u0442\u0435\u043D\u0442\u043D\u043E\u0441\u0442\u044C (\u043A\u043B\u0430\u0441\u0441\u044B \u0437\u0430\u0434\u0430\u0447):" }), " \u043F\u043E\u0438\u0441\u043A \u2264 800 \u043C\u0441; \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F 1\u20135 \u0441; \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F \u043F\u0430\u0447\u043A\u0438 \u2264 2 \u043C\u0438\u043D"] }), _jsxs("li", { children: [_jsx("strong", { children: "Throughput:" }), " 200 ops/\u0441\u0435\u043A \u0432 \u043F\u0438\u043A\u0435; OCR 50 \u0441\u0442\u0440/\u043C\u0438\u043D"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E:" }), " recall@10 \u2265 0.9 (\u0441 rerank); OCR WER \u2264 15%"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u042D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0430:" }), " cost/req \u221230\u201355% \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u043A\u044D\u0448\u0443 \u0438 \u0440\u043E\u0443\u0442\u0438\u043D\u0433\u0443"] })] }), _jsx("h3", { id: "slo-sli", children: "\u0414\u043E\u0440\u043E\u0436\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430 (\u043A\u0432\u0430\u0440\u0442\u0430\u043B)" }), _jsxs("ol", { children: [_jsx("li", { children: "\u041F\u043E\u043B\u043D\u0430\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 (\u0444\u0438\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0439)" }), _jsx("li", { children: "GraphRAG + HyDE: \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u0438 multi\u2011hop reasoning" }), _jsx("li", { children: "\u0410\u0434\u043C\u0438\u043D\u2011\u043F\u0430\u043D\u0435\u043B\u044C \u043C\u0435\u0442\u0440\u0438\u043A: \u0432\u0438\u0437\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F SLO/SLI \u0438 \u0434\u0435\u043C\u043E\u2011\u043A\u0435\u0439\u0441\u044B" })] }), _jsx("h3", { children: "\u0420\u0438\u0441\u043A\u0438 \u0438 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u0430\u043D\u043D\u044B\u0445:" }), " \u043F\u0440\u0435\u0434\u2011/\u043F\u043E\u0441\u0442\u2011\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430, \u0430\u043D\u043E\u043D\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u044F PII, \u0432\u0430\u043B\u0438\u0434\u0430\u0442\u043E\u0440\u044B"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430:" }), " \u043E\u0447\u0435\u0440\u0435\u0434\u0438, \u043F\u0443\u043B \u0432\u043E\u0440\u043A\u0435\u0440\u043E\u0432, \u0434\u0435\u0433\u0440\u0430\u0434\u0430\u0446\u0438\u044F \u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u041C\u043E\u0434\u0435\u043B\u0438:" }), " \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u043C\u044B\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u0438 \u044D\u043C\u0431\u0435\u0434\u0434\u0438\u043D\u0433\u043E\u0432 \u0438 rerank, fallback \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0438"] })] }), _jsx("h3", { id: "demo-cases", children: "\u0414\u0435\u043C\u043E\u2011\u043A\u0435\u0439\u0441\u044B" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0434\u0435\u043B\u0443:" }), " \u043E\u0442\u0432\u0435\u0442 \u2264 2 \u0441, \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0430 \u0437\u0430 \u0441\u0447\u0451\u0442 RAPTOR"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u0410\u043D\u0430\u043B\u0438\u0437 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0430:" }), " \u0432\u044B\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u0440\u0438\u0441\u043A\u043E\u0432 \u0441 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u044B\u043C\u0438 \u0441\u0441\u044B\u043B\u043A\u0430\u043C\u0438"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u0421\u0431\u043E\u0440 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430:" }), " \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 + \u0432\u0430\u043B\u0438\u0434\u0430\u0442\u043E\u0440 \u043F\u043E\u043B\u0435\u0439, \u044D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 DOCX/PDF"] })] })] })] }), showLegend && (_jsx("div", { className: "legend-panel", children: _jsx(DiagramLegend, {}) }))] })] }));
};
//# sourceMappingURL=index.js.map