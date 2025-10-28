# Техническое задание: Telegram-авторизация через бота

---

## 📋 КРАТКОЕ РЕЗЮМЕ

**Цель:** Реализовать полноценную Telegram-авторизацию для платформы Boss AI с использованием Telegram Login Widget и бота для подтверждения пользовательского соглашения.

**Текущий статус (обновлено):**
- ✅ Backend основа готова (Express, SQLite, базовая auth)
- ✅ **Backend Telegram авторизация РЕАЛИЗОВАНА** (этапы 1-6 завершены)
- ✅ Frontend исходники найдены (`barsukov-platform-ts/src/`)
- ⏳ Frontend компоненты авторизации - в процессе

**Что реализовано в Backend:**
1. ✅ Миграции БД (таблицы users, sessions)
2. ✅ UserService (CRUD пользователей)
3. ✅ JWT utils (генерация и проверка токенов)
4. ✅ Telegram валидация (HMAC-SHA256)
5. ✅ Auth Controller (4 endpoint'а)
6. ✅ Обновленный Auth Middleware (JWT + demo-token)
7. ✅ TelegramBotService (webhook, команды, callback queries)
8. ✅ Webhook endpoint `/api/telegram/webhook`
9. ✅ Интеграция в index.ts
10. ✅ TELEGRAM_BOT_SETUP.md с инструкциями
11. ✅ Тестирование (health, миграции, endpoints)

**Что реализовано в Frontend:**
1. ✅ Типы авторизации (`src/types/auth.ts`)
2. ✅ AuthService (`src/services/AuthService.ts`)
3. ✅ Auth компоненты (AuthWidget, TelegramAuthButton, ProfilePanel, AgreementDialog)
4. ✅ CSS стили для компонентов (`src/styles/components/auth.css`)
5. ✅ Telegram Widget интегрирован в HTML
6. ✅ ENV_SETUP.md с инструкциями по настройке

**Следующий этап:** 
- Frontend: Обновление PlatformContext, интеграция в App.tsx и Sidebar
- Telegram Bot: Webhook, логика соглашения

---

## 📊 СТАТУС РЕАЛИЗАЦИИ

### ✅ ЧТО УЖЕ ЕСТЬ В ПРОЕКТЕ:

**Backend (папка `backend/`):**
- ✅ Express.js сервер на порту 3001
- ✅ SQLite база `./data/ozon_manager.db`
- ✅ Базовый middleware авторизации (`generateDemoToken`, `requireAuth`)
- ✅ Winston логирование в `./logs/ozon_manager.log`
- ✅ CORS настроен
- ✅ Ozon Manager API (магазины, акции, архив, планировщик)

**Frontend (папка `frontend/`):**
- ✅ Скомпилированная версия приложения (production build)
- ✅ HTML с подключением React приложения
- ✅ Модульная система сервисов
- ⚠️ **НЕТ доступа к исходному коду** (нет папки `src/` с TypeScript/React компонентами)

---

### ❌ ЧТО НУЖНО РЕАЛИЗОВАТЬ:

#### **BACKEND (приоритет 1):**

1. **База данных:**
   - [x] Создать таблицу `users` (см. раздел 3.1)
   - [x] Создать таблицу `sessions` (см. раздел 3.2)
   - [x] Создать файл `src/utils/database-migrations.ts`

2. **JWT авторизация:**
   - [x] Установить зависимости: `jsonwebtoken`, `@types/jsonwebtoken`
   - [x] Создать `src/utils/jwt.ts` с функциями генерации/проверки токенов
   - [x] Обновить `src/middleware/auth.ts` для работы с JWT

3. **User Service:**
   - [x] Создать `src/services/user-service.ts`
   - [x] Реализовать CRUD операции с пользователями
   - [x] Методы: `findByTelegramId()`, `createUser()`, `updateAgreement()`, `updateLastLogin()`

4. **Auth Controller:**
   - [x] Создать `src/controllers/auth-controller.ts`
   - [x] Эндпоинт `POST /api/auth/telegram/login` (см. раздел 4.1)
   - [x] Эндпоинт `GET /api/auth/me` (см. раздел 4.1)
   - [x] Эндпоинт `POST /api/auth/logout` (см. раздел 4.1)
   - [x] Эндпоинт `POST /api/auth/telegram/agree` (см. раздел 4.1)

5. **Telegram Bot Service:**
   - [ ] Установить зависимости: `node-telegram-bot-api`, `@types/node-telegram-bot-api`
   - [ ] Создать `src/services/telegram-bot.ts` (см. раздел 6.3)
   - [ ] Реализовать обработку webhook `/api/telegram/webhook` (см. раздел 4.2)
   - [ ] Логика команды `/start` с deep linking
   - [ ] Обработка callback `agree_{userId}`

6. **Безопасность:**
   - [ ] Реализовать валидацию Telegram hash (HMAC-SHA256) (см. раздел 9.1)
   - [ ] Проверка `auth_date` (не старше 24 часов)

7. **Конфигурация:**
   - [ ] Добавить в `.env`: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`
   - [ ] Обновить `src/index.ts` для подключения auth routes и webhook

---

#### **FRONTEND (приоритет 2):**

⚠️ **ПРОБЛЕМА:** Исходный код frontend (TypeScript/React) не найден в проекте. Есть только скомпилированные файлы.

**ТРЕБУЕТСЯ ВЫЯСНИТЬ:**
1. Где находится репозиторий с исходниками `barsukov-platform-ts`?
2. Нужно ли восстанавливать frontend с нуля?

**Если исходники есть, нужно реализовать:**

1. **AuthService:**
   - [x] Создать `src/services/AuthService.ts` (см. раздел 5.3)
   - [x] Методы: `loginWithTelegram()`, `getCurrentUser()`, `logout()`, `getStoredToken()`, `setStoredToken()`

2. **Auth компоненты:**
   - [x] Создать `src/components/Auth/AuthWidget.tsx` (см. раздел 5.1)
   - [x] Создать `src/components/Auth/ProfilePanel.tsx` (см. раздел 5.2)
   - [x] Создать `src/components/Auth/TelegramAuthButton.tsx`
   - [x] Создать `src/components/Auth/AgreementDialog.tsx`
   - [x] Создать `src/styles/components/auth.css`

3. **Типы:**
   - [x] Создать `src/types/auth.ts` с типами `User`, `TelegramAuthData`, etc.

4. **Интеграция:**
   - [ ] Обновить `src/context/PlatformContext.tsx` (см. раздел 7.1)
   - [ ] Обновить `src/components/Sidebar/Sidebar.tsx` (см. раздел 7.2)
   - [ ] Обновить `src/App.tsx` (см. раздел 7.3)

5. **Telegram Login Widget:**
   - [x] Интеграция скрипта Telegram Widget в HTML (см. раздел 5.1)
   - [x] Создать ENV_SETUP.md с инструкциями по настройке переменных окружения
   - [ ] Callback функция `onTelegramAuth()` (реализуется в AuthWidget)

---

#### **TELEGRAM BOT (приоритет 3):**

1. **Создание бота:**
   - [x] Создать бота через @BotFather
   - [x] Получить `BOT_TOKEN`
   - [x] Настроить domain для Login Widget через `/setdomain`

2. **Настройка webhook:**
   - [x] Локально: использовать ngrok для тестирования (см. раздел 10.1)
   - [x] Продакшн: установить webhook на `https://yourdomain.com/api/telegram/webhook`

3. **Backend реализация:**
   - [x] Установить зависимости: `node-telegram-bot-api`, `@types/node-telegram-bot-api`
   - [x] Создать `src/services/telegram-bot-service.ts`
   - [x] Реализовать обработку webhook `/api/telegram/webhook`
   - [x] Логика команды `/start` с deep linking
   - [x] Обработка callback `agree_{userId}`
   - [x] Создать `TELEGRAM_BOT_SETUP.md` с инструкциями

---

#### **ТЕСТИРОВАНИЕ (приоритет 4):**

- [ ] Все пункты чеклиста из раздела 10.2

---

#### **ДЕПЛОЙ (приоритет 5):**

- [ ] Настройка VPS (см. раздел 11.1)
- [ ] SSL сертификаты
- [ ] Nginx конфигурация (см. раздел 11.2)
- [ ] PM2 для автозапуска backend

---

### ✅ ИСХОДНИКИ НАЙДЕНЫ!

**СТРУКТУРА ПРОЕКТА:**

1. **`barsukov-platform-ts/`** - ОСНОВНОЙ ПРОЕКТ с исходниками:
   - `src/` - Исходный код React + TypeScript (146 .tsx, 135 .ts файлов)
   - `src/context/PlatformContext.tsx` - Контекст платформы
   - `src/components/Sidebar/Sidebar.tsx` - Сайдбар
   - `src/App.tsx` - Главный компонент
   - `package.json`, `vite.config.ts`, `tsconfig.json` - Конфигурация

2. **`Ozo_Api/backend/`** - Backend с исходниками:
   - `src/` - Исходный код Node.js + TypeScript
   - `src/index.ts` - Главный файл сервера
   - `src/middleware/auth.ts` - Middleware авторизации
   - `src/services/` - Сервисы (Ozon API, планировщик, и т.д.)
   - `package.json`, `tsconfig.json` - Конфигурация

3. **`deploy-package/`** - Production builds для деплоя:
   - `backend/dist/` - Скомпилированный backend
   - `frontend/` - Скомпилированный frontend

**ТЕПЕРЬ МОЖНО НАЧИНАТЬ РЕАЛИЗАЦИЮ!**

---

## 1. ИССЛЕДОВАНИЕ АРХИТЕКТУРЫ ПЛАТФОРМЫ

### 1.1 Текущее состояние

**Frontend (barsukov-platform-ts):**

- React + TypeScript + Vite
- Контекст PlatformContext хранит `user: User | null` в localStorage (`barsukov-user`)
- Тип User: `{ id, name, email, avatar?, preferences }`
- Сайдбар имеет кнопку "Профиль" (`sidebar-footer-button`) в футере
- Виджетная система через WidgetsService (регистрация типов, создание, отображение)
- Модальные окна и оверлеи управляются через состояние компонентов

**Backend (deploy-package/backend):**

- Express.js на Node 18+, порт 3001
- SQLite база: `./data/ozon_manager.db` (текущая структура: stores, schedules)
- CORS настроен на `http://localhost:5173` (или `.env CORS_ORIGIN`)
- Middleware auth: `generateDemoToken()` и `requireAuth` (простая проверка токена)
- Логирование через Winston в `./logs/ozon_manager.log`

### 1.2 Telegram Bot API + OAuth

**Telegram Login Widget** (рекомендуемый способ):

- Использует Telegram Widgets для OAuth через браузер
- Callback возвращает: `id, first_name, last_name, username, photo_url, auth_date, hash`
- Проверка подлинности: HMAC-SHA256 с секретным ключом бота

**Telegram Bot API:**

- Бот получает `/start` с параметром `auth={userId}` для подтверждения соглашения
- Кнопка "Подтвердить соглашение" → callback или команда `/agree`
- После согласия бот отправляет данные обратно в приложение (webhook или polling)

---

## 2. АРХИТЕКТУРА РЕШЕНИЯ

### 2.1 Компоненты системы

#### **Frontend:**

1. **AuthWidget** (виджет авторизации при старте)
2. **ProfilePanel** (панель профиля при клике на кнопку в футере)
3. **AuthService** (сервис для работы с авторизацией и токенами)
4. **TelegramAuthButton** (компонент кнопки Telegram Login)

#### **Backend:**

1. **AuthController** (API эндпоинты `/api/auth/*`)
2. **UserService** (работа с БД пользователей)
3. **TelegramService** (валидация данных Telegram, webhook бота)
4. **DatabaseMigration** (создание таблицы `users`)

#### **Telegram Bot:**

1. **Webhook endpoint** `/api/telegram/webhook` (прием событий бота)
2. **Логика соглашения** (отправка текста, кнопка "Подтвердить", сохранение согласия)
3. **Deep linking** (ссылка на бота с параметром `start=auth_{userId}`)

---

## 3. БАЗА ДАННЫХ (SQLite)

### 3.1 Таблица `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  auth_date INTEGER NOT NULL,
  agreed_to_terms BOOLEAN DEFAULT 0,
  agreed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_login INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### 3.2 Таблица `sessions` (опционально, для JWT)

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. BACKEND API

### 4.1 Эндпоинты авторизации

#### `POST /api/auth/telegram/login`

**Описание:** Валидация данных Telegram Login Widget и создание сессии

**Тело запроса:**

```json
{
  "id": 123456789,
  "first_name": "Иван",
  "last_name": "Иванов",
  "username": "ivanov",
  "photo_url": "https://t.me/i/userpic/...",
  "auth_date": 1699999999,
  "hash": "abc123..."
}
```

**Ответ (успех):**

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "telegram_id": 123456789, "username": "ivanov", ... },
    "token": "jwt_token_here",
    "needsAgreement": true
  }
}
```

**Логика:**

1. Валидация `hash` (HMAC-SHA256 с `BOT_TOKEN`)
2. Проверка `auth_date` (не старше 24 часов)
3. Поиск/создание пользователя в БД
4. Генерация JWT токена (срок 30 дней)
5. Возврат `needsAgreement: true`, если `agreed_to_terms = 0`

#### `GET /api/auth/me`

**Описание:** Получение данных текущего пользователя

**Заголовки:** `Authorization: Bearer {token}`

**Ответ:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "ivanov",
    "first_name": "Иван",
    "agreed_to_terms": true
  }
}
```

