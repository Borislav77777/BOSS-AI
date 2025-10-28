import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService, TelegramAuthData } from '../services/user-service';
import { generateToken, verifyToken } from '../utils/jwt';
import { validateTelegramAuth } from '../utils/telegram-auth';
import { Logger } from '../utils/logger';

const logger = new Logger();

/**
 * Auth Controller - эндпоинты авторизации
 * Согласно разделу 4 ТЗ
 */

/**
 * POST /api/auth/telegram/login
 * Валидация данных Telegram Login Widget и создание сессии
 */
export async function telegramLogin(req: Request, res: Response): Promise<void> {
  try {
    const telegramData = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      logger.error('TELEGRAM_BOT_TOKEN не установлен');
      res.status(500).json({
        success: false,
        error: 'Конфигурация бота не настроена'
      });
      return;
    }

    // Валидация данных Telegram
    if (!validateTelegramAuth(telegramData, botToken)) {
      logger.warn('Невалидные данные Telegram авторизации');
      res.status(400).json({
        success: false,
        error: 'Невалидные данные авторизации'
      });
      return;
    }

    const userService = new UserService(process.env.DB_PATH || './data/ozon_manager.db');
    
    try {
      // Поиск существующего пользователя
      let user = userService.findByTelegramId(telegramData.id);
      
      if (user) {
        // Обновляем данные пользователя
        userService.updateUserData(telegramData.id, telegramData);
        user = userService.findByTelegramId(telegramData.id)!;
        logger.info(`Пользователь ${user.username || user.first_name} вошел в систему`);
      } else {
        // Создаем нового пользователя
        user = userService.createUser(telegramData);
        logger.info(`Создан новый пользователь ${user.username || user.first_name}`);
      }

      // Обновляем время входа
      userService.updateLastLogin(user.id);

      // Генерируем JWT токен
      const token = generateToken(user.id, user.telegram_id);

      // Проверяем нужно ли соглашение
      const needsAgreement = !user.agreed_to_terms;

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            telegram_id: user.telegram_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            photo_url: user.photo_url,
            agreed_to_terms: user.agreed_to_terms
          },
          token,
          needsAgreement
        }
      });

    } catch (error) {
      logger.error('Ошибка обработки Telegram авторизации:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
      });
    } finally {
      userService.close();
    }
  } catch (error) {
    logger.error('Ошибка в telegramLogin:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
}

/**
 * GET /api/auth/me
 * Получение данных текущего пользователя
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userService = new UserService(process.env.DB_PATH || './data/ozon_manager.db');
    
    try {
      const user = userService.getUserById(req.user!.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          telegram_id: user.telegram_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          photo_url: user.photo_url,
          agreed_to_terms: user.agreed_to_terms,
          created_at: user.created_at,
          last_login: user.last_login
        }
      });

    } finally {
      userService.close();
    }
  } catch (error) {
    logger.error('Ошибка в getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
}

/**
 * POST /api/auth/logout
 * Выход из системы
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    // В будущем здесь можно добавить логику удаления сессии из БД
    // Пока просто возвращаем успех
    logger.info(`Пользователь ${req.user!.userId} вышел из системы`);
    
    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    logger.error('Ошибка в logout:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
}

/**
 * POST /api/auth/telegram/agree
 * Подтверждение пользовательского соглашения
 */
export async function telegramAgree(req: Request, res: Response): Promise<void> {
  try {
    const { telegram_id, agreed } = req.body;

    if (typeof telegram_id !== 'number' || typeof agreed !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'Невалидные данные запроса'
      });
      return;
    }

    const userService = new UserService(process.env.DB_PATH || './data/ozon_manager.db');
    
    try {
      const success = userService.updateAgreement(telegram_id, agreed);
      
      if (success) {
        logger.info(`Согласие пользователя ${telegram_id} обновлено: ${agreed}`);
        res.json({
          success: true,
          message: 'Соглашение принято'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }

    } finally {
      userService.close();
    }
  } catch (error) {
    logger.error('Ошибка в telegramAgree:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
}
