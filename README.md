# Boss AI Platform

## 🚀 Описание

Boss AI Platform (BARSUKOV OS) - это революционная орбитальная система навигации с AI-агентами, построенная на философии "Head Cutter". Платформа представляет собой операционную систему для бизнеса будущего, где эффективность и технологии определяют успех.

### 🎯 Ключевые особенности

- **Орбитальная навигация** - уникальная система с двумя уровнями агентов
- **Эффект парения** - иконки "парят" в воздухе с технологичным дизайном
- **100 слоганов BOSS AI** - мотивационная система с автоматической сменой
- **Философия Head Cutter** - эффективность без компромиссов
- **Двухуровневая архитектура** - основные агенты + подсервисы
- **Система биллинга** - Boss Tokens (BT) за каждую операцию

## 📁 Структура проекта

```
boss-ai/
├── frontend/                      # React + TypeScript веб-приложение (BARSUKOV OS)
│   ├── src/                       # Исходники React
│   │   ├── components/            # React компоненты
│   │   │   ├── Chat/              # Компоненты чата
│   │   │   ├── Settings/          # Компоненты настроек
│   │   │   ├── Services/          # Сервисы платформы
│   │   │   └── Auth/              # Компоненты авторизации
│   │   ├── services/              # Сервисы и API клиенты
│   │   ├── types/                 # TypeScript типы
│   │   └── context/               # React контексты
│   ├── public/                    # Статические файлы
│   │   └── services/              # Конфигурации сервисов
│   ├── dist/                      # Собранное приложение
│   ├── package.json               # Зависимости frontend
│   └── vite.config.ts             # Конфигурация Vite
├── backend/                       # Node.js + TypeScript API серверы
│   ├── main/                      # API Gateway (порт 3001) - единая точка входа
│   ├── ozon-manager/              # Ozon Manager микросервис (порт 4200)
│   ├── katya-service/             # Katya AI Service (порт 4300)
│   ├── analytics-service/         # Analytics Service (порт 4400)
│   ├── shared/                    # Общие утилиты и модули
│   └── README.md                  # Документация backend
├── ozon-desktop/                  # Python desktop приложение (архив)
│   ├── main.py                    # GUI приложение
│   ├── api_client.py              # Ozon API клиент
│   ├── requirements.txt           # Python зависимости
│   └── README.md                  # Документация desktop приложения
├── deploy/                        # Скрипты и конфигурации деплоя
│   ├── nginx.conf                 # Конфигурация Nginx
│   ├── ecosystem.config.js        # Конфигурация PM2
│   ├── deploy.sh                  # Скрипт развертывания
│   └── README.md                  # Инструкции по деплою
└── README.md                      # Этот файл
```

## 🛠 Технологии

### Frontend

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Tailwind CSS** - стилизация
- **Framer Motion** - анимации
- **Context API** - управление состоянием

### Backend (Микросервисная архитектура)

- **Node.js 18+** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизация
- **SQLite** (WAL mode) - база данных
- **JWT** (HS256, 15d exp) - аутентификация
- **Telegram Bot API** - интеграция с Telegram (webhook + HMAC validation)
- **WebSocket (Socket.IO)** - реальное время
- **Helmet + CSP** - безопасность
- **GPT-5 nano** - быстрая и экономичная AI суммаризация

### DevOps

- **PM2** - управление процессами + logrotate
- **Nginx** - веб-сервер (CSP, HSTS, WebSocket proxy)
- **Let's Encrypt** - SSL сертификаты
- **Cron** - автоматические бэкапы SQLite

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или yarn
- Git

### Установка и запуск

#### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd BossAIPABOTA
```

#### 2. Установка зависимостей

**Frontend:**

```bash
cd frontend
npm install
```

**Backend - Главный сервер:**

```bash
cd backend/main
npm install
```

**Backend - Ozon Manager:**

```bash
cd backend/ozon-manager
npm install
```

#### 3. Настройка переменных окружения

**Frontend (.env):**

```bash
cd frontend
cp .env.example .env
# Отредактируйте .env файл
```

**Backend - Главный сервер (.env):**

```bash
cd backend/main
cp .env.example .env
# Отредактируйте .env файл
```

**Backend - Ozon Manager (.env):**

```bash
cd backend/ozon-manager
cp env.example .env
# Отредактируйте .env файл
```

#### 4. Запуск в режиме разработки

**Backend - API Gateway (терминал 1):**

```bash
cd backend/main
npm run dev
# Сервер запустится на http://localhost:3001
```

**Backend - Ozon Manager (терминал 2):**

```bash
cd backend/ozon-manager
npm run dev
# Сервер запустится на http://localhost:4200
```

**Backend - Katya AI Service (терминал 3):**

```bash
cd backend/katya-service
npm run dev
# Сервер запустится на http://localhost:4300
```

**Frontend (терминал 4):**

```bash
cd frontend
npm run dev
# Приложение запустится на http://localhost:5173
```

## 🔧 Конфигурация

### Frontend конфигурация

Основные переменные окружения в `frontend/.env`:

```env
# API
VITE_API_BASE_URL=http://localhost:3000
VITE_OZON_API_URL=http://localhost:4200
VITE_API_TIMEOUT=30000

