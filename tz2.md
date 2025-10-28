# 📋 ТЕХНИЧЕСКОЕ ЗАДАНИЕ v3.0: Telegram Bot "Катя" для Boss AI Platform

### 👨‍💻 Разработчик: Николай

### 🎯 Цель: Создание автономного Telegram бота с интеграцией в платформу Boss AI

## 🎯 ЦЕЛЬ ПРОЕКТА

Разработать **Катю** как полноценный микросервис платформы Boss AI с функцией **распределенной памяти команды** (Institutional Knowledge), который:

1. **Интегрируется как сервис платформы** (аналогично ChatGPT Service)
2. **Работает в двух режимах:**

   - 📱 Telegram Bot (отвечает в TG чатах на @Катя)
   - 💬 Платформенный чат (кнопки и команды в интерфейсе Boss AI)

3. **Использует GPT-5 nano** для быстрой и экономичной суммаризации
4. **Интегрирован с биллингом** через service_pricing (автоматическое списание BT)
5. **Имеет настройки на платформе** (включение/выключение, параметры AI)

---

## 🏗️ АРХИТЕКТУРА ИНТЕГРАЦИИ

### Существующая структура сервисов Boss AI:

```
Boss AI Platform Services:
├── ChatGPT Service (frontend/public/services/chatgpt-service.json)
├── Ozon Manager Service
├── AI Lawyer Service
├── Photo Studio Service
└── NEW: Katya AI Service ⭐
```

### Архитектура Кати как сервиса:

```
Katya AI Service
├── 1. Service Config (katya-service.json)
│   ├── id: "katya-ai-service"
│   ├── tools: [summarize, search, onboarding, decisions]
│   ├── isChatFunction: true
│   └── chatApiEndpoint: "/api/katya/*"
│
├── 2. Backend Microservice (Node.js + TypeScript)
│   ├── Express API Server (port 4300)
│   ├── Telegram Bot Integration
│   ├── GPT-5 nano Integration
│   ├── Context Manager
│   └── Database Access (shared SQLite)
│
├── 3. API Gateway Integration
│   ├── Proxy: /api/katya/* → http://localhost:4300
│   ├── Authentication middleware
│   └── Billing middleware
│
├── 4. Frontend Integration
│   ├── Service button в чате
│   ├── Katya tools в Service Sidebar
│   ├── Settings panel для Кати
│   └── Chat history с Катей
│
└── 5. Billing Integration
    ├── service_pricing таблица
    ├── Автоматическое списание BT
    └── Прозрачность стоимости
```

---

