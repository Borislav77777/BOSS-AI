# 🚀 Boss AI Platform - Developer Setup Guide

**Для разработчика Николая**
**Дата:** 21 октября 2025
**Версия:** Production Platform v1.0

---

## 📋 Системные требования

### Обязательные компоненты:

- **Node.js** 18+ (рекомендуется 18.17.0)
- **npm** 9+ (или yarn)
- **SQLite** 3.35+ (обычно встроен в систему)
- **PM2** (для production deployment)
- **Git** (для версионирования)

### Опциональные:

- **Nginx** (для production)
- **Docker** (для контейнеризации)

---

## 🏗️ Архитектура платформы

```
Boss AI Platform
├── Frontend (React + Vite) → http://localhost:3000
├── API Gateway (Node.js, port 3000) → http://localhost:3000
├── Ozon Manager (Node.js, port 4200) → http://localhost:4200
└── Database: SQLite (WAL mode)
    └── /backend/ozon-manager/data/ozon_manager.db
```

### Микросервисы:

- **API Gateway** - основной entry point, аутентификация, биллинг
- **Ozon Manager** - интеграция с Ozon API
- **Frontend** - React SPA с динамической загрузкой сервисов

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Backend (API Gateway)
cd backend/main
npm install

# Backend (Ozon Manager)
cd ../ozon-manager
npm install

# Frontend
cd ../../frontend
npm install
```

### 2. Настройка окружения

Файлы `.env` уже настроены с реальными токенами:

- `backend/main/.env` - API Gateway конфигурация
- `backend/ozon-manager/.env` - Ozon Manager конфигурация
- `frontend/.env` - Frontend конфигурация

### 3. Запуск в development режиме

```bash
# Terminal 1: API Gateway
cd backend/main
npm run dev

# Terminal 2: Ozon Manager
cd backend/ozon-manager
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 4. Проверка работы

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3000/api/health
- **Ozon Manager**: http://localhost:4200/health

---

## 📁 Структура проекта

### Backend (API Gateway)

```
backend/main/
├── src/
│   ├── index.ts                 # Express server
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts      # Аутентификация
│   │   ├── billing.routes.ts   # Биллинг (BT токены)
│   │   ├── ai.routes.ts        # AI сервисы (GPT)
│   │   └── ozon.routes.ts      # Ozon Manager proxy
│   ├── services/               # Бизнес логика
│   │   ├── auth.service.ts     # Telegram Login Widget
│   │   ├── billing.service.ts  # BT токены, транзакции
│   │   └── ai-services.service.ts # GPT проксирование
│   ├── middleware/             # Middleware
│   │   ├── auth.middleware.ts  # JWT аутентификация
│   │   └── error.middleware.ts # Обработка ошибок
│   └── utils/                  # Утилиты
│       └── proxy.ts            # ProxyClient для микросервисов
├── data/                       # SQLite база данных
└── .env                        # Конфигурация
```

### Backend (Ozon Manager)

```
backend/ozon-manager/
├── src/
│   ├── index.ts                # Express server
│   ├── routes/                 # Ozon API routes
│   ├── services/               # Ozon API клиент
│   └── utils/                  # Database, миграции
├── data/
│   └── ozon_manager.db         # SQLite база (shared!)
└── .env                        # Конфигурация
```

### Frontend

```
frontend/
├── src/
│   ├── components/             # React компоненты
│   ├── pages/                  # Страницы
│   ├── services/               # API клиенты
│   └── utils/                  # Утилиты
├── public/
│   └── services/               # Конфигурации сервисов
│       └── chatgpt-service.json # Пример сервиса
└── .env                        # Конфигурация
```

---

## 🔑 Ключевые API Endpoints

### Аутентификация

```bash
# Telegram Login Widget
POST /api/auth/telegram
Content-Type: application/json

{
  "id": 123456789,
  "first_name": "Николай",
  "username": "nikolay_dev",
  "photo_url": "https://...",
  "auth_date": 1729500000,
  "hash": "abc123..."
}
```

### AI Сервисы (для Кати)

```bash
# GPT запрос через платформу
POST /api/ai/chatgpt
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "prompt": "Суммаризируй обсуждение команды",
  "options": {
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "max_tokens": 2000
  }
}
```

### Биллинг