# Режим разработки
VITE_NODE_ENV=development
VITE_DEBUG=true
```

### Backend конфигурация

**API Gateway (`backend/main/.env`):**

```env
NODE_ENV=development
PORT=3001
DB_PATH=./data/boss_ai.db
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
OZON_MANAGER_URL=http://localhost:4200
KATYA_SERVICE_URL=http://localhost:4300
```

**Ozon Manager (`backend/ozon-manager/.env`):**

```env
NODE_ENV=development
PORT=4200
DB_PATH=./data/ozon_manager.db
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
```

**Katya AI Service (`backend/katya-service/.env`):**

```env
NODE_ENV=development
PORT=4300
DB_PATH=./data/boss_ai.db
OPENAI_API_KEY=your_openai_api_key_here
TELEGRAM_BOT_TOKEN=your_katya_bot_token_here
TELEGRAM_BOT_USERNAME=katya_boss_ai_bot
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

## 🎨 Орбитальная навигация BOSS AI

### Центральная платформа
- **BOSS AI** - операционная система для бизнеса будущего
- **Размер:** 200px (desktop) / 150px (mobile)
- **Эффекты:** Пульсация, свечение, анимация появления

## 🌈 ГЕНИАЛЬНАЯ СИСТЕМА АНИМИРОВАННЫХ ПОЛОСОК

### 🎯 Образец совершенства - Анимированная полоска сверху экрана

Наша платформа использует революционную систему анимированных полосок, которая представляет собой образец визуального совершенства:

#### ✨ Технические характеристики:
- **Радужный градиент:** 7 цветов (красный → оранжевый → желтый → зеленый → черный → фиолетовый → красный)
- **Плавная анимация:** 8 секунд для полного цикла движения
- **Эффект течения:** background-position создает непрерывное движение
- **Объемная тень:** box-shadow добавляет глубину и объем
- **Бесконечность:** infinite создает непрерывный цикл

#### 🎨 CSS реализация:
```css
.animated-top-bar {
  background: linear-gradient(
    90deg,
    #ff0000 0%,           /* Красный */
    #ff8000 16.66%,       /* Оранжевый */
    #ffff00 33.33%,       /* Желтый */
    #00ff00 50%,          /* Зеленый */
    #000000 66.66%,       /* Черный */
    #8000ff 83.33%,       /* Фиолетовый */
    #ff0000 100%          /* Красный (замыкаем круг) */
  );
  background-size: 300% 100%;
  animation: rainbow-flow 8s linear infinite;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes rainbow-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}
```

#### 🚀 РЕАЛИЗОВАННАЯ СИСТЕМА ГЕНЕРАЦИИ ПОЛОСОК:

**✨ Функциональность:**
- **Отклонения от прямой:** полоски движутся по синусоидальным траекториям с настраиваемой амплитудой и частотой
- **Синхронное движение:** параллельные полоски движутся согласованно с уникальными параметрами
- **Задержки запуска:** каждая полоска начинает движение с случайной задержкой (0-2 секунды)
- **Коннекторы:** красивые кружочки на концах с пульсирующим свечением
- **Динамическая генерация:** система автоматически создает новые паттерны с 16-цветной палитрой
- **Настраиваемые параметры:** размеры контейнера, количество полосок, интервалы генерации
- **Производительность:** оптимизированные CSS-анимации с использованием CSS-переменных

**🎛️ Технические характеристики:**
- **Амплитуда отклонения:** 20-80px (случайная)
- **Частота волны:** 0.5-2 (случайная)
- **Длительность анимации:** 3-7 секунд (случайная)
- **Цветовая палитра:** 16 ярких цветов
- **Размеры полосок:** ширина 200-500px, высота 3-10px
- **Интервал генерации:** настраиваемый (500-5000ms)

**📁 Структура модуля:**
```
frontend/src/components/AnimatedStripes/
├── AnimatedStripesGenerator.tsx    # Основной компонент генератора
├── AnimatedStripesGenerator.css    # Стили генератора
├── AnimatedStripesDemo.tsx         # Демо-страница
├── AnimatedStripesDemo.css         # Стили демо-страницы
└── index.ts                        # Экспорты и типы
```

**🎮 Доступ:**
- Кнопка "Полоски" в главном заголовке приложения
- Полноэкранная демонстрация с интерактивными настройками
- Режимы: автоматическая и ручная генерация

### Уровень 1: Основные агенты (6 агентов)

#### 🤖 Продавец
- **Описание:** Умные боты для продаж в чатах и на сайте
- **Цена:** BT за каждое сообщение
- **Функции:** Автоматические ответы, квалификация лидов

#### 📋 Секретарь
- **Описание:** Личный ассистент для продуктивности
- **Цена:** BT за каждую задачу
- **Функции:** Планирование, напоминания, организация

#### ⚖️ Юрист
- **Описание:** Правовая помощь и консультации
- **Цена:** BT за каждую консультацию
- **Функции:** Анализ документов, правовые консультации

#### 📦 Manager для Ozon
- **Описание:** Управление продажами на Ozon
- **Цена:** BT за каждую операцию
- **Функции:** Управление товарами, акциями, аналитика

#### 📱 Manager для Avito
- **Описание:** Управление объявлениями на Avito
- **Цена:** BT за каждое объявление
- **Функции:** Автопубликация, управление объявлениями

#### 🎨 Студия Решений
- **Описание:** Индивидуальные AI решения под ключ
- **Цена:** От 10к+ рублей
- **Функции:** Кастомная разработка, интеграции
- **Особенность:** Имеет подсервисы (уровень 2)

### Уровень 2: Подсервисы Студии Решений (5 подсервисов)

#### 🎮 3D Конфигураторы
- **Описание:** Интерактивные 3D конфигураторы товаров
- **Цена:** 50к-2кк рублей
- **Применение:** Мебель, автомобили, недвижимость

#### 🤖 Telegram Боты
- **Описание:** Умные боты для автоматизации
- **Цена:** 20к-2кк рублей
- **Применение:** Поддержка, продажи, уведомления

#### 🌐 Сайты Лэндинги
- **Описание:** Продающие лендинги под ключ
- **Цена:** 20к-200к рублей
- **Применение:** Маркетинг, продажи, лиды

#### 🧮 Калькуляторы
- **Описание:** Интерактивные калькуляторы стоимости
- **Цена:** 10к+ рублей
- **Применение:** Расчеты, конфигураторы

#### 📱 Приложения
- **Описание:** Мобильные и веб-приложения
- **Цена:** 100к+ рублей
- **Применение:** Полноценные приложения, интеграции

### Визуальные эффекты

#### Эффект парения (Levitation Effect)
- **Вертикальное движение** - иконки "парят" вверх-вниз
- **Динамическая тень** - тень под иконкой пульсирует
- **Свечение** - cyan свечение вокруг иконок
- **Плавность** - естественное движение с разными фазами

#### Анимированные линии
- **"Дышащий" градиент** - пульсация света по линиям
- **Последовательность** - линии рисуются от центра к агентам
- **Реакция на hover** - линии подсвечиваются при наведении

