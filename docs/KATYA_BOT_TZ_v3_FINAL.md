# 📋 ТЕХНИЧЕСКОЕ ЗАДАНИЕ v3.0 FINAL: Telegram Bot "Катя" для Boss AI Platform

**Разработчик:** Николай
**Дата:** 20 октября 2025
**Версия:** 3.0 FINAL (оптимизированная)
**Статус:** Готово к реализации 🚀

---

## 🎯 ЦЕЛЬ ПРОЕКТА

Разработать **Telegram бота "Катя"** как микросервис платформы Boss AI с функцией **распределенной памяти команды** (Institutional Knowledge), который:

1. **Работает в двух режимах:**

   - 📱 **Telegram Bot** - отвечает в TG чатах на @Катя
   - 💬 **Платформенный чат** - доступен через интерфейс Boss AI

2. **Использует существующую инфраструктуру:**

   - ✅ Проксирует запросы к GPT через `/api/ai/chatgpt` (уже настроен GPT-5 nano)
   - ✅ Использует единую БД Boss AI (SQLite, WAL mode)
   - ✅ Интегрирован с биллингом через `service_pricing`

3. **Оптимизирован по расходам:**
   - 💰 Переиспользование OpenAI API ключа платформы
   - ⚡ Кэширование частых запросов
   - 🎯 Умная суммаризация (только при необходимости)

---

## 🏗️ АРХИТЕКТУРА (ОПТИМИЗИРОВАННАЯ)

### Текущая инфраструктура Boss AI:

```
Boss AI Platform (Production)
├── Frontend (React + Vite) → https://boss-ai.online
├── API Gateway (Node.js, port 3000)
│   ├── /api/auth/* - авторизация (Telegram Login)
│   ├── /api/billing/* - биллинг (BT токены)
│   ├── /api/ai/chatgpt - GPT-5 nano (уже настроен!) ✅
│   ├── /api/ozon/* - прокси к Ozon Manager
│   └── /api/katya/* - прокси к Katya Service (добавить)
├── Ozon Manager (Node.js, port 4200)
└── Database: SQLite WAL
    └── /var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db
```

### Новая архитектура с Катей (оптимизированная):

```
Katya AI Service (NEW, port 4300)
├── Express API Server
│   ├── /health - health check
│   ├── /summarize - суммаризация через /api/ai/chatgpt ✅
│   ├── /search - поиск в БД + AI ранжирование
│   ├── /question - ответ через /api/ai/chatgpt ✅
│   ├── /decisions - чтение из БД (без AI)
│   └── /settings - настройки пользователя
├── Telegram Bot (polling)
│   ├── @Катя упоминания
│   ├── Команды: /summary, /search, /decisions
│   └── Inline keyboards
├── Context Manager
│   ├── Логирование сообщений в БД
│   ├── Извлечение контекста (последние N сообщений)
│   └── Кэширование частых запросов
└── Database: SHARED SQLite
    └── Новые таблицы: chat_messages, chat_summaries, etc.

API Gateway (обновить)
├── Добавить /api/katya/* proxy → http://localhost:4300
├── Применить authenticateToken middleware
└── Применить billing middleware (переиспользовать!)

Frontend (обновить)
├── Добавить katya-service.json
├── Кнопка "Катя" в чате
└── Компонент KatyaSettings
```

### ⚡ КЛЮЧЕВАЯ ОПТИМИЗАЦИЯ:

**Катя НЕ имеет своего OpenAI клиента!**

Вместо этого:

```typescript
// ❌ ПЛОХО (было в v2.0):
const gpt5Client = new GPT5NanoClient(apiKey); // дублирование!

// ✅ ХОРОШО (v3.0):
const response = await axios.post(
  "http://localhost:3000/api/ai/chatgpt",
  {
    prompt: summarizationPrompt,
    options: { model: "gpt-5-nano", temperature: 0.3 },
  },
  {
    headers: { Authorization: `Bearer ${platformToken}` },
  }
);
// Биллинг списывается автоматически через существующий middleware!
```

**Преимущества:**

- 💰 Один OpenAI API ключ для всей платформы
- 🔒 Централизованный биллинг (нет дублирования)
- 📊 Единая аналитика использования AI
- ⚡ Меньше кода = меньше багов

---

## 📋 СТРУКТУРА СЕРВИСА

### 1. katya-service.json (для frontend/public/services/)

```json
{
  "id": "katya-ai-service",
  "name": "Катя AI",
  "description": "AI-ассистент с распределенной памятью команды. Суммаризирует обсуждения, отвечает на вопросы по истории, помогает новым участникам.",
  "icon": "Brain",
  "version": "1.0.0",
  "isActive": true,
  "category": "ai",
  "priority": 2,
  "author": "Николай для BOSS AI Team",

  "settings": {
    "telegram_enabled": true,
    "platform_chat_enabled": true,
    "auto_summarize": false,
    "context_window": 50,
    "billing_enabled": true
  },

  "tools": [
    {
      "id": "summarize-chat",
      "name": "📊 Суммаризация",
      "description": "Подводит итоги обсуждений и выделяет ключевые решения",
      "icon": "FileText",
      "action": "summarize",
      "isEnabled": true,
      "category": "analysis",
      "isChatFunction": true,
      "chatPrompt": "Подведи итоги обсуждения: {userInput}",
      "chatApiEndpoint": "/api/katya/summarize",
      "pricing": {
        "type": "per_request",
        "cost_bt": 0.5,
        "cost_rub": 5.0
      }
    },
    {
      "id": "search-history",
      "name": "🔍 Поиск по истории",
      "description": "Находит обсуждения и решения из прошлого",
      "icon": "Search",
      "action": "search",
      "isEnabled": true,
      "category": "search",
      "isChatFunction": true,
      "chatPrompt": "Найди в истории: {userInput}",
      "chatApiEndpoint": "/api/katya/search",
      "pricing": {
        "type": "per_request",
        "cost_bt": 0.2,
        "cost_rub": 2.0
      }
    },
    {
      "id": "ask-katya",
      "name": "💬 Спросить Катю",
      "description": "Задать вопрос по контексту команды",
      "icon": "MessageCircle",
      "action": "question",
      "isEnabled": true,
      "category": "chat",
      "isChatFunction": true,
      "chatPrompt": "{userInput}",
      "chatApiEndpoint": "/api/katya/question",
      "pricing": {
        "type": "per_request",
        "cost_bt": 0.3,
        "cost_rub": 3.0
      }
    },
    {
      "id": "show-decisions",
      "name": "✅ Решения команды",
      "description": "Показывает список принятых решений",
      "icon": "CheckCircle",
      "action": "decisions",
      "isEnabled": true,
      "category": "history",
      "isChatFunction": false,
      "apiEndpoint": "/api/katya/decisions",
      "pricing": {
        "type": "free",
        "cost_bt": 0,
        "cost_rub": 0
      }
    },
    {
      "id": "katya-settings",
      "name": "⚙️ Настройки",
      "description": "Настройка параметров работы Кати",
      "icon": "Settings",
      "action": "settings",
      "isEnabled": true,
      "category": "settings",
      "isChatFunction": false,
      "uiComponent": "KatyaSettings"
    }
  ],

  "telegram": {
    "enabled": true,
    "bot_username": "katya_boss_ai_bot",
    "commands": [
      { "command": "/summary", "description": "Суммаризация чата" },
      { "command": "/search", "description": "Поиск по истории" },
      { "command": "/decisions", "description": "Список решений" }
    ]
  },

  "billing": {
    "service_name": "katya_ai",
    "pricing_items": [
      {
        "name": "katya_summarize",
        "description": "Суммаризация обсуждений",
        "unit_type": "request",
        "price_bt": 0.5,
        "price_rub": 5.0
      },
      {
        "name": "katya_search",
        "description": "Поиск по истории",
        "unit_type": "request",
        "price_bt": 0.2,
        "price_rub": 2.0
      },
      {
        "name": "katya_question",
        "description": "Вопрос к Кате",
        "unit_type": "request",
        "price_bt": 0.3,
        "price_rub": 3.0
      }
    ]
  }
}
```

