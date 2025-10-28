/**
 * Сервис уведомлений для Anti-Procrastination OS
 */

class NotificationService {
  private permissionGranted: boolean = false;

  constructor() {
    this.checkPermission();
  }

  /**
   * Проверка разрешения на уведомления
   */
  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[APOS] Notifications API не поддерживается');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Отправка уведомления
   */
  async send(
    title: string,
    options?: NotificationOptions
  ): Promise<Notification | null> {
    if (!this.permissionGranted) {
      await this.checkPermission();
    }

    if (!this.permissionGranted) {
      console.warn('[APOS] Разрешение на уведомления не получено');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options,
      });

      // Автоматически закрывать через 5 секунд
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('[APOS] Ошибка при отправке уведомления:', error);
      return null;
    }
  }

  /**
   * Уведомление о начале блока
   */
  notifyBlockStart(blockTitle: string, duration: number): void {
    this.send(`🚀 Начинаем: ${blockTitle}`, {
      body: `Длительность: ${duration} минут. Фокус!`,
      tag: 'block-start',
    });

    this.playSound('start');
  }

  /**
   * Уведомление о завершении блока
   */
  notifyBlockComplete(blockTitle: string, actualDuration?: number): void {
    const body = actualDuration
      ? `Выполнено за ${actualDuration} минут. Отлично!`
      : 'Выполнено!';

    this.send(`✅ Завершено: ${blockTitle}`, {
      body,
      tag: 'block-complete',
    });

    this.playSound('complete');
  }

  /**
   * Уведомление о перерыве
   */
  notifyBreak(duration: number): void {
    this.send('☕ Время перерыва!', {
      body: `Отдохните ${duration} минут. Вы заслужили!`,
      tag: 'break',
    });

    this.playSound('break');
  }

  /**
   * Уведомление о мотивации
   */
  notifyMotivation(message: string): void {
    this.send('💪 Мотивация!', {
      body: message,
      tag: 'motivation',
    });
  }

  /**
   * Уведомление о достижении
   */
  notifyAchievement(title: string, description: string): void {
    this.send(`🏆 Достижение разблокировано: ${title}`, {
      body: description,
      tag: 'achievement',
    });

    this.playSound('achievement');
  }

  /**
   * Воспроизведение звука
   */
  private playSound(type: 'start' | 'complete' | 'break' | 'achievement'): void {
    try {
      // Простые звуковые частоты для разных событий
      const frequencies: Record<typeof type, number> = {
        start: 440, // A
        complete: 523.25, // C
        break: 392, // G
        achievement: 659.25, // E
      };

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.5
      );

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.warn('[APOS] Ошибка при воспроизведении звука:', error);
    }
  }

  /**
   * Отображение toast уведомления
   */
  showToast(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 3000
  ): void {
    // Создаем элемент toast
    const toast = document.createElement('div');
    toast.className = `apos-toast apos-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      background: ${this.getToastColor(type)};
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Удаляем через заданное время
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Получение цвета toast по типу
   */
  private getToastColor(type: string): string {
    const colors: Record<string, string> = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    return colors[type] || colors.info;
  }
}

export const notificationService = new NotificationService();