## 📋 СТРУКТУРА СЕРВИСА (katya-service.json)

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
  "author": "BOSS AI Team",

  "settings": {
    "telegram_enabled": true,
    "platform_chat_enabled": true,
    "auto_summarize": true,
    "auto_summarize_threshold": 100,
    "context_window": 100,
    "ai_model": "gpt-5-nano",
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
      "id": "onboarding",
      "name": "👋 Онбординг",
      "description": "Вводный курс для новых участников команды",
      "icon": "Users",
      "action": "onboarding",
      "isEnabled": true,
      "category": "help",
      "isChatFunction": true,
      "chatPrompt": "Расскажи о команде и проекте",
      "chatApiEndpoint": "/api/katya/onboarding",
      "pricing": {
        "type": "free",
        "cost_bt": 0,
        "cost_rub": 0
      }
    },
    {
      "id": "katya-settings",
      "name": "⚙️ Настройки Кати",
      "description": "Настройка параметров работы Кати",
      "icon": "Settings",
      "action": "settings",
      "isEnabled": true,
      "category": "settings",
      "isChatFunction": false,
      "uiComponent": "KatyaSettings"
    }
  ],

  "endpoints": {
    "base": "/api/katya",
    "health": "/api/katya/health",
    "summarize": "/api/katya/summarize",
    "search": "/api/katya/search",
    "question": "/api/katya/question",
    "decisions": "/api/katya/decisions",
    "onboarding": "/api/katya/onboarding",
    "settings": "/api/katya/settings"
  },

  "telegram": {
    "enabled": true,
    "bot_username": "katya_boss_ai_bot",
    "commands": [
      { "command": "/summary", "description": "Суммаризация чата" },
      { "command": "/search", "description": "Поиск по истории" },
      { "command": "/decisions", "description": "Список решений" },
      { "command": "/onboarding", "description": "Вводный курс" }
    ],
    "mentions": ["@Катя", "@Katya"]
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

---

## 🤖 AI ИНТЕГРАЦИЯ: GPT-5 NANO

### Почему GPT-5 nano?

**Преимущества:**

1. ⚡ **Скорость**: В 3-5 раз быстрее GPT-4 (ответ за 0.5-1 сек вместо 2-3 сек)
2. 💰 **Цена**: В 10 раз дешевле GPT-4 ($0.10/1M tokens vs $1.00/1M)
3. 🎯 **Качество**: Отлично для суммаризации и извлечения информации
4. 📊 **Контекст**: До 128K токенов (достаточно для 100 сообщений)
5. 🌍 **Русский язык**: Хорошее понимание русского

**API конфигурация:**

```typescript
// src/ai/gpt5-client.ts
import OpenAI from "openai";

export class GPT5NanoClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async summarize(
    messages: string[],
    context?: string
  ): Promise<SummaryResult> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-nano", // или "gpt-4o-mini" если gpt-5-nano недоступен
      messages: [
        {
          role: "system",
          content: `Ты - Катя, AI-ассистент Boss AI Team.
          Твоя задача - суммаризировать обсуждения команды.
          Выдели: решения, участников, ключевые темы, нерешенные вопросы.
          Ответ дай в структурированном формате JSON.`,
        },
        {
          role: "user",
          content: `Суммаризируй следующие сообщения:\n\n${messages.join(
            "\n"
          )}`,
        },
      ],
      temperature: 0.3, // Низкая температура для точности
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async search(query: string, chatHistory: string[]): Promise<SearchResult> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `Ты - Катя. Найди в истории обсуждений ответ на вопрос.
          Укажи источники (message IDs) и сформулируй краткий ответ.`,
        },
        {
          role: "user",
          content: `Вопрос: ${query}\n\nИстория:\n${chatHistory.join("\n")}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return parseSearchResponse(response.choices[0].message.content);
  }
}
```

**Fallback стратегия:**

```typescript
// Если GPT-5 nano недоступен, использовать:
const AI_MODEL_PRIORITY = [
  "gpt-5-nano", // Приоритет 1
  "gpt-4o-mini", // Приоритет 2 (доступен сейчас)
  "claude-3-haiku", // Приоритет 3
  "gemini-1.5-flash", // Приоритет 4 (бесплатный)
];
```

---

## 💰 ИНТЕГРАЦИЯ С БИЛЛИНГОМ

### 1. Обновление service_pricing таблицы

```sql
-- Добавить тарифы Кати при старте сервиса
INSERT OR IGNORE INTO service_pricing (service_name, unit_type, price_per_unit, currency, is_active) VALUES
  ('katya_summarize', 'request', 5.0, 'RUB', 1),
  ('katya_search', 'request', 2.0, 'RUB', 1),
  ('katya_question', 'request', 3.0, 'RUB', 1),
  ('katya_onboarding', 'request', 0.0, 'RUB', 1),
  ('katya_decisions', 'request', 0.0, 'RUB', 1);