### 2. Структура Backend Katya Service

```
backend/katya-service/
├── src/
│   ├── index.ts                    # Express server (port 4300)
│   ├── config/
│   │   └── index.ts                # Конфигурация (DB_PATH, API_GATEWAY_URL)
│   ├── routes/
│   │   ├── summarize.route.ts      # POST /summarize
│   │   ├── search.route.ts         # POST /search
│   │   ├── question.route.ts       # POST /question
│   │   ├── decisions.route.ts      # GET /decisions
│   │   ├── settings.route.ts       # GET/PUT /settings
│   │   ├── history.route.ts        # GET /history
│   │   └── health.route.ts         # GET /health
│   ├── telegram/
│   │   ├── bot.ts                  # Telegram Bot (polling)
│   │   ├── handlers/
│   │   │   ├── mention.handler.ts  # @Катя обработка
│   │   │   ├── command.handler.ts  # /summary, /search
│   │   │   └── message.handler.ts  # Логирование сообщений
│   │   └── keyboards.ts            # Inline buttons
│   ├── services/
│   │   ├── platform-gpt.service.ts # ⭐ Проксирование к /api/ai/chatgpt
│   │   ├── context-manager.service.ts
│   │   ├── knowledge-base.service.ts
│   │   └── anonymizer.service.ts   # 🔒 152-ФЗ (опционально)
│   ├── database/
│   │   ├── connection.ts           # Подключение к SQLite
│   │   ├── migrations.ts           # Миграции таблиц
│   │   └── repositories/
│   │       ├── messages.repo.ts
│   │       ├── summaries.repo.ts
│   │       ├── contexts.repo.ts
│   │       └── settings.repo.ts
│   └── utils/
│       ├── logger.ts
│       ├── prompts.ts              # Промпты для GPT
│       └── cache.ts                # LRU кэш для частых запросов
├── tests/
│   ├── integration/
│   └── unit/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md                       # Как запустить локально
└── INTEGRATION.md                  # Как интегрировать в Boss AI
```

---

## 🤖 AI ИНТЕГРАЦИЯ ЧЕРЕЗ ПЛАТФОРМУ

### ⚡ ВАЖНО: Dual Mode для разработки и production

**Проблема:** Николай разрабатывает локально и не имеет доступа к `http://localhost:3000/api/ai/chatgpt`

**Решение:** Создать **два клиента** и переключаться через env:

```typescript
// src/config/index.ts
export const AI_CONFIG = {
  USE_PLATFORM_GPT: process.env.USE_PLATFORM_GPT === "true", // false для dev
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "", // для dev
  API_GATEWAY_URL: process.env.API_GATEWAY_URL || "http://localhost:3000",
};
```

### ⭐ Главное изменение v3.0: Проксирование к `/api/ai/chatgpt`

#### 1. PlatformGPTService (для production)

