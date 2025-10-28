# 🔌 API Examples - Boss AI Platform

**Для разработчика Николая**
**Дата:** 21 октября 2025
**Версия:** API Examples v1.0

---

## 📋 Содержание

1. [Аутентификация](#аутентификация)
2. [AI Сервисы (GPT)](#ai-сервисы-gpt)
3. [Биллинг](#биллинг)
4. [Ozon Manager](#ozon-manager)
5. [Katya Service (планируемый)](#katya-service-планируемый)
6. [Response форматы](#response-форматы)
7. [Error handling](#error-handling)

---

## 🔐 Аутентификация

### Telegram Login Widget

**Endpoint:** `POST /api/auth/telegram`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "first_name": "Николай",
    "username": "nikolay_dev",
    "photo_url": "https://t.me/i/userpic/320/abc123.jpg",
    "auth_date": 1729500000,
    "hash": "abc123def456..."
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "telegram_id": 123456789,
      "username": "nikolay_dev",
      "first_name": "Николай",
      "last_name": null,
      "photo_url": "https://t.me/i/userpic/320/abc123.jpg",
      "auth_date": 1729500000,
      "agreed_to_terms": true,
      "created_at": "2025-10-21T10:00:00Z",
      "last_login": "2025-10-21T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid Telegram hash",
  "message": "Неверная подпись Telegram Login Widget"
}
```

### Проверка токена

**Endpoint:** `GET /api/auth/me`

**Request:**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "nikolay_dev",
    "first_name": "Николай",
    "last_login": "2025-10-21T10:00:00Z"
  }
}
```

---

## 🤖 AI Сервисы (GPT)

### ChatGPT запрос

**Endpoint:** `POST /api/ai/chatgpt`

**Request:**

```bash
curl -X POST http://localhost:3000/api/ai/chatgpt \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Объясни принципы микросервисной архитектуры",
    "options": {
      "model": "gpt-4o-mini",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "choices": [
      {
        "message": {
          "content": "Микросервисная архитектура - это подход к разработке приложений, где приложение разбивается на множество небольших, независимых сервисов...",
          "role": "assistant"
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 15,
      "completion_tokens": 150,
      "total_tokens": 165
    },
    "model": "gpt-4o-mini"
  }
}
```

**Response (Insufficient funds):**

```json
{
  "success": false,
  "error": "Insufficient funds",
  "message": "Недостаточно средств. Пополните баланс BT токенов.",
  "data": {
    "balance_bt": 0.1,
    "required_bt": 0.5,
    "balance_rub": 1.0
  }
}
```

### Claude запрос

**Endpoint:** `POST /api/ai/claude`

**Request:**

```bash
curl -X POST http://localhost:3000/api/ai/claude \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Напиши код на TypeScript для работы с SQLite",
    "options": {
      "model": "claude-3-5-sonnet-20241022",
      "temperature": 0.3,
      "max_tokens": 1000
    }
  }'
```

### Gemini запрос

**Endpoint:** `POST /api/ai/gemini`

**Request:**

```bash
curl -X POST http://localhost:3000/api/ai/gemini \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Создай диаграмму архитектуры системы",
    "options": {
      "model": "gemini-1.5-pro",
      "temperature": 0.5
    }
  }'
```

---

## 💰 Биллинг

### Получить баланс пользователя

**Endpoint:** `GET /api/billing/balance`

**Request:**

```bash
curl -X GET http://localhost:3000/api/billing/balance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "balance_rub": 100.0,
    "balance_bt": 10.0,
    "currency": "RUB",
    "bt_rate": 10.0,
    "last_updated": "2025-10-21T10:00:00Z"
  }
}
```

### Пополнить баланс (Admin)

**Endpoint:** `POST /api/billing/deposit`

**Request:**

```bash
curl -X POST http://localhost:3000/api/billing/deposit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 50.0,
    "currency": "RUB",
    "description": "Пополнение баланса для разработки"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transaction_id": 123,
    "new_balance_rub": 150.0,
    "new_balance_bt": 15.0,
    "amount": 50.0,
    "currency": "RUB"
  }
}
```

### История транзакций

**Endpoint:** `GET /api/billing/transactions`

**Request:**

```bash
curl -X GET "http://localhost:3000/api/billing/transactions?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 123,
        "service_name": "chatgpt_request",
        "amount": -0.5,
        "currency": "BT",
        "transaction_type": "charge",
        "description": "GPT-4 запрос",
        "created_at": "2025-10-21T10:00:00Z"
      },
      {
        "id": 122,
        "service_name": "deposit",
        "amount": 50.0,
        "currency": "RUB",
        "transaction_type": "deposit",
        "description": "Пополнение баланса",
        "created_at": "2025-10-21T09:30:00Z"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

### Тарифы сервисов

**Endpoint:** `GET /api/billing/pricing`

**Request:**

```bash
curl -X GET http://localhost:3000/api/billing/pricing \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "services": [
      {
        "service_name": "chatgpt_request",
        "unit_type": "request",
        "price_per_unit": 0.5,
        "currency": "BT",
        "is_active": true
      },
      {
        "service_name": "claude_request",
        "unit_type": "request",
        "price_per_unit": 0.3,
        "currency": "BT",
        "is_active": true
      },
      {
        "service_name": "gemini_request",
        "unit_type": "request",
        "price_per_unit": 0.2,
        "currency": "BT",
        "is_active": true
      }
    ]
  }
}
```

---

## 🛒 Ozon Manager

### Health check

**Endpoint:** `GET /api/ozon/health`

**Request:**

```bash
curl -X GET http://localhost:3000/api/ozon/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "ozon-manager",
    "version": "1.0.0",
    "uptime": 3600
  }
}
```

### Получить продукты

**Endpoint:** `GET /api/ozon/products`

**Request:**

```bash
curl -X GET "http://localhost:3000/api/ozon/products?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "12345",
        "name": "Тестовый товар",
        "price": 1000.0,
        "currency": "RUB",
        "status": "active",
        "created_at": "2025-10-21T10:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### Создать продукт

**Endpoint:** `POST /api/ozon/products`

**Request:**

```bash
curl -X POST http://localhost:3000/api/ozon/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый товар",
    "price": 2000.0,
    "currency": "RUB",
    "description": "Описание товара"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "67890",
    "name": "Новый товар",
    "price": 2000.0,
    "currency": "RUB",
    "status": "active",
    "created_at": "2025-10-21T10:30:00Z"
  }
}
```

---

## 🧠 Katya Service (УЖЕ РЕАЛИЗОВАН!)

### Список чатов пользователя

**Endpoint:** `GET /api/katya-chats`

**Request:**

```bash
curl -X GET https://boss-ai.online/api/katya-chats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "telegram_chat_id": "-1001234567890",
        "chat_name": "Команда Boss AI",
        "chat_type": "supergroup",
        "is_active": true,
        "message_count": 150,
        "last_activity": "2025-10-21T10:30:00.000Z",
        "created_at": "2025-10-20T15:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### Детали конкретного чата

**Endpoint:** `GET /api/katya-chats/:chatId`

**Request:**

```bash
curl -X GET https://boss-ai.online/api/katya-chats/-1001234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "telegram_chat_id": "-1001234567890",
    "chat_name": "Команда Boss AI",
    "chat_type": "supergroup",
    "is_active": true,
    "message_count": 150,
    "katya_mentions": 25,
    "last_activity": "2025-10-21T10:30:00.000Z",
    "first_message": "2025-10-20T15:00:00.000Z",
    "created_at": "2025-10-20T15:00:00.000Z"
  }
}
```

### История сообщений чата

**Endpoint:** `GET /api/katya-chats/:chatId/messages`

**Request:**

```bash
curl -X GET "https://boss-ai.online/api/katya-chats/-1001234567890/messages?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "message_id": 12345,
        "telegram_user_id": 987654321,
        "username": "boss",
        "first_name": "Борислав",
        "text": "Привет команда! Как дела с проектом?",
        "is_katya_mention": false,
        "created_at": "2025-10-21T10:30:00.000Z"
      },
      {
        "id": 2,
        "message_id": 12346,
        "telegram_user_id": 987654321,
        "username": "boss",
        "first_name": "Борислав",
        "text": "@Катя, можешь суммаризировать наш вчерашний разговор?",
        "is_katya_mention": true,
        "created_at": "2025-10-21T10:31:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### Статистика чата

**Endpoint:** `GET /api/katya-chats/:chatId/stats`

**Request:**

```bash
curl -X GET https://boss-ai.online/api/katya-chats/-1001234567890/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_messages": 150,
    "katya_mentions": 25,
    "unique_users": 8,
    "first_message_at": "2025-10-20T15:00:00.000Z",
    "last_message_at": "2025-10-21T10:30:00.000Z",
    "top_users": [
      {
        "telegram_user_id": 987654321,
        "username": "boss",
        "first_name": "Борислав",
        "message_count": 45
      },
      {
        "telegram_user_id": 123456789,
        "username": "nikolay_dev",
        "first_name": "Николай",
        "message_count": 32
      }
    ]
  }
}
```

### Суммаризация чата через AI

**Endpoint:** `POST /api/katya-chats/:chatId/summarize`

**Request:**

```bash
curl -X POST https://boss-ai.online/api/katya-chats/-1001234567890/summarize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_count": 50,
    "query": "Основные решения по проекту"
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "summary": "За последние 50 сообщений команда обсудила архитектуру проекта, приняла решение использовать SQLite вместо PostgreSQL для MVP, и назначила Николая ответственным за разработку Telegram бота Катя.",
    "topics": ["архитектура", "база данных", "MVP", "Telegram бот"],
    "decisions": [
      {
        "decision": "Использовать SQLite вместо PostgreSQL для MVP"
      },
      {
        "decision": "Назначить Николая разработчиком бота Катя"
      }
    ],
    "keywords": ["архитектура", "SQLite", "PostgreSQL", "MVP", "Telegram"],
    "message_count": 50,
    "cost_bt": 0.5
  }
}
```

**Response (Insufficient funds):**

```json
{
  "success": false,
  "error": "Insufficient funds",
  "message": "Недостаточно средств. Пополните баланс BT токенов.",
  "data": {
    "balance_bt": 0.2,
    "required_bt": 0.5
  }
}
```

### Health check

**Endpoint:** `GET /api/katya/health`

**Request:**

```bash
curl -X GET http://localhost:3000/api/katya/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "katya-ai",
    "version": "1.0.0",
    "uptime": 1800,
    "telegram_bot": "active",
    "database": "connected"
  }
}
```

### Суммаризация чата

**Endpoint:** `POST /api/katya/summarize`

**Request:**

```bash
curl -X POST http://localhost:3000/api/katya/summarize \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_chat_id": -1001234567890,
    "message_count": 50,
    "query": "Обсуждение новой фичи"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": "Команда обсуждала новую фичу для платформы. Было принято решение использовать микросервисную архитектуру...",
    "topics": ["архитектура", "микросервисы", "разработка"],
    "decisions": [
      {
        "decision": "Использовать микросервисную архитектуру",
        "decided_by": "@nikolay_dev",
        "decided_at": "2025-10-21T10:00:00Z"
      }
    ],
    "keywords": ["архитектура", "микросервисы", "API", "база данных"],
    "message_count": 45,
    "duration_ms": 2500
  }
}
```

### Поиск в истории

**Endpoint:** `POST /api/katya/search`

**Request:**

```bash
curl -X POST http://localhost:3000/api/katya/search \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_chat_id": -1001234567890,
    "query": "архитектура базы данных",
    "limit": 10
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "message_id": 123,
        "text": "Решили использовать SQLite с WAL mode для лучшей производительности",
        "username": "nikolay_dev",
        "created_at": "2025-10-21T09:30:00Z",
        "relevance_score": 0.95
      },
      {
        "message_id": 124,
        "text": "PostgreSQL будет слишком сложно для MVP",
        "username": "boss",
        "created_at": "2025-10-21T09:25:00Z",
        "relevance_score": 0.87
      }
    ],
    "total": 2,
    "query": "архитектура базы данных",
    "duration_ms": 150
  }
}
```

### Вопрос к контексту

**Endpoint:** `POST /api/katya/question`

**Request:**

```bash
curl -X POST http://localhost:3000/api/katya/question \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_chat_id": -1001234567890,
    "question": "Почему мы выбрали SQLite вместо PostgreSQL?",
    "context_window": 50
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "answer": "Команда выбрала SQLite вместо PostgreSQL по следующим причинам:\n1. Простота развертывания - не нужен отдельный сервер БД\n2. WAL mode обеспечивает хорошую производительность для MVP\n3. Меньше сложности в настройке и поддержке\n4. Достаточно для текущих нагрузок\n\nРешение было принято @boss 21.10.2025 в 09:25.",
    "sources": [
      {
        "message_id": 124,
        "text": "PostgreSQL будет слишком сложно для MVP",
        "username": "boss",
        "created_at": "2025-10-21T09:25:00Z"
      }
    ],
    "confidence": 0.92,
    "duration_ms": 3200
  }
}
```

### Список решений

**Endpoint:** `GET /api/katya/decisions`

**Request:**

```bash
curl -X GET "http://localhost:3000/api/katya/decisions?telegram_chat_id=-1001234567890&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "decisions": [
      {
        "id": 1,
        "topic": "Выбор базы данных",
        "decision": "Использовать SQLite с WAL mode",
        "decided_by": "boss",
        "decided_at": "2025-10-21T09:25:00Z",
        "context": "Обсуждение архитектуры платформы",
        "alternatives": ["PostgreSQL", "MySQL"]
      },
      {
        "id": 2,
        "topic": "Аутентификация",
        "decision": "Telegram Login Widget",
        "decided_by": "nikolay_dev",
        "decided_at": "2025-10-21T08:15:00Z",
        "context": "Выбор способа авторизации пользователей",
        "alternatives": ["OAuth", "Custom auth"]
      }
    ],
    "total": 2,
    "limit": 10
  }
}
```

### Настройки пользователя

**Endpoint:** `GET /api/katya/settings`

**Request:**

```bash
curl -X GET http://localhost:3000/api/katya/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "success": true,
  "data": {
    "telegram_enabled": true,
    "platform_chat_enabled": false,
    "auto_summarize": false,
    "auto_summarize_threshold": 100,
    "context_window": 50,
    "ai_model": "gpt-4o-mini",
    "updated_at": "2025-10-21T10:00:00Z"
  }
}
```

**Endpoint:** `PUT /api/katya/settings`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/katya/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "auto_summarize": true,
    "auto_summarize_threshold": 50,
    "context_window": 100,
    "ai_model": "gpt-5-nano"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "telegram_enabled": true,
    "platform_chat_enabled": false,
    "auto_summarize": true,
    "auto_summarize_threshold": 50,
    "context_window": 100,
    "ai_model": "gpt-5-nano",
    "updated_at": "2025-10-21T10:30:00Z"
  }
}
```

---

## 📊 Response форматы

### Стандартный успешный ответ

```json
{
  "success": true,
  "data": {
    // Данные ответа
  },
  "timestamp": "2025-10-21T10:00:00Z",
  "request_id": "req_abc123"
}
```

### Стандартный ответ с ошибкой

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable error message",
  "details": {
    // Дополнительные детали ошибки
  },
  "timestamp": "2025-10-21T10:00:00Z",
  "request_id": "req_abc123"
}
```

