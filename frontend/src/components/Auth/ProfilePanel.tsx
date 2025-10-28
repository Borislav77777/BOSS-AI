/**
 * ProfilePanel - Панель профиля пользователя
 * 
 * Открывается при клике на кнопку профиля в sidebar.
 * Показывает информацию о пользователе и кнопку выхода.
 * 
 * @module components/Auth/ProfilePanel
 */

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, User as UserIcon, Calendar, LogOut } from 'lucide-react';
import { useState } from 'react';
import type { AuthUser } from '@/types/auth';

interface ProfilePanelProps {
  /** Данные пользователя */
  user: AuthUser;
  
  /** Callback при закрытии панели */
  onClose: () => void;
  
  /** Callback при выходе из системы */
  onLogout: () => void;
}

/**
 * Панель профиля пользователя
 */
export function ProfilePanel({ user, onClose, onLogout }: ProfilePanelProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Обработка выхода из системы
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await onLogout();
    } catch (error) {
      console.error('[ProfilePanel] Ошибка при выходе:', error);
      setIsLoggingOut(false);
    }
  };

  /**
   * Форматирование даты
   */
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Неизвестно';
    
    const date = new Date(timestamp * 1000); // Конвертируем Unix timestamp
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Получение инициалов для аватара по умолчанию
   */
  const getInitials = (): string => {
    const firstName = user.first_name?.charAt(0) || '';
    const lastName = user.last_name?.charAt(0) || '';
    return (firstName + lastName).toUpperCase() || '?';
  };

  // Рендерим панель через Portal напрямую в document.body
  // Это гарантирует что панель будет поверх всех элементов страницы
  return createPortal(
    <>
      {/* Backdrop - затемнённый фон */}
      <motion.div
        className="profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Панель профиля - модальное окно по центру */}
      <motion.div
        className="profile-panel"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-text">Профиль</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto">
          {/* Аватар и основная информация */}
          <div className="flex flex-col items-center mb-8">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.first_name}
                className="profile-avatar mb-4"
              />
            ) : (
              <div className="profile-avatar mb-4 flex items-center justify-center bg-button-primary text-white text-2xl font-bold">
                {getInitials()}
              </div>
            )}
            
            <h3 className="profile-name mb-1">
              {user.first_name} {user.last_name || ''}
            </h3>
            
            {user.username && (
              <p className="profile-username">
                @{user.username}
              </p>
            )}
          </div>

          {/* Информация */}
          <div className="space-y-4 mb-8">
            {/* Telegram ID */}
            <div className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="w-4 h-4 text-text-secondary" />
                <span className="text-sm text-text-secondary">Telegram ID</span>
              </div>
              <p className="text-text font-mono text-sm">{user.telegram_id}</p>
            </div>

            {/* Дата регистрации */}
            {user.created_at && (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">Дата регистрации</span>
                </div>
                <p className="text-text text-sm">{formatDate(user.created_at)}</p>
              </div>
            )}

            {/* Последний вход */}
            {user.last_login && (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">Последний вход</span>
                </div>
                <p className="text-text text-sm">{formatDate(user.last_login)}</p>
              </div>
            )}

            {/* Статус соглашения */}
            <div className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-text-secondary">Пользовательское соглашение</span>
              </div>
              <p className="text-text text-sm">
                {user.agreed_to_terms ? (
                  <span className="text-success">✅ Принято</span>
                ) : (
                  <span className="text-warning">⚠️ Не принято</span>
                )}
              </p>
            </div>
          </div>

          {/* Debug информация убрана для чистого UI */}
        </div>

        {/* Кнопка выхода */}
        <div className="border-t border-border pt-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="profile-logout-button w-full"
          >
            {isLoggingOut ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Выход...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogOut className="w-5 h-5 mr-2" />
                Выйти из системы
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </>,
    document.body // Рендерим в body, минуя все контейнеры
  );
}