```typescript
// src/services/platform-gpt.service.ts
import axios, { AxiosInstance } from "axios";
import { Logger } from "../utils/logger";

/**
 * Сервис для проксирования GPT запросов через платформу Boss AI
 * Использует существующий /api/ai/chatgpt endpoint с биллингом
 */
export class PlatformGPTService {
  private client: AxiosInstance;
  private logger: Logger;
  private apiGatewayUrl: string;

  constructor(apiGatewayUrl: string = "http://localhost:3000") {
    this.apiGatewayUrl = apiGatewayUrl;
    this.logger = new Logger("PlatformGPT");

    this.client = axios.create({
      baseURL: this.apiGatewayUrl,
      timeout: 60000, // AI запросы могут занимать время
      headers: {
        "Content-Type": "application/json",
        "X-Service": "katya-ai",
      },
    });
  }

  /**
   * Суммаризация сообщений через платформенный GPT
   * Биллинг списывается автоматически!
   */
  async summarize(
    messages: string[],
    userToken: string,
    context?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildSummarizationPrompt(messages, context);

    try {
      this.logger.info(
        `Суммаризация ${messages.length} сообщений через платформу`
      );

      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-5-nano",
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`, // Токен пользователя для биллинга!
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "AI request failed");
      }

      // Парсим JSON ответ от GPT
      const result = JSON.parse(response.data.data.choices[0].message.content);

      return {
        summary: result.summary,
        topics: result.topics || [],
        decisions: result.decisions || [],
        keywords: result.keywords || [],
        participants: result.participants || [],
      };
    } catch (error: any) {
      this.logger.error("Ошибка суммаризации", error);

      // Проверяем ошибку недостаточного баланса
      if (error.response?.status === 402) {
        throw new Error("Insufficient funds");
      }

      throw error;
    }
  }

  /**
   * Поиск + AI ранжирование
   */
  async searchAndRank(
    query: string,
    searchResults: any[],
    userToken: string
  ): Promise<RankedResult[]> {
    const prompt = this.buildSearchPrompt(query, searchResults);

    try {
      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-5-nano",
            temperature: 0.5,
            max_tokens: 1500,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return this.parseSearchResponse(
        response.data.data.choices[0].message.content
      );
    } catch (error: any) {
      this.logger.error("Ошибка поиска", error);
      throw error;
    }
  }

  /**
   * Ответ на вопрос через GPT
   */
  async answer(
    question: string,
    context: string[],
    userToken: string
  ): Promise<AnswerResult> {
    const prompt = this.buildQuestionPrompt(question, context);

    try {
      const response = await this.client.post(
        "/api/ai/chatgpt",
        {
          prompt,
          options: {
            model: "gpt-5-nano",
            temperature: 0.7,
            max_tokens: 1000,
          },
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      return {
        answer: response.data.data.choices[0].message.content,
        sources: this.extractSources(context),
        confidence: 0.85,
      };
    } catch (error: any) {
      this.logger.error("Ошибка ответа", error);
      throw error;
    }
  }

  /**
   * Построение промпта для суммаризации
   */
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
- Ключевые слова для поиска
- Участники обсуждения

Ответ дай СТРОГО в JSON формате:
{
  "summary": "Краткое резюме...",
  "topics": ["тема1", "тема2"],
  "decisions": [{"decision": "текст", "decided_by": "username", "date": "timestamp"}],
  "keywords": ["ключ1", "ключ2"],
  "unresolved": ["вопрос1"],
  "participants": ["user1", "user2"]
}`;
  }

  private buildSearchPrompt(query: string, results: any[]): string {
    return `Вопрос пользователя: "${query}"

Найденные обсуждения:
${results.map((r, i) => `${i + 1}. ${r.text}`).join("\n\n")}

Проанализируй и ранжируй результаты по релевантности. Верни только 3 самых релевантных.
Объясни, почему каждый результат релевантен.`;
  }

  private buildQuestionPrompt(question: string, context: string[]): string {
    return `Ты - Катя. Ответь на вопрос на основе контекста команды.

Вопрос: ${question}

Контекст из истории:
${context.join("\n---\n")}

Дай краткий и точный ответ. Если информации недостаточно - так и скажи.`;
  }

  private parseSearchResponse(response: string): RankedResult[] {
    // Парсинг ответа GPT
    return [];
  }

  private extractSources(context: string[]): number[] {
    // Извлечение message IDs
    return [];
  }
}

// Интерфейсы
interface SummaryResult {
  summary: string;
  topics: string[];
  decisions: Array<{ decision: string; decided_by: string; date: string }>;
  keywords: string[];
  participants: string[];
}

interface RankedResult {
  text: string;
  relevance: number;
  explanation: string;
}

interface AnswerResult {
  answer: string;
  sources: number[];
  confidence: number;
}
```

#### 2. DirectGPTClient (для local development)

```typescript
// src/ai/direct-gpt-client.ts
import OpenAI from "openai";
import { Logger } from "../utils/logger";

/**
 * Прямой клиент OpenAI для локальной разработки
 * Используется когда USE_PLATFORM_GPT=false
 */
export class DirectGPTClient {
  private client: OpenAI;
  private logger: Logger;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.logger = new Logger("DirectGPT");
  }

  async summarize(
    messages: string[],
    context?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildSummarizationPrompt(messages, context);

    try {
      this.logger.info(
        `Суммаризация ${messages.length} сообщений (DIRECT MODE)`
      );

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini", // или gpt-5-nano если доступен
        messages: [
          {
            role: "system",
            content: prompt.system,
          },
          {
            role: "user",
            content: prompt.user,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);

      return {
        summary: result.summary,
        topics: result.topics || [],
        decisions: result.decisions || [],
        keywords: result.keywords || [],
        participants: result.participants || [],
      };
    } catch (error: any) {
      this.logger.error("Ошибка DirectGPT суммаризации", error);
      throw error;
    }
  }

  // ... аналогичные методы searchAndRank, answer

  private buildSummarizationPrompt(messages: string[], context?: string) {
    return {
      system: `Ты - Катя, AI-ассистент команды Boss AI.
Твоя задача - суммаризировать обсуждения команды.
Выдели: решения, участников, ключевые темы, нерешенные вопросы.
Ответ дай в структурированном формате JSON.`,
      user: `Суммаризируй следующие сообщения:\n\n${messages.join("\n---\n")}`,
    };
  }
}
```

#### 3. AIClientFactory (фабрика для переключения)

```typescript
// src/services/ai-client-factory.ts
import { PlatformGPTService } from "./platform-gpt.service";
import { DirectGPTClient } from "../ai/direct-gpt-client";
import { AI_CONFIG } from "../config";

export interface AIClient {
  summarize(
    messages: string[],
    userToken: string,
    context?: string
  ): Promise<SummaryResult>;
  searchAndRank(
    query: string,
    results: any[],
    userToken: string
  ): Promise<RankedResult[]>;
  answer(
    question: string,
    context: string[],
    userToken: string
  ): Promise<AnswerResult>;
}

/**
 * Фабрика для создания AI клиента
 * Возвращает PlatformGPTService (production) или DirectGPTClient (dev)
 */
export class AIClientFactory {
  static create(): AIClient {
    if (AI_CONFIG.USE_PLATFORM_GPT) {
      console.log("🔧 Using PlatformGPTService (production mode)");
      return new PlatformGPTService(AI_CONFIG.API_GATEWAY_URL);
    } else {
      console.log("🧪 Using DirectGPTClient (development mode)");
      // В dev mode создаем адаптер для совместимости интерфейсов
      const directClient = new DirectGPTClient(AI_CONFIG.OPENAI_API_KEY);

      return {
        async summarize(
          messages: string[],
          userToken: string,
          context?: string
        ) {
          // В dev режиме userToken игнорируется
          return directClient.summarize(messages, context);
        },
        async searchAndRank(query: string, results: any[], userToken: string) {
          return directClient.searchAndRank(query, results);
        },
        async answer(question: string, context: string[], userToken: string) {
          return directClient.answer(question, context);
        },
      };
    }
  }
}
```

#### 4. Использование в routes

```typescript
// src/routes/summarize.route.ts
import { Router, Request, Response } from "express";
import { AIClientFactory } from "../services/ai-client-factory";
import { MessagesRepository } from "../database/repositories/messages.repo";
import { SummariesRepository } from "../database/repositories/summaries.repo";

const router = Router();
const aiClient = AIClientFactory.create(); // Автоматически выбирает режим!
const messagesRepo = new MessagesRepository();
const summariesRepo = new SummariesRepository();

/**
 * POST /summarize
 * Суммаризация обсуждений
 *
 * Body:
 * - chatId: number
 * - messageCount?: number (default: 50)
 * - query?: string
 *
 * Headers:
 * - Authorization: Bearer <platform_token>
 */
router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const { chatId, messageCount = 50, query } = req.body;
    const userToken = req.headers.authorization?.replace("Bearer ", "");

    if (!userToken) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // 1. Получить сообщения из БД
    const messages = await messagesRepo.getLastMessages(chatId, messageCount);

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

    // 2. Суммаризация через AI клиент (автоматически выбирается режим!)
    const summary = await aiClient.summarize(
      messages.map((m) => `${m.username}: ${m.text}`),
      userToken,
      query
    );

    // 3. Сохранить summary в БД
    await summariesRepo.create({
      chatId,
      summaryText: summary.summary,
      messageCount: messages.length,
      keywords: JSON.stringify(summary.keywords),
      topics: JSON.stringify(summary.topics),
      decisions: JSON.stringify(summary.decisions),
    });

    // 4. Ответ клиенту
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
        message:
          "Недостаточно средств для суммаризации. Пополните баланс BT токенов.",
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

## 🔒 152-ФЗ ИНТЕГРАЦИЯ (Обезличивание ПД)

### Опциональный Anonymizer Service

```typescript
// src/services/anonymizer.service.ts
/**
 * Сервис для обезличивания персональных данных (152-ФЗ)
 * Заменяет ФИО, телефоны, email перед отправкой в GPT
 */
export class AnonymizerService {
  private piiPatterns = {
    phone: /(\+7|8)?[\s\(]?\d{3}[\s\)]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
    email: /[\w.-]+@[\w.-]+\.\w+/g,
    // Простая эвристика для имен (улучшить!)
    name: /\b[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+(?:\s[А-ЯЁ][а-яё]+)?\b/g,
  };

  private replacementMap: Map<string, string> = new Map();
  private counter = 0;

  /**
   * Обезличить текст перед отправкой в GPT
   */
  anonymize(text: string): { anonymized: string; map: Record<string, string> } {
    let anonymized = text;
    const map: Record<string, string> = {};

    // Заменяем телефоны
    anonymized = anonymized.replace(this.piiPatterns.phone, (match) => {
      const replacement = `[PHONE_${++this.counter}]`;
      map[replacement] = match;
      return replacement;
    });

    // Заменяем email
    anonymized = anonymized.replace(this.piiPatterns.email, (match) => {
      const replacement = `[EMAIL_${++this.counter}]`;
      map[replacement] = match;
      return replacement;
    });

    // Заменяем имена
    anonymized = anonymized.replace(this.piiPatterns.name, (match) => {
      const replacement = `[NAME_${++this.counter}]`;
      map[replacement] = match;
      return replacement;
    });

    return { anonymized, map };
  }

  /**
   * Восстановить текст после получения ответа от GPT
   */
  deanonymize(text: string, map: Record<string, string>): string {
    let deanonymized = text;

    for (const [placeholder, original] of Object.entries(map)) {
      deanonymized = deanonymized.replace(
        new RegExp(placeholder, "g"),
        original
      );
    }

    return deanonymized;
  }
}

// Использование в PlatformGPTService:
/*
const anonymizer = new AnonymizerService();
const { anonymized, map } = anonymizer.anonymize(messages.join('\n'));
const summary = await platformGPT.summarize([anonymized], userToken);
summary.summary = anonymizer.deanonymize(summary.summary, map);
*/
```

**Конфигурация:**

```env
# .env
ANONYMIZE_PII=true  # Включить обезличивание (для production)
```

**⚠️ Важно:** 152-ФЗ требуется только если:

- Обрабатываете ПД российских граждан
- Передаете данные третьим лицам (OpenAI)
- Не получили согласие на обработку ПД

**Рекомендация:** Включить в production, если работаете с чувствительными данными.

---

## 💰 БИЛЛИНГ ИНТЕГРАЦИЯ

### ⚡ Автоматический биллинг через платформу

**Преимущество v3.0:** Катя **НЕ списывает** деньги напрямую!

Процесс:

```
1. User → Платформа → /api/katya/summarize
2. API Gateway применяет authenticateToken middleware
3. Katya Service → /api/ai/chatgpt (с токеном user)
4. API Gateway применяет requireBalance('ai_request', 5.0)
5. API Gateway списывает 5₽ с user.balance_rub
6. Запрос идет к OpenAI
7. Ответ → Katya Service → User
```

**Никакого дублирования биллинга!**

### SQL миграции для service_pricing

```sql
-- Добавить тарифы Кати при старте (в src/database/migrations.ts)
INSERT OR IGNORE INTO service_pricing (service_name, unit_type, price_per_unit, currency, is_active) VALUES
  ('katya_summarize', 'request', 5.0, 'RUB', 1),   -- Стоимость = стоимость /api/ai/chatgpt
  ('katya_search', 'request', 2.0, 'RUB', 1),       -- Дешевле, т.к. часть logic без AI
  ('katya_question', 'request', 3.0, 'RUB', 1);     -- Средняя стоимость
```

### Обновление API Gateway

```typescript
// backend/main/src/routes/katya.routes.ts (НОВЫЙ ФАЙЛ!)
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { ProxyClient } from "../utils/proxy";

const router = Router();

// Создать прокси к Katya Service
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
 * Биллинг: через /api/ai/chatgpt (внутри Кати)
 */
router.use("/api/katya/*", authenticateToken, async (req, res) => {
  try {
    // Убираем '/api/katya' из пути
    const targetPath = req.originalUrl.replace("/api/katya", "");

    // Проксируем запрос, передавая токен
    const result = await katyaProxy.request(
      req.method as any,
      targetPath,
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization, // Передаем токен user!
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
this.app.use(katyaRoutes); // Добавить после других роутов
```

---

## 💾 СХЕМА БАЗЫ ДАННЫХ

### Новые таблицы (добавить в ozon_manager.db)

```sql
-- 1. История сообщений чатов (для Telegram и платформы)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id BIGINT UNIQUE NOT NULL,
  chat_id BIGINT NOT NULL,
  user_id INTEGER,
  telegram_user_id BIGINT,
  username TEXT,
  first_name TEXT,
  text TEXT NOT NULL,
  reply_to_message_id BIGINT,
  is_katya_mention BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Суммаризированные контексты
CREATE TABLE IF NOT EXISTS chat_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id BIGINT NOT NULL,
  summary_text TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  start_message_id BIGINT,
  end_message_id BIGINT,
  keywords TEXT,  -- JSON array
  topics TEXT,    -- JSON array
  decisions TEXT, -- JSON array
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 3. Контексты обсуждений (темы)
CREATE TABLE IF NOT EXISTS chat_contexts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id BIGINT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  ref_message_ids TEXT,  -- JSON array
  decision TEXT,
  decided_by TEXT,
  decided_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 4. База знаний (Q&A)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_chat_id BIGINT,
  source_message_ids TEXT,  -- JSON array
  context_id INTEGER,
  created_by TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  relevance_score REAL DEFAULT 1.0,
  FOREIGN KEY (context_id) REFERENCES chat_contexts(id) ON DELETE SET NULL
);

-- 5. История запросов с платформы
CREATE TABLE IF NOT EXISTS katya_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  request_type TEXT NOT NULL,  -- 'summarize', 'search', 'question'
  request_data TEXT,            -- JSON
  response_data TEXT,           -- JSON
  cost_bt REAL NOT NULL,
  cost_rub REAL NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Настройки Кати для пользователей
CREATE TABLE IF NOT EXISTS katya_user_settings (
  user_id INTEGER PRIMARY KEY,
  telegram_enabled BOOLEAN DEFAULT 1,
  platform_chat_enabled BOOLEAN DEFAULT 1,
  auto_summarize BOOLEAN DEFAULT 0,
  auto_summarize_threshold INTEGER DEFAULT 100,
  context_window INTEGER DEFAULT 50,
  anonymize_pii BOOLEAN DEFAULT 0,  -- 152-ФЗ
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_messages_chat ON chat_messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_mention ON chat_messages(is_katya_mention, chat_id);
CREATE INDEX IF NOT EXISTS idx_summaries_chat ON chat_summaries(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contexts_topic ON chat_contexts(topic);
CREATE INDEX IF NOT EXISTS idx_knowledge_question ON knowledge_base(question);
CREATE INDEX IF NOT EXISTS idx_katya_requests ON katya_requests(user_id, created_at DESC);
```

---

## 📱 TELEGRAM ИНТЕГРАЦИЯ

### Telegram Bot Setup

```typescript
// src/telegram/bot.ts
import TelegramBot from "node-telegram-bot-api";
import { PlatformGPTService } from "../services/platform-gpt.service";
import { MessagesRepository } from "../database/repositories/messages.repo";
import { Logger } from "../utils/logger";

export class KatyaTelegramBot {
  private bot: TelegramBot;
  private platformGPT: PlatformGPTService;
  private messagesRepo: MessagesRepository;
  private logger: Logger;

  constructor(botToken: string, apiGatewayUrl: string, dbPath: string) {
    this.bot = new TelegramBot(botToken, { polling: true });
    this.platformGPT = new PlatformGPTService(apiGatewayUrl);
    this.messagesRepo = new MessagesRepository(dbPath);
    this.logger = new Logger("TelegramBot");

    this.setupHandlers();
    this.logger.info("✅ Telegram бот Катя запущен");
  }

  private setupHandlers() {
    // Логирование всех сообщений
    this.bot.on("message", async (msg) => {
      try {
        await this.messagesRepo.create({
          messageId: msg.message_id,
          chatId: msg.chat.id,
          telegramUserId: msg.from?.id,
          username: msg.from?.username || "unknown",
          firstName: msg.from?.first_name || "",
          text: msg.text || "",
          isKatyaMention: this.isMentioned(msg.text),
        });
      } catch (error) {
        this.logger.error("Ошибка сохранения сообщения", error);
      }
    });

    // Обработка @Катя упоминаний
    this.bot.on("message", async (msg) => {
      if (!this.isMentioned(msg.text)) return;

      try {
        await this.bot.sendChatAction(msg.chat.id, "typing");

        // ⚠️ ПРОБЛЕМА: У Telegram сообщений НЕТ токена платформы!
        // Решение: использовать system token или требовать авторизацию

        const messages = await this.messagesRepo.getLastMessages(
          msg.chat.id,
          50
        );

        // TODO: Получить platform token для user через telegram_id
        // Пока используем system token (без биллинга)
        const systemToken = process.env.SYSTEM_TOKEN || "";

        const summary = await this.platformGPT.summarize(
          messages.map((m) => `${m.username}: ${m.text}`),
          systemToken,
          msg.text
        );

        await this.bot.sendMessage(msg.chat.id, this.formatSummary(summary), {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 Подробнее",
                  callback_data: `details_${msg.chat.id}`,
                },
                {
                  text: "📊 Статистика",
                  callback_data: `stats_${msg.chat.id}`,
                },
              ],
            ],
          },
        });
      } catch (error: any) {
        this.logger.error("Ошибка обработки @Катя", error);
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

  private formatSummary(summary: any): string {
    return `📊 *Суммаризация обсуждения*

${summary.summary}

🔑 *Ключевые темы:*
${summary.topics.map((t: string) => `• ${t}`).join("\n")}

✅ *Решения:*
${
  summary.decisions
    .map((d: any) => `• ${d.decision} (${d.decided_by})`)
    .join("\n") || "Нет принятых решений"
}

👥 *Участники:* ${summary.participants.join(", ")}`;
  }

  private async handleSummaryCommand(msg: TelegramBot.Message) {
    // Similar to @Катя mention handling
  }

  private async handleSearchCommand(
    msg: TelegramBot.Message,
    match: RegExpExecArray | null
  ) {
    // Search implementation
  }

  private async handleDecisionsCommand(msg: TelegramBot.Message) {
    // Show decisions from database
  }
}
```

**⚠️ Важная проблема:** Telegram сообщения не содержат токен платформы!

**Решения:**

1. **Вариант A (простой):** Использовать system token без биллинга для TG
2. **Вариант B (правильный):** Требовать связывание TG аккаунта с платформой (telegram_id → user_id)

---

## 🧪 ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ ДЛЯ НИКОЛАЯ

### Настройка локального окружения

#### 1. Создать `.env` для разработки

```env
# Development Mode
NODE_ENV=development
PORT=4300

# Database (копия с сервера)
DB_PATH=./data/test_db.sqlite

# API Gateway (не используется в dev mode)
API_GATEWAY_URL=http://localhost:3000

# AI Configuration
USE_PLATFORM_GPT=false  # ⚠️ false для локальной разработки!
OPENAI_API_KEY=sk-...   # 🔑 Реальный ключ OpenAI (взять у @boss)

# Telegram Bot (тестовый)
TELEGRAM_BOT_TOKEN=<тестовый токен от @BotFather>
TELEGRAM_BOT_USERNAME=katya_test_bot

# System Token (не используется в dev mode)
SYSTEM_TOKEN=test_token

# Logging
LOG_LEVEL=debug

# Features
ANONYMIZE_PII=false
```

#### 2. Получить тестовую БД

```bash
# Скачать копию БД с сервера (у @boss запросить)
# Или создать минимальную тестовую БД:

sqlite3 ./data/test_db.sqlite < test-schema.sql
```

**test-schema.sql:**

```sql
-- Минимальная схема для тестирования
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  first_name TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id BIGINT UNIQUE NOT NULL,
  chat_id BIGINT NOT NULL,
  user_id INTEGER,
  username TEXT,
  text TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Тестовые данные
INSERT INTO users (id, telegram_id, username, first_name) VALUES
  (1, 123456789, 'test_user', 'Тестовый');

INSERT INTO chat_messages (message_id, chat_id, user_id, username, text) VALUES
  (1, 1, 1, 'test_user', 'Привет, это первое сообщение'),
  (2, 1, 1, 'test_user', 'Давайте обсудим новую фичу'),
  (3, 1, 1, 'test_user', 'Я предлагаю использовать React'),
  (4, 1, 1, 'test_user', 'Согласны?'),
  (5, 1, 1, 'test_user', 'Решено: используем React');
```

#### 3. Запустить локально

```bash
# Установить зависимости
npm install

# Запустить в dev режиме
npm run dev

# Логи покажут:
# 🧪 Using DirectGPTClient (development mode)
# ✅ Telegram бот Катя запущен
# 🚀 Katya Service запущен на порту 4300
```

#### 4. Тестирование endpoints (без API Gateway!)

**Тест 1: Health check**

```bash
curl http://localhost:4300/health
# Ожидается: {"status":"ok","service":"katya-ai"}
```

**Тест 2: Суммаризация (без токена в dev режиме)**

```bash
curl -X POST http://localhost:4300/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": 1,
    "messageCount": 5,
    "query": "Подведи итоги"
  }'

# Ожидается:
# {
#   "success": true,
#   "data": {
#     "summary": "Обсуждалась новая фича...",
#     "topics": ["React", "фича"],
#     "decisions": [{"decision": "Используем React", ...}],
#     "keywords": ["React", "фича"]
#   }
# }
```

**Тест 3: Telegram бот**

```bash
# Написать тестовому боту в Telegram:
# @katya_test_bot привет!
# @Катя, подведи итоги

# Должен ответить суммаризацией
```

#### 5. Mock режим (без реального OpenAI)

Для совсем быстрого тестирования без API ключа:

```env
USE_MOCK_AI=true  # Вернет mock данные вместо реального GPT
```

```typescript
// src/ai/mock-gpt-client.ts
export class MockGPTClient {
  async summarize(messages: string[]): Promise<SummaryResult> {
    return {
      summary: `Mock суммаризация ${messages.length} сообщений`,
      topics: ["mock-тема-1", "mock-тема-2"],
      decisions: [
        {
          decision: "Mock решение 1",
          decided_by: "test_user",
          date: new Date().toISOString(),
        },
      ],
      keywords: ["mock", "test"],
      participants: ["test_user"],
    };
  }
}
```

### Примеры кода из платформы для Николая

#### Пример 1: Структура ozon-manager (как reference)

Скинуть Николаю эти файлы:

```
backend/ozon-manager/
├── src/
│   ├── index.ts                 # 👈 Как инициализировать Express + DB
│   ├── config/
│   │   └── index.ts             # 👈 Как работать с .env
│   ├── routes/
│   │   └── stores.routes.ts     # 👈 Пример API роутов
│   ├── database/
│   │   └── migrations.ts        # 👈 Как делать миграции SQLite
│   └── services/
│       └── ozon-api-client.ts   # 👈 Как делать HTTP клиенты
```

#### Пример 2: AI Routes из API Gateway

```typescript
// backend/main/src/routes/ai.routes.ts (скинуть Николаю)
// Показывает как работает /api/ai/chatgpt endpoint
```

#### Пример 3: Service Config

```json
// frontend/public/services/chatgpt-service.json (скинуть Николаю)
// Показывает как настроить service для платформы
```

### Postman коллекция для тестирования

**katya-api-tests.postman_collection.json:**

```json
{
  "info": {
    "name": "Katya AI Service - Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:4300/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4300",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Summarize (Dev Mode)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"chatId\": 1,\n  \"messageCount\": 5,\n  \"query\": \"Подведи итоги обсуждения\"\n}"
        },
        "url": {
          "raw": "http://localhost:4300/summarize",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4300",
          "path": ["summarize"]
        }
      }
    },
    {
      "name": "Search History",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"React\",\n  \"chatId\": 1,\n  \"limit\": 10\n}"
        },
        "url": {
          "raw": "http://localhost:4300/search",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4300",
          "path": ["search"]
        }
      }
    }
  ]
}
```

### Unit тесты (примеры для Николая)

```typescript
// tests/ai/direct-gpt-client.test.ts
import { DirectGPTClient } from "../../src/ai/direct-gpt-client";

describe("DirectGPTClient", () => {
  let client: DirectGPTClient;

  beforeAll(() => {
    client = new DirectGPTClient(process.env.OPENAI_API_KEY!);
  });

  test("should summarize messages", async () => {
    const messages = [
      "User1: Привет!",
      "User2: Давайте обсудим проект",
      "User1: Решено: начинаем завтра",
    ];

    const result = await client.summarize(messages);

    expect(result.summary).toBeDefined();
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.decisions).toBeInstanceOf(Array);
  }, 30000); // OpenAI может быть медленным

  test("should handle empty messages", async () => {
    const result = await client.summarize([]);

    expect(result.summary).toBeDefined();
  });
});
```

---

## 📦 DELIVERABLES ДЛЯ НИКОЛАЯ

После разработки Николай должен прислать:

### 1. katya-service.tar.gz

```
katya-service/
├── dist/                  # Compiled JavaScript
├── node_modules/          # All dependencies
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example           # Template с комментариями
├── README.md              # Как запустить локально
└── INTEGRATION.md         # Как интегрировать в Boss AI
```

### 2. katya-service.json

Положить в `frontend/public/services/katya-service.json`

### 3. SQL миграции

Файл `migrations.sql` с создан таблиц (выполнить вручную)

### 4. INTEGRATION.md (пример)

````markdown
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

# Telegram Bot

TELEGRAM_BOT_TOKEN=<получить от @BotFather>
TELEGRAM_BOT_USERNAME=katya_boss_ai_bot

# Database (shared)

DB_PATH=/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db

# API Gateway

API_GATEWAY_URL=http://localhost:3000

# System Token (для TG без биллинга)

SYSTEM_TOKEN=<взять из платформы>

# Features

ANONYMIZE_PII=false # true для production с ПД
\`\`\`

## 3. Запустить миграции БД

\`\`\`bash
sqlite3 /var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db < migrations.sql
\`\`\`

## 4. Добавить в PM2

Обновить `ecosystem.config.js`:

\`\`\`javascript
{
name: "boss-ai-katya-service",
script: "dist/index.js",
cwd: "/var/www/boss-ai/backend/katya-service",
instances: 1,
exec_mode: "fork",
env: {
NODE_ENV: "production",
PORT: 4300,
DB_PATH: "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db",
API_GATEWAY_URL: "http://localhost:3000",
LOG_LEVEL: "info"
},
env_file: "/var/www/boss-ai/backend/katya-service/.env",
error_file: "./logs/katya_err.log",
out_file: "./logs/katya_out.log",
log_file: "./logs/katya_combined.log",
time: true,
autorestart: true,
watch: false,
max_memory_restart: "512M"
}
\`\`\`

Запустить:
\`\`\`bash
pm2 start ecosystem.config.js --only boss-ai-katya-service
pm2 save
\`\`\`

## 5. Добавить katya.routes.ts в API Gateway

См. секцию "Обновление API Gateway" в ТЗ.

Пересобрать:
\`\`\`bash
cd /var/www/boss-ai/backend/main
npm run build
pm2 restart boss-ai-api-gateway
\`\`\`

## 6. Добавить katya-service.json в frontend

\`\`\`bash
cp katya-service.json /var/www/boss-ai/frontend/public/services/
cd /var/www/boss-ai/frontend
npm run build
\`\`\`

## 7. Проверка

- Katya Service: http://localhost:4300/health
- API Gateway proxy: http://localhost:3000/api/katya/health
- Frontend: https://boss-ai.online (проверить появление сервиса)

\`\`\`bash
pm2 logs boss-ai-katya-service --lines 50
\`\`\`
\`\`\`

---

## ✅ ЧЕКЛИСТ РАЗРАБОТКИ ДЛЯ НИКОЛАЯ

### Этап 1: Backend Core (3-4 дня)

- [ ] Инициализация Express server (port 4300)
- [ ] Подключение к SQLite БД Boss AI
- [ ] Миграции таблиц (chat_messages, chat_summaries, etc.)
- [ ] Health check endpoint (`/health`)
- [ ] Logger setup

### Этап 2: PlatformGPTService (2 дня)

- [ ] Класс `PlatformGPTService`
- [ ] Метод `summarize()` через `/api/ai/chatgpt`
- [ ] Метод `searchAndRank()`
- [ ] Метод `answer()`
- [ ] Промпты для GPT (в `utils/prompts.ts`)
- [ ] Обработка ошибок (особенно 402 Insufficient funds)

### Этап 3: API Routes (2 дня)

- [ ] POST `/summarize` - суммаризация
- [ ] POST `/search` - поиск по истории
- [ ] POST `/question` - вопрос к Кате
- [ ] GET `/decisions` - список решений
- [ ] GET/PUT `/settings` - настройки user
- [ ] GET `/history` - история запросов

### Этап 4: Database Repositories (2 дня)

- [ ] `MessagesRepository` - CRUD для chat_messages
- [ ] `SummariesRepository` - CRUD для chat_summaries
- [ ] `ContextsRepository` - CRUD для chat_contexts
- [ ] `KnowledgeRepository` - CRUD для knowledge_base
- [ ] `SettingsRepository` - CRUD для katya_user_settings

### Этап 5: Telegram Bot (3 дня)

- [ ] Инициализация бота (polling)
- [ ] Логирование всех сообщений
- [ ] Обработка @Катя упоминаний
- [ ] Команды: `/summary`, `/search`, `/decisions`
- [ ] Inline keyboards
- [ ] Обработка callback_query

### Этап 6: Опциональные фичи (2 дня)

- [ ] `AnonymizerService` для 152-ФЗ
- [ ] LRU кэш для частых запросов
- [ ] Автоматическая суммаризация (каждые N сообщений)

### Этап 7: Testing (2-3 дня)

- [ ] Unit тесты для PlatformGPTService
- [ ] Integration тесты для routes
- [ ] Тестирование Telegram бота
- [ ] E2E тесты с реальной платформой
- [ ] Performance тесты (100+ сообщений)

### Этап 8: Documentation & Packaging (1 день)

- [ ] README.md (как запустить локально)
- [ ] INTEGRATION.md (как интегрировать в Boss AI)
- [ ] API Documentation (endpoints)
- [ ] .env.example с комментариями
- [ ] migrations.sql
- [ ] Создать tar.gz архив

**Итого:** ~18-22 дней разработки

---

## 📋 ЧТО ПОЛУЧИТ НИКОЛАЙ ДЛЯ СТАРТА

### От @boss перед началом работы:

1. **OpenAI API ключ** (для локального тестирования)

   ```
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Копия тестовой БД** (SQLite файл)

   ```bash
   test_db.sqlite (с тестовыми данными)
   ```

3. **Telegram тестовый бот токен**

   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
   ```

4. **Архив с примерами** (`katya-references.tar.gz`)

   ```
   - ozon-manager/ (структура микросервиса)
   - ai-routes-reference.ts (как работает GPT endpoint)
   - chatgpt-service.json (service config пример)
   - test-db.sql (тестовая схема БД)
   - postman-collection.json (API тесты)
   ```

5. **Доступ к документации**
   - Это ТЗ (`KATYA_BOT_TZ_v3_FINAL.md`)
   - README платформы
   - Схема БД платформы

### Workflow разработки:

```
День 1-2: Настройка окружения
├── Создать проект
├── Настроить .env с тестовыми ключами
├── Запустить тестовую БД
└── Протестировать подключение к OpenAI

День 3-5: Backend Core
├── Express server + routes
├── DirectGPTClient (для dev)
├── Database repositories
└── Локальные тесты

День 6-8: Telegram Bot
├── Инициализация бота
├── Handlers (@Катя упоминания)
├── Тесты с тестовым ботом
└── Интеграция с DirectGPTClient

День 9-11: PlatformGPTService
├── HTTP клиент к API Gateway
├── AIClientFactory переключение
├── Mock режим
└── Unit тесты

День 12-14: Остальные endpoints
├── /search, /question, /decisions
├── Settings, History
└── Integration тесты

День 15-17: Полировка
├── Error handling
├── Логирование
├── Документация
└── Финальное тестирование

День 18-20: Упаковка
├── Создать production .env.example
├── INTEGRATION.md
├── Архив katya-service.tar.gz
└── Передать @boss
```

**Итого:** ~18-22 дней разработки + тестирование

---

## 📊 ТЕСТИРОВАНИЕ

### Локальное тестирование (для Николая)

```bash
# 1. Запустить БД Boss AI локально (SQLite)
cp /path/to/ozon_manager.db ./data/

# 2. Запустить Katya Service
npm run dev

# 3. Тестовый запрос к /summarize
curl -X POST http://localhost:4300/summarize \
  -H "Authorization: Bearer <test_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": 123456,
    "messageCount": 10,
    "query": "Подведи итоги"
  }'