```bash
# Получить баланс пользователя
GET /api/billing/balance
Authorization: Bearer <user_token>

# Списать средства (автоматически через middleware)
# Происходит при каждом AI запросе
```

### Ozon Manager

```bash
# Все запросы проксируются через API Gateway
GET /api/ozon/health
POST /api/ozon/products
# и т.д.
```

---

## 🗄️ База данных

### Основные таблицы (уже созданы):

```sql
-- Пользователи (Telegram авторизация)
users (
  id INTEGER PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  first_name TEXT,
  -- ...
)

-- Балансы (BT токены)
user_balance (
  user_id INTEGER,
  balance_rub REAL,
  balance_bt REAL,
  currency TEXT
)

-- Транзакции
transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  service_name TEXT,
  amount REAL,
  currency TEXT,
  -- ...
)

-- Тарифы сервисов
service_pricing (
  service_name TEXT,
  price_per_unit REAL,
  currency TEXT
)
```

### Для Кати (новые таблицы):

См. `docs/KATYA_BOT_TZ_v5_FINAL.md` - раздел "СХЕМА БАЗЫ ДАННЫХ"

---

## 🔧 Конфигурация сервисов

### Пример: chatgpt-service.json

```json
{
  "id": "chatgpt-service",
  "name": "ChatGPT",
  "description": "AI ассистент OpenAI",
  "tools": [
    {
      "id": "chat-completion",
      "name": "💬 Чат",
      "action": "chat",
      "chatApiEndpoint": "/api/ai/chatgpt",
      "pricing": {
        "cost_bt": 0.5,
        "cost_rub": 5.0
      }
    }
  ]
}
```

### Для Кати нужно создать:

- `katya-service.json` (аналогично chatgpt-service.json)
- API endpoints в Katya Service
- Интеграция с биллингом

---

## 🚀 Production Deployment

### PM2 конфигурация (ecosystem.config.js):

```javascript
{
  name: "boss-ai-api-gateway",
  script: "dist/index.js",
  cwd: "/var/www/boss-ai/backend/main",
  env: {
    NODE_ENV: "production",
    PORT: 3000,
    DB_PATH: "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db"
  }
}
```

### Nginx конфигурация:

```nginx
server {
    listen 80;
    server_name boss-ai.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🧪 Тестирование

### 1. Проверка API Gateway

```bash
curl http://localhost:3000/api/health
# Должен вернуть: {"status": "ok", "service": "api-gateway"}
```

### 2. Проверка Ozon Manager

```bash
curl http://localhost:4200/health
# Должен вернуть: {"status": "ok", "service": "ozon-manager"}
```

### 3. Проверка Frontend

```bash
curl http://localhost:3000
# Должен вернуть HTML страницу
```

### 4. Проверка базы данных

```bash
sqlite3 backend/ozon-manager/data/ozon_manager.db
.tables
# Должны быть: users, user_balance, transactions, service_pricing
```

---

## 🔍 Troubleshooting

### Проблема: "Cannot find module"

**Решение:**

```bash
cd backend/main && npm install
cd ../ozon-manager && npm install
cd ../../frontend && npm install
```

### Проблема: "Database is locked"

**Решение:**

```bash
# Проверить процессы
ps aux | grep sqlite
# Убить зависшие процессы
pkill -f sqlite
```

### Проблема: "Port 3000 already in use"

**Решение:**

```bash
# Найти процесс
lsof -i :3000
# Убить процесс
kill -9 <PID>
```

### Проблема: "401 Unauthorized"

**Решение:**

- Проверить токен в localStorage
- Проверить JWT_SECRET в .env
- Проверить Telegram Login Widget настройки

---

## 📚 Дополнительная документация

- `docs/KATYA_BOT_TZ_v5_FINAL.md` - Полное ТЗ для разработки Кати
- `docs/KATYA_INTEGRATION_GUIDE.md` - Детальное руководство по интеграции
- `docs/API_EXAMPLES.md` - Примеры всех API запросов
- `QUICK_START_DEV.sh` - Автоматический скрипт установки

---

## 🆘 Поддержка

При возникновении проблем:

1. Проверить логи: `pm2 logs`
2. Проверить статус сервисов: `pm2 status`
3. Перезапустить: `pm2 restart all`
4. Обратиться к @boss в чате

---

**Удачи в разработке! 🚀**