```

### 2. Middleware для автоматического списания

```typescript
// backend/main/src/middleware/katya-billing.middleware.ts
import { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service";

const billingService = new BillingService(process.env.DB_PATH!);

// Маппинг endpoint → service_name
const ENDPOINT_TO_SERVICE: Record<string, string> = {
  "/api/katya/summarize": "katya_summarize",
  "/api/katya/search": "katya_search",
  "/api/katya/question": "katya_question",
  "/api/katya/onboarding": "katya_onboarding",
  "/api/katya/decisions": "katya_decisions",
};

export async function katyaBillingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const serviceName = ENDPOINT_TO_SERVICE[req.path];

  if (!serviceName) {
    return next();
  }

  // Получить стоимость из service_pricing
  const pricing = await billingService
    .getServicePricing()
    .find((p) => p.service_name === serviceName);

  if (!pricing || pricing.price_per_unit === 0) {
    // Бесплатная функция
    return next();
  }

  const userId = (req as any).user.id;

  // Проверить баланс
  const balance = await billingService.getBalance(userId);
  const balanceBT = balance.balance_bt;
  const requiredBT = pricing.price_per_unit / 10; // RUB to BT

  if (balanceBT < requiredBT) {
    return res.status(402).json({
      success: false,
      error: "Insufficient funds",
      message: `Недостаточно средств. Требуется ${requiredBT} BT (${pricing.price_per_unit} ₽)`,
      balance: {
        current_bt: balanceBT,
        required_bt: requiredBT,
        deficit_bt: requiredBT - balanceBT,
      },
    });
  }

  // Сохранить информацию для списания после успешного ответа
  (req as any).katyaBilling = {
    serviceName,
    amount: pricing.price_per_unit,
    amountBT: requiredBT,
  };

  next();
}

// Middleware для списания после успешного ответа
export async function chargeAfterSuccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const billing = (req as any).katyaBilling;

    if (billing && body.success) {
      // Списать BT
      const userId = (req as any).user.id;
      billingService
        .charge(
          userId,
          billing.amount,
          billing.serviceName,
          `Katya AI: ${billing.serviceName}`
        )
        .catch((err) => {
          console.error("Billing error:", err);
        });
    }

    return originalJson(body);
  };

  next();
}
```

### 3. Применение middleware в API Gateway

```typescript
// backend/main/src/routes/katya.routes.ts
import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  katyaBillingMiddleware,
  chargeAfterSuccess,
} from "../middleware/katya-billing.middleware";
import { createKatyaProxy } from "../utils/proxy";

const router = express.Router();
const katyaProxy = createKatyaProxy(
  process.env.KATYA_SERVICE_URL || "http://localhost:4300"
);

// Все запросы к Кате: аутентификация → проверка баланса → прокси → списание
router.use(
  "/api/katya/*",
  authenticateToken,
  katyaBillingMiddleware,
  chargeAfterSuccess,
  katyaProxy
);

export default router;
```

---

## 🎨 FRONTEND ИНТЕГРАЦИЯ

### 1. Кнопка Кати в чате

```tsx
// frontend/src/components/Chat/ChatInput.tsx
import { Brain } from "lucide-react";

export function ChatInput() {
  const [showKatyaMenu, setShowKatyaMenu] = useState(false);

  return (
    <div className="chat-input-container">
      {/* Кнопка вызова Кати */}
      <button
        onClick={() => setShowKatyaMenu(!showKatyaMenu)}
        className="katya-button"
        title="Катя AI"
      >
        <Brain className="w-5 h-5" />
        <span>Катя</span>
      </button>

      {/* Меню быстрых команд */}
      {showKatyaMenu && (
        <div className="katya-menu">
          <button onClick={() => executeKatyaTool("summarize")}>
            📊 Суммаризация
          </button>
          <button onClick={() => executeKatyaTool("search")}>🔍 Поиск</button>
          <button onClick={() => executeKatyaTool("decisions")}>
            ✅ Решения
          </button>
          <button onClick={() => executeKatyaTool("onboarding")}>
            👋 Онбординг
          </button>
        </div>
      )}

      {/* Обычный input */}
      <input type="text" placeholder="Сообщение или @Катя для вызова..." />
    </div>
  );
}
```

### 2. Компонент настроек Кати

```tsx
// frontend/src/components/Services/KatyaSettings.tsx
import { useState, useEffect } from "react";

interface KatyaSettings {
  telegram_enabled: boolean;
  platform_chat_enabled: boolean;
  auto_summarize: boolean;
  auto_summarize_threshold: number;
  context_window: number;
  ai_model: string;
}

