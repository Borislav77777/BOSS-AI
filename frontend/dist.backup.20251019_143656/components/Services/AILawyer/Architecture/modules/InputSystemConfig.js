/**
 * Модуль системы входа
 * Включает пользователя, Nginx, ботов, веб-сервис, мобильное приложение
 */
export const InputSystem = {
    id: 'input-system',
    name: 'Система входа',
    description: 'Пользовательские интерфейсы и балансировщик нагрузки',
    position: { x: 0, y: 0 },
    dependencies: [],
    isVisible: true,
    isExpanded: true,
    mermaidCode: `
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

    %% Стилизация
    classDef implemented fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#111827
    class USER,NGINX_LB,BOT,WEB_SERVICE,MOBILE_APP,REDIS_QUEUE,WORKER_POOL,ROUTER implemented
  `
};
//# sourceMappingURL=InputSystemConfig.js.map