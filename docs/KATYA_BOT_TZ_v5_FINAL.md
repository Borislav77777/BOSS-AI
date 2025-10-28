# 📋 ТЕХНИЧЕСКОЕ ЗАДАНИЕ v5.0 FINAL: Telegram Bot "Катя" для Boss AI Platform

**Разработчик:** Николай
**Дата:** 21 октября 2025
**Версия:** 5.0 FINAL (Многопользовательская, упрощенная, правильная)
**Статус:** Готово к реализации 🚀

---

## 🎯 ЦЕЛЬ ПРОЕКТА

Разработать **"Катю"** - Telegram бота с функцией **Institutional Knowledge** (Распределенной памяти команды) для Boss AI Platform:

### Основные возможности:

1. **Два режима работы:**

   - 📱 **Telegram Bot** - отвечает в TG чатах на @Катя (основной режим)
   - 💬 **Platform Chat** - встроенный чат в Boss AI (будущее)

2. **Базовые функции (MVP):**

   - 🧠 **Суммаризация** - подводит итоги обсуждений
   - 🔍 **Поиск** - находит информацию в истории
   - 💬 **Вопросы** - отвечает по контексту чата
   - ✅ **Решения** - список принятых решений

3. **Технологии:**
   - ✅ SQLite (shared с платформой) - НЕ PostgreSQL!
   - ✅ GPT через `/api/ai/chatgpt` (платформенный endpoint)
   - ✅ Единый биллинг Boss AI (BT токены)
   - ✅ Многопользовательская изоляция данных

---

## 🏗️ АРХИТЕКТУРА

### Текущая инфраструктура Boss AI

```
Boss AI Platform (Production)
├── Frontend (React + Vite) → https://boss-ai.online
├── API Gateway (Node.js, port 3000)
│   ├── /api/auth/* - авторизация (Telegram Login Widget)
│   ├── /api/billing/* - биллинг (BT токены)
│   ├── /api/ai/chatgpt - GPT-5 nano ✅ (уже работает!)
│   ├── /api/ozon/* - Ozon Manager
│   └── /api/katya/* - Katya Service (добавить)
├── Ozon Manager (Node.js, port 4200)
└── Database: SQLite (WAL mode)
    └── /var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db
```

**Ключевые таблицы платформы (уже есть):**

- `users` - пользователи (id INTEGER, telegram_id BIGINT UNIQUE)
- `sessions` - сессии JWT
- `user_balance` - балансы пользователей (BT токены)
- `transactions` - история операций
- `service_pricing` - тарифы сервисов

### Новая архитектура с Катей

```
Katya AI Service (NEW, port 4300)
├── Express API Server
│   ├── /health - health check
│   ├── /summarize - суммаризация
│   ├── /search - поиск по истории
│   ├── /question - вопрос к контексту
│   ├── /decisions - список решений
│   └── /settings - настройки пользователя
│
├── Telegram Bot (polling)
│   ├── @Катя упоминания в чатах
│   ├── Команды: /summary, /search, /decisions
│   └── Логирование всех сообщений
│
├── Services:
│   ├── PlatformGPTService - проксирование к /api/ai/chatgpt ✅
│   ├── ContextManagerService - управление контекстом
│   └── UserChatMappingService - связь TG user ↔ platform user
│
└── Database: SQLite (shared с платформой)
    └── Новые таблицы Кати (с изоляцией по user_id)
```

---

## 👥 МНОГОПОЛЬЗОВАТЕЛЬСКАЯ АРХИТЕКТУРА БД

### Ключевое требование: ИЗОЛЯЦИЯ ДАННЫХ

**Проблема:**

- Пользователь может добавить Катю в несколько TG чатов (домашний, рабочий, семейный)
- Каждый чат должен иметь свою независимую историю
- Данные одного пользователя НЕ должны смешиваться с другими

**Решение:**

```
users (платформа)
  ├── id = 123 (platform user_id)
  └── telegram_id = 987654321

katya_user_chats (NEW)
  ├── user_id = 123 (владелец)
  ├── telegram_chat_id = -1001234567890 (чат где добавлена Катя)
  ├── chat_name = "Рабочий чат команды"
  └── is_active = true

chat_messages (NEW)
  ├── user_id = 123 (владелец данных)
  ├── telegram_chat_id = -1001234567890 (в каком чате)
  ├── text = "Обсудили новую фичу"
  └── created_at = 1729500000

Все запросы: WHERE user_id = ? AND telegram_chat_id = ?
```

**Примеры изоляции:**

```sql
-- User 123 добавил Катю в 3 чата:
katya_user_chats:
  (user_id=123, telegram_chat_id=-1001111111, chat_name="Домашний")
  (user_id=123, telegram_chat_id=-1001222222, chat_name="Рабочий")
  (user_id=123, telegram_chat_id=-1001333333, chat_name="Хобби")

-- User 456 добавил Катю в 1 чат:
katya_user_chats:
  (user_id=456, telegram_chat_id=-1001444444, chat_name="Стартап")

-- Запрос сообщений User 123 в рабочем чате:
SELECT * FROM chat_messages
WHERE user_id = 123 AND telegram_chat_id = -1001222222
ORDER BY created_at DESC LIMIT 50;

-- НЕ ВИДИТ сообщений других пользователей!
```

### Mapping: Telegram User → Platform User

**Проблема:** Telegram Bot получает `telegram_user_id` и `telegram_chat_id`, но БД работает с `user_id` (platform).

**Решение:**

