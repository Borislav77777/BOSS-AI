# Boss AI Analytics Service

Модуль аналитики и отчетов для платформы Boss AI - микросервис для сбора, обработки и анализа всех пользовательских действий, метрик производительности и использования сервисов.

## 🚀 Основные возможности

- ✅ Трекинг всех действий пользователей (клики, навигация, события)
- ✅ Сбор метрик производительности (время загрузки, API ответы)
- ✅ Мониторинг использования сервисов с биллингом
- ✅ Управление сессиями пользователей
- ✅ Real-time обновления через WebSocket
- ✅ Агрегация метрик для быстрого доступа
- ✅ Экспорт данных в JSON/CSV
- ✅ Речевая аналитика (152 ФЗ) - в разработке
- ✅ Admin дашборд для контроля

## 📁 Структура проекта

```
backend/analytics-service/
├── src/
│   ├── index.ts                    # Главный файл сервера
│   ├── routes/
│   │   ├── analytics.routes.ts     # API endpoints аналитики
│   │   └── health.routes.ts        # Health check
│   ├── services/
│   │   └── collector.service.ts    # Сбор данных
│   ├── database/
│   │   ├── migrations.ts           # Миграции таблиц
│   │   └── repositories/
│   │       ├── events.repo.ts      # События пользователей
│   │       ├── sessions.repo.ts    # Сессии
│   │       └── metrics.repo.ts     # Метрики
│   ├── middleware/
│   │   └── auth.middleware.ts      # Аутентификация
│   ├── types/
│   │   └── analytics.types.ts      # TypeScript типы
│   └── utils/
│       └── logger.ts               # Логирование
├── package.json
├── tsconfig.json
└── env.example
```

## 🛠 Технологии

- **Node.js 18+** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизация
- **SQLite** (WAL mode) - база данных
- **Socket.IO** - WebSocket для real-time
- **Winston** - логирование
- **JWT** - аутентификация

## 📦 Установка

### 1. Установка зависимостей

```bash
cd backend/analytics-service
npm install
```

### 2. Настройка переменных окружения

Скопируйте `env.example` в `.env` и настройте:

```env
NODE_ENV=development
PORT=4400
DB_PATH=./data/boss_ai.db
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### 3. Сборка

```bash
npm run build
```

## 🚀 Запуск

### Режим разработки

```bash
npm run dev
```

### Production

```bash
npm start
```

## 📡 API Endpoints

### Трекинг

#### POST /api/analytics/track
Трекинг события пользователя

```json
{
  "userId": "string",
  "eventType": "click|navigation|api_call|service_use",
  "eventCategory": "ui|api|service|billing",
  "eventAction": "string",
  "eventLabel": "string (optional)",
  "eventValue": number (optional),
  "serviceName": "string (optional)",
  "sessionId": "string (optional)",
  "metadata": {} (optional)
}
```

#### POST /api/analytics/performance
Трекинг метрики производительности

```json
{
  "userId": "string (optional)",
  "metricType": "page_load|api_response|render_time",
  "metricName": "string",
  "value": number,
  "unit": "ms|seconds|bytes",
  "pageUrl": "string (optional)",
  "serviceName": "string (optional)"
}
```

#### POST /api/analytics/service-usage
Трекинг использования сервиса

```json
{
  "userId": "string",
  "serviceName": "string",
  "action": "string",
  "success": boolean,
  "durationMs": number,
  "costBt": number (optional),
  "costRub": number (optional),
  "errorMessage": "string (optional)"
}
```

#### POST /api/analytics/session/start
Начало сессии пользователя

```json
{
  "sessionId": "string",
  "userId": "string",
  "ipAddress": "string",
  "userAgent": "string"
}
```

#### POST /api/analytics/session/end
Завершение сессии

```json
{
  "sessionId": "string"
}
```

### Данные и отчеты

#### GET /api/analytics/dashboard
Получение данных для дашборда

Query params:
- `startDate` (optional) - unix timestamp
- `endDate` (optional) - unix timestamp

#### GET /api/analytics/users/:userId
Аналитика конкретного пользователя

#### GET /api/analytics/services/:serviceName
Аналитика конкретного сервиса

#### GET /api/analytics/metrics
Агрегированные метрики

Query params:
- `startDate` (optional)
- `endDate` (optional)
- `userId` (optional)
- `serviceName` (optional)

#### GET /api/analytics/export
Экспорт данных

Query params:
- `format` - json|csv
- `startDate` (optional)
- `endDate` (optional)
- `userId` (optional)
- `serviceName` (optional)

### Health Check

#### GET /api/analytics/health
Проверка работоспособности сервиса

## 🔌 WebSocket События

### Подключение

```javascript
const socket = io('http://localhost:4400');

// Подписка на аналитику пользователя
socket.emit('subscribe-analytics', { userId: 'user123' });

// Получение обновлений
socket.on('analytics-update', (data) => {
  console.log('Analytics update:', data);
});

// Отписка
socket.emit('unsubscribe-analytics', { userId: 'user123' });
```

### События

- `analytics-update` - real-time обновление данных
- `connect` - успешное подключение
- `disconnect` - отключение

## 💾 База данных

### Таблицы

- `user_events` - все события пользователей
- `user_sessions` - сессии пользователей
- `performance_metrics` - метрики производительности
- `service_usage` - использование сервисов
- `aggregated_metrics` - агрегированные метрики
- `speech_analytics` - речевая аналитика (152 ФЗ)

### Миграции

Миграции запускаются автоматически при первом старте сервиса.

Для ручного запуска:

```typescript
import { runAnalyticsMigrations } from './database/migrations';
runAnalyticsMigrations('./data/boss_ai.db');
```

## 🔒 Безопасность

- JWT аутентификация для всех endpoints
- CORS настроен для защиты от XSS
- Helmet для HTTP заголовков безопасности
- Валидация входных данных
- Rate limiting (планируется)

## 📊 Мониторинг

### Логи

Логи записываются в:
- `logs/analytics.log` - все логи
- `logs/analytics-error.log` - только ошибки

### Метрики

Доступны через endpoint `/api/analytics/metrics`

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# Integration тесты
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Деплой

### PM2

```bash
pm2 start dist/index.js --name analytics-service
```

### Docker (планируется)

```bash
docker build -t boss-ai-analytics .
docker run -p 4400:4400 boss-ai-analytics
```

## 📝 Changelog

### v1.0.0 (2025-01-27)

- ✅ Базовый функционал трекинга событий
- ✅ Управление сессиями
- ✅ Метрики производительности
- ✅ WebSocket real-time обновления
- ✅ API endpoints для дашборда
- ✅ Экспорт данных

### Планируется

- 🔄 Речевая аналитика (152 ФЗ)
- 🔄 CSV экспорт
- 🔄 Rate limiting
- 🔄 Docker образ
- 🔄 Grafana интеграция

## 👥 Команда

BARSUKOV OS Team

## 📄 Лицензия

MIT License