# Ожидаемый ответ:
{
  "success": true,
  "data": {
    "summary": "...",
    "topics": ["тема1"],
    "decisions": [],
    "keywords": ["ключ1"]
  }
}
```
````

### Integration тестирование

```bash
# 1. Запустить API Gateway
cd /var/www/boss-ai/backend/main
npm run dev

# 2. Запустить Katya Service
cd /var/www/boss-ai/backend/katya-service
npm run dev

# 3. Тест через API Gateway
curl -X POST http://localhost:3000/api/katya/summarize \
  -H "Authorization: Bearer <real_user_token>" \
  -H "Content-Type: application/json" \
  -d '{"chatId": 123, "messageCount": 20}'
```

### Telegram Bot тестирование

1. Создать бота через @BotFather
2. Получить token
3. Добавить в `.env`: `TELEGRAM_BOT_TOKEN=...`
4. Запустить Katya Service
5. Написать боту: `/start`
6. Написать: `@Катя, привет!`
7. Проверить ответ

---

## 🚀 ИНСТРУКЦИИ ПО ДОБАВЛЕНИЮ СЕРВИСА В ПЛАТФОРМУ

### Для интегратора (после получения архива от Николая):

#### Шаг 1: Распаковать и настроить

```bash
cd /var/www/boss-ai/backend
mkdir katya-service
cd katya-service
tar -xzf ~/katya-service.tar.gz
cp .env.example .env
nano .env  # Заполнить переменные
```

#### Шаг 2: Запустить миграции БД

```bash
sqlite3 /var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db < migrations.sql
```

#### Шаг 3: Обновить API Gateway

```bash
cd /var/www/boss-ai/backend/main/src/routes
# Создать katya.routes.ts (код выше)