```typescript
// src/services/user-chat-mapping.service.ts
export class UserChatMappingService {
  private db: Database;

  /**
   * Связать Telegram пользователя с платформой
   * Если пользователь уже авторизован через Telegram Login Widget,
   * он есть в таблице users
   */
  async getPlatformUserId(telegramUserId: number): Promise<number | null> {
    const user = this.db
      .prepare(
        `
      SELECT id FROM users WHERE telegram_id = ?
    `
      )
      .get(telegramUserId);

    return user ? (user as any).id : null;
  }

  /**
   * Зарегистрировать чат для пользователя
   * Вызывается когда бот добавляется в чат
   */
  async registerUserChat(
    userId: number,
    telegramChatId: number,
    chatName: string
  ): Promise<void> {
    this.db
      .prepare(
        `
      INSERT OR IGNORE INTO katya_user_chats
        (user_id, telegram_chat_id, chat_name, is_active)
      VALUES (?, ?, ?, 1)
    `
      )
      .run(userId, telegramChatId, chatName);
  }

  /**
   * Проверить имеет ли пользователь доступ к чату
   */
  async hasAccessToChat(
    userId: number,
    telegramChatId: number
  ): Promise<boolean> {
    const chat = this.db
      .prepare(
        `
      SELECT id FROM katya_user_chats
      WHERE user_id = ? AND telegram_chat_id = ? AND is_active = 1
    `
      )
      .get(userId, telegramChatId);

    return !!chat;
  }

  /**
   * Получить все чаты пользователя
   */
  async getUserChats(userId: number): Promise<UserChat[]> {
    return this.db
      .prepare(
        `
      SELECT
        telegram_chat_id,
        chat_name,
        created_at,
        (SELECT COUNT(*) FROM chat_messages
         WHERE user_id = ? AND telegram_chat_id = k.telegram_chat_id) as message_count
      FROM katya_user_chats k
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `
      )
      .all(userId, userId) as UserChat[];
  }
}

interface UserChat {
  telegram_chat_id: number;
  chat_name: string;
  created_at: number;
  message_count: number;
}
```

---

## 💾 СХЕМА БАЗЫ ДАННЫХ (SQLite)

### Новые таблицы Кати (добавить в ozon_manager.db)

```sql
-- 1. Чаты пользователей (связь user ↔ telegram chat)
CREATE TABLE IF NOT EXISTS katya_user_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  chat_name TEXT NOT NULL,
  chat_type TEXT DEFAULT 'group', -- 'group', 'supergroup', 'private'
  is_active BOOLEAN DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, telegram_chat_id)
);

CREATE INDEX idx_user_chats_user ON katya_user_chats(user_id);
CREATE INDEX idx_user_chats_telegram ON katya_user_chats(telegram_chat_id);

-- 2. История сообщений чатов (с изоляцией по user_id!)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- владелец данных (изоляция!)
  telegram_chat_id BIGINT NOT NULL,
  message_id BIGINT NOT NULL,
  telegram_user_id BIGINT, -- кто отправил сообщение
  username TEXT,
  first_name TEXT,
  text TEXT NOT NULL,
  reply_to_message_id BIGINT,
  is_katya_mention BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, telegram_chat_id, message_id)
);

CREATE INDEX idx_messages_user_chat ON chat_messages(user_id, telegram_chat_id, created_at DESC);
CREATE INDEX idx_messages_mention ON chat_messages(user_id, telegram_chat_id, is_katya_mention);

-- 3. Суммаризированные контексты (с изоляцией!)
CREATE TABLE IF NOT EXISTS chat_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  summary_text TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  start_message_id BIGINT,
  end_message_id BIGINT,
  keywords TEXT, -- JSON array
  topics TEXT,   -- JSON array
  decisions TEXT, -- JSON array
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_summaries_user_chat ON chat_summaries(user_id, telegram_chat_id, created_at DESC);

-- 4. Контексты обсуждений / решения (с изоляцией!)
CREATE TABLE IF NOT EXISTS chat_contexts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  keywords TEXT, -- JSON
  ref_message_ids TEXT, -- JSON array
  decision TEXT,
  decided_by TEXT,
  decided_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_contexts_user_chat ON chat_contexts(user_id, telegram_chat_id);
CREATE INDEX idx_contexts_topic ON chat_contexts(topic);

-- 5. База знаний Q&A (с изоляцией!)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_message_ids TEXT, -- JSON
  context_id INTEGER,
  created_by TEXT,
  relevance_score REAL DEFAULT 1.0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (context_id) REFERENCES chat_contexts(id) ON DELETE SET NULL
);

CREATE INDEX idx_knowledge_user_chat ON knowledge_base(user_id, telegram_chat_id);

-- 6. История запросов Кати с платформы (для биллинга)
CREATE TABLE IF NOT EXISTS katya_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  telegram_chat_id BIGINT,
  request_type TEXT NOT NULL, -- 'summarize', 'search', 'question'
  request_data TEXT, -- JSON
  response_data TEXT, -- JSON
  cost_bt REAL NOT NULL,
  cost_rub REAL NOT NULL,
  duration_ms INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_requests_user ON katya_requests(user_id, created_at DESC);
CREATE INDEX idx_requests_type ON katya_requests(request_type);

-- 7. Настройки Кати для пользователей
CREATE TABLE IF NOT EXISTS katya_user_settings (
  user_id INTEGER PRIMARY KEY,
  telegram_enabled BOOLEAN DEFAULT 1,
  platform_chat_enabled BOOLEAN DEFAULT 0, -- пока отключено
  auto_summarize BOOLEAN DEFAULT 0,
  auto_summarize_threshold INTEGER DEFAULT 100,
  context_window INTEGER DEFAULT 50,
  ai_model TEXT DEFAULT 'gpt-4o-mini', -- fallback если gpt-5-nano не доступен
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Миграция (добавить в katya-service)

```typescript
// src/database/migrations.ts
import Database from "better-sqlite3";