### Пагинация

```json
{
  "success": true,
  "data": {
    "items": [
      // Массив элементов
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

## ❌ Error handling

### HTTP статус коды

- **200** - Успешный запрос
- **201** - Ресурс создан
- **400** - Неверный запрос (validation error)
- **401** - Не авторизован (invalid/missing token)
- **402** - Недостаточно средств (insufficient funds)
- **403** - Доступ запрещен (forbidden)
- **404** - Ресурс не найден
- **409** - Конфликт (duplicate resource)
- **422** - Ошибка валидации данных
- **429** - Слишком много запросов (rate limit)
- **500** - Внутренняя ошибка сервера
- **502** - Ошибка микросервиса
- **503** - Сервис недоступен

### Примеры ошибок

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Токен недействителен или истек",
  "code": "INVALID_TOKEN"
}
```

#### 402 Insufficient funds

```json
{
  "success": false,
  "error": "Insufficient funds",
  "message": "Недостаточно средств. Пополните баланс BT токенов.",
  "data": {
    "balance_bt": 0.1,
    "required_bt": 0.5,
    "balance_rub": 1.0
  }
}
```

#### 400 Validation error

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Неверные данные запроса",
  "details": {
    "field": "prompt",
    "error": "Поле обязательно для заполнения"
  }
}
```

#### 429 Rate limit

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Слишком много запросов. Попробуйте позже.",
  "data": {
    "retry_after": 60,
    "limit": 100,
    "remaining": 0
  }
}
```

