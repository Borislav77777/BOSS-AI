import jwt from 'jsonwebtoken';
import { Logger } from './logger';

const logger = new Logger();

/**
 * JWT утилиты для генерации и проверки токенов
 * Согласно разделу 9.2 ТЗ
 */

export interface JWTPayload {
  userId: number;
  telegramId: number;
  iat?: number;
  exp?: number;
}

/**
 * Генерация JWT токена
 * @param userId - ID пользователя в БД
 * @param telegramId - Telegram ID пользователя
 * @returns JWT токен
 */
export function generateToken(userId: number, telegramId: number): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET не установлен в переменных окружения');
  }

  const payload: JWTPayload = {
    userId,
    telegramId
  };

  try {
    const token = jwt.sign(payload, secret);
    logger.info(`JWT токен сгенерирован для пользователя ${userId} (Telegram: ${telegramId})`);
    return token;
  } catch (error: any) {
    logger.error('Ошибка генерации JWT токена:', error);
    throw new Error('Не удалось сгенерировать токен');
  }
}

/**
 * Проверка и декодирование JWT токена
 * @param token - JWT токен
 * @returns Декодированный payload или null если невалиден
 */
export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error('JWT_SECRET не установлен в переменных окружения');
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    logger.debug(`JWT токен проверен для пользователя ${decoded.userId}`);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT токен истек');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Невалидный JWT токен');
    } else {
      logger.error('Ошибка проверки JWT токена:', error);
    }
    return null;
  }
}

/**
 * Проверка валидности токена без декодирования
 * @param token - JWT токен
 * @returns true если токен валиден
 */
export function isTokenValid(token: string): boolean {
  return verifyToken(token) !== null;
}

/**
 * Получение времени истечения токена
 * @param token - JWT токен
 * @returns Время истечения в миллисекундах или null
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (error) {
    logger.error('Ошибка декодирования токена для получения времени истечения:', error);
    return null;
  }
}