export function runKatyaMigrations(db: Database.Database): void {
  // WAL mode для производительности
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");

  // Выполнить все CREATE TABLE IF NOT EXISTS ... (см. выше)

  console.log("✅ Миграции Кати выполнены успешно");
}
```

---

## 🤖 AI ИНТЕГРАЦИЯ ЧЕРЕЗ ПЛАТФОРМУ

### PlatformGPTService (проксирование к /api/ai/chatgpt)

```typescript
// src/services/platform-gpt.service.ts
import axios, { AxiosInstance } from "axios";

export class PlatformGPTService {
  private client: AxiosInstance;
  private apiGatewayUrl: string;

  constructor(apiGatewayUrl: string = "https://boss-ai.online") {
    this.apiGatewayUrl = apiGatewayUrl;

    this.client = axios.create({
      baseURL: this.apiGatewayUrl,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        "X-Service": "katya-ai",
      },
    });
  }

  /**
   * Суммаризация через платформенный GPT
   * Биллинг списывается автоматически через middleware платформы!
   */
  async summarize(
    messages: string[],
    userToken: string,
    context?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildSummarizationPrompt(messages, context);

    try {
      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-4o-mini", // или 'gpt-5-nano' когда доступен
            temperature: 0.3,
            max_tokens: 2000,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`, // Токен пользователя!
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "AI request failed");
      }

      // Парсим ответ
      const content = response.data.data.choices[0].message.content;

      // Извлекаем структурированные данные (примитивно)
      return {
        summary: content,
        topics: this.extractTopics(content),
        decisions: this.extractDecisions(content),
        keywords: this.extractKeywords(content),
      };
    } catch (error: any) {
      console.error("Ошибка суммаризации:", error);

      if (error.response?.status === 402) {
        throw new Error("Insufficient funds");
      }

      throw error;
    }
  }

  /**
   * Поиск по истории + AI ранжирование
   */
  async searchAndRank(
    query: string,
    searchResults: string[],
    userToken: string
  ): Promise<string> {
    const prompt = this.buildSearchPrompt(query, searchResults);

    try {
      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-4o-mini",
            temperature: 0.5,
            max_tokens: 1500,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return response.data.data.choices[0].message.content;
    } catch (error: any) {
      console.error("Ошибка поиска:", error);
      throw error;
    }
  }

  /**
   * Ответ на вопрос
   */
  async answer(
    question: string,
    context: string[],
    userToken: string
  ): Promise<string> {
    const prompt = this.buildQuestionPrompt(question, context);

    try {
      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: 1000,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return response.data.data.choices[0].message.content;
    } catch (error: any) {
      console.error("Ошибка ответа:", error);
      throw error;
    }
  }

  // Промпты
  private buildSummarizationPrompt(
    messages: string[],
    context?: string
  ): string {
    return `Ты - Катя, AI-ассистент команды Boss AI.
Твоя задача - суммаризировать обсуждения команды.

Контекст: ${context || "Общее обсуждение"}

Сообщения (${messages.length} шт.):
${messages.join("\n---\n")}

Выдели:
- Краткое резюме (2-3 предложения)
- Основные темы обсуждения
- Принятые решения (кто решил, когда)
- Нерешенные вопросы
- Ключевые слова

Ответ дай структурированно.`;
  }

  private buildSearchPrompt(query: string, results: string[]): string {
    return `Вопрос пользователя: "${query}"

Найденные обсуждения:
${results.map((r, i) => `${i + 1}. ${r}`).join("\n\n")}

Проанализируй и дай краткий ответ с отсылками к источникам.`;
  }

  private buildQuestionPrompt(question: string, context: string[]): string {
    return `Ты - Катя. Ответь на вопрос на основе контекста команды.

Вопрос: ${question}

Контекст из истории:
${context.join("\n---\n")}

Дай краткий и точный ответ.`;
  }

  // Утилиты
  private extractTopics(text: string): string[] {
    // Примитивное извлечение (улучшить!)
    const matches = text.match(/темы?:?\s*([^\n]+)/i);
    if (matches) {
      return matches[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }

  private extractDecisions(text: string): Array<{ decision: string }> {
    // Примитивное извлечение (улучшить!)
    const matches = text.match(/решени[яе]:?\s*([^\n]+)/i);
    if (matches) {
      return [{ decision: matches[1].trim() }];
    }
    return [];
  }

  private extractKeywords(text: string): string[] {
    // Примитивное извлечение (улучшить!)
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(words)].slice(0, 5);
  }
}

interface SummaryResult {
  summary: string;
  topics: string[];
  decisions: Array<{ decision: string }>;
  keywords: string[];
}
```

---

## 📱 TELEGRAM BOT

### Telegram Bot с авторизацией пользователей

```typescript
// src/telegram/bot.ts
import TelegramBot from "node-telegram-bot-api";
import Database from "better-sqlite3";
import { PlatformGPTService } from "../services/platform-gpt.service";
import { UserChatMappingService } from "../services/user-chat-mapping.service";
import { MessagesRepository } from "../database/repositories/messages.repo";

export class KatyaTelegramBot {
  private bot: TelegramBot;
  private db: Database.Database;
  private platformGPT: PlatformGPTService;
  private userChatMapping: UserChatMappingService;
  private messagesRepo: MessagesRepository;

  constructor(botToken: string, dbPath: string, apiGatewayUrl: string) {
    this.bot = new TelegramBot(botToken, { polling: true });
    this.db = new Database(dbPath);
    this.platformGPT = new PlatformGPTService(apiGatewayUrl);
    this.userChatMapping = new UserChatMappingService(this.db);
    this.messagesRepo = new MessagesRepository(this.db);

    this.setupHandlers();
    console.log("✅ Telegram бот Катя запущен");
  }

  private setupHandlers() {
    // Логирование всех сообщений
    this.bot.on("message", async (msg) => {
      try {
        // Получить platform user_id по telegram_id
        const userId = await this.userChatMapping.getPlatformUserId(
          msg.from!.id
        );

        if (!userId) {
          // Пользователь не авторизован на платформе
          console.log(`Пользователь ${msg.from!.id} не найден в платформе`);
          return;
        }

        // Сохранить сообщение
        await this.messagesRepo.create({
          userId,
          telegramChatId: msg.chat.id,
          messageId: msg.message_id,
          telegramUserId: msg.from!.id,
          username: msg.from!.username || "unknown",
          firstName: msg.from!.first_name,
          text: msg.text || "",
          isKatyaMention: this.isMentioned(msg.text),
        });
      } catch (error) {
        console.error("Ошибка сохранения сообщения:", error);
      }
    });

    // Обработка добавления бота в чат
    this.bot.on("my_chat_member", async (update) => {
      if (
        update.new_chat_member.status === "member" ||
        update.new_chat_member.status === "administrator"
      ) {
        // Бот добавлен в чат
        const addedBy = update.from;
        const chat = update.chat;

        const userId = await this.userChatMapping.getPlatformUserId(addedBy.id);

        if (!userId) {
          await this.bot.sendMessage(
            chat.id,
            `⚠️ Чтобы использовать Катю, сначала авторизуйтесь на https://boss-ai.online через Telegram Login`
          );
          return;
        }

        // Зарегистрировать чат для пользователя
        await this.userChatMapping.registerUserChat(
          userId,
          chat.id,
          chat.title || "Private chat"
        );

        await this.bot.sendMessage(
          chat.id,
          `👋 Привет! Я Катя - AI-ассистент команды Boss AI.\n\n` +
            `Я могу:\n` +
            `📊 Суммаризировать обсуждения (@Катя подведи итоги)\n` +
            `🔍 Искать в истории (/search запрос)\n` +
            `💬 Отвечать на вопросы\n` +
            `✅ Показывать принятые решения (/decisions)\n\n` +
            `Упомяните меня в чате (@Катя) или используйте команды!`
        );
      }
    });

    // Обработка @Катя упоминаний
    this.bot.on("message", async (msg) => {
      if (!this.isMentioned(msg.text)) return;

      try {
        const userId = await this.userChatMapping.getPlatformUserId(
          msg.from!.id
        );

        if (!userId) {
          await this.bot.sendMessage(
            msg.chat.id,
            "⚠️ Сначала авторизуйтесь на https://boss-ai.online",
            { reply_to_message_id: msg.message_id }
          );
          return;
        }

        // Проверить доступ к чату
        const hasAccess = await this.userChatMapping.hasAccessToChat(
          userId,
          msg.chat.id
        );

        if (!hasAccess) {
          await this.bot.sendMessage(
            msg.chat.id,
            "⚠️ У вас нет доступа к этому чату",
            { reply_to_message_id: msg.message_id }
          );
          return;
        }

        await this.bot.sendChatAction(msg.chat.id, "typing");

        // Получить последние сообщения (с изоляцией!)
        const messages = await this.messagesRepo.getLastMessages(
          userId,
          msg.chat.id,
          50
        );

        // ⚠️ ПРОБЛЕМА: У нас нет platform token для этого пользователя!
        // Решение: использовать SYSTEM_TOKEN (без биллинга для TG режима)
        // ИЛИ: требовать связывание TG с платформой и хранить токены

        const systemToken = process.env.SYSTEM_TOKEN || "";

        const summary = await this.platformGPT.summarize(
          messages.map((m) => `${m.username}: ${m.text}`),
          systemToken, // ⚠️ Без биллинга (system token)
          msg.text
        );

        await this.bot.sendMessage(msg.chat.id, this.formatSummary(summary), {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
      } catch (error: any) {
        console.error("Ошибка обработки @Катя:", error);
        await this.bot.sendMessage(msg.chat.id, `⚠️ Ошибка: ${error.message}`, {
          reply_to_message_id: msg.message_id,
        });
      }
    });

    // Команды
    this.bot.onText(/\/summary/, (msg) => this.handleSummaryCommand(msg));
    this.bot.onText(/\/search (.+)/, (msg, match) =>
      this.handleSearchCommand(msg, match)
    );
    this.bot.onText(/\/decisions/, (msg) => this.handleDecisionsCommand(msg));
  }

  private isMentioned(text?: string): boolean {
    if (!text) return false;
    return (
      text.includes("@Катя") ||
      text.includes("@Katya") ||
      text.includes("@katya_boss_ai_bot")
    );
  }

  private formatSummary(summary: SummaryResult): string {
    return (
      `📊 *Суммаризация обсуждения*\n\n` +
      `${summary.summary}\n\n` +
      `🔑 *Ключевые темы:*\n${summary.topics
        .map((t) => `• ${t}`)
        .join("\n")}\n\n` +
      `✅ *Решения:*\n${
        summary.decisions.map((d) => `• ${d.decision}`).join("\n") || "Нет"
      }`
    );
  }

  private async handleSummaryCommand(msg: TelegramBot.Message) {
    // Аналогично @Катя mention
  }

  private async handleSearchCommand(
    msg: TelegramBot.Message,
    match: RegExpExecArray | null
  ) {
    const query = match?.[1];
    if (!query) return;

    const userId = await this.userChatMapping.getPlatformUserId(msg.from!.id);
    if (!userId) return;

    // Поиск по сообщениям (с изоляцией!)
    const results = await this.messagesRepo.search(
      userId,
      msg.chat.id,
      query,
      10
    );

    if (results.length === 0) {
      await this.bot.sendMessage(msg.chat.id, "❌ Ничего не найдено");
      return;
    }

    const response =
      `🔍 *Результаты поиска:*\n\n` +
      results
        .map((r, i) => `${i + 1}. ${r.text.substring(0, 100)}...`)
        .join("\n\n");

    await this.bot.sendMessage(msg.chat.id, response, {
      parse_mode: "Markdown",
    });
  }

  private async handleDecisionsCommand(msg: TelegramBot.Message) {
    const userId = await this.userChatMapping.getPlatformUserId(msg.from!.id);
    if (!userId) return;

    // Получить решения (с изоляцией!)
    const decisions = await this.db
      .prepare(
        `
      SELECT decision, decided_by, decided_at
      FROM chat_contexts
      WHERE user_id = ? AND telegram_chat_id = ? AND decision IS NOT NULL
      ORDER BY decided_at DESC
      LIMIT 10
    `
      )
      .all(userId, msg.chat.id);

    if (decisions.length === 0) {
      await this.bot.sendMessage(msg.chat.id, "✅ Пока нет принятых решений");
      return;
    }

    const response =
      `✅ *Принятые решения:*\n\n` +
      decisions
        .map((d: any, i) => `${i + 1}. ${d.decision}\n   _by ${d.decided_by}_`)
        .join("\n\n");

    await this.bot.sendMessage(msg.chat.id, response, {
      parse_mode: "Markdown",
    });
  }
}
```

---

## 🔌 BACKEND API ENDPOINTS

### Структура Katya Service

```
backend/katya-service/
├── src/
│   ├── index.ts                # Express server (port 4300)
│   ├── config/index.ts         # Конфигурация
│   ├── routes/
│   │   ├── summarize.route.ts  # POST /summarize
│   │   ├── search.route.ts     # POST /search
│   │   ├── question.route.ts   # POST /question
│   │   ├── decisions.route.ts  # GET /decisions
│   │   ├── settings.route.ts   # GET/PUT /settings
│   │   └── health.route.ts     # GET /health
│   ├── telegram/
│   │   └── bot.ts              # Telegram Bot
│   ├── services/
│   │   ├── platform-gpt.service.ts
│   │   ├── user-chat-mapping.service.ts
│   │   └── context-manager.service.ts
│   ├── database/
│   │   ├── connection.ts
│   │   ├── migrations.ts
│   │   └── repositories/
│   │       ├── messages.repo.ts
│   │       ├── summaries.repo.ts
│   │       └── contexts.repo.ts
│   └── utils/
│       ├── logger.ts
│       └── prompts.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### API Routes (примеры)