#### 502 Service unavailable

```json
{
  "success": false,
  "error": "Service unavailable",
  "message": "Микросервис временно недоступен",
  "data": {
    "service": "katya-ai",
    "status": "down"
  }
}
```

---

## 🧪 Тестирование API

### Health checks

```bash
# API Gateway
curl http://localhost:3000/api/health

# Ozon Manager
curl http://localhost:3000/api/ozon/health

# Katya Service (после создания)
curl http://localhost:3000/api/katya/health
```

### Тестовый пользователь

```bash
# 1. Получить токен через Telegram Login Widget
# 2. Сохранить токен в переменную
export USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Тестировать API
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3000/api/billing/balance
```

### Load testing

```bash
# Тест нагрузки на AI endpoint
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/ai/chatgpt \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Test message '$i'", "options": {"model": "gpt-4o-mini"}}' &
done
wait
```

---

## 📚 Дополнительные ресурсы

- `DEVELOPER_SETUP.md` - Полная инструкция по установке
- `KATYA_INTEGRATION_GUIDE.md` - Детальное руководство по интеграции
- `KATYA_BOT_TZ_v5_FINAL.md` - Техническое задание для Кати
- `QUICK_START_DEV.sh` - Автоматический скрипт установки

---

**Удачи в разработке! 🚀**