# Добавить в index.ts:
# import katyaRoutes from './routes/katya.routes';
# this.app.use(katyaRoutes);

cd /var/www/boss-ai/backend/main
npm run build
```

#### Шаг 4: Обновить PM2

```bash
nano /var/www/boss-ai/ecosystem.config.js
# Добавить конфигурацию katya-service (см. выше)

pm2 start ecosystem.config.js --only boss-ai-katya-service
pm2 restart boss-ai-api-gateway
pm2 save
```

#### Шаг 5: Добавить frontend config

```bash
cp katya-service.json /var/www/boss-ai/frontend/public/services/
cd /var/www/boss-ai/frontend
npm run build
```

#### Шаг 6: Обновить Nginx (если нужно)

```bash
sudo systemctl reload nginx
```

#### Шаг 7: Проверка

```bash
# Health checks
curl http://localhost:4300/health
curl http://localhost:3000/api/katya/health

# PM2 статус
pm2 status
pm2 logs boss-ai-katya-service --lines 20

# Frontend
# Открыть https://boss-ai.online
# Проверить появление сервиса "Катя AI"
```

---

## 💡 ОПТИМИЗАЦИИ И BEST PRACTICES

### 1. Кэширование частых запросов

```typescript
// src/utils/cache.ts
import LRU from "lru-cache";