```typescript
// src/routes/summarize.route.ts
import { Router, Request, Response } from "express";
import { PlatformGPTService } from "../services/platform-gpt.service";
import { MessagesRepository } from "../database/repositories/messages.repo";

const router = Router();
const platformGPT = new PlatformGPTService();
const messagesRepo = new MessagesRepository();

/**
 * POST /summarize
 * Суммаризация обсуждений с изоляцией по user_id
 */
router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const { telegramChatId, messageCount = 50, query } = req.body;
    const userId = (req as any).user.id; // из authenticateToken middleware
    const userToken = req.headers.authorization?.replace("Bearer ", "");

    if (!userToken) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Получить сообщения (С ИЗОЛЯЦИЕЙ!)
    const messages = await messagesRepo.getLastMessages(
      userId,
      telegramChatId,
      messageCount
    );

    if (messages.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: "Нет сообщений для суммаризации",
          topics: [],
          decisions: [],
          keywords: [],
        },
      });
    }

    // Суммаризация через платформу
    const summary = await platformGPT.summarize(
      messages.map((m) => `${m.username}: ${m.text}`),
      userToken,
      query
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("Summarize error:", error);

    if (error.message === "Insufficient funds") {
      return res.status(402).json({
        success: false,
        error: "Insufficient funds",
        message: "Недостаточно средств. Пополните баланс BT токенов.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
```

