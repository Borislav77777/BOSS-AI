import { ArchiveResult, StoreConfig } from '../types';
import { Logger } from '../utils/logger';
import { OzonAPIClient } from './ozon-api-client';

/**
 * Менеджер для управления архивом товаров Ozon
 * Портировано из Python archive.py
 */
export class ArchiveManager {
  private apiClient: OzonAPIClient;
  private logger: Logger;

  constructor(
    private storeConfig: StoreConfig,
    logger?: Logger
  ) {
    this.logger = logger || new Logger();
    this.apiClient = new OzonAPIClient({
      client_id: storeConfig.client_id,
      api_key: storeConfig.api_key,
      base_url: process.env.OZON_API_BASE_URL || 'https://api-seller.ozon.ru',
      timeout: parseInt(process.env.OZON_API_TIMEOUT || '30000'),
      rate_limit: parseInt(process.env.OZON_API_RATE_LIMIT || '50')
    }, this.logger);
  }

  /**
   * Запускает простую разархивацию "до упора"
   * Портировано из Python clean_autoarchive_until_limit
   */
  async runSimpleUnarchiveProcess(): Promise<ArchiveResult> {
    const batchSize = 1; // Максимальная надежность - по 1 товару
    let totalUnarchived = 0;
    let cyclesCompleted = 0;

    this.logger.logInfo('🚀 ЗАПУСК ПРОСТОЙ РАЗАРХИВАЦИИ ДО УПОРА');
    this.logger.logInfo(`📦 Размер пачки: ${batchSize} товар(ов) - максимальная надежность`);
    this.logger.logInfo('🔄 Режим: Бесконечный цикл до упора в лимиты API или пустой автоархив');

    // Бесконечный цикл - работаем до реальных ограничений API
    while (true) {
      cyclesCompleted++;

      this.logger.logInfo(`🔄 ЦИКЛ ${cyclesCompleted}/∞`);
      this.logger.logInfo(`📊 Всего разархивировано: ${totalUnarchived}`);

      try {
        // Шаг 1: Получаем пачку автоархивированных товаров
        this.logger.logInfo(`📦 Получаем ${batchSize} автоархивированных товаров...`);

        const autoarchiveResponse = await this.apiClient.getAutoarchivedProducts(batchSize);

        if (!autoarchiveResponse.success) {
          this.logger.logError(`Ошибка получения автоархива: ${autoarchiveResponse.error}`);
          continue;
        }

        const items = autoarchiveResponse.data?.result?.items || [];

        if (items.length === 0) {
          // Проверяем причину отсутствия товаров
          if (this.apiClient.hasRecentLimitError()) {
            this.logger.logInfo('⚠️ Товары не найдены, но обнаружены недавние ошибки лимита');
            this.logger.logInfo('💡 Вероятно товары остались, но достигнут дневной лимит API');
            this.logger.logInfo(`📊 Итого разархивировано: ${totalUnarchived} товаров`);

            return {
              success: true,
              total_unarchived: totalUnarchived,
              cycles_completed: cyclesCompleted,
              stopped_reason: 'daily_limit_reached',
              message: `🛑 Достигнут дневной лимит API Ozon. Товары остались, но недоступны для разархивации. Разархивировано ${totalUnarchived} товаров за ${cyclesCompleted} циклов. Запустите снова завтра после 03:00 МСК.`
            };
          } else {
            // Только если нет недавних ошибок лимита, считаем автоархив пустым
            this.logger.logInfo('🎉 АВТОАРХИВ ПОЛНОСТЬЮ ОЧИЩЕН!');
            this.logger.logInfo('💡 Больше нет автоархивированных товаров');

            return {
              success: true,
              total_unarchived: totalUnarchived,
              cycles_completed: cyclesCompleted,
              stopped_reason: 'autoarchive_empty',
              message: `Автоархив полностью очищен! Разархивировано ${totalUnarchived} товаров за ${cyclesCompleted} циклов`
            };
          }
        }

        this.logger.logInfo(`✅ Получено ${items.length} автоархивированных товаров`);

        // Шаг 2: Извлекаем ID товаров
        const productIds: number[] = [];
        for (const item of items) {
          const productId = item.product_id || item.id;
          if (productId) {
            try {
              productIds.push(parseInt(productId));
            } catch (error) {
              continue;
            }
          }
        }

        if (productIds.length === 0) {
          this.logger.logInfo('❌ Не удалось извлечь валидные ID товаров');
          continue;
        }

        this.logger.logInfo(`🎯 Подготовлено к разархивации: ${productIds.length} товаров`);
        this.logger.logInfo(`🔢 ID товаров: ${productIds.slice(0, 5).join(', ')}${productIds.length > 5 ? '...' : ''}`);

        // Шаг 3: Разархивируем товары
        this.logger.logInfo(`🔓 Разархивируем ${productIds.length} товаров...`);

        const unarchiveResponse = await this.apiClient.unarchiveProducts(productIds);

        if (unarchiveResponse.success) {
          // Успешная разархивация
          const unarchivedCount = productIds.length;
          totalUnarchived += unarchivedCount;

          this.logger.logInfo(`✅ Успешно разархивировано: ${unarchivedCount} товаров`);
          this.logger.logInfo(`📈 Всего разархивировано: ${totalUnarchived}`);

          // Если разархивировали меньше чем получили, возможно достигли лимита
          if (unarchivedCount < productIds.length) {
            this.logger.logInfo(`⚠️ Разархивировано меньше товаров чем планировалось`);
            this.logger.logInfo(`🎯 Возможно достигнут дневной лимит API`);
          }
        } else {
          // Ошибка разархивации
          const errorMsg = unarchiveResponse.error || 'Неизвестная ошибка';
          this.logger.logInfo(`❌ Ошибка разархивации: ${errorMsg}`);

          // Проверяем тип ошибки лимита
          const errorLower = errorMsg.toLowerCase();
          if (this.isLimitError(errorLower)) {
            // Записываем ошибку лимита для отслеживания
            this.apiClient.recordLimitError();

            this.logger.logInfo('🛑 ДОСТИГНУТ ДНЕВНОЙ ЛИМИТ РАЗАРХИВАЦИИ OZON API');
            this.logger.logInfo('💡 Это официальный лимит Ozon: максимум 10 автоархивированных товаров в день');
            this.logger.logInfo('⏰ Лимит сбрасывается в 03:00 МСК каждый день');
            this.logger.logInfo(`📊 Итого разархивировано: ${totalUnarchived} товаров`);

            return {
              success: true, // Это успех - мы достигли максимума API
              total_unarchived: totalUnarchived,
              cycles_completed: cyclesCompleted,
              stopped_reason: 'daily_limit_reached',
              message: `🛑 Достигнут дневной лимит API Ozon. Разархивировано ${totalUnarchived} товаров за ${cyclesCompleted} циклов. Запустите снова завтра после 03:00 МСК.`
            };
          }

          // Проверяем другие критические ошибки
          if (this.isAccessDeniedError(errorLower)) {
            this.logger.logError('🚫 КРИТИЧЕСКАЯ ОШИБКА: Доступ запрещён к API');
            this.logger.logError('💡 Проверьте API ключи и права доступа');

            return {
              success: false,
              total_unarchived: totalUnarchived,
              cycles_completed: cyclesCompleted,
              stopped_reason: 'access_denied',
              message: `❌ Доступ к API запрещён. Разархивировано ${totalUnarchived} товаров. Проверьте API ключи.`
            };
          }

          // Другие ошибки - продолжаем попытки
          this.logger.logInfo('⚠️ Продолжаем попытки с новой пачкой товаров');
        }

        // Небольшая задержка между циклами
        await this.sleep(500);

      } catch (error: any) {
        this.logger.logError(`Критическая ошибка в цикле ${cyclesCompleted}: ${error.message}`, error);
        // При критической ошибке продолжаем
        await this.sleep(1000);
        continue;
      }
    }
  }

  /**
   * Проверяет является ли ошибка ошибкой лимита
   */
  private isLimitError(errorMsg: string): boolean {
    const limitKeywords = [
      'quota', 'лимит', 'limit exceeded', 'restore limit', 'restore quota',
      'daily limit', 'дневной лимит', 'превышен лимит', 'quota exceeded',
      'восстановление превышено', 'лимит восстановления'
    ];

    return limitKeywords.some(keyword => errorMsg.includes(keyword));
  }

  /**
   * Проверяет является ли ошибка ошибкой доступа
   */
  private isAccessDeniedError(errorMsg: string): boolean {
    const accessDeniedKeywords = [
      '403', 'доступ запрещён', 'access denied', 'forbidden'
    ];

    return accessDeniedKeywords.some(keyword => errorMsg.includes(keyword));
  }

  /**
   * Задержка в миллисекундах
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
