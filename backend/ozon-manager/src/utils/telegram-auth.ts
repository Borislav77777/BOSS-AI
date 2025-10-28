import crypto from 'crypto';
import { Logger } from './logger';

const logger = new Logger();

/**
 * Валидация Telegram Login Widget данных
 * Согласно разделу 9.1 ТЗ - HMAC-SHA256 валидация
 */

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Проверка валидности данных Telegram Login Widget
 * @param data - Данные от Telegram Widget
 * @param botToken - Токен бота
 * @returns true если данные валидны
 */
export function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  try {
    // Проверка auth_date (не старше 24 часов)
    const currentTime = Math.floor(Date.now() / 1000);
    const authDate = data.auth_date;
    const maxAge = 24 * 60 * 60; // 24 часа в секундах

    if (currentTime - authDate > maxAge) {
      logger.warn(`Telegram auth_date слишком старый: ${authDate}, текущее время: ${currentTime}`);
      return false;
    }

    // Извлечение hash из данных
    const { hash, ...fields } = data;

    // Создание data-check-string согласно документации Telegram
    const checkString = Object.keys(fields)
      .sort()
      .map(key => `${key}=${fields[key as keyof typeof fields]}`)
      .join('\n');

    // Создание secret key из bot token
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Вычисление HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    const isValid = hmac === hash;

    if (isValid) {
      logger.info(`Telegram авторизация успешно проверена для пользователя ${data.id} (${data.username || data.first_name})`);
    } else {
      logger.warn(`Невалидный hash для пользователя ${data.id}: ожидался ${hmac}, получен ${hash}`);
    }

    return isValid;
  } catch (error) {
    logger.error('Ошибка проверки Telegram авторизации:', error);
    return false;
  }
}

/**
 * Проверка обязательных полей в данных Telegram
 * @param data - Данные от Telegram Widget
 * @returns true если все обязательные поля присутствуют
 */
export function validateTelegramFields(data: any): data is TelegramAuthData {
  const requiredFields = ['id', 'first_name', 'auth_date', 'hash'];
  
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      logger.warn(`Отсутствует обязательное поле ${field} в данных Telegram`);
      return false;
    }
  }

  // Проверка типов
  if (typeof data.id !== 'number' || data.id <= 0) {
    logger.warn('Невалидный Telegram ID');
    return false;
  }

  if (typeof data.first_name !== 'string' || data.first_name.trim().length === 0) {
    logger.warn('Невалидное имя пользователя');
    return false;
  }

  if (typeof data.auth_date !== 'number' || data.auth_date <= 0) {
    logger.warn('Невалидная дата авторизации');
    return false;
  }

  if (typeof data.hash !== 'string' || data.hash.length === 0) {
    logger.warn('Невалидный hash');
    return false;
  }

  return true;
}

/**
 * Полная валидация данных Telegram (поля + hash)
 * @param data - Данные от Telegram Widget
 * @param botToken - Токен бота
 * @returns true если данные полностью валидны
 */
export function validateTelegramAuth(data: any, botToken: string): data is TelegramAuthData {
  // Сначала проверяем поля
  if (!validateTelegramFields(data)) {
    return false;
  }

  // Затем проверяем hash
  return verifyTelegramAuth(data, botToken);
}