---

## 💰 БИЛЛИНГ

### Pricing для Кати

```sql
-- Добавить в service_pricing
INSERT OR IGNORE INTO service_pricing (service_name, unit_type, price_per_unit, currency, is_active) VALUES
  ('katya_summarize', 'request', 5.0, 'RUB', 1),  -- стоимость /api/ai/chatgpt
  ('katya_search', 'request', 2.0, 'RUB', 1),
  ('katya_question', 'request', 3.0, 'RUB', 1);
```

### Биллинг для Telegram режима

**Проблема:** У Telegram сообщений НЕТ platform token → НЕТ биллинга!

**Решения:**

**Вариант A (простой, для MVP):**

- Использовать `SYSTEM_TOKEN` для TG режима
- **НЕ списывать** деньги за TG запросы
- Telegram бот = бесплатный (для привлечения пользователей)

**Вариант B (правильный, для production):**

- Требовать связывание TG аккаунта с платформой
- Хранить `platform_token` для каждого `telegram_id`
- Списывать как обычно

**Рекомендация для MVP:** Вариант A (бесплатный TG бот)

---

## 🚀 DEPLOYMENT

### PM2 конфигурация

```javascript
// ecosystem.config.js (добавить)
{
  name: "boss-ai-katya-service",
  script: "dist/index.js",
  cwd: "/var/www/boss-ai/backend/katya-service",
  instances: 1,
  exec_mode: "fork",
  env: {
    NODE_ENV: "production",
    PORT: 4300,

    // Database (shared с платформой)
    DB_PATH: "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db",

    // API Gateway
    API_GATEWAY_URL: "https://boss-ai.online",

    // Telegram Bot
    TELEGRAM_BOT_TOKEN: "<получить от @BotFather>",
    TELEGRAM_BOT_USERNAME: "katya_boss_ai_bot",

    // System Token (для TG без биллинга)
    SYSTEM_TOKEN: "<взять из платформы>",

    // Logging
    LOG_LEVEL: "info"
  },
  error_file: "./logs/katya_err.log",
  out_file: "./logs/katya_out.log",
  time: true,
  autorestart: true,
  watch: false,
  max_memory_restart: "512M"
}
```

