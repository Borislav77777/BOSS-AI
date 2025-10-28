/**
 * TelegramBotService - Сервис для работы с Telegram Bot
 *
 * Обрабатывает команды и callback queries от Telegram бота:
 * - /start с deep linking для подтверждения соглашения
 * - Inline кнопки "Принять" / "Отклонить" соглашение
 * - Обновление статуса соглашения в БД
 *
 * @module services/telegram-bot-service
 */

import TelegramBot from "node-telegram-bot-api";
import { Logger } from "../utils/logger";
import { UserService } from "./user-service";

const logger = new Logger();

export class TelegramBotService {
  private bot: TelegramBot;
  private userService: UserService;

  constructor(token: string, dbPath: string) {
    // Webhook mode - не используем polling
    this.bot = new TelegramBot(token, { polling: false });
    this.userService = new UserService(dbPath);

    logger.info("TelegramBotService инициализирован в webhook режиме");
  }

  /**
   * Обработка webhook от Telegram
   */
  async handleUpdate(update: TelegramBot.Update): Promise<void> {
    try {
      logger.debug("Получен update от Telegram:", {
        updateId: update.update_id,
        type: update.message
          ? "message"
          : update.callback_query
          ? "callback_query"
          : "unknown",
      });

      // Обработка сообщений
      if (update.message) {
        await this.handleMessage(update.message);
      }

      // Обработка callback queries (inline кнопки)
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      logger.error("Ошибка обработки Telegram update:", error);
      throw error;
    }
  }

  /**
   * Обработка сообщений от пользователей
   */
  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text;

    logger.debug(`Получено сообщение от ${chatId}: ${text}`);

