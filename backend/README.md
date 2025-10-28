# Boss AI Platform - Backend

## 🏗 Архитектура Backend

Backend построен по модульной микросервисной архитектуре с четким разделением ответственности.

## 📁 Структура

```
backend/
├── main/                    # Главный API сервер
│   ├── src/                 # Исходники главного сервера
│   ├── dist/                # Скомпилированный код
│   ├── package.json         # Зависимости главного сервера
│   └── tsconfig.json        # Конфигурация TypeScript
├── ozon-manager/            # Ozon Manager сервис
│   ├── src/                 # Исходники Ozon Manager
│   ├── dist/               # Скомпилированный код
│   ├── data/                # База данных Ozon Manager
│   ├── logs/                # Логи Ozon Manager
│   ├── package.json         # Зависимости Ozon Manager
│   └── tsconfig.json        # Конфигурация TypeScript
├── ai-services/             # AI сервисы (будущее)
│   ├── chatgpt/             # ChatGPT интеграция
│   ├── claude/              # Claude интеграция
│   └── gemini/              # Gemini интеграция
├── shared/                  # Общие утилиты и модули
│   ├── types/               # Общие типы TypeScript
│   ├── utils/               # Утилиты (logger, database, etc.)
│   └── middleware/          # Общие middleware
└── README.md                # Этот файл
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

**Главный сервер:**

```bash
cd backend/main
npm install
```

**Ozon Manager:**

```bash
cd backend/ozon-manager
npm install
```

### 2. Настройка переменных окружения

**Главный сервер (.env):**

```env
NODE_ENV=development
PORT=3000
DB_PATH=./data/boss_ai.db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

**Ozon Manager (.env):**

```env
NODE_ENV=development
PORT=4200
DB_PATH=./data/ozon_manager.db
TELEGRAM_BOT_TOKEN=your_bot_token_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Запуск в режиме разработки

**Главный сервер (терминал 1):**

```bash
cd backend/main
npm run dev
# Сервер запустится на http://localhost:3000
```

**Ozon Manager (терминал 2):**

```bash
cd backend/ozon-manager
npm run dev
# Сервер запустится на http://localhost:4200
```

## 🔧 Конфигурация

### Главный API сервер

Основные функции:

- ✅ Маршрутизация запросов к микросервисам
- ✅ WebSocket соединения
- ✅ Аутентификация и авторизация
- ✅ Rate limiting и безопасность
- ✅ Мониторинг и health checks

### Ozon Manager сервис

Основные функции:

- ✅ Telegram авторизация
- ✅ Управление Ozon магазинами
- ✅ API для работы с Ozon
- ✅ Планировщик задач
- ✅ Логирование и мониторинг

### AI Services (планируется)

Будущие сервисы:

- 🔄 ChatGPT интеграция
- 🔄 Claude интеграция
- 🔄 Gemini интеграция
- 🔄 Кастомные AI модели

## 📡 API Endpoints

### API Gateway (порт 3000)

```
GET  /                    # Информация о сервере
GET  /api/health          # Health check
POST /api/auth/telegram/login  # Telegram авторизация
GET  /api/auth/me         # Информация о пользователе
POST /api/ozon/*          # Прокси к Ozon Manager
POST /api/ai/*            # Прокси к AI Services
```

### Ozon Manager (порт 4200) - через API Gateway

```
GET  /api/ozon/stores           # Список магазинов
POST /api/ozon/stores           # Создание магазина
PUT  /api/ozon/stores/:name      # Обновление магазина
DELETE /api/ozon/stores/:name    # Удаление магазина
POST /api/ozon/promotions/remove # Удаление из акций
POST /api/ozon/archive/unarchive # Разархивация
GET  /api/ozon/logs             # Логи
GET  /api/ozon/scheduler/status  # Статус планировщика
```

## 🔌 WebSocket Events

### Подключение

```javascript
const socket = io('http://localhost:3000');

// Подписка на Ozon Manager события
socket.emit('subscribe-ozon', { userId: 'user123' });

// Подписка на AI события
socket.emit('subscribe-ai', { userId: 'user123' });
```

### События

- `ozon-update` - обновления от Ozon Manager
- `ai-response` - ответы от AI сервисов
- `notification` - системные уведомления

## 🛡 Безопасность

### Реализованные меры

- ✅ Helmet для HTTP заголовков
- ✅ CORS настройки
- ✅ Rate limiting
- ✅ JWT токены
- ✅ Валидация входных данных
- ✅ SQL injection защита

### Рекомендации

- Используйте HTTPS в production
- Регулярно обновляйте зависимости
- Мониторьте логи на подозрительную активность
- Настройте firewall

## 📊 Мониторинг

### Логи

- Главный сервер: `backend/main/logs/`
- Ozon Manager: `backend/ozon-manager/logs/`
- Общие логи: `backend/shared/logs/`

### Метрики

- CPU, память, диск
- Количество запросов
- Время ответа API
- Ошибки и исключения

## 🧪 Тестирование

### Unit тесты

```bash
cd backend/main
npm run test

cd backend/ozon-manager
npm run test
```

### Integration тесты

```bash
npm run test:integration
```

### E2E тесты

```bash
npm run test:e2e
```

## 🚀 Деплой

### Production сборка

```bash
# Главный сервер
cd backend/main
npm run build

# Ozon Manager
cd backend/ozon-manager
npm run build
```

### PM2 конфигурация

```bash
# Запуск всех сервисов
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit

# Логи
pm2 logs
```

## 🔄 Разработка

### Добавление нового сервиса

1. Создайте папку в `backend/your-service/`
2. Скопируйте структуру из `ozon-manager/`
3. Обновите `backend/main/src/index.ts`
4. Добавьте роуты в `backend/main/src/routes/`
5. Обновите документацию

### Общие утилиты

Используйте модули из `backend/shared/`:

- `@shared/types` - общие типы
- `@shared/utils/logger` - логирование
- `@shared/utils/database` - работа с БД

## 📚 Документация

- [API документация](docs/API.md)
- [WebSocket события](docs/WEBSOCKET.md)
- [Безопасность](docs/SECURITY.md)
- [Мониторинг](docs/MONITORING.md)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи сервисов
2. Проверьте статус PM2: `pm2 status`
3. Проверьте подключение к базе данных
4. Проверьте переменные окружения

---

**Boss AI Platform Backend** - Модульная микросервисная архитектура! 🚀