### API Gateway Integration

```typescript
// backend/main/src/routes/katya.routes.ts (НОВЫЙ ФАЙЛ!)
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { ProxyClient } from "../utils/proxy";

const router = Router();

const createKatyaProxy = (): ProxyClient => {
  return new ProxyClient({
    baseURL: process.env.KATYA_SERVICE_URL || "http://localhost:4300",
    timeout: 60000,
    headers: {
      "X-Service": "katya-ai",
    },
  });
};

const katyaProxy = createKatyaProxy();

/**
 * Проксирование всех запросов к Кате
 * Middleware: authenticateToken (для токена user)
 */
router.use("/api/katya/*", authenticateToken, async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/katya", "");

    const result = await katyaProxy.request(
      req.method as any,
      targetPath,
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization, // Передаем токен!
        },
      }
    );

    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json(
      error.data || {
        success: false,
        error: error.message,
      }
    );
  }
});

export default router;
```

Добавить в `backend/main/src/index.ts`:

```typescript
import katyaRoutes from "./routes/katya.routes";

// В setupRoutes():
this.app.use(katyaRoutes);
```

---

## ✅ ЧЕКЛИСТ РАЗРАБОТКИ

### Этап 1: Backend Core (3-4 дня)

- [ ] Инициализация Express server (port 4300)
- [ ] Подключение к SQLite БД (shared с платформой)
- [ ] Миграции новых таблиц (с user_id изоляцией!)
- [ ] Health check endpoint
- [ ] Logger setup

### Этап 2: PlatformGPTService (2 дня)

- [ ] Класс `PlatformGPTService`
- [ ] Метод `summarize()` через `/api/ai/chatgpt`
- [ ] Метод `searchAndRank()`
- [ ] Метод `answer()`
- [ ] Промпты для GPT
- [ ] Обработка ошибок (402 Insufficient funds)

### Этап 3: UserChatMappingService (1 день)

- [ ] Класс `UserChatMappingService`
- [ ] Метод `getPlatformUserId(telegram_id)`
- [ ] Метод `registerUserChat()`
- [ ] Метод `hasAccessToChat()`
- [ ] Метод `getUserChats()`

### Этап 4: Database Repositories (2 дня)

- [ ] `MessagesRepository` - CRUD с изоляцией
- [ ] `SummariesRepository` - CRUD с изоляцией
- [ ] `ContextsRepository` - CRUD с изоляцией
- [ ] All queries: `WHERE user_id = ? AND telegram_chat_id = ?`

### Этап 5: API Routes (2 дня)

- [ ] POST `/summarize` с изоляцией
- [ ] POST `/search` с изоляцией
- [ ] POST `/question` с изоляцией
- [ ] GET `/decisions` с изоляцией
- [ ] GET/PUT `/settings`

### Этап 6: Telegram Bot (3-4 дня)

- [ ] Инициализация бота (polling)
- [ ] Handler: `my_chat_member` (добавление в чат)
- [ ] Handler: `message` (логирование)
- [ ] Handler: @Катя упоминания
- [ ] Команды: `/summary`, `/search`, `/decisions`
- [ ] Проверка авторизации пользователей
- [ ] Изоляция данных по user_id

### Этап 7: API Gateway Proxy (1 день)

- [ ] Добавить `/api/katya/*` роуты в API Gateway
- [ ] Прокси к Katya Service (port 4300)
- [ ] Применить authenticateToken middleware

### Этап 8: PM2 & Deployment (1 день)

- [ ] Конфигурация PM2 для katya-service
- [ ] .env.example с комментариями
- [ ] README.md и INTEGRATION.md
- [ ] Тестирование на dev окружении

### Этап 9: Testing (2-3 дня)

- [ ] Unit тесты для PlatformGPTService
- [ ] Integration тесты для routes
- [ ] Тестирование Telegram бота
- [ ] Тестирование изоляции данных
- [ ] E2E тесты

**Итого:** ~17-20 дней разработки

---

## 📦 DELIVERABLES ДЛЯ НИКОЛАЯ

После разработки Николай должен прислать:

### 1. katya-service.tar.gz

```
katya-service/
├── dist/                  # Compiled JavaScript
├── node_modules/          # Dependencies
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
├── README.md
└── INTEGRATION.md
```

### 2. katya-service.json (для frontend/public/services/)

