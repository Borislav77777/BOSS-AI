/**
 * AgreementDialog - Диалог пользовательского соглашения
 * 
 * Показывается после успешной авторизации в Telegram,
 * если пользователь еще не принял условия использования.
 * 
 * @module components/Auth/AgreementDialog
 */

import { motion } from 'framer-motion';
import type { AuthUser } from '@/types/auth';

interface AgreementDialogProps {
  /** Данные пользователя */
  user: AuthUser;
  
  /** Callback при принятии соглашения */
  onAccept: () => void;
  
  /** Callback при отклонении соглашения */
  onDecline: () => void;
  
  /** Индикатор загрузки */
  isLoading?: boolean;
}

/**
 * Диалог пользовательского соглашения
 */
export function AgreementDialog({
  user,
  onAccept,
  onDecline,
  isLoading = false,
}: AgreementDialogProps) {
  // Username бота из переменных окружения
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot';
  
  // Deep link для открытия бота
  const botDeepLink = `https://t.me/${botUsername}?start=auth_${user.id}`;

  return (
    <motion.div
      className="agreement-dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="agreement-dialog-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Заголовок */}
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-semibold text-text">
            Пользовательское соглашение
          </h2>
        </div>

        {/* Приветствие */}
        <p className="text-text-secondary mb-4">
          Здравствуйте, <span className="text-text font-medium">{user.first_name}</span>!
        </p>

        {/* Текст соглашения */}
        <div className="mb-6 p-4 bg-surface rounded-lg border border-border max-h-64 overflow-y-auto">
          <h3 className="text-lg font-medium text-text mb-3">
            📋 Условия использования Boss AI
          </h3>
          
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              Нажимая "Принять", вы соглашаетесь с условиями использования платформы Boss AI:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>
                <strong className="text-text">Обработка данных:</strong> Мы обрабатываем ваши данные Telegram 
                (ID, имя, username, фото профиля) для авторизации и идентификации в системе.
              </li>
              <li>
                <strong className="text-text">Конфиденциальность:</strong> Ваши данные не передаются третьим 
                лицам и используются исключительно для работы платформы.
              </li>
              <li>
                <strong className="text-text">Удаление аккаунта:</strong> Вы можете удалить свой аккаунт и все 
                связанные данные в любой момент через настройки профиля.
              </li>
              <li>
                <strong className="text-text">Использование сервисов:</strong> Вы обязуетесь использовать 
                платформу в соответствии с законодательством и не нарушать права других пользователей.
              </li>
            </ol>
            
            <p className="mt-4">
              📄 Подробнее с условиями можно ознакомиться на странице{' '}
              <a 
                href="https://boss-ai.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-button-primary hover:underline"
              >
                Пользовательское соглашение
              </a>
            </p>
          </div>
        </div>

        {/* Альтернативный способ - через бота */}
        <div className="mb-6 p-3 bg-telegram-blue/10 border border-telegram-blue/30 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">
            💡 <strong className="text-text">Альтернативный способ:</strong>
          </p>
          <p className="text-sm text-text-secondary mb-3">
            Вы также можете подтвердить соглашение через нашего бота в Telegram:
          </p>
          <a
            href={botDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="agreement-button-telegram inline-block w-full text-center"
          >
            📱 Открыть бота в Telegram
          </a>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отклонить
          </button>
          
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-button-primary text-button-primary-text rounded-lg font-semibold hover:bg-button-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Подтверждение...
              </>
            ) : (
              '✅ Принять'
            )}
          </button>
        </div>

        {/* Дополнительная информация */}
        <p className="text-xs text-text-muted text-center mt-4">
          Принимая соглашение, вы подтверждаете что ознакомились с условиями использования
        </p>
      </motion.div>
    </motion.div>
  );
}

