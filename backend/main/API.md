# Boss AI Platform - API Gateway Documentation

## 📋 Обзор

API Gateway - это единая точка входа для всех запросов к микросервисам Boss AI Platform. Он обеспечивает маршрутизацию, авторизацию, rate limiting и мониторинг.

## 🏗️ Архитектура

```
Frontend (5173) → API Gateway (3000) → Ozon Manager (4200)
                                      → AI Services (4300)
```

## 🔧 Конфигурация

### Переменные окружения

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DB_PATH=./data/boss_ai.db

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Microservices
OZON_MANAGER_URL=http://localhost:4200
AI_SERVICES_URL=http://localhost:4300

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
```

## 📡 API Endpoints

### 🔐 Авторизация

#### POST /api/auth/telegram/login
Авторизация через Telegram

**Request:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "auth_date": 1640995200,
  "hash": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "telegram_123456789",
      "telegramId": 123456789,
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 2592000,
      "tokenType": "Bearer"
    }
  }
}
```

#### GET /api/auth/me
Получение информации о текущем пользователе

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "telegram_123456789",
      "telegramId": 123456789,
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### POST /api/auth/refresh
Обновление токена

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 2592000,
      "tokenType": "Bearer"
    }
  }
}
```

#### POST /api/auth/logout
Выход из системы

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Успешный выход из системы"
  }
}
```

### 🏪 Ozon Manager (Прокси)

#### GET /api/ozon/stores
Получить все магазины

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "My Store",
      "client_id": "12345",
      "api_key": "abc123...",
      "remove_from_promotions": true,
      "unarchive_products": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/ozon/stores
Создать новый магазин

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "New Store",
  "client_id": "67890",
  "api_key": "def456...",
  "remove_from_promotions": true,
  "unarchive_products": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "New Store",
    "client_id": "67890",
    "api_key": "def456...",
    "remove_from_promotions": true,
    "unarchive_products": false,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/ozon/stores/:name
Обновить магазин

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "client_id": "67890",
  "api_key": "new_key...",
  "remove_from_promotions": false,
  "unarchive_products": true
}
```

#### DELETE /api/ozon/stores/:name
Удалить магазин

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Магазин удален"
  }
}
```

#### POST /api/ozon/stores/:name/test-connection
Тест подключения к API магазина

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Подключение успешно"
  }
}
```

#### POST /api/ozon/promotions/remove
Удаление товаров из акций

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "storeNames": ["Store1", "Store2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "store": "Store1",
      "success": true,
      "products_removed": 15,
      "actions_processed": 1
    },
    {
      "store": "Store2",
      "success": false,
      "error": "Invalid API key"
    }
  ]
}
```

#### POST /api/ozon/archive/unarchive
Разархивация товаров

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "storeNames": ["Store1", "Store2"]
}
```

#### GET /api/ozon/logs
Получить логи

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    "2024-01-01 12:00:00 - INFO - Store 'Store1' connected successfully",
    "2024-01-01 12:01:00 - ERROR - Store 'Store2' connection failed"
  ]
}
```

#### GET /api/ozon/scheduler/status
Получить статус планировщика

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "tasksCount": 3,
    "tasks": [
      {
        "id": "task1",
        "name": "Remove from promotions",
        "schedule": "0 0 * * *",
        "lastRun": "2024-01-01T00:00:00.000Z",
        "nextRun": "2024-01-02T00:00:00.000Z",
        "status": "active"
      }
    ]
  }
}
```

### 🤖 AI Services (Прокси)

#### POST /api/ai/chatgpt
Отправить запрос к ChatGPT

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "prompt": "Привет, как дела?",
  "options": {
    "model": "gpt-4",
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Привет! У меня все хорошо, спасибо!",
    "model": "gpt-4",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 15,
      "total_tokens": 25
    }
  }
}
```

#### POST /api/ai/claude
Отправить запрос к Claude

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "prompt": "Объясни квантовую физику",
  "options": {
    "max_tokens": 1000
  }
}
```

#### POST /api/ai/gemini
Отправить запрос к Gemini

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "prompt": "Напиши стихотворение о весне",
  "options": {
    "temperature": 0.8
  }
}
```

#### GET /api/ai/models
Получить список доступных AI моделей

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "gpt-4",
      "provider": "openai",
      "description": "GPT-4 model"
    },
    {
      "name": "claude-3",
      "provider": "anthropic",
      "description": "Claude 3 model"
    }
  ]
}
```

#### GET /api/ai/history/:userId
Получить историю запросов пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Количество записей (по умолчанию 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req1",
      "prompt": "Привет",
      "response": "Привет!",
      "model": "gpt-4",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### GET /api/ai/status
Получить статус AI сервисов

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "services": ["chatgpt", "claude", "gemini"],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 🏥 Health Checks

#### GET /api/health
Базовая проверка здоровья API Gateway

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "uptime": 3600000
  }
}
```