```json
{
  "id": "katya-ai-service",
  "name": "Катя AI",
  "description": "AI-ассистент с распределенной памятью команды",
  "icon": "Brain",
  "version": "1.0.0",
  "isActive": true,
  "category": "ai",
  "priority": 2,
  "author": "Николай для BOSS AI Team",
  "tools": [
    {
      "id": "summarize-chat",
      "name": "📊 Суммаризация",
      "description": "Подводит итоги обсуждений",
      "icon": "FileText",
      "action": "summarize",
      "isEnabled": true,
      "category": "analysis",
      "isChatFunction": true,
      "chatPrompt": "Подведи итоги: {userInput}",
      "chatApiEndpoint": "/api/katya/summarize",
      "pricing": {
        "type": "per_request",
        "cost_bt": 0.5,
        "cost_rub": 5.0
      }
    }
  ],
  "telegram": {
    "enabled": true,
    "bot_username": "katya_boss_ai_bot"
  }
}
```

### 3. migrations.sql

```sql
-- SQL миграции для добавления таблиц Кати
-- (см. раздел "СХЕМА БАЗЫ ДАННЫХ")
```

### 4. INTEGRATION.md

```markdown
# Интеграция Katya Service в Boss AI Platform

## 1. Распаковать архив

\`\`\`bash
cd /var/www/boss-ai/backend
mkdir katya-service
cd katya-service
tar -xzf ~/katya-service.tar.gz
\`\`\`

## 2. Настроить .env

\`\`\`bash
cp .env.example .env
nano .env
\`\`\`

Заполнить:
\`\`\`env
TELEGRAM_BOT_TOKEN=<от @BotFather>
DB_PATH=/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db
API_GATEWAY_URL=https://boss-ai.online
SYSTEM_TOKEN=<взять из платформы>
\`\`\`

## 3. Запустить миграции БД

\`\`\`bash
sqlite3 /var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db < migrations.sql
\`\`\`

## 4. Добавить в PM2

(см. раздел DEPLOYMENT)

## 5. Обновить API Gateway

(см. раздел API Gateway Integration)

## 6. Проверка

\`\`\`bash
curl http://localhost:4300/health
pm2 logs boss-ai-katya-service --lines 50
\`\`\`
```

---

## 🎯 КЛЮЧЕВЫЕ ОСОБЕННОСТИ v5.0

### Что изменено по сравнению с предыдущими версиями:

1. ✅ **SQLite вместо PostgreSQL**

   - Не мигрировать всю платформу
   - Shared БД с платформой
   - Проще и быстрее

2. ✅ **Многопользовательская изоляция**

   - Каждая таблица с `user_id`
   - `telegram_chat_id` для множественных чатов
   - `WHERE user_id = ? AND telegram_chat_id = ?`

3. ✅ **Интеграция с существующей авторизацией**

   - Использование таблицы `users` (уже есть!)
   - Mapping: `telegram_id` → `user_id`
   - Проверка доступа к чатам

4. ✅ **Упрощенная архитектура (MVP)**

   - ❌ Убрано: PostgreSQL, Mini App, Knowledge Graph
   - ✅ Оставлено: Core функционал, Telegram Bot, Billing

5. ✅ **Проксирование к платформе**

   - Все AI запросы через `/api/ai/chatgpt`
   - Один OpenAI ключ
   - Централизованный биллинг

6. ✅ **Поддержка множественных чатов**
   - User может добавить Катю в разные чаты
   - Каждый чат независимый
   - Изолированная история

---

## 💡 ROADMAP (Phase 2)

### После MVP:

- 📊 **Platform Chat** - интеграция в Boss AI интерфейс
- 🔍 **Semantic Search** - векторный поиск (pgvector)
- 🕸️ **Knowledge Graph** - граф связей
- 📱 **Telegram Mini App** - визуализация
- 💰 **Billing для TG** - связывание TG ↔ platform токенов
- 🔔 **Проактивные подсказки** - автоматические напоминания
- 📤 **Export** - PDF/Markdown экспорт знаний

---

## 📋 ЧТО НУЖНО ОТ @BOSS ПЕРЕД СТАРТОМ

### Для Николая:

1. **Доступ к тестовому серверу** (staging environment)

   - URL: `https://staging.boss-ai.online` или `https://boss-ai.online`
   - SSH доступ для деплоя

2. **Тестовый platform token**

   - Для тестирования `/api/ai/chatgpt`
   - Получить через авторизацию

3. **Копия БД для тестирования**

   - `ozon_manager.db` с тестовыми данными
   - Или доступ к dev БД

4. **Telegram Bot Token**

   - Создать через @BotFather
   - `katya_test_bot` для разработки

5. **System Token**

   - Для TG режима без биллинга
   - Получить у @boss

6. **Примеры кода** (опционально)
   - `backend/ozon-manager/` - структура микросервиса
   - `backend/main/src/routes/ai.routes.ts` - как работает GPT endpoint

---

## 🌐 ВЕБ-ИНТЕРФЕЙС ДЛЯ ПРОСМОТРА ЧАТОВ (УЖЕ РЕАЛИЗОВАНО!)

### Описание

В Boss AI Platform уже добавлен **веб-интерфейс для просмотра Telegram чатов с Катей**. Пользователи могут:

- Видеть список всех своих TG чатов, где добавлена Катя
- Просматривать историю сообщений каждого чата
- Запрашивать суммаризацию через AI (с списанием BT токенов)
- Видеть статистику: количество сообщений, упоминаний Кати, топ участников

### Backend API Endpoints (уже работают)