export function KatyaSettings() {
  const [settings, setSettings] = useState<KatyaSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("barsukov-token");
      const response = await fetch("/api/katya/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to load Katya settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<KatyaSettings>) => {
    try {
      const token = localStorage.getItem("barsukov-token");
      await fetch("/api/katya/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
      setSettings({ ...settings!, ...newSettings });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="katya-settings">
      <h2>⚙️ Настройки Кати</h2>

      <div className="setting-group">
        <h3>🤖 Режимы работы</h3>

        <label>
          <input
            type="checkbox"
            checked={settings?.platform_chat_enabled}
            onChange={(e) =>
              updateSettings({ platform_chat_enabled: e.target.checked })
            }
          />
          Включить Катю в чате платформы
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings?.telegram_enabled}
            onChange={(e) =>
              updateSettings({ telegram_enabled: e.target.checked })
            }
          />
          Telegram бот активен
        </label>
      </div>

      <div className="setting-group">
        <h3>🧠 AI настройки</h3>

        <label>
          Модель AI:
          <select
            value={settings?.ai_model}
            onChange={(e) => updateSettings({ ai_model: e.target.value })}
          >
            <option value="gpt-5-nano">GPT-5 nano (быстро, дешево)</option>
            <option value="gpt-4o-mini">GPT-4o mini (баланс)</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
        </label>

        <label>
          Размер контекста:
          <input
            type="number"
            value={settings?.context_window}
            onChange={(e) =>
              updateSettings({ context_window: parseInt(e.target.value) })
            }
            min="50"
            max="200"
          />
          сообщений
        </label>
      </div>

      <div className="setting-group">
        <h3>📊 Автоматизация</h3>

        <label>
          <input
            type="checkbox"
            checked={settings?.auto_summarize}
            onChange={(e) =>
              updateSettings({ auto_summarize: e.target.checked })
            }
          />
          Автоматическая суммаризация
        </label>

        {settings?.auto_summarize && (
          <label>
            Суммаризировать каждые:
            <input
              type="number"
              value={settings?.auto_summarize_threshold}
              onChange={(e) =>
                updateSettings({
                  auto_summarize_threshold: parseInt(e.target.value),
                })
              }
              min="50"
              max="500"
            />
            сообщений
          </label>
        )}
      </div>

      <div className="pricing-info">
        <h3>💰 Стоимость использования</h3>
        <ul>
          <li>
            📊 Суммаризация: <strong>0.5 BT</strong> (5 ₽)
          </li>
          <li>
            🔍 Поиск: <strong>0.2 BT</strong> (2 ₽)
          </li>
          <li>
            💬 Вопрос: <strong>0.3 BT</strong> (3 ₽)
          </li>
          <li>
            ✅ Решения: <strong>Бесплатно</strong>
          </li>
          <li>
            👋 Онбординг: <strong>Бесплатно</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

### 3. История диалога с Катей

```tsx
// frontend/src/components/Services/KatyaHistory.tsx
export function KatyaHistory() {
  const [history, setHistory] = useState<KatyaMessage[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem("barsukov-token");
    const response = await fetch("/api/katya/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setHistory(data.history);
  };

  return (
    <div className="katya-history">
      <h2>📚 История с Катей</h2>
      {history.map((msg) => (
        <div key={msg.id} className="history-item">
          <div className="query">
            <strong>Вы:</strong> {msg.query}
          </div>
          <div className="response">
            <strong>Катя:</strong> {msg.response}
          </div>
          <div className="meta">
            {new Date(msg.created_at * 1000).toLocaleString()} ·{msg.cost_bt} BT
            · {msg.service_name}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔌 BACKEND API ENDPOINTS

### Структура Katya Service Backend

```
backend/katya-service/
├── src/
│   ├── index.ts                    # Express server (port 4300)
│   ├── routes/
│   │   ├── summarize.route.ts      # POST /summarize
│   │   ├── search.route.ts         # POST /search
│   │   ├── question.route.ts       # POST /question
│   │   ├── decisions.route.ts      # GET /decisions
│   │   ├── onboarding.route.ts     # GET /onboarding
│   │   ├── settings.route.ts       # GET/PUT /settings
│   │   ├── history.route.ts        # GET /history
│   │   └── health.route.ts         # GET /health
│   ├── telegram/
│   │   ├── bot.ts                  # Telegram Bot инициализация
│   │   ├── handlers/
│   │   │   ├── mention.handler.ts
│   │   │   ├── command.handler.ts
│   │   │   └── message.handler.ts
│   │   └── keyboards.ts            # Inline keyboards
│   ├── ai/
│   │   ├── gpt5-client.ts          # GPT-5 nano клиент
│   │   ├── summarizer.ts
│   │   ├── search-engine.ts
│   │   └── prompts.ts
│   ├── database/
│   │   ├── connection.ts
│   │   ├── migrations.ts
│   │   └── repositories/
│   │       ├── messages.repo.ts
│   │       ├── summaries.repo.ts
│   │       ├── contexts.repo.ts
│   │       └── settings.repo.ts
│   └── services/
│       ├── context-manager.service.ts
│       ├── knowledge-base.service.ts
│       └── telegram-bridge.service.ts
```

### API Endpoints (примеры)

#### 1. POST /api/katya/summarize

```typescript
// Суммаризация обсуждений
router.post("/summarize", async (req, res) => {
  const { chatId, messageCount = 50, query } = req.body;
  const userId = (req as any).user.id;

  try {
    // Получить последние N сообщений
    const messages = await messagesRepo.getLastMessages(chatId, messageCount);

    // Суммаризация через GPT-5 nano
    const summary = await gpt5Client.summarize(messages, query);

    // Сохранить summary в БД
    await summariesRepo.create({
      chatId,
      summaryText: summary.text,
      messageCount: messages.length,
      keywords: summary.keywords,
    });

    res.json({
      success: true,
      data: {
        summary: summary.text,
        topics: summary.topics,
        decisions: summary.decisions,
        keywords: summary.keywords,
        message_count: messages.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

#### 2. POST /api/katya/search

```typescript
// Поиск по истории
router.post("/search", async (req, res) => {
  const { query, chatId, limit = 10 } = req.body;

  try {
    // Поиск в базе знаний
    const knowledgeResults = await knowledgeRepo.search(query);

    // Поиск в контекстах
    const contextResults = await contextsRepo.search(query, chatId);

    // Поиск в сообщениях
    const messageResults = await messagesRepo.search(query, chatId, limit);

    // Объединить результаты и ранжировать
    const results = rankResults([
      ...knowledgeResults,
      ...contextResults,
      ...messageResults,
    ]);

    res.json({
      success: true,
      data: {
        results,
        total: results.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

#### 3. POST /api/katya/question

```typescript
// Вопрос к Кате
router.post("/question", async (req, res) => {
  const { question, chatId } = req.body;

  try {
    // Получить релевантный контекст
    const context = await contextManager.getRelevantContext(question, chatId);

    // Запрос к GPT-5 nano
    const answer = await gpt5Client.answer(question, context);

    // Сохранить в knowledge base
    await knowledgeRepo.create({
      question,
      answer: answer.text,
      sourceChatId: chatId,
      sourceMessageIds: answer.sources,
    });

    res.json({
      success: true,
      data: {
        answer: answer.text,
        sources: answer.sources,
        confidence: answer.confidence,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

## 📱 TELEGRAM ИНТЕГРАЦИЯ

### Dual Mode: Platform + Telegram

**Катя работает в двух режимах одновременно:**

1. **Platform Mode** - отвечает в чате Boss AI
2. **Telegram Mode** - отвечает в TG чатах на @Катя

### Telegram Bot Handler

```typescript
// src/telegram/bot.ts
import TelegramBot from "node-telegram-bot-api";
import { GPT5NanoClient } from "../ai/gpt5-client";
import { MessagesRepository } from "../database/repositories/messages.repo";

export class KatyaTelegramBot {
  private bot: TelegramBot;
  private gpt5: GPT5NanoClient;
  private messagesRepo: MessagesRepository;

  constructor(token: string, gpt5ApiKey: string, dbPath: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.gpt5 = new GPT5NanoClient(gpt5ApiKey);
    this.messagesRepo = new MessagesRepository(dbPath);

    this.setupHandlers();
  }

  private setupHandlers() {
    // Логирование всех сообщений
    this.bot.on("message", async (msg) => {
      await this.messagesRepo.create({
        messageId: msg.message_id,
        chatId: msg.chat.id,
        telegramUserId: msg.from?.id,
        username: msg.from?.username,
        firstName: msg.from?.first_name,
        text: msg.text || "",
        isKatyaMention: this.isMentioned(msg.text),
      });
    });

    // Обработка @Катя упоминаний
    this.bot.on("message", async (msg) => {
      if (!this.isMentioned(msg.text)) return;

      try {
        // Показать typing...
        await this.bot.sendChatAction(msg.chat.id, "typing");

        // Получить контекст (последние 50 сообщений)
        const messages = await this.messagesRepo.getLastMessages(
          msg.chat.id,
          50
        );

        // Суммаризация
        const summary = await this.gpt5.summarize(messages, msg.text);

        // Отправить ответ с inline кнопками
        await this.bot.sendMessage(msg.chat.id, summary.text, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 Подробнее",
                  callback_data: `details_${summary.id}`,
                },
                {
                  text: "📊 Статистика",
                  callback_data: `stats_${msg.chat.id}`,
                },
              ],
              [
                {
                  text: "💬 Задать вопрос",
                  callback_data: `question_${msg.chat.id}`,
                },
              ],
            ],
          },
        });
      } catch (error) {
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
    this.bot.onText(/\/onboarding/, (msg) => this.handleOnboardingCommand(msg));
  }

  private isMentioned(text?: string): boolean {
    if (!text) return false;
    return (
      text.includes("@Катя") ||
      text.includes("@Katya") ||
      text.includes("@katya_boss_ai_bot")
    );
  }

  private async handleSummaryCommand(msg: TelegramBot.Message) {
    // Аналогично обработке @Катя
  }

  // ... другие handlers
}
```

---

## 💾 ОБНОВЛЕННАЯ СХЕМА БД

```sql
-- Добавить таблицу для хранения истории запросов с платформы
CREATE TABLE IF NOT EXISTS katya_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  request_type TEXT NOT NULL,  -- 'summarize', 'search', 'question'
  request_data TEXT,            -- JSON с деталями запроса
  response_data TEXT,           -- JSON с ответом
  cost_bt REAL NOT NULL,
  cost_rub REAL NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица настроек Кати (для каждого пользователя)
CREATE TABLE IF NOT EXISTS katya_user_settings (
  user_id INTEGER PRIMARY KEY,
  telegram_enabled BOOLEAN DEFAULT 1,
  platform_chat_enabled BOOLEAN DEFAULT 1,
  auto_summarize BOOLEAN DEFAULT 1,
  auto_summarize_threshold INTEGER DEFAULT 100,
  context_window INTEGER DEFAULT 100,
  ai_model TEXT DEFAULT 'gpt-5-nano',
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_katya_requests_user ON katya_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_katya_requests_type ON katya_requests(request_type);
```

---

## ✅ ОБНОВЛЕННЫЙ ЧЕКЛИСТ РАЗРАБОТКИ

### Этап 1: Service Config & Frontend (1-2 дня)

- [ ] Создать katya-service.json по образцу chatgpt-service.json
- [ ] Добавить кнопку Кати в ChatInput.tsx
- [ ] Создать KatyaSettings.tsx компонент
- [ ] Создать KatyaHistory.tsx компонент
- [ ] Интегрировать с PlatformContext

### Этап 2: Backend Microservice Core (2-3 дня)

- [ ] Инициализация Express server (port 4300)
- [ ] Подключение к БД Boss AI (shared SQLite)
- [ ] Миграции новых таблиц
- [ ] Endpoints: /summarize, /search, /question
- [ ] Health check endpoint

### Этап 3: GPT-5 Nano Integration (1 день)

- [ ] GPT5NanoClient класс
- [ ] Промпты для суммаризации
- [ ] Промпты для поиска
- [ ] Промпты для вопросов
- [ ] Error handling & fallback

### Этап 4: Telegram Bot (2 дня)

- [ ] Инициализация бота (polling)
- [ ] Логирование всех сообщений в chat_messages
- [ ] Обработка @Катя упоминаний
- [ ] Команды /summary, /search, /decisions
- [ ] Inline keyboards для навигации

### Этап 5: Billing Integration (1-2 дня)

- [ ] katyaBillingMiddleware в API Gateway
- [ ] chargeAfterSuccess middleware
- [ ] Интеграция с service_pricing
- [ ] Проверка баланса перед запросом
- [ ] Запись транзакций
- [ ] Уведомления о недостатке средств

### Этап 6: API Gateway Proxy (1 день)

- [ ] Добавить /api/katya/\* роуты в API Gateway
- [ ] Прокси к Katya Service (port 4300)
- [ ] Применить middleware (auth + billing)
- [ ] Health check интеграция

### Этап 7: PM2 & Deployment (1 день)

- [ ] Конфигурация PM2 для katya-service
- [ ] .env.example и документация
- [ ] Скрипт миграций БД
- [ ] README.md и INTEGRATION.md
- [ ] Тестирование на dev окружении

### Этап 8: Testing & Polish (2-3 дня)

- [ ] Unit тесты для AI функций
- [ ] Integration тесты для API
- [ ] Тестирование Telegram бота
- [ ] Тестирование биллинга
- [ ] UI/UX полировка
- [ ] Performance тесты

---

## 📦 DELIVERABLES

### 1. katya-service.tar.gz (архив для сервера)

```
katya-service/
├── dist/                  # Compiled JS
├── node_modules/          # Dependencies
├── package.json
├── .env.example
├── README.md
└── INTEGRATION.md
```

### 2. katya-service.json (для frontend/public/services/)

- Service configuration
- Tools definitions
- Billing settings
- Telegram config

### 3. INTEGRATION.md (подробная инструкция)

- SQL миграции
- PM2 configuration
- API Gateway setup
- Frontend integration
- Environment variables
- Testing checklist

### 4. Документация

- API Documentation (endpoints, request/response)
- Telegram Commands Guide
- User Guide (как пользоваться Катей)
- Admin Guide (настройка и мониторинг)

---

## 🎯 КЛЮЧЕВЫЕ УЛУЧШЕНИЯ V2.0

### Что добавлено по сравнению с v1.0:

1. ✅ **Полная интеграция как сервис платформы**

   - katya-service.json конфигурация
   - Кнопки в чате
   - Настройки на платформе

2. ✅ **GPT-5 nano вместо GPT-4**

   - В 3-5x быстрее
   - В 10x дешевле
   - Отличное качество для суммаризации

3. ✅ **Автоматический биллинг**

   - Интеграция через service_pricing
   - Middleware для проверки баланса
   - Прозрачность стоимости

4. ✅ **Dual Mode: Platform + Telegram**

   - Работает в чате платформы
   - Работает в Telegram
   - Единая БД для обоих режимов

5. ✅ **UI компоненты**

   - KatyaSettings для настройки
   - KatyaHistory для истории
   - Кнопка быстрого вызова в чате

6. ✅ **Расширенная схема БД**

   - katya_requests для истории
   - katya_user_settings для персонализации

---

## 💡 ROADMAP (будущие фичи)

### Phase 2 (после MVP):

- 🔔 Напоминания о дедлайнах из обсуждений
- 📈 Аналитика команды (/stats)
- 🎯 Автоматическое выделение TODO
- 🌐 Мультиязычность

### Phase 3 (масштабирование):

- 🔄 Интеграция с другими чатами (Slack, Discord)
- 📊 Dashboard с визуализацией решений
- 🤖 ML модель для предсказания решений
- 🔗 API для внешних интеграций

---

**ТЗ готово к реализации! 🚀**

Вопросы и уточнения: @boss