export class RequestCache {
  private cache: LRU<string, any>;

  constructor(max: number = 100) {
    this.cache = new LRU({
      max,
      ttl: 1000 * 60 * 15, // 15 минут
    });
  }

  get(key: string): any | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  generateKey(chatId: number, messageCount: number): string {
    return `summary_${chatId}_${messageCount}`;
  }
}

// Использование:
const cache = new RequestCache();
const cacheKey = cache.generateKey(chatId, messageCount);
const cached = cache.get(cacheKey);
if (cached) return cached;
// ... запрос к GPT
cache.set(cacheKey, summary);
```

### 2. Rate Limiting для Telegram

```typescript
const rateLimiter = new Map<number, number>(); // userId -> last request timestamp

function checkRateLimit(userId: number): boolean {
  const last = rateLimiter.get(userId) || 0;
  const now = Date.now();

  if (now - last < 10000) {
    // 10 секунд между запросами
    return false;
  }

  rateLimiter.set(userId, now);
  return true;
}
```

### 3. Graceful Shutdown

```typescript
// src/index.ts
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");

  // Остановить Telegram бот
  await telegramBot.stop();

  // Закрыть БД соединения
  db.close();

  // Закрыть HTTP server
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

**Разработчик:** Николай
**Интегратор:** @boss (Boss AI Team)
**Репозиторий:** `/var/www/boss-ai/backend/katya-service`
**Логи:** `pm2 logs boss-ai-katya-service`
**Документация:** `docs/KATYA_BOT_TZ_v3_FINAL.md`

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ ГОТОВНОСТИ