```
GET  /api/katya-chats                      - Список всех чатов пользователя
GET  /api/katya-chats/:chatId              - Детали конкретного чата
GET  /api/katya-chats/:chatId/messages     - История сообщений (с пагинацией)
GET  /api/katya-chats/:chatId/stats        - Статистика чата
POST /api/katya-chats/:chatId/summarize    - Суммаризация чата через AI
```

**Важно:** Эти endpoints уже подключены к API Gateway и работают! Но они будут возвращать пустые данные до тех пор, пока Николай не создаст таблицы и Telegram бот не начнет логировать сообщения.

### Требуемые таблицы в БД

Telegram бот должен создать эти таблицы:

```sql
-- 1. Связь пользователей платформы с их TG чатами
CREATE TABLE IF NOT EXISTS katya_user_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  telegram_chat_id BIGINT NOT NULL,
  chat_name TEXT NOT NULL,
  chat_type TEXT NOT NULL CHECK(chat_type IN ('private', 'group', 'supergroup', 'channel')),
  is_active BOOLEAN DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, telegram_chat_id)
);

-- 2. История всех сообщений в чатах
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  telegram_chat_id BIGINT NOT NULL,
  message_id BIGINT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  username TEXT,
  first_name TEXT,
  text TEXT NOT NULL,
  is_katya_mention BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(telegram_chat_id, message_id)
);

CREATE INDEX idx_chat_messages_user_chat ON chat_messages(user_id, telegram_chat_id, created_at DESC);
CREATE INDEX idx_chat_messages_mentions ON chat_messages(is_katya_mention, user_id, telegram_chat_id);
```

### Frontend компоненты (уже реализованы)

1. **`KatyaChats.tsx`** - страница со списком чатов

   - Показывает все TG чаты пользователя с Катей
   - Карточки с названием, типом чата, количеством сообщений
   - Кнопки "Открыть чат" и "Суммаризировать"
   - Empty state с инструкцией, если чатов нет

2. **`KatyaChatInterface.tsx`** - интерфейс просмотра чата

   - История сообщений с пагинацией (lazy loading)
   - Выделение @Катя упоминаний
   - Статистика чата (сообщения, участники, активность)
   - Кнопка суммаризации с проверкой баланса BT

3. **Кнопка "🧠 Катя чаты" в Sidebar**
   - Добавлена в левую боковую панель
   - Переключает на секцию `katya-chats`

### Логика работы

1. **Пользователь заходит на платформу** → авторизуется через Telegram Login Widget
2. **Пользователь добавляет @katya_boss_ai_bot в TG чат** → бот создает запись в `katya_user_chats`
3. **Бот логирует все сообщения** → сохраняет в `chat_messages` с `user_id` и `telegram_chat_id`
4. **Пользователь открывает "Катя чаты" на платформе** → видит список своих чатов
5. **Пользователь кликает "Суммаризировать"** → запрос к `/api/ai/chatgpt`, списание BT токенов

### Интеграция с биллингом

- **Стоимость суммаризации:** 0.5 BT за запрос
- Проверка баланса перед AI запросом
- Автоматическое списание средств
- Обработка ошибки 402 (недостаточно средств)

### Что нужно сделать Николаю

1. **Создать таблицы** `katya_user_chats` и `chat_messages` в `ozon_manager.db`
2. **В Telegram боте при получении сообщения:**
   - Определить `user_id` из платформы (связка TG ↔ platform)
   - Сохранить сообщение в `chat_messages`
   - Если чат новый → создать запись в `katya_user_chats`
3. **Тестировать веб-интерфейс:**
   - Авторизоваться на https://boss-ai.online
   - Открыть "🧠 Катя чаты" в Sidebar
   - Увидеть свои чаты (если бот логировал сообщения)

### Файлы для изучения

- `backend/main/src/routes/katya-chats.routes.ts` - API endpoints
- `frontend/src/pages/KatyaChats.tsx` - список чатов
- `frontend/src/pages/KatyaChatInterface.tsx` - интерфейс чата
- `frontend/src/components/Sidebar/Sidebar.tsx` - кнопка в меню

---

## ❓ FAQ

### Q: Почему SQLite, а не PostgreSQL?

**A:** Проще интеграция, меньше изменений в платформе, SQLite WAL mode достаточно для MVP.

### Q: Как работает изоляция данных?

**A:** Каждая таблица имеет `user_id`. Все запросы с `WHERE user_id = ?`. User видит только свои данные.

### Q: Что если пользователь не авторизован на платформе?

**A:** Telegram бот скажет авторизоваться на https://boss-ai.online через Telegram Login Widget.

### Q: Как биллинг для Telegram режима?

**A:** MVP: бесплатно (system token). Production: связывание TG ↔ platform + обычный биллинг.

### Q: Можно ли добавить Катю в несколько чатов?

**A:** Да! `katya_user_chats` хранит связь `user_id` ↔ `telegram_chat_id`. Каждый чат независимый.

### Q: Где хранится история сообщений?

**A:** В `chat_messages` с полями `user_id` + `telegram_chat_id` для изоляции.

---

**🎯 ТЗ v5.0 FINAL готово к реализации!**

**Ключевые преимущества:**

- ✅ Простая архитектура (SQLite, shared DB)
- ✅ Правильная многопользовательская изоляция
- ✅ Множественные чаты на пользователя
- ✅ Интеграция с существующей авторизацией
- ✅ Централизованный биллинг через платформу
- ✅ Telegram Bot + Platform API (dual mode)

**Николай, успехов в разработке! 🚀**

**Вопросы:** @boss в чате Boss AI