#### GET /api/health/gateway
Детальная проверка здоровья API Gateway

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "uptime": 3600000,
    "services": [
      {
        "service": "ozon-manager",
        "status": "healthy",
        "lastCheck": "2024-01-01T12:00:00.000Z"
      },
      {
        "service": "ai-services",
        "status": "unhealthy",
        "lastCheck": "2024-01-01T12:00:00.000Z",
        "error": "Service not available"
      }
    ],
    "version": "1.0.0"
  }
}
```

#### GET /api/health/services
Проверка здоровья всех микросервисов

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "services": [
      {
        "service": "ozon-manager",
        "status": "healthy",
        "lastCheck": "2024-01-01T12:00:00.000Z"
      },
      {
        "service": "ai-services",
        "status": "unhealthy",
        "lastCheck": "2024-01-01T12:00:00.000Z",
        "error": "Service not available"
      }
    ],
    "healthy": 1,
    "total": 2,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /api/health/detailed
Детальная информация о здоровье системы

**Response:**
```json
{
  "success": true,
  "data": {
    "gateway": {
      "status": "healthy",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "uptime": 3600000,
      "services": [...],
      "version": "1.0.0"
    },
    "database": {
      "service": "database",
      "status": "healthy",
      "lastCheck": "2024-01-01T12:00:00.000Z"
    },
    "external": [
      {
        "service": "telegram-api",
        "status": "healthy",
        "lastCheck": "2024-01-01T12:00:00.000Z"
      }
    ],
    "metrics": {
      "uptime": 3600000,
      "memory": {
        "rss": 50000000,
        "heapTotal": 20000000,
        "heapUsed": 15000000,
        "external": 1000000
      },
      "services": [...],
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### GET /api/health/metrics
Получить метрики системы

**Response:**
```json
{
  "success": true,
  "data": {
    "uptime": 3600000,
    "memory": {
      "rss": 50000000,
      "heapTotal": 20000000,
      "heapUsed": 15000000,
      "external": 1000000
    },
    "services": [...],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /api/health/ready
Проверка готовности к работе (для Kubernetes readiness probe)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /api/health/live
Проверка жизнеспособности (для Kubernetes liveness probe)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "alive",
    "uptime": 3600000,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🔌 WebSocket Events

### Подключение
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### События

#### `connect`
Подключение к WebSocket

#### `disconnect`
Отключение от WebSocket

#### `auth:success`
Успешная авторизация

#### `auth:error`
Ошибка авторизации

#### `ozon:store_updated`
Обновление магазина

#### `ozon:operation_completed`
Завершение операции

#### `ai:response`
Ответ от AI сервиса

#### `system:health_update`
Обновление статуса системы

## 🛡️ Безопасность

### Rate Limiting
- **Общие запросы:** 100 запросов в 15 минут
- **Авторизация:** 5 попыток в 15 минут

### CORS
- Разрешены запросы с `http://localhost:5173`
- Поддержка credentials

### JWT Токены
- Секретный ключ из `JWT_SECRET`
- Время жизни: 30 дней (настраивается)
- Автоматическое обновление при истечении

## 📊 Мониторинг

### Логирование
- Уровни: ERROR, WARN, INFO, DEBUG
- Формат: JSON с timestamp
- Контекст: userId, requestId, service

### Метрики
- Время ответа
- Количество запросов
- Ошибки по сервисам
- Использование памяти

### Health Checks
- Проверка доступности микросервисов
- Мониторинг внешних API
- Проверка базы данных

## 🚀 Развертывание

### Development
```bash
cd backend/main
npm install
npm run dev
```

### Production
```bash
cd backend/main
npm install
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Частые проблемы

1. **Ошибка 401 Unauthorized**
   - Проверьте JWT токен в заголовке Authorization
   - Убедитесь что токен не истек

2. **Ошибка 503 Service Unavailable**
   - Проверьте доступность микросервисов
   - Убедитесь что Ozon Manager запущен на порту 4200

3. **Ошибка 429 Too Many Requests**
   - Превышен лимит запросов
   - Подождите 15 минут или увеличьте лимиты

4. **CORS ошибки**
   - Проверьте настройки CORS_ORIGIN
   - Убедитесь что frontend запущен на правильном порту

### Логи
```bash
# Просмотр логов
tail -f logs/api_gateway.log

# Фильтрация по уровню
grep "ERROR" logs/api_gateway.log

# Поиск по пользователю
grep "userId:123456789" logs/api_gateway.log
```