    // Обработка команды /start
    if (text.startsWith("/start")) {
      await this.handleStart(msg);
    } else {
      // Отправляем приветственное сообщение для других команд
      await this.bot.sendMessage(
        chatId,
        "👋 Добро пожаловать в Boss AI!\n\n" +
          "Для подтверждения пользовательского соглашения используйте команду /start с параметром из приложения."
      );
    }
  }

  /**
   * Обработка команды /start с deep linking
   */
  private async handleStart(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text || "";
    const telegramId = msg.from?.id;

    if (!telegramId) {
      logger.warn("Не удалось получить telegram_id из сообщения");
      await this.bot.sendMessage(
        chatId,
        "❌ Ошибка: не удалось определить пользователя"
      );
      return;
    }

    logger.info(`Обработка /start от пользователя ${telegramId}`);

    // Парсинг параметра: /start auth_{userId}
    const match = text.match(/\/start auth_(\d+)/);
    if (!match) {
      await this.bot.sendMessage(
        chatId,
        "👋 Добро пожаловать в Boss AI!\n\n" +
          "Для подтверждения пользовательского соглашения используйте ссылку из приложения."
      );
      return;
    }

    const userId = parseInt(match[1]);
    logger.info(`Deep link: auth_${userId} от telegram_id ${telegramId}`);

    try {
      // Поиск пользователя в БД
      const user = this.userService.findByTelegramId(telegramId);

      if (!user) {
        logger.warn(`Пользователь с telegram_id ${telegramId} не найден в БД`);
        await this.bot.sendMessage(
          chatId,
          "❌ Пользователь не найден. Пожалуйста, сначала авторизуйтесь в приложении."
        );
        return;
      }

      // Проверяем что userId совпадает
      if (user.id !== userId) {
        logger.warn(
          `Несоответствие userId: ожидался ${userId}, получен ${user.id}`
        );
        await this.bot.sendMessage(
          chatId,
          "❌ Ошибка авторизации. Пожалуйста, используйте ссылку из приложения."
        );
        return;
      }

      // Проверяем статус соглашения
      if (user.agreed_to_terms) {
        await this.bot.sendMessage(
          chatId,
          "✅ Соглашение уже принято!\n\n" +
            "Вы можете вернуться в приложение и продолжить работу."
        );
        return;
      }

      // Отправляем сообщение с кнопками
      await this.sendAgreementMessage(chatId, user.id);
    } catch (error) {
      logger.error("Ошибка обработки /start:", error);
      await this.bot.sendMessage(
        chatId,
        "❌ Произошла ошибка. Попробуйте позже или обратитесь в поддержку."
      );
    }
  }

  /**
   * Отправка сообщения с кнопками соглашения
   */
  private async sendAgreementMessage(
    chatId: number,
    userId: number
  ): Promise<void> {
    const message =
      "📋 **Пользовательское соглашение Boss AI**\n\n" +
      "Для использования платформы необходимо принять условия использования:\n\n" +
      "• Обработка данных Telegram (ID, имя, username, фото)\n" +
      "• Конфиденциальность и безопасность данных\n" +
      "• Возможность удаления аккаунта\n" +
      "• Соблюдение законодательства\n\n" +
      "Выберите действие:";

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Принять",
            callback_data: `agree_yes_${userId}`,
          },
          {
            text: "❌ Отклонить",
            callback_data: `agree_no_${userId}`,
          },
        ],
      ],
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    logger.info(`Отправлено сообщение с кнопками для пользователя ${userId}`);
  }

  /**
   * Обработка callback queries (нажатия на inline кнопки)
   */
  private async handleCallbackQuery(
    query: TelegramBot.CallbackQuery
  ): Promise<void> {
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const data = query.data;

    if (!chatId || !messageId || !data) {
      logger.warn("Неполные данные callback query:", {
        chatId,
        messageId,
        data,
      });
      return;
    }

    logger.info(`Обработка callback query: ${data} от ${query.from?.id}`);

    try {
      // Парсинг callback_data: agree_yes_{userId} или agree_no_{userId}
      const match = data.match(/agree_(yes|no)_(\d+)/);
      if (!match) {
        await this.bot.answerCallbackQuery(query.id, {
          text: "❌ Неверная команда",
        });
        return;
      }

      const action = match[1]; // 'yes' или 'no'
      const userId = parseInt(match[2]);

      if (action === "yes") {
        await this.handleAgreementAccept(chatId, messageId, userId, query.id);
      } else {
        await this.handleAgreementDecline(chatId, messageId, userId, query.id);
      }
    } catch (error) {
      logger.error("Ошибка обработки callback query:", error);
      await this.bot.answerCallbackQuery(query.id, {
        text: "❌ Произошла ошибка",
      });
    }
  }

  /**
   * Обработка принятия соглашения
   */
  private async handleAgreementAccept(
    chatId: number,
    messageId: number,
    userId: number,
    callbackQueryId: string
  ): Promise<void> {
    try {
      // Обновляем статус соглашения в БД
      this.userService.updateAgreement(userId, true);

      logger.info(`Пользователь ${userId} принял соглашение`);

      // Отправляем подтверждение
      await this.bot.answerCallbackQuery(callbackQueryId, {
        text: "✅ Соглашение принято!",
      });

      // Обновляем сообщение
      const newMessage =
        "✅ **Соглашение принято!**\n\n" +
        "Спасибо! Теперь вы можете вернуться в приложение и продолжить работу с Boss AI.";

      await this.bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
      });
    } catch (error) {
      logger.error("Ошибка принятия соглашения:", error);
      await this.bot.answerCallbackQuery(callbackQueryId, {
        text: "❌ Ошибка обновления",
      });
    }
  }

  /**
   * Обработка отклонения соглашения
   */
  private async handleAgreementDecline(
    chatId: number,
    messageId: number,
    userId: number,
    callbackQueryId: string
  ): Promise<void> {
    try {
      logger.info(`Пользователь ${userId} отклонил соглашение`);

      // Отправляем подтверждение
      await this.bot.answerCallbackQuery(callbackQueryId, {
        text: "❌ Соглашение отклонено",
      });

      // Обновляем сообщение
      const newMessage =
        "❌ **Соглашение отклонено**\n\n" +
        "Без принятия соглашения вы не сможете использовать платформу Boss AI.\n\n" +
        "Если передумаете, можете снова открыть ссылку из приложения.";

      await this.bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
      });
    } catch (error) {
      logger.error("Ошибка отклонения соглашения:", error);
      await this.bot.answerCallbackQuery(callbackQueryId, {
        text: "❌ Ошибка обработки",
      });
    }
  }

  /**
   * Отправка уведомления о балансе
   */
  async sendBalanceNotification(
    telegramId: number,
    balance: number,
    lastTransaction: string
  ): Promise<void> {
    try {
      const message = `💰 Баланс обновлён\n\nТекущий баланс: ${balance.toFixed(
        2
      )} ₽\nОперация: ${lastTransaction}`;

      await this.bot.sendMessage(telegramId, message);
      logger.info(
        `Уведомление о балансе отправлено: telegramId=${telegramId}, balance=${balance}`
      );
    } catch (error) {
      logger.error("Ошибка отправки уведомления о балансе:", error);
    }
  }

  /**
   * Отправка уведомления о недостатке средств
   */
  async sendLowBalanceWarning(
    telegramId: number,
    balance: number,
    required: number
  ): Promise<void> {
    try {
      const message = `⚠️ Недостаточно средств\n\nТекущий баланс: ${balance.toFixed(
        2
      )} ₽\nТребуется: ${required.toFixed(
        2
      )} ₽\n\nПополните баланс для продолжения работы.`;

      await this.bot.sendMessage(telegramId, message);
      logger.info(
        `Предупреждение о низком балансе отправлено: telegramId=${telegramId}, balance=${balance}`
      );
    } catch (error) {
      logger.error("Ошибка отправки предупреждения о балансе:", error);
    }
  }

  /**
   * Закрытие соединения
   */
  close(): void {
    this.userService.close();
    logger.info("TelegramBotService закрыт");
  }
}