### Для Николая (перед отправкой):

- [ ] Все endpoints реализованы и протестированы
- [ ] Telegram бот работает локально
- [ ] Проксирование к `/api/ai/chatgpt` работает
- [ ] Миграции БД написаны
- [ ] Unit тесты написаны и проходят
- [ ] README.md и INTEGRATION.md заполнены
- [ ] .env.example содержит все переменные с комментариями
- [ ] Создан tar.gz архив
- [ ] Проверено на чистой Ubuntu 20.04

### Для интегратора (после получения):

- [ ] Архив распакован в `/var/www/boss-ai/backend/katya-service`
- [ ] .env настроен с реальными токенами
- [ ] Миграции БД выполнены
- [ ] PM2 конфигурация добавлена
- [ ] API Gateway обновлен (katya.routes.ts)
- [ ] Frontend config добавлен (katya-service.json)
- [ ] Все сервисы перезапущены
- [ ] Health checks проходят
- [ ] Тест через платформу работает
- [ ] Telegram бот отвечает на @Катя

---

**🎯 ТЗ v3.0 FINAL готово к реализации!**

**Ключевые преимущества v3.0:**

- ✅ Переиспользование `/api/ai/chatgpt` (экономия)
- ✅ Единый биллинг (нет дублирования)
- ✅ Один OpenAI API ключ (проще управление)
- ✅ 152-ФЗ опционально (гибкость)
- ✅ Полные инструкции интеграции (простота)

Николай, успехов в разработке! 🚀
