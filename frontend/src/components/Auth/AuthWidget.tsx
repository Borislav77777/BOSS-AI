/**
 * AuthWidget - Виджет авторизации через Telegram
 *
 * Показывается при старте приложения если пользователь не авторизован.
 * Блокирует доступ к интерфейсу до завершения авторизации.
 *
 * @module components/Auth/AuthWidget
 */

import { authService } from '@/services/AuthService';
import type { AuthUser, TelegramAuthData } from '@/types/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { AgreementDialog } from './AgreementDialog';
import { TelegramAuthButton } from './TelegramAuthButton';

interface AuthWidgetProps {
  /** Callback при успешной авторизации */
  onAuthSuccess: (user: AuthUser, token: string) => void;

  /** Callback при ошибке */
  onAuthError?: (error: string) => void;
}

/**
 * Виджет авторизации
 */
export function AuthWidget({ onAuthSuccess, onAuthError }: AuthWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  /**
   * Обработка авторизации через Telegram
   */
  const handleTelegramAuth = async (telegramData: TelegramAuthData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthWidget] Получены данные от Telegram:', telegramData);

      // Отправляем данные на backend
      // authService.loginWithTelegram уже сохраняет токен и пользователя в localStorage
      const result = await authService.loginWithTelegram(telegramData);

      console.log('[AuthWidget] Результат авторизации:', {
        userId: result.user.id,
        needsAgreement: result.needsAgreement,
      });

      // Если нужно принять соглашение
      if (result.needsAgreement) {
        setPendingUser(result.user);
        setPendingToken(result.token);
        setShowAgreement(true);
      } else {
        // Авторизация завершена - вызываем callback для обновления состояния приложения
        // Токен и пользователь уже сохранены в localStorage через authService
        onAuthSuccess(result.user, result.token);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка авторизации';
      console.error('[AuthWidget] Ошибка авторизации:', err);
      setError(errorMessage);

      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработка входа в демо-режим
   */
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthWidget] Вход в демо-режим');

      // Создаем демо-пользователя
      const demoUser: AuthUser = {
        id: 0,
        telegram_id: 0,
        username: 'demo_user',
        first_name: 'Demo',
        last_name: 'User',
        photo_url: undefined,
        agreed_to_terms: true,
        // auth_date: Date.now(),
      };

      const demoToken = 'demo-token';

      // Сохраняем в localStorage
      authService.setStoredToken(demoToken);
      authService.setStoredUser(demoUser);

      console.log('[AuthWidget] Демо-авторизация успешна');

      // Авторизация завершена
      onAuthSuccess(demoUser, demoToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа в демо-режим';
      console.error('[AuthWidget] Ошибка демо-входа:', err);
      setError(errorMessage);

      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработка принятия соглашения
   */
  const handleAgreementAccept = async () => {
    if (!pendingUser || !pendingToken) return;

    setIsLoading(true);
    try {
      await authService.confirmAgreement(pendingUser.telegram_id, true);
      console.log('[AuthWidget] Соглашение принято');

      // Авторизация завершена
      onAuthSuccess(pendingUser, pendingToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка подтверждения соглашения';
      console.error('[AuthWidget] Ошибка подтверждения:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработка отклонения соглашения
   */
  const handleAgreementDecline = () => {
    console.log('[AuthWidget] Соглашение отклонено');
    // Очищаем данные и возвращаемся к экрану авторизации
    setPendingUser(null);
    setPendingToken(null);
    setShowAgreement(false);
    authService.clearStorage();
  };

  return (
    <>
      {/* Основной виджет авторизации */}
      <motion.div
        className="auth-widget-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="auth-widget-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Лого (минимализм) */}
          <div className="auth-logo">
            <span>B</span>
            <span>o</span>
            <span>s</span>
            <span>s</span>
            <span> </span>
            <span>A</span>
            <span>I</span>
          </div>

          {/* Кнопка Telegram с рамками поверх */}
          {!isLoading && (
            <div className="auth-telegram-wrapper">
              <TelegramAuthButton
                botUsername={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'test_bot'}
                onAuth={handleTelegramAuth}
                onError={(err: string) => setError(err)}
              />
            </div>
          )}

          {/* Индикатор загрузки */}
          {isLoading && (
            <motion.div
              className="flex items-center justify-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-blue"></div>
              <span className="ml-3 text-text-secondary">Авторизация...</span>
            </motion.div>
          )}

          {/* Ошибка */}
          {error && (
            <motion.div
              className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Demo режим скрыт по требованию дизайна */}
        </motion.div>
      </motion.div>

      {/* Диалог соглашения */}
      <AnimatePresence>
        {showAgreement && pendingUser && (
          <AgreementDialog
            user={pendingUser}
            onAccept={handleAgreementAccept}
            onDecline={handleAgreementDecline}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}
