import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download, Maximize2, RotateCcw, Search, ZoomIn, ZoomOut } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './ArchitectureDiagram.css';
export const ArchitectureDiagram = () => {
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const diagramRef = useRef(null);
    const tooltipRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoverTooltip, setHoverTooltip] = useState({ visible: false, x: 0, y: 0 });
    // Инвесторский контент по узлам диаграммы (без упоминаний размещения)
    const nodeMeta = useMemo(() => ({
        'RAPTOR_ENGINE': {
            title: 'RAPTOR Engine',
            summary: 'Рекурсивная кластеризация, древовидная организация, контекстная навигация.',
            kpi: '200 ops/s; +70–95% скорость; −90% нагрузка БД',
            link: '#raptor-engine'
        },
        'RAPTOR_TREE': {
            title: 'RAPTOR Tree',
            summary: 'Иерархические абстракции, быстрый доступ к релевантному контексту.',
            kpi: 'p95 выбор контекста < 80 мс',
            link: '#raptor-engine'
        },
        'RAPTOR_CLUSTERING': {
            title: 'RAPTOR Clustering',
            summary: 'Семантическое группирование, адаптивные пороги.',
            kpi: 'recall@10 +8–12% vs baseline',
            link: '#raptor-engine'
        },
        'INTELLIGENT_ROUTER': {
            title: 'Intelligent Router',
            summary: 'Выбор модели по сложности, управление бюджетом, стабильная латентность.',
            kpi: 'cost/req −30–55%; p95 1–5 c',
            link: '#investor-metrics'
        },
        'GPT5_NANO': {
            title: 'GPT‑5 Nano',
            summary: '80% запросов: быстрые ответы при устойчивом качестве.',
            kpi: 'p95 1–2 c; cost низкий',
            link: '#demo-cases'
        },
        'GPT5_MINI': {
            title: 'GPT‑5 Mini',
            summary: '15% задач: баланс качества/стоимости.',
            kpi: 'p95 2–3 c',
            link: '#demo-cases'
        },
        'GPT5_STANDARD': {
            title: 'GPT‑5 Standard',
            summary: '5% сложных задач: максимальное качество.',
            kpi: 'p95 3–5 c',
            link: '#demo-cases'
        },
        'RESULT_CACHE': {
            title: 'Result Cache',
            summary: 'Повторные ответы без задержек, снижение нагрузки.',
            kpi: 'hit rate 35–65%; latency −80–90%',
            link: '#investor-metrics'
        },
        'ENHANCED_OCR': {
            title: 'OCR Pipeline',
            summary: 'Tesseract 5 + пред/пост-обработка, кастомные модели.',
            kpi: '50 стр/мин; OCR WER < 15%',
            link: '#demo-cases'
        },
        'ENHANCED_EMBED': {
            title: 'Embeddings',
            summary: 'BGE‑M3/Nomic, быстрая индексация и релевантный поиск.',
            kpi: 'throughput 800–900 t/s',
            link: '#investor-metrics'
        },
        'QDRANT': {
            title: 'Vector DB (Qdrant)',
            summary: 'Семантический поиск, контекстные метаданные.',
            kpi: 'recall@10 > 0.9 (с rerank)',
            link: '#investor-metrics'
        },
        'POSTGRESQL': {
            title: 'PostgreSQL',
            summary: 'Метаданные и аналитика, надёжная транзакционная база.',
            kpi: '99.9% доступность',
            link: '#investor-metrics'
        },
        'SIGNOZ': {
            title: 'Monitoring (SigNoz)',
            summary: 'Единые метрики и трассировка, контроль SLO/SLI.',
            kpi: 'SLO p95 ответов по классам задач',
            link: '#slo-sli'
        }
    }), []);
    const mermaidDiagram = useMemo(() => `
flowchart TD
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

    %% ================ ЛОКАЛЬНЫЕ КОМПОНЕНТЫ ================ %%
    subgraph LOCAL_COMPONENTS["🏠 ЛОКАЛЬНЫЕ КОМПОНЕНТЫ"]
        BGE_M3_EMBEDDINGS["🔤 BGE-M3 Embeddings<br>• 1.3 GB VRAM<br>• Русскоязычные эмбеддинги<br>• Высокая точность"]

        NOMIC_EMBEDDINGS["⚡ Nomic-Embed-Text-v1.5<br>• 0.1 GB VRAM<br>• Быстрые эмбеддинги<br>• Универсальность"]

        BGE_RERANKER["🎯 BGE-Reranker-Base<br>• 0.02 GB VRAM<br>• Переранжирование результатов<br>• Повышение релевантности"]
    end

    %% ================ ПОИСКОВАЯ СИСТЕМА ================ %%
    subgraph SEARCH_SYSTEM["🔍 ПОИСКОВАЯ СИСТЕМА"]
        ENHANCED_QPROC --> INTELLIGENT_CLASSIFY["🧠 Интеллектуальная классификация<br>• Контекстное понимание<br>• ML на пользовательских данных<br>• Анализ сложности"]

        INTELLIGENT_CLASSIFY --> ENHANCED_HYBRID["🔍 Гибридный поиск<br>• BM25 + dense<br>• Конфигурируемый merge<br>• Контекстное ранжирование"]

        ENHANCED_HYBRID --> BM25["📖 BM25 Поиск<br>• rank-bm25 (free)<br>• Контекстная оптимизация<br>• Адаптивные параметры"]

        ENHANCED_HYBRID --> ENHANCED_VECTOR["🔍 Векторный поиск<br>• Qdrant<br>• Многоязычные эмбеддинги<br>• Специализированные модели"]

        BM25 --> ENHANCED_MERGE["🔗 Объединение результатов<br>• Контекстное взвешивание<br>• Адаптивные алгоритмы<br>• Качественные метрики"]

        ENHANCED_VECTOR --> ENHANCED_MERGE

        ENHANCED_MERGE --> ENHANCED_RERANK["🔍 Rerank<br>• bge-reranker-base<br>• Legal специализированные<br>• Многоязычные ранжировщики"]
    end

    %% ================ GRAPHRAG И HYDE СИСТЕМА ================ %%
    subgraph GRAPHRAG_HYDE["🕸️ GRAPHRAG + HYDE СИСТЕМА"]
        ENHANCED_QPROC --> GRAPHRAG_SYSTEM["🕸️ GraphRAG System<br>• Графовые запросы<br>• Семантические связи<br>• Multi-hop reasoning<br>• Knowledge Graph Access<br>• Контекстная навигация<br>• Адаптивные алгоритмы"]

        GRAPHRAG_SYSTEM --> GRAPH_DB["🗄️ ArangoDB Graph DB<br>• Графовые запросы<br>• Документная БД<br>• Ключ-значение<br>• Многоязычная поддержка<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы"]

        GRAPHRAG_SYSTEM --> KNOWLEDGE_GRAPH["🧠 Knowledge Graph<br>• RDF триплеты<br>• OWL-инференс<br>• Юридическая онтология<br>• Таксономия законов<br>• Прецеденты (GQL запросы)<br>• Правовые связи"]

        GRAPHRAG_SYSTEM --> MULTI_HOP_REASONING["🔄 Multi-hop Reasoning<br>• Итеративный поиск<br>• Графовые запросы<br>• Sub-question Decomposition<br>• Reasoning Traces<br>• Контекстная навигация<br>• Адаптивные алгоритмы"]

        ENHANCED_QPROC --> HYDE_SYSTEM["🔮 HyDE Prompting<br>• Гипотетические ответы<br>• Few-shot генерация<br>• Query Rewriting<br>• Step-back Prompting<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы"]

        HYDE_SYSTEM --> HYPOTHETICAL_GENERATOR["🎯 Hypothetical Document Generator<br>• Генерация гипотетических документов<br>• Контекстная адаптация<br>• Адаптивные стратегии<br>• Оптимизированные алгоритмы<br>• Качественные метрики<br>• Автоматическая валидация"]

        HYDE_SYSTEM --> QUERY_REWRITER["✍️ Query Rewriter<br>• Переписывание запросов<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы<br>• Оптимизированная производительность<br>• Качественные метрики<br>• Автоматическая валидация"]

        HYDE_SYSTEM --> STEP_BACK_PROMPTING["🔙 Step-back Prompting<br>• Пошаговое уточнение<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы<br>• Оптимизированная производительность<br>• Качественные метрики<br>• Автоматическая валидация"]

        GRAPHRAG_SYSTEM --> GRAPH_SEARCH["🔍 Graph Search Engine<br>• SPARQL запросы<br>• Graph Traversal<br>• Path Finding<br>• Inference Rules<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы"]

        GRAPH_SEARCH --> GRAPH_QUERY_OPTIMIZER["⚡ Graph Query Optimizer<br>• Оптимизация графовых запросов<br>• Контекстная оптимизация<br>• Адаптивные алгоритмы<br>• Оптимизированная производительность<br>• Качественные метрики<br>• Автоматическая валидация"]
    end

    %% ================ ОБРАБОТКА ДОКУМЕНТОВ ================ %%
    subgraph DOC_PROC["🔍 ОБРАБОТКА ДОКУМЕНТОВ"]
        ROUTER -->|"📄 Документ"| OCR_QUEUE["📬 OCR Очередь"] --> DOC_PIPE["🧹 Обработчик документов"]

        DOC_PIPE --> DETECT["🔎 Определение типа"]
        DETECT -->|"Скан"| ENHANCED_OCR["🔍 Расширенный OCR<br>• Tesseract 5<br>• Кастомные модели<br>• Legal_rus_eng.traineddata<br>• Конфиденциальность"]

        ENHANCED_OCR --> OCR_MODEL_MANAGER["🤖 OCR Model Manager<br>• Автоматический выбор модели<br>• Качество изображения<br>• Валидация точности >85%"]

        OCR_MODEL_MANAGER --> LAYOUT["📐 Структурирование<br>• DocumentChunker<br>• Сохранение offsets<br>• Контекстная сегментация"]

        DETECT -->|"Текст"| LAYOUT
        LAYOUT --> CLEAN["🧼 Очистка"]
        CLEAN --> CHUNK["✂️ Разделение на чанки<br>• Семантические теги<br>• Контекстная сегментация<br>• Адаптивные размеры"]

        CHUNK --> ENHANCED_TAG["🏷 Извлечение сущностей<br>• SpaCy ru_core_news_lg<br>• Legal NER модели<br>• PII правила"]

        ENHANCED_TAG --> PII["🔒 PII Анонимизация<br>• Конфигурируемые политики<br>• Адаптивные алгоритмы<br>• Контекстная защита"]

        PII --> ENHANCED_EMBED["🧬 Векторизация<br>• BGE-M3/Jina v3<br>• Multilingual-E5<br>• Sentence Transformers"]

        ENHANCED_EMBED --> STORE["💾 Индексация<br>• Батчи в Qdrant<br>• Отдельные коллекции<br>• Контекстные метаданные"]
    end

    %% ================ ХРАНИЛИЩА ================ %%
    STORE --> QDRANT(("🗄️ Qdrant<br>• user-docs коллекция<br>• payload{doc_id, user_id}<br>• Контекстные метаданные"))
    STORE --> MINIO(("🗄️ MinIO (S3)<br>• Бакеты: docs/exports/logs<br>• Политики жизненного цикла<br>• Контекстная архивация"))

    %% ================ ГЕНЕРАЦИЯ ДОКУМЕНТОВ ================ %%
    subgraph DOC_GEN["📄 ГЕНЕРАТОР ДОКУМЕНТОВ"]
        ROUTER -->|"📝 Генерация"| DOCGEN["📝 Генератор документов"]

        DOCGEN --> ENHANCED_TEMPLATE["📋 Выбор шаблона<br>• DOCX/HTML + Jinja2<br>• JSON Schema/YAML<br>• Контекстные шаблоны"]

        ENHANCED_TEMPLATE --> ENHANCED_CLARIFY["❓ Уточнение деталей<br>• FSM aiogram<br>• Интерактивный диалог<br>• Контекстные подсказки"]

        ENHANCED_CLARIFY --> ENHANCED_COMPOSE["🧩 Конструктор документа<br>• Адаптивная структура<br>• Контекстные блоки<br>• Оптимизированные алгоритмы"]

        ENHANCED_COMPOSE --> ENHANCED_FILL["✍️ Заполнение шаблона<br>• PII-маскирование<br>• Контекстная адаптация<br>• Адаптивные алгоритмы"]

        ENHANCED_FILL --> ENHANCED_VALIDATE["✔️ Юридическая проверка<br>• Правила полей (ИНН/ОГРН)<br>• Контекстная валидация<br>• Автоматические исправления"]

        ENHANCED_VALIDATE --> ENHANCED_FORMAT["🔄 Конвертация формата<br>• python-docx (DOCX)<br>• Pandoc (PDF)<br>• Множественные форматы"]

        ENHANCED_FORMAT --> ENHANCED_SEND["📤 Умная отправка<br>• Адаптивные форматы<br>• Персонализированная доставка<br>• Контекстная оптимизация"]
    end

    %% ================ КЭШИРОВАНИЕ ================ %%
    subgraph CACHE_SYSTEM["⚡ СИСТЕМА КЭШИРОВАНИЯ"]
        REDIS_CACHE["🔴 Redis Cache<br>• Сессии пользователей<br>• Кэш промптов<br>• Результаты поиска<br>• Rate limiting"]

        VECTOR_CACHE["🧬 Vector Cache<br>• FAISS/HNSW индексы<br>• Эмбеддинги<br>• Поисковые результаты<br>• Оптимизированная память"]

        MODEL_CACHE["🤖 Model Cache<br>• Кэшированные модели<br>• Оптимизированные веса<br>• Быстрая загрузка<br>• Экономия памяти"]
    end

    %% ================ МОНИТОРИНГ И ОБСЕРВАБИЛЬНОСТЬ ================ %%
    subgraph MONITORING["📊 ЕДИНАЯ ПЛАТФОРМА МОНИТОРИНГА - SIGNOZ"]
        SIGNOZ["🔍 SigNoz - Единая платформа<br>• Централизованный мониторинг<br>• Distributed tracing<br>• Метрики производительности<br>• Алерты и уведомления<br>• Аналитика ошибок<br>• Grafana-совместимые дашборды<br>• Loki-совместимое логирование<br>• Prometheus-совместимые метрики<br>• Специализированные метрики GPT-5/RAPTOR"]

        SYSTEM_PERFORMANCE_MONITOR["📊 System Performance Monitor<br>• Время ответа системы<br>• Использование ресурсов<br>• Ошибки и исключения<br>• Алерты при превышении лимитов<br>• Real-time метрики<br>• Системные метрики<br>• Мониторинг инфраструктуры<br>• Качество сервисов<br>• Соответствие SLA"]

        SYSTEM_PERFORMANCE_MONITOR --> AUTO_RECOVERY["🔄 Auto Recovery<br>• Автоматическое восстановление<br>• Health checks<br>• Failover механизмы<br>• Graceful degradation<br>• Self-healing системы"]

        AUTO_RECOVERY --> ALERT_SYSTEM["🚨 Alert System<br>• Умные алерты<br>• Эскалация уведомлений<br>• Автоматические действия<br>• Интеграция с Slack/Telegram<br>• Приоритизация инцидентов"]

        CACHE_PERFORMANCE_MONITOR["📊 Cache Performance Monitor<br>• Время ответа<br>• Использование ресурсов<br>• Ошибки и исключения<br>• Real-time метрики<br>• GPT-5 производительность<br>• RAPTOR Engine метрики<br>• Юридические запросы<br>• Качество ответов<br>• Соответствие 152-ФЗ"]

        ADMIN_PANEL["📊 Админка с визуализацией<br>• Dashboard с метриками<br>• Графики и аналитика<br>• Управление пользователями<br>• Мониторинг системы<br>• Real-time обновления"]
    end

    %% ================ БАЗЫ ДАННЫХ ================ %%
    subgraph DATABASES["🗄️ БАЗЫ ДАННЫХ"]
        POSTGRESQL["🐘 PostgreSQL<br>• Пользователи и сессии<br>• Метаданные документов<br>• Системные настройки<br>• Аналитика и отчеты<br>• Реляционные данные"]
        QDRANT["🔍 Qdrant<br>• Векторные эмбеддинги<br>• Семантический поиск<br>• Контекстные данные<br>• Оптимизированные индексы<br>• Масштабируемое хранение"]
        MINIO["🗄️ MinIO (S3)<br>• Документы и файлы<br>• Бэкапы и архивы<br>• Логи и метрики<br>• Временные данные<br>• Объектное хранение"]
    end

    %% ================ СВЯЗИ МЕЖДУ КОМПОНЕНТАМИ ================ %%
    ENHANCED_QPROC --> REDIS_CACHE
    ENHANCED_QPROC --> VECTOR_CACHE
    ENHANCED_QPROC --> MODEL_CACHE
    ENHANCED_QPROC --> SIGNOZ
    ENHANCED_QPROC --> SYSTEM_PERFORMANCE_MONITOR
    ENHANCED_QPROC --> POSTGRESQL
    ENHANCED_QPROC --> QDRANT
    ENHANCED_QPROC --> MINIO

    %% ================ СВЯЗИ МЕЖДУ СИСТЕМАМИ ================ %%
    ENHANCED_RERANK --> RESPONSE_GENERATOR
    GRAPHRAG_SYSTEM --> RESPONSE_GENERATOR
    HYDE_SYSTEM --> RESPONSE_GENERATOR
    MULTI_HOP_REASONING --> RESPONSE_GENERATOR
    GRAPH_SEARCH --> RESPONSE_GENERATOR

    RESPONSE_GENERATOR --> ENHANCED_OUTPUT["📤 Отправка пользователю<br>• Idempotency keys<br>• Персонализированный формат<br>• Контекстная оптимизация"]

    ENHANCED_OUTPUT --> ENHANCED_FEEDBACK["📊 Сбор обратной связи<br>• A/B тестирование<br>• Качественные метрики<br>• Пользовательские предпочтения"]

    %% ================ СТИЛИЗАЦИЯ ================ %%
    classDef implemented fill:#d1fae5,stroke:#10b981,stroke-width:2px
    classDef missing fill:#fff,stroke:#ef4444,stroke-width:2px,stroke-dasharray: 5 5
    classDef raptor fill:#fbbf24,stroke:#f59e0b,stroke-width:3px
    classDef gpt5 fill:#a78bfa,stroke:#8b5cf6,stroke-width:2px
    classDef graphClass fill:#ec4899,stroke:#be185d,stroke-width:2px
    classDef hydeClass fill:#10b981,stroke:#059669,stroke-width:2px
    classDef monitoringClass fill:#6366f1,stroke:#4f46e5,stroke-width:2px
    classDef databaseClass fill:#ef4444,stroke:#dc2626,stroke-width:2px

    class USER,NGINX_LB,BOT,WEB_SERVICE,MOBILE_APP,REDIS_QUEUE,WORKER_POOL,ROUTER,RATE,ENHANCED_QPROC,OPTIMIZED_VOICE,OCR_QUEUE,DOC_PIPE,DOCGEN implemented
    class RAPTOR_ENGINE,RAPTOR_TREE,RAPTOR_CLUSTERING,RAPTOR_ABSTRACTION,RAPTOR_SEARCH,INTELLIGENT_ROUTER,GPT5_NANO,GPT5_MINI,GPT5_STANDARD,RESPONSE_GENERATOR,RESULT_CACHE,GPT5_CACHE,SMART_CACHE_MANAGER implemented
    class CACHE_PERFORMANCE_MONITOR,BGE_M3_EMBEDDINGS,NOMIC_EMBEDDINGS,BGE_RERANKER,FREE_ALTERNATIVES_NOTE,SLANG_DICT,CONTEXT_ANALYZER,SYNONYM_EXPANDER,LEGAL_TERMINOLOGY,ADAPTIVE_PROMPT implemented
    class ENHANCED_OCR,OCR_MODEL_MANAGER,OCR_PREPROCESSING,OCR_POSTPROCESSING,DETECT,LAYOUT,CLEAN,CHUNK,ENHANCED_TAG,PII,ENHANCED_EMBED,STORE,CLAUSE_EXT implemented
    class QDRANT,MINIO,ANONYMIZATION_SYSTEM,INTELLIGENT_CLASSIFY,ENHANCED_NER,ENHANCED_DSL,ENHANCED_HYBRID,BM25,ENHANCED_VECTOR,ENHANCED_MERGE,ENHANCED_RERANK implemented
    class ENHANCED_GROUNDED,ENHANCED_CONTEXT,GRAPHRAG_SYSTEM,GRAPH_DB,KNOWLEDGE_GRAPH,MULTI_HOP_REASONING,HYDE_SYSTEM,HYPOTHETICAL_GENERATOR,QUERY_REWRITER,STEP_BACK_PROMPTING implemented
    class GRAPH_SEARCH,GRAPH_QUERY_OPTIMIZER,GUARD,ESCALATE_QUEUE,ESCALATE,ENHANCED_VAL,ENHANCED_RESP,ENHANCED_RETRY,ENHANCED_STRUCT,ENHANCED_CITATIONS implemented
    class ENHANCED_OUTPUT,ENHANCED_FEEDBACK,ENHANCED_TEMPLATE,ENHANCED_CLARIFY,ENHANCED_COMPOSE,ENHANCED_FILL,ENHANCED_VALIDATE,ENHANCED_GUARD_DOC,ENHANCED_NEGOTIATE,ENHANCED_REDLINES implemented
    class FORMAT_QUEUE,ENHANCED_FORMAT,ENHANCED_SEND,ADMIN_PANEL,INFRASTRUCTURE,CONTRACT_SYSTEM,OPTIMIZED_SERVER_INFRA,REDIS_CACHE,VECTOR_CACHE,MODEL_CACHE implemented
    class SIGNOZ,SYSTEM_PERFORMANCE_MONITOR,POSTGRESQL,AUTO_RECOVERY,ALERT_SYSTEM implemented

    class RAPTOR_ENGINE,RAPTOR_TREE,RAPTOR_CLUSTERING,RAPTOR_ABSTRACTION,RAPTOR_SEARCH raptor
    class GPT5_NANO,GPT5_MINI,GPT5_STANDARD,INTELLIGENT_ROUTER gpt5
    class GRAPHRAG_SYSTEM,KNOWLEDGE_GRAPH,MULTI_HOP_REASONING,GRAPH_SEARCH,GRAPH_QUERY_OPTIMIZER graphClass
    class HYDE_SYSTEM,HYPOTHETICAL_GENERATOR,QUERY_REWRITER,STEP_BACK_PROMPTING hydeClass
    class SIGNOZ,SYSTEM_PERFORMANCE_MONITOR,AUTO_RECOVERY,ALERT_SYSTEM,ADMIN_PANEL monitoringClass
    class POSTGRESQL,QDRANT,MINIO,GRAPH_DB databaseClass
    `, []);
    useEffect(() => {
        // Динамически загружаем Mermaid
        const loadMermaid = async () => {
            if (typeof window !== 'undefined' && !window.mermaid) {
                try {
                    const mermaid = await import('mermaid');
                    mermaid.default.initialize({
                        startOnLoad: false,
                        theme: 'dark',
                        securityLevel: 'loose',
                        flowchart: {
                            useMaxWidth: true,
                            htmlLabels: true,
                            curve: 'basis'
                        },
                        // Добавляем настройки для предотвращения ошибок
                        suppressErrorRendering: true
                    });
                    window.mermaid = mermaid.default;
                }
                catch (error) {
                    console.error('Failed to load mermaid:', error);
                }
            }
        };
        const attachInteractivity = () => {
            const svg = diagramRef.current?.querySelector('svg');
            if (!svg)
                return;
            // Поиск и подсветка узлов по запросу
            const highlightMatches = () => {
                const groups = Array.from(svg.querySelectorAll('g'));
                groups.forEach(g => {
                    const label = g.textContent?.toLowerCase() || '';
                    const match = searchQuery.trim().length > 0 && label.includes(searchQuery.toLowerCase());
                    g.style.opacity = match || searchQuery.trim().length === 0 ? '1' : '0.25';
                    if (match) {
                        g.classList.add('node-highlight');
                    }
                    else {
                        g.classList.remove('node-highlight');
                    }
                });
            };
            highlightMatches();
            // Ховер/клик для известных узлов
            Object.keys(nodeMeta).forEach((id) => {
                const nodeEl = svg.querySelector(`[id$="${id}"]`);
                if (!nodeEl)
                    return;
                // ARIA для доступности
                nodeEl.setAttribute('role', 'button');
                nodeEl.setAttribute('tabindex', '0');
                nodeEl.setAttribute('aria-label', `${nodeMeta[id].title}: ${nodeMeta[id].summary}. KPI: ${nodeMeta[id].kpi}`);
                const onMouseMove = (e) => {
                    setHoverTooltip({
                        visible: true,
                        x: e.clientX + 12,
                        y: e.clientY + 12,
                        title: nodeMeta[id].title,
                        summary: nodeMeta[id].summary,
                        kpi: nodeMeta[id].kpi
                    });
                };
                const onMouseLeave = () => setHoverTooltip(v => ({ ...v, visible: false }));
                const onClick = () => {
                    // Переход к соответствующему разделу (якорь на странице)
                    const link = nodeMeta[id].link;
                    if (link && typeof window !== 'undefined') {
                        window.location.hash = link;
                    }
                };
                const onKeyDown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                };
                nodeEl.addEventListener('mousemove', onMouseMove);
                nodeEl.addEventListener('mouseleave', onMouseLeave);
                nodeEl.addEventListener('click', onClick);
                nodeEl.addEventListener('keydown', onKeyDown);
                // Очистка обработчиков при ре-рендере
                const cleanup = () => {
                    nodeEl.removeEventListener('mousemove', onMouseMove);
                    nodeEl.removeEventListener('mouseleave', onMouseLeave);
                    nodeEl.removeEventListener('click', onClick);
                    nodeEl.removeEventListener('keydown', onKeyDown);
                };
                // Сохраняем функцию на элементе для возможной очистки (переинициализация)
                nodeEl.__cleanup = cleanup;
            });
        };
        loadMermaid().then(() => {
            if (window.mermaid && diagramRef.current) {
                try {
                    // Очищаем предыдущий контент
                    if (diagramRef.current) {
                        diagramRef.current.innerHTML = '';
                    }
                    window.mermaid.render('ai-lawyer-diagram', mermaidDiagram).then(({ svg }) => {
                        if (diagramRef.current) {
                            diagramRef.current.innerHTML = svg;
                            attachInteractivity();
                        }
                    }).catch((error) => {
                        console.error('Failed to render mermaid diagram:', error);
                        // Показываем сообщение об ошибке
                        if (diagramRef.current) {
                            diagramRef.current.innerHTML = '<div class="text-red-500 p-4">Ошибка загрузки диаграммы. Попробуйте обновить страницу.</div>';
                        }
                    });
                }
                catch (error) {
                    console.error('Mermaid render error:', error);
                    if (diagramRef.current) {
                        diagramRef.current.innerHTML = '<div class="text-red-500 p-4">Ошибка инициализации диаграммы.</div>';
                    }
                }
            }
        });
    }, [mermaidDiagram, searchQuery, nodeMeta]);
    // Позиционирование тултипа без inline-стилей в JSX
    useEffect(() => {
        if (!tooltipRef.current)
            return;
        if (hoverTooltip.visible) {
            tooltipRef.current.style.transform = `translate(${hoverTooltip.x}px, ${hoverTooltip.y}px)`;
        }
    }, [hoverTooltip]);
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2));
    };
    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };
    const handleResetZoom = () => {
        setZoom(1);
    };
    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    const handleDownload = () => {
        const svg = diagramRef.current?.querySelector('svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const link = document.createElement('a');
                link.download = 'ai-lawyer-architecture.png';
                link.href = canvas.toDataURL();
                link.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };
    return (_jsxs("div", { className: `bg-surface rounded-lg border border-border ${isFullscreen ? 'fixed inset-0 z-50 p-4' : ''}`, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [_jsx("h3", { className: "text-lg font-semibold", children: "\u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430 AI-\u042E\u0440\u0438\u0441\u0442\u0430" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-2 mr-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" }), _jsx("input", { "aria-label": "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430\u043C \u0434\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u044B", className: "pl-7 pr-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[220px]", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }) }), _jsx("button", { onClick: handleZoomOut, className: "p-2 rounded-lg bg-surface hover:bg-hover transition-colors", title: "\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C", children: _jsx(ZoomOut, { className: "w-4 h-4" }) }), _jsxs("span", { className: "text-sm text-text-secondary min-w-[60px] text-center", children: [Math.round(zoom * 100), "%"] }), _jsx("button", { onClick: handleZoomIn, className: "p-2 rounded-lg bg-surface hover:bg-hover transition-colors", title: "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C", children: _jsx(ZoomIn, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleResetZoom, className: "p-2 rounded-lg bg-surface hover:bg-hover transition-colors", title: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043C\u0430\u0441\u0448\u0442\u0430\u0431", children: _jsx(RotateCcw, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleFullscreen, className: "p-2 rounded-lg bg-surface hover:bg-hover transition-colors", title: "\u041F\u043E\u043B\u043D\u043E\u044D\u043A\u0440\u0430\u043D\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C", children: _jsx(Maximize2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleDownload, className: "p-2 rounded-lg bg-surface hover:bg-hover transition-colors", title: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0434\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0443", children: _jsx(Download, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "p-4 overflow-auto", children: [_jsx("div", { ref: diagramRef, className: "diagram-container scaled", "data-zoom": zoom }), hoverTooltip.visible && (_jsxs("div", { role: "tooltip", className: "pointer-events-none fixed z-[60] max-w-xs rounded-md border border-border bg-surface/95 px-3 py-2 shadow-xl text-sm", ref: tooltipRef, children: [hoverTooltip.title && _jsx("div", { className: "font-semibold mb-1", children: hoverTooltip.title }), hoverTooltip.summary && _jsx("div", { className: "text-text-secondary mb-1", children: hoverTooltip.summary }), hoverTooltip.kpi && _jsxs("div", { className: "text-xs text-text-secondary", children: ["KPI: ", hoverTooltip.kpi] })] })), _jsxs("div", { className: "mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-text-secondary", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-text", children: "\u041B\u0435\u0433\u0435\u043D\u0434\u0430 \u0440\u043E\u043B\u0435\u0439" }), _jsxs("ul", { className: "mt-1 space-y-1", children: [_jsx("li", { children: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u043E\u0442\u0432\u0435\u0442" }), _jsx("li", { children: "\u041F\u043E\u0438\u0441\u043A\u043E\u0432\u043E-\u0430\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0443\u0437\u043B\u044B" }), _jsx("li", { children: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u044B" }), _jsx("li", { children: "\u0425\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0438 \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F" }), _jsx("li", { children: "\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0438 \u043C\u0435\u0442\u0440\u0438\u043A\u0438" })] })] }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-text", children: "\u041A\u0430\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F" }), _jsxs("ul", { className: "mt-1 space-y-1", children: [_jsx("li", { children: "\u041D\u0430\u0432\u0435\u0434\u0438 \u0434\u043B\u044F \u043A\u0440\u0430\u0442\u043A\u043E\u0433\u043E \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u0438 KPI" }), _jsx("li", { children: "\u041D\u0430\u0436\u043C\u0438 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u043A \u0440\u0430\u0437\u0434\u0435\u043B\u0443 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0435\u0439" }), _jsx("li", { children: "\u0418\u0449\u0438 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u0432 \u043F\u043E\u043B\u0435 \u043F\u043E\u0438\u0441\u043A\u0430" }), _jsx("li", { children: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u043E\u043C \u043A\u043D\u043E\u043F\u043A\u0430\u043C\u0438 \u0441\u0432\u0435\u0440\u0445\u0443" })] })] })] })] })] }));
};
//# sourceMappingURL=ArchitectureDiagram.js.map