#### `POST /api/auth/logout`

**Описание:** Выход из системы (удаление токена)

**Заголовки:** `Authorization: Bearer {token}`

**Ответ:**

```json
{ "success": true }
```

#### `POST /api/auth/telegram/agree`

**Описание:** Подтверждение пользовательского соглашения (вызывается ботом после нажатия кнопки)

**Тело запроса:**

```json
{
  "telegram_id": 123456789,
  "agreed": true
}
```

**Ответ:**

```json
{ "success": true, "message": "Соглашение принято" }
```

**Логика:**

1. Обновить `agreed_to_terms = 1`, `agreed_at = CURRENT_TIMESTAMP` в БД
2. Отправить уведомление клиенту (через webhook или polling)

---

### 4.2 Telegram Bot Webhook

#### `POST /api/telegram/webhook`

**Описание:** Прием событий от Telegram Bot API

**Тело запроса:** [Update object](https://core.telegram.org/bots/api#update)

**Логика обработки:**

1. **Команда `/start`:**

   - Если параметр `start=auth_{userId}`, показать пользовательское соглашение
   - Текст соглашения (любой, например: "Нажимая 'Подтвердить', вы соглашаетесь с условиями использования сервиса Boss AI...")
   - Inline-кнопка "Подтвердить" (callback_data: `agree_{userId}`)

2. **Callback query `agree_{userId}`:**

   - Вызвать `POST /api/auth/telegram/agree` с `telegram_id`
   - Ответить пользователю: "Спасибо! Теперь вы можете вернуться в приложение."
   - Обновить БД: `agreed_to_terms = 1`

---

## 5. FRONTEND КОМПОНЕНТЫ

### 5.1 AuthWidget (виджет при запуске)

**Расположение:** `src/components/Auth/AuthWidget.tsx`

**Логика отображения:**

- Показывается, если `user === null` в `PlatformContext`
- Фиксированная позиция по центру экрана, backdrop с blur
- **Нельзя закрыть** до авторизации (нет кнопки закрытия)

**Содержимое:**

- Логотип Boss AI
- Заголовок: "Добро пожаловать в Boss AI"
- Описание: "Авторизуйтесь через Telegram для доступа к платформе"
- Кнопка Telegram Login Widget (встроенный скрипт)
- После успешной авторизации:
  - Если `needsAgreement === true`: показать модальное окно с текстом соглашения и кнопкой "Перейти в бота"
  - Кнопка "Перейти в бота" → открывает Deep Link: `https://t.me/{BOT_USERNAME}?start=auth_{userId}`
  - После согласия (polling или WebSocket) → скрыть виджет, загрузить данные пользователя в контекст

**Интеграция Telegram Login Widget:**

```html
<script async src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="YOUR_BOT_USERNAME"
  data-size="large"
  data-onauth="onTelegramAuth(user)"
  data-request-access="write">
</script>
```

```typescript
function onTelegramAuth(user) {
  // Отправить данные на backend: POST /api/auth/telegram/login
  // Сохранить токен в localStorage
  // Обновить PlatformContext
}
```

---

### 5.2 ProfilePanel (панель профиля)

**Расположение:** `src/components/Auth/ProfilePanel.tsx`

**Отображение:**

- Открывается при клике на кнопку "Профиль" в футере сайдбара
- Панель справа от сайдбара (как Settings/Prompts), ширина 400px
- Backdrop с blur, можно закрыть кликом снаружи или кнопкой X

**Содержимое:**

- Аватар пользователя (фото из Telegram или дефолтная иконка)
- Имя пользователя: `@username` или `first_name last_name`
- Telegram ID (для debug)
- Дата регистрации
- Кнопка "Выйти" (красная, внизу):
  - Вызов `POST /api/auth/logout`
  - Очистка `localStorage.removeItem('barsukov-user')`
  - Сброс `user: null` в контексте → показать AuthWidget

**Анимация:**

- Появление: slide-in справа (как Settings)
- Исчезновение: slide-out вправо

---

### 5.3 AuthService

**Расположение:** `src/services/AuthService.ts`

**Методы:**

```typescript
class AuthService {
  private baseUrl = 'http://localhost:3001/api';

  async loginWithTelegram(telegramData: TelegramAuthData): Promise<{ user: User; token: string; needsAgreement: boolean }> {
    const res = await fetch(`${this.baseUrl}/auth/telegram/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramData)
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
  }

  async getCurrentUser(token: string): Promise<User> {
    const res = await fetch(`${this.baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    return data.data;
  }

  async logout(token: string): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.removeItem('barsukov-token');
    localStorage.removeItem('barsukov-user');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('barsukov-token');
  }

  setStoredToken(token: string): void {
    localStorage.setItem('barsukov-token', token);
  }
}
```

---

## 6. TELEGRAM BOT (Node.js)

### 6.1 Создание бота

1. Создать бота через @BotFather
2. Получить `BOT_TOKEN`
3. Установить Telegram Login Domain (Settings → Bot Settings → Domain)

### 6.2 Webhook или Long Polling

**Рекомендуется webhook для продакшена:**

```bash
curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### 6.3 Логика бота (в backend)

**Файл:** `src/services/telegram-bot.ts`

```typescript
import TelegramBot from 'node-telegram-bot-api';

export class TelegramBotService {
  private bot: TelegramBot;
  private userService: UserService;

  constructor(token: string, userService: UserService) {
    this.bot = new TelegramBot(token, { polling: false }); // webhook mode
    this.userService = userService;
  }

  handleWebhook(update: any) {
    if (update.message?.text?.startsWith('/start')) {
      const param = update.message.text.split(' ')[1];
      if (param?.startsWith('auth_')) {
        const userId = param.replace('auth_', '');
        this.sendAgreement(update.message.chat.id, userId);
      }
    } else if (update.callback_query?.data?.startsWith('agree_')) {
      const userId = update.callback_query.data.replace('agree_', '');
      this.handleAgreement(update.callback_query.from.id, userId, update.callback_query.id);
    }
  }

  private sendAgreement(chatId: number, userId: string) {
    const agreementText = `
📋 Пользовательское соглашение Boss AI

Нажимая "Подтвердить", вы соглашаетесь с условиями использования платформы Boss AI.

1. Мы обрабатываем ваши данные Telegram для авторизации
2. Ваши данные не передаются третьим лицам
3. Вы можете удалить аккаунт в любой момент

Подробнее: https://boss-ai.com/terms
    `;

    this.bot.sendMessage(chatId, agreementText, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Подтвердить', callback_data: `agree_${userId}` }
        ]]
      }
    });
  }

  private async handleAgreement(telegramId: number, userId: string, callbackQueryId: string) {
    // Обновить БД
    await this.userService.updateAgreement(telegramId, true);

    // Ответить пользователю
    await this.bot.answerCallbackQuery(callbackQueryId, {
      text: 'Спасибо! Соглашение принято.'
    });

    await this.bot.sendMessage(telegramId, '✅ Вы успешно подтвердили соглашение! Теперь можете вернуться в приложение Boss AI.');
  }
}
```

---

## 7. ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩИЙ КОД

### 7.1 Обновление PlatformContext

**Файл:** `src/context/PlatformContext.tsx`

**Изменения в `initializePlatform`:**

```typescript
const initializePlatform = async () => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Проверка токена авторизации
    const token = authService.getStoredToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser(token);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        // Токен недействителен, очистить
        localStorage.removeItem('barsukov-token');
        localStorage.removeItem('barsukov-user');
      }
    }

    // Остальная логика инициализации...
  }
};
```

### 7.2 Обновление кнопки "Профиль" в Sidebar

**Файл:** `src/components/Sidebar/Sidebar.tsx`

**Добавить состояние и обработчик:**

```typescript
const [showProfilePanel, setShowProfilePanel] = useState(false);

// В JSX кнопки:
<button
  onClick={() => setShowProfilePanel(true)}
  className={cn("sidebar-footer-button", showProfilePanel && "active")}
  title="Профиль"
>
  <User className="w-4 h-4 icon" />
</button>

// Рендер панели (условно):
{showProfilePanel && (
  <ProfilePanel onClose={() => setShowProfilePanel(false)} />
)}
```

### 7.3 Регистрация AuthWidget в App.tsx

**Файл:** `src/App.tsx`

**Добавить перед основным контентом:**

```typescript
const AppContent = memo(() => {
  const { state } = usePlatform();

  // Показывать виджет авторизации, если пользователь не авторизован
  if (!state.user) {
    return <AuthWidget />;
  }

  return (
    <motion.div className="min-h-screen w-screen flex app-container">
      {/* Остальной интерфейс */}
    </motion.div>
  );
});
```

---

## 8. BACKEND РЕАЛИЗАЦИЯ

### 8.1 Структура файлов (добавить в backend)

```
deploy-package/backend/
├── src/
│   ├── controllers/
│   │   └── auth-controller.ts (новый)
│   ├── services/
│   │   ├── user-service.ts (новый)
│   │   └── telegram-bot.ts (новый)
│   ├── middleware/
│   │   └── auth.ts (обновить)
│   ├── utils/
│   │   └── jwt.ts (новый)
│   └── index.ts (обновить - добавить роуты)
└── .env (добавить переменные)
```

### 8.2 Переменные окружения (.env)

```env
# Существующие...
PORT=3001
NODE_ENV=development
DB_PATH=./data/ozon_manager.db
CORS_ORIGIN=http://localhost:5173

# Новые для авторизации
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
```

### 8.3 Установка зависимостей

```bash
cd deploy-package/backend
npm install jsonwebtoken node-telegram-bot-api @types/jsonwebtoken @types/node-telegram-bot-api
```

### 8.4 Миграция БД

**Файл:** `src/utils/database-migrations.ts`

```typescript
import Database from 'better-sqlite3';

export function runMigrations(dbPath: string) {
  const db = new Database(dbPath);

  // Таблица users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id BIGINT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      photo_url TEXT,
      auth_date INTEGER NOT NULL,
      agreed_to_terms BOOLEAN DEFAULT 0,
      agreed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      last_login INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_telegram_id ON users(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_token ON sessions(token);
  `);

  db.close();
}
```

**Вызов в `index.ts`:**

```typescript
import { runMigrations } from './utils/database-migrations';

// После инициализации
runMigrations(process.env.DB_PATH || './data/ozon_manager.db');
```

---

## 9. БЕЗОПАСНОСТЬ

### 9.1 Валидация Telegram данных

**Алгоритм проверки hash:**

```typescript
import crypto from 'crypto';

function verifyTelegramAuth(data: any, botToken: string): boolean {
  const { hash, ...fields } = data;

  // Создать data-check-string
  const checkString = Object.keys(fields)
    .sort()
    .map(key => `${key}=${fields[key]}`)
    .join('\n');

  // Создать secret key из bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Вычислить HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  return hmac === hash;
}
```

### 9.2 JWT токены

**Генерация:**

```typescript
import jwt from 'jsonwebtoken';

function generateToken(userId: number, telegramId: number): string {
  return jwt.sign(
    { userId, telegramId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}
```

**Middleware проверки:**

```typescript
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
```

---

## 10. ТЕСТИРОВАНИЕ

### 10.1 Локальное тестирование бота

**Использовать ngrok для webhook:**

```bash
ngrok http 3001
# Получить URL: https://abc123.ngrok.io
# Установить webhook:
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://abc123.ngrok.io/api/telegram/webhook"
```

### 10.2 Чеклист тестирования

- [ ] Виджет авторизации появляется при первом запуске
- [ ] Кнопка Telegram Login открывает OAuth
- [ ] После авторизации показывается модальное окно с соглашением
- [ ] Deep Link открывает бота в Telegram
- [ ] Бот отправляет текст соглашения и кнопку "Подтвердить"
- [ ] После подтверждения в боте виджет скрывается
- [ ] Имя пользователя отображается в профиле
- [ ] Кнопка "Выйти" очищает сессию и показывает виджет авторизации
- [ ] Токен сохраняется в localStorage и восстанавливается после перезагрузки
- [ ] Валидация Telegram hash работает корректно
- [ ] JWT токены истекают через 30 дней

---

## 11. ДЕПЛОЙ НА ПРОДАКШЕН

### 11.1 VPS (рекомендуется)

**Backend:**

- Установить Node.js 18+
- Склонировать репозиторий
- Настроить .env с реальными значениями
- Установить зависимости: `npm install --production`
- Собрать: `npm run build`
- Запустить через PM2: `pm2 start dist/index.js --name boss-ai-backend`
- Настроить Nginx для проксирования

**Telegram Bot:**

- Установить реальный webhook URL: `https://yourdomain.com/api/telegram/webhook`
- Убедиться, что SSL включен (обязательно для Telegram)

**Frontend:**

- Собрать: `npm run build`
- Скопировать `dist/` в `/var/www/html/boss-ai`
- Настроить Nginx для статики

### 11.2 Nginx конфигурация (пример)

```nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # Frontend
  location / {
    root /var/www/html/boss-ai;
    try_files $uri $uri/ /index.html;
  }

  # Backend API
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 12. ИТОГОВАЯ ФАЙЛОВАЯ СТРУКТУРА

```
barsukov-platform-ts/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── AuthWidget.tsx          (новый)
│   │   │   ├── ProfilePanel.tsx        (новый)
│   │   │   └── TelegramAuthButton.tsx  (новый)
│   │   └── ...
│   ├── services/
│   │   ├── AuthService.ts              (новый)
│   │   └── ...
│   ├── types/
│   │   ├── auth.ts                     (новый)
│   │   └── ...
│   └── context/
│       └── PlatformContext.tsx         (обновить)

deploy-package/backend/
├── src/
│   ├── controllers/
│   │   └── auth-controller.ts          (новый)
│   ├── services/
│   │   ├── user-service.ts             (новый)
│   │   └── telegram-bot.ts             (новый)
│   ├── middleware/
│   │   └── auth.ts                     (обновить)
│   ├── utils/
│   │   ├── jwt.ts                      (новый)
│   │   └── database-migrations.ts      (новый)
│   └── index.ts                        (обновить)
├── .env                                (обновить)
└── package.json                        (обновить)
```

---

## 13. ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ (опционально)

### 13.1 WebSocket для real-time уведомлений

- После подтверждения соглашения в боте отправить WebSocket событие
- Frontend подписывается на `ws://localhost:3001` и слушает событие `agreement_confirmed`
- Немедленно скрыть модальное окно без polling

### 13.2 Аватар пользователя в сайдбаре

- Показывать миниатюру фото Telegram вместо иконки User
- Lazy load через `<img src={user.photo_url} />`

### 13.3 Статистика авторизаций

- Таблица `auth_logs` с полями: `user_id, login_at, ip_address, user_agent`
- Отображение последних входов в профиле

---

## 14. КРИТИЧЕСКИЕ ЗАМЕЧАНИЯ

### ⚠️ НЕ МЕНЯТЬ

- Порт backend (3001)
- Путь к SQLite (`./data/ozon_manager.db`)
- CORS настройки (добавить только новые origins)
- Существующие API endpoints (не ломать `/api/stores`, `/api/schedule`, etc.)

### ✅ ПОДСТРАИВАТЬ

- Новую таблицу `users` создать в той же БД
- Новые endpoints добавить под `/api/auth/*`
- Middleware `requireAuth` обновить, но оставить совместимость с `generateDemoToken()`

---

## 15. ПЛАН РЕАЛИЗАЦИИ (пошагово)

### Этап 1: Backend база (1-2 дня)

1. Миграция БД (таблицы users, sessions)
2. UserService (CRUD операции с пользователями)
3. JWT utils (генерация, проверка токенов)
4. Middleware auth (обновить requireAuth)

### Этап 2: Backend авторизация (1-2 дня)

5. AuthController (POST /login, GET /me, POST /logout)
6. Валидация Telegram hash
7. TelegramBotService (обработка webhook, отправка соглашения)
8. Настройка бота через @BotFather

### Этап 3: Frontend компоненты (2-3 дня)

9. AuthService (API клиент)
10. AuthWidget (виджет при старте)
11. ProfilePanel (панель профиля)
12. TelegramAuthButton (интеграция Telegram Login Widget)

### Этап 4: Интеграция (1 день)

13. Обновить PlatformContext (проверка токена при старте)
14. Обновить Sidebar (кнопка профиля → ProfilePanel)
15. Обновить App.tsx (показ AuthWidget если не авторизован)

### Этап 5: Тестирование (1-2 дня)

16. Локальное тестирование (ngrok для webhook)
17. Проверка всех сценариев (авторизация, соглашение, выход)
18. Исправление багов

### Этап 6: Деплой (1 день)

19. Настройка VPS
20. Установка SSL
21. Настройка реального webhook
22. Финальное тестирование на продакшене

**Итого:** 7-11 дней полной разработки

---

## 16. КОНТАКТЫ И ДОКУМЕНТАЦИЯ

**Документация Telegram:**

- Bot API: <https://core.telegram.org/bots/api>
- Login Widget: <https://core.telegram.org/widgets/login>
- Deep Links: <https://core.telegram.org/bots#deep-linking>

**Библиотеки:**

- node-telegram-bot-api: <https://github.com/yagop/node-telegram-bot-api>
- jsonwebtoken: <https://github.com/auth0/node-jsonwebtoken>
- better-sqlite3: <https://github.com/WiseLibs/better-sqlite3>

**Создание бота:**

- Открыть @BotFather в Telegram
- Команда: `/newbot`
- Получить токен
- Настроить domain для Login Widget: `/setdomain`
