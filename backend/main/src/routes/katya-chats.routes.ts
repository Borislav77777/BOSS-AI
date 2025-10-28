import Database from "better-sqlite3";
import { Request, Response, Router } from "express";
import path from "path";
import { authenticateToken } from "../middleware/auth.middleware";
import { BillingService } from "../services/billing.service";

const router = Router();

// Подключение к базе данных (shared с ozon-manager)
const dbPath =
  process.env.DB_PATH ||
  path.join(__dirname, "../../ozon-manager/data/ozon_manager.db");
const db = new Database(dbPath);
const billingService = new BillingService(dbPath);

// Включить WAL mode для лучшей производительности
db.pragma("journal_mode = WAL");

/**
 * GET /api/katya-chats
 * Получить список всех Telegram чатов пользователя с Катей
 */
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Получить все чаты пользователя с Катей
    const chats = db
      .prepare(
        `
      SELECT
        k.telegram_chat_id,
        k.chat_name,
        k.chat_type,
        k.is_active,
        k.created_at,
        COUNT(cm.id) as message_count,
        MAX(cm.created_at) as last_activity
      FROM katya_user_chats k
      LEFT JOIN chat_messages cm ON k.user_id = cm.user_id AND k.telegram_chat_id = cm.telegram_chat_id
      WHERE k.user_id = ? AND k.is_active = 1
      GROUP BY k.telegram_chat_id, k.chat_name, k.chat_type, k.is_active, k.created_at
      ORDER BY last_activity DESC, k.created_at DESC
    `
      )
      .all(userId);

    // Форматировать данные
    const formattedChats = chats.map((chat: any) => ({
      telegram_chat_id: chat.telegram_chat_id,
      chat_name: chat.chat_name,
      chat_type: chat.chat_type,
      is_active: Boolean(chat.is_active),
      message_count: chat.message_count || 0,
      last_activity: chat.last_activity
        ? new Date(chat.last_activity * 1000).toISOString()
        : null,
      created_at: new Date(chat.created_at * 1000).toISOString(),
    }));

    res.json({
      success: true,
      data: {
        chats: formattedChats,
        total: formattedChats.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching Katya chats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/katya-chats/:chatId
 * Получить детали конкретного чата
 */
router.get(
  "/:chatId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const chatId = req.params.chatId;

      // Проверить что пользователь имеет доступ к этому чату
      const chatAccess = db
        .prepare(
          `
      SELECT id FROM katya_user_chats
      WHERE user_id = ? AND telegram_chat_id = ? AND is_active = 1
    `
        )
        .get(userId, chatId);

      if (!chatAccess) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "У вас нет доступа к этому чату",
        });
      }

      // Получить детали чата
      const chatDetails = db
        .prepare(
          `
      SELECT
        k.telegram_chat_id,
        k.chat_name,
        k.chat_type,
        k.is_active,
        k.created_at,
        COUNT(cm.id) as message_count,
        COUNT(CASE WHEN cm.is_katya_mention = 1 THEN 1 END) as katya_mentions,
        MAX(cm.created_at) as last_activity,
        MIN(cm.created_at) as first_message
      FROM katya_user_chats k
      LEFT JOIN chat_messages cm ON k.user_id = cm.user_id AND k.telegram_chat_id = cm.telegram_chat_id
      WHERE k.user_id = ? AND k.telegram_chat_id = ?
      GROUP BY k.telegram_chat_id, k.chat_name, k.chat_type, k.is_active, k.created_at
    `
        )
        .get(userId, chatId);

      if (!chatDetails) {
        return res.status(404).json({
          success: false,
          error: "Chat not found",
          message: "Чат не найден",
        });
      }

      const details = chatDetails as any;
      res.json({
        success: true,
        data: {
          telegram_chat_id: details.telegram_chat_id,
          chat_name: details.chat_name,
          chat_type: details.chat_type,
          is_active: Boolean(details.is_active),
          message_count: details.message_count || 0,
          katya_mentions: details.katya_mentions || 0,
          last_activity: details.last_activity
            ? new Date(details.last_activity * 1000).toISOString()
            : null,
          first_message: details.first_message
            ? new Date(details.first_message * 1000).toISOString()
            : null,
          created_at: new Date(details.created_at * 1000).toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Error fetching chat details:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/katya-chats/:chatId/messages
 * Получить историю сообщений чата с пагинацией
 */
router.get(
  "/:chatId/messages",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const chatId = req.params.chatId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Проверить доступ к чату
      const chatAccess = db
        .prepare(
          `
      SELECT id FROM katya_user_chats
      WHERE user_id = ? AND telegram_chat_id = ? AND is_active = 1
    `
        )
        .get(userId, chatId);

      if (!chatAccess) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "У вас нет доступа к этому чату",
        });
      }

      // Получить сообщения с пагинацией
      const messages = db
        .prepare(
          `
      SELECT
        id,
        message_id,
        telegram_user_id,
        username,
        first_name,
        text,
        is_katya_mention,
        created_at
      FROM chat_messages
      WHERE user_id = ? AND telegram_chat_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
        )
        .all(userId, chatId, limit, offset);

      // Получить общее количество сообщений
      const totalCount = db
        .prepare(
          `
      SELECT COUNT(*) as count FROM chat_messages
      WHERE user_id = ? AND telegram_chat_id = ?
    `
        )
        .get(userId, chatId) as any;

      // Форматировать сообщения
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        message_id: msg.message_id,
        telegram_user_id: msg.telegram_user_id,
        username: msg.username,
        first_name: msg.first_name,
        text: msg.text,
        is_katya_mention: Boolean(msg.is_katya_mention),
        created_at: new Date(msg.created_at * 1000).toISOString(),
      }));

      res.json({
        success: true,
        data: {
          messages: formattedMessages,
          pagination: {
            total: totalCount?.count || 0,
            limit,
            offset,
            has_more: offset + limit < (totalCount?.count || 0),
          },
        },
      });
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/katya-chats/:chatId/stats
 * Получить статистику чата
 */
router.get(
  "/:chatId/stats",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const chatId = req.params.chatId;

      // Проверить доступ к чату
      const chatAccess = db
        .prepare(
          `
      SELECT id FROM katya_user_chats
      WHERE user_id = ? AND telegram_chat_id = ? AND is_active = 1
    `
        )
        .get(userId, chatId);

      if (!chatAccess) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "У вас нет доступа к этому чату",
        });
      }

      // Получить статистику
      const stats = db
        .prepare(
          `
      SELECT
        COUNT(*) as total_messages,
        COUNT(CASE WHEN is_katya_mention = 1 THEN 1 END) as katya_mentions,
        COUNT(DISTINCT telegram_user_id) as unique_users,
        MIN(created_at) as first_message_at,
        MAX(created_at) as last_message_at
      FROM chat_messages
      WHERE user_id = ? AND telegram_chat_id = ?
    `
        )
        .get(userId, chatId) as any;

      // Получить топ пользователей по активности
      const topUsers = db
        .prepare(
          `
      SELECT
        telegram_user_id,
        username,
        first_name,
        COUNT(*) as message_count
      FROM chat_messages
      WHERE user_id = ? AND telegram_chat_id = ?
      GROUP BY telegram_user_id, username, first_name
      ORDER BY message_count DESC
      LIMIT 5
    `
        )
        .all(userId, chatId);

      res.json({
        success: true,
        data: {
          total_messages: stats?.total_messages || 0,
          katya_mentions: stats?.katya_mentions || 0,
          unique_users: stats?.unique_users || 0,
          first_message_at: stats?.first_message_at
            ? new Date(stats.first_message_at * 1000).toISOString()
            : null,
          last_message_at: stats?.last_message_at
            ? new Date(stats.last_message_at * 1000).toISOString()
            : null,
          top_users: topUsers.map((user: any) => ({
            telegram_user_id: user.telegram_user_id,
            username: user.username,
            first_name: user.first_name,
            message_count: user.message_count,
          })),
        },
      });
    } catch (error: any) {
      console.error("Error fetching chat stats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/katya-chats/:chatId/summarize
 * Запросить суммаризацию чата через AI
 */
router.post(
  "/:chatId/summarize",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const chatId = req.params.chatId;
      const { message_count = 50, query } = req.body;

      // Проверить доступ к чату
      const chatAccess = db
        .prepare(
          `
      SELECT id FROM katya_user_chats
      WHERE user_id = ? AND telegram_chat_id = ? AND is_active = 1
    `
        )
        .get(userId, chatId);

      if (!chatAccess) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "У вас нет доступа к этому чату",
        });
      }

      // Получить последние сообщения для суммаризации
      const messages = db
        .prepare(
          `
      SELECT
        username,
        first_name,
        text,
        created_at
      FROM chat_messages
      WHERE user_id = ? AND telegram_chat_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `
        )
        .all(userId, chatId, message_count);

      if (messages.length === 0) {
        return res.json({
          success: true,
          data: {
            summary: "Нет сообщений для суммаризации",
            topics: [],
            decisions: [],
            keywords: [],
            message_count: 0,
          },
        });
      }

      // Проверить баланс перед AI запросом
      const balance = billingService.getBalance(Number(userId));
      const cost = 0.5; // BT токены за суммаризацию

      if (balance.balance_bt < cost) {
        return res.status(402).json({
          success: false,
          error: "Insufficient funds",
          message: "Недостаточно средств. Пополните баланс BT токенов.",
          data: {
            balance_bt: balance.balance_bt,
            required_bt: cost,
          },
        });
      }

      // Подготовить сообщения для AI
      const messagesText = messages
        .reverse() // Восстановить хронологический порядок
        .map(
          (msg: any) =>
            `[${new Date(msg.created_at * 1000).toLocaleString()}] ${
              msg.username || msg.first_name
            }: ${msg.text}`
        )
        .join("\n");

      // Создать промпт для суммаризации
      const prompt = `Ты - Катя, AI-ассистент команды Boss AI.
Твоя задача - суммаризировать обсуждения команды.

${query ? `Контекст запроса: ${query}` : ""}

Сообщения (${messages.length} шт.):
${messagesText}

Выдели:
- Краткое резюме (2-3 предложения)
- Основные темы обсуждения
- Принятые решения (кто решил, когда)
- Нерешенные вопросы
- Ключевые слова

Ответ дай структурированно.`;

      // Сделать AI запрос через существующий AI сервис
      const aiServices = require("../services/ai-services.service");
      const aiService = new aiServices.AIServicesService();

      const aiResponse = await aiService.sendChatGPTRequest(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 2000,
      });

      // Списать средства
      billingService.charge(
        Number(userId),
        cost,
        "katya_summarize",
        "Суммаризация чата через веб-интерфейс"
      );

      // Простой парсинг ответа (можно улучшить)
      const content = aiResponse.choices[0].message.content;

      // Извлечь темы (примитивно)
      const topicsMatch = content.match(/темы?:?\s*([^\n]+)/i);
      const topics = topicsMatch
        ? topicsMatch[1]
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      // Извлечь решения (примитивно)
      const decisionsMatch = content.match(/решени[яе]:?\s*([^\n]+)/i);
      const decisions = decisionsMatch
        ? [{ decision: decisionsMatch[1].trim() }]
        : [];

      // Извлечь ключевые слова (примитивно)
      const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const keywords = [...new Set(words)].slice(0, 5);

      res.json({
        success: true,
        data: {
          summary: content,
          topics,
          decisions,
          keywords,
          message_count: messages.length,
          cost_bt: cost,
        },
      });
    } catch (error: any) {
      console.error("Error summarizing chat:", error);

      if (error.message === "Insufficient funds") {
        return res.status(402).json({
          success: false,
          error: "Insufficient funds",
          message: "Недостаточно средств. Пополните баланс BT токенов.",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

export default router;