#### Фирменный стиль
- **Cyan (#00FFFF)** - основной цвет технологий и AI
- **Белый (#FFFFFF)** - чистота, профессионализм
- **Черный (#000000)** - элегантность, премиум

## 📱 Функциональность

### Основные возможности

- ✅ **Орбитальная навигация** - революционная система с двумя уровнями
- ✅ **Эффект парения** - иконки "парят" в воздухе
- ✅ **100 слоганов BOSS AI** - мотивационная система
- ✅ **Философия Head Cutter** - эффективность без компромиссов
- ✅ **Telegram авторизация** - вход через Telegram Login Widget
- ✅ **Katya AI Service** - AI-ассистент с распределенной памятью команды
- ✅ **Ozon Manager** - автоматизация работы с Ozon
- ✅ **Anti-Procrastination OS** - система борьбы с прокрастинацией
- ✅ **Микросервисная архитектура** - легко расширяемая система
- ✅ **WebSocket** - реальное время
- ✅ **Responsive дизайн** - адаптивный интерфейс
- ✅ **Темная/светлая тема** - переключение тем
- ✅ **Безопасность** - JWT токены, CORS, Helmet
- ✅ **Биллинг** - автоматическое списание BT за использование сервисов

### Архитектура Backend

#### API Gateway (порт 3001)

- ✅ Единая точка входа для всех запросов
- ✅ Маршрутизация запросов к микросервисам
- ✅ WebSocket соединения
- ✅ Централизованная авторизация через Telegram
- ✅ Rate limiting и безопасность
- ✅ Мониторинг и health checks
- ✅ Проксирование запросов к Ozon Manager и AI сервисам

#### Ozon Manager микросервис (порт 4200)

- ✅ Управление Ozon магазинами
- ✅ API для работы с Ozon
- ✅ Планировщик задач
- ✅ Логирование и мониторинг
- ✅ Автономная работа через API Gateway

#### Katya AI Service (порт 4300)

- ✅ AI-ассистент с распределенной памятью команды
- ✅ Суммаризация обсуждений через GPT-5 nano
- ✅ Поиск по истории команды
- ✅ Telegram Bot интеграция (@Катя)
- ✅ Интеграция с биллингом (автоматическое списание BT)
- ✅ Настройки на платформе

#### Analytics Service (порт 4400)

- ✅ Трекинг всех действий пользователей
- ✅ Сбор метрик производительности
- ✅ Мониторинг использования сервисов
- ✅ Real-time WebSocket обновления
- ✅ Агрегация метрик и статистика
- ✅ Экспорт данных (JSON/CSV)
- ✅ Admin дашборд

#### AI Services (планируется)

- 🔄 ChatGPT интеграция
- 🔄 Claude интеграция
- 🔄 Gemini интеграция
- 🔄 Кастомные AI модели

### Модули Frontend (BARSUKOV OS)

- **ChatGPT Service** - интеграция с OpenAI
- **Ozon Manager** - управление товарами на Ozon
- **Katya AI Service** - AI-ассистент с распределенной памятью команды
- **Anti-Procrastination OS** - система борьбы с прокрастинацией
- **AI Lawyer** - правовая помощь
- **Photo Studio** - обработка изображений
- **Sales Scripts** - скрипты продаж
- **Regulations Manager** - управление регламентами

## 📡 API Endpoints

### API Gateway (порт 3001)

```
GET  /                    # Информация о сервере
GET  /api/health          # Health check
POST /api/auth/telegram/login  # Telegram авторизация
GET  /api/auth/me         # Информация о пользователе
POST /api/ozon/*          # Прокси к Ozon Manager
POST /api/katya/*         # Прокси к Katya AI Service
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

### Katya AI Service (порт 4300) - через API Gateway

```
POST /api/katya/summarize       # Суммаризация обсуждений
POST /api/katya/search          # Поиск по истории
POST /api/katya/question        # Вопрос к Кате
GET  /api/katya/decisions       # Список решений команды
GET  /api/katya/onboarding      # Онбординг для новых участников
GET  /api/katya/settings        # Настройки Кати
PUT  /api/katya/settings        # Обновление настроек
GET  /api/katya/history         # История диалогов с Катей
```

### Analytics Service (порт 4400) - через API Gateway

```
POST /api/analytics/track            # Трекинг события
POST /api/analytics/performance      # Метрика производительности
POST /api/analytics/service-usage    # Использование сервиса
POST /api/analytics/session/start    # Начало сессии
POST /api/analytics/session/end      # Завершение сессии
GET  /api/analytics/dashboard        # Данные для дашборда
GET  /api/analytics/users/:userId    # Аналитика пользователя
GET  /api/analytics/services/:name   # Аналитика сервиса
GET  /api/analytics/metrics          # Агрегированные метрики
GET  /api/analytics/export           # Экспорт данных
GET  /api/analytics/health           # Health check
```

## 🔌 WebSocket Events

### Подключение

```javascript
const socket = io("http://localhost:3001");

// Подписка на Ozon Manager события
socket.emit("subscribe-ozon", { userId: "user123" });

// Подписка на Katya AI события
socket.emit("subscribe-katya", { userId: "user123" });

// Подписка на Analytics события
socket.emit("subscribe-analytics", { userId: "user123" });

// Подписка на AI события
socket.emit("subscribe-ai", { userId: "user123" });
```

### События

- `ozon-update` - обновления от Ozon Manager
- `katya-response` - ответы от Katya AI Service
- `katya-agreement-confirmed` - подтверждение соглашения в Telegram
- `analytics-update` - real-time обновления аналитики
- `ai-response` - ответы от AI сервисов
- `notification` - системные уведомления

## 🚀 Деплой на VPS

### Требования к серверу

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 2 CPU cores, 4GB RAM, 20GB SSD
- Node.js 18+, Nginx, PM2

### Автоматический деплой

```bash
# Клонирование на сервер
git clone <repository-url> /var/www/boss-ai
cd /var/www/boss-ai

# Запуск скрипта развертывания
./deploy/deploy.sh production
```

Подробные инструкции в [deploy/README.md](deploy/README.md)

## 🧪 Тестирование

### Frontend тесты

```bash
cd frontend
npm run test
```

### Backend тесты

```bash
# Главный сервер
cd backend/main
npm run test

# Ozon Manager
cd backend/ozon-manager
npm run test
```

### E2E тесты

```bash
npm run test:e2e
```

## 📊 Мониторинг

### Логи

- Главный сервер: `backend/main/logs/`
- Ozon Manager: `backend/ozon-manager/logs/`
- PM2: `pm2 logs`
- Nginx: `/var/log/nginx/`

### Метрики

- CPU, память, диск
- Количество запросов
- Время ответа API
- Ошибки и исключения

## 🔒 Безопасность

### Реализованные меры

- JWT токены для аутентификации
- CORS настройки
- Helmet для HTTP заголовков
- Rate limiting
- Валидация входных данных
- SQL injection защита

### Рекомендации

- Используйте HTTPS в production
- Регулярно обновляйте зависимости
- Настройте firewall
- Мониторьте логи на подозрительную активность

## 🤝 Разработка

### Структура кода

- **Микросервисная архитектура** - каждый сервис независим
- **TypeScript** - строгая типизация
- **ESLint + Prettier** - форматирование кода
- **Git hooks** - автоматические проверки

### Соглашения

- **Коммиты** - Conventional Commits
- **Ветки** - GitFlow
- **Код** - Clean Code принципы
- **Документация** - JSDoc комментарии

## 📚 Документация

- [Backend архитектура](backend/README.md)
- [API документация](docs/API.md)
- [WebSocket события](docs/WEBSOCKET.md)
- [Деплой](deploy/README.md)
- [Desktop приложение](ozon-desktop/README.md)
- **[Production Configuration](PRODUCTION_CONFIG.md)** - Полная конфигурация production системы

## 🐛 Отчеты об ошибках

При обнаружении ошибок:

1. Проверьте [Issues](https://github.com/your-repo/issues)
2. Создайте новый issue с описанием
3. Приложите логи и скриншоты
4. Укажите версию и окружение

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл

## 👥 Команда

- **BARSUKOV OS Team** - разработка и поддержка
- **AI Integration** - интеграция с AI сервисами
- **DevOps** - развертывание и мониторинг

## 🔐 Production Environment Variables

Для продакшена создайте файл `/var/www/boss-ai/.env` с правами `600`:

```bash
# Security & CORS
CORS_ORIGIN=https://boss-ai.online
JWT_SECRET=<сгенерируйте: openssl rand -base64 48>
JWT_EXPIRES_IN=15d

# Telegram Bot (получите у @BotFather)
TELEGRAM_BOT_TOKEN=<ваш_токен_бота>
TELEGRAM_BOT_SECRET=<сгенерируйте: openssl rand -base64 32>
TELEGRAM_BOT_USERNAME=your_bot_username

# Database
DB_PATH=./backend/data/boss_ai.db

# Services
OZON_MANAGER_URL=http://localhost:4200
KATYA_SERVICE_URL=http://localhost:4300
AI_SERVICES_URL=http://localhost:4300

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Важно:**

- Файл `.env` НИКОГДА не коммитьте в git
- Храните только на сервере с правами `chmod 600`
- Ротируйте секреты каждые 90 дней
- После изменения `.env` перезапустите PM2: `pm2 reload ecosystem.config.js`

См. полную инструкцию по деплою: [`deploy/SERVER_SETUP.md`](deploy/SERVER_SETUP.md)

## 🔒 Security Features

- **CSP (Content Security Policy)**: запрет unsafe-inline, whitelist доменов
- **HSTS**: принудительный HTTPS с preload
- **Telegram HMAC validation**: проверка подписи Telegram Login
- **Webhook secret**: защита Telegram webhook через X-Telegram-Bot-Api-Secret-Token
- **JWT HS256**: 15-дневный срок жизни токена
- **SQLite WAL mode**: безопасная конкурентная работа с БД
- **Rate limiting**: защита от DDoS и брутфорса

## 📦 Backups

Автоматический бэкап SQLite настроен через cron:

```bash
# Добавьте в crontab -e:
0 3 * * * DB_PATH=/var/www/boss-ai/backend/data/boss_ai.db BACKUP_DIR=/var/backups/boss-ai /bin/bash /var/www/boss-ai/scripts/backup_sqlite.sh >> /var/www/boss-ai/logs/backup.log 2>&1
```

- Частота: ежедневно в 03:00
- Формат: gzip
- Ретенция: 14 дней
- Путь: `/var/backups/boss-ai/boss_ai_YYYYMMDD-HHMMSS.sqlite.gz`

## ⚡ Философия Head Cutter

### Принципы
1. **Эффективность без компромиссов** - максимальный результат при минимальных затратах
2. **AI вместо HR** - автоматизация кадровых процессов
3. **Код вместо людей** - технологические решения вместо человеческих ресурсов
4. **Результат вместо процесса** - фокус на итоге, а не на методах
5. **Будущее вместо прошлого** - инновации и технологии

### 100 слоганов BOSS AI

#### Категории слоганов
- **Дерзкие и провокационные (20)** - привлечение внимания
- **Престиж и статус (20)** - укрепление позиции лидера
- **Результат и возможности (20)** - демонстрация возможностей
- **Технологии будущего (20)** - позиционирование как инновации
- **Head Cutter философия (20)** - продвижение принципов

#### Примеры слоганов
- "BOSS AI. Head Cutter. Ваш штат — это код."
- "BOSS AI. Ваши вакансии закрыты. Навсегда."
- "BOSS AI. Престижный бизнес — это автоматизированный бизнес."
- "BOSS AI. Операционная система для бизнеса будущего."
- "BOSS AI. Head Cutter. Режем расходы, растим прибыль."

#### Система смены
- **Автоматическая смена** каждые 10 секунд
- **Случайный выбор** из всех категорий
- **Мотивационное воздействие** на пользователей

## 💰 Система биллинга

### Boss Tokens (BT)
- **Внутренняя валюта** платформы
- **Автоматическое списание** за использование сервисов
- **Прозрачная тарификация** - все цены указаны заранее
- **Мониторинг расходов** в реальном времени

### Тарификация
- **Основные агенты:** BT за операцию (сообщение, задача, консультация)
- **Подсервисы:** Фиксированная стоимость в рублях
- **Пополнение:** Различные способы оплаты

## 📊 Структура платформы

Подробная Mermaid диаграмма структуры доступна в файле [PLATFORM_STRUCTURE.md](PLATFORM_STRUCTURE.md)

## 🔗 Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Ozon Seller API](https://docs.ozon.ru/api/seller/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Framer Motion](https://www.framer.com/motion/) - анимации
- [Mermaid](https://mermaid-js.github.io/) - диаграммы

## 🚀 Быстрый старт для разработки

### Предварительные требования

- Node.js 18+
- npm или yarn
- Git

### Установка и запуск

#### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd BossAIPABOTA
```

#### 2. Установка всех зависимостей

```bash
# Установка зависимостей для всех сервисов
npm run install:all
```

#### 3. Запуск всех сервисов

### Windows

```powershell
# Запуск всех сервисов одной командой
.\dev-start.ps1
```

### Linux/Mac

```bash
# Запуск всех сервисов
npm run dev
```

### Ручной запуск сервисов

1. **Ozon Manager (порт 4200):**

```bash
cd backend/ozon-manager
npm run dev
```

2. **API Gateway (порт 3000):**

```bash
cd backend/main
npm run dev
```

3. **Frontend (порт 5173):**

```bash
cd frontend
npm run dev
```

#### 4. Проверка работоспособности

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3001
- **Ozon Manager:** http://localhost:4200
- **Katya AI Service:** http://localhost:4300
- **Health Check API Gateway:** http://localhost:3001/api/health
- **Health Check Ozon Manager:** http://localhost:4200/api/health
- **Health Check Katya AI:** http://localhost:4300/api/health

---

**Boss AI Platform** - Ваш AI-помощник для автоматизации бизнеса! 🚀
