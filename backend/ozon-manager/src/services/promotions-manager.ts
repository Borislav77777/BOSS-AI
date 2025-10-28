import { PromotionResult, StoreConfig } from '../types';
import { Logger } from '../utils/logger';
import { OzonAPIClient } from './ozon-api-client';

/**
 * Менеджер для управления акциями Ozon
 * Портировано из Python promotions.py
 */
export class PromotionsManager {
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
   * Запускает процесс удаления товаров из невыгодных акций
   */
  async runPromotionCleanup(): Promise<PromotionResult> {
    try {
      this.logger.logInfo(`Начинаем очистку акций для магазина: ${this.storeConfig.name}`);

      // Получаем все акции
      const actionsResponse = await this.apiClient.getActions();
      if (!actionsResponse.success) {
        return {
          success: false,
          products_removed: 0,
          actions_processed: 0,
          errors: [`Ошибка получения акций: ${actionsResponse.error}`]
        };
      }

      const actions = actionsResponse.data?.result || [];
      this.logger.logInfo(`Найдено акций: ${actions.length}`);

      // Фильтруем невыгодные акции
      const unprofitableActions = this.filterUnprofitableActions(actions);
      this.logger.logInfo(`Невыгодных акций найдено: ${unprofitableActions.length}`);

      let totalRemoved = 0;
      let totalProcessed = 0;
      const errors: string[] = [];

      // Обрабатываем каждую невыгодную акцию
      for (const action of unprofitableActions) {
        try {
          const result = await this.processAction(action);
          totalRemoved += result.products_removed;
          totalProcessed += 1;
        } catch (error: any) {
          errors.push(`Ошибка обработки акции ${action.id}: ${error.message}`);
        }
      }

      this.logger.logInfo(`Очистка акций завершена. Удалено товаров: ${totalRemoved}, обработано акций: ${totalProcessed}`);

      return {
        success: errors.length === 0,
        products_removed: totalRemoved,
        actions_processed: totalProcessed,
        errors
      };

    } catch (error: any) {
      this.logger.logError(`Критическая ошибка при очистке акций: ${error.message}`, error);
      return {
        success: false,
        products_removed: 0,
        actions_processed: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Фильтрует невыгодные акции по ключевым словам
   */
  private filterUnprofitableActions(actions: any[]): any[] {
    const unprofitableKeywords = [
      'за наш счёт',
      'за счёт продавца',
      'промо цена',
      'скидка продавца',
      'вы платите',
      'ваши средства'
    ];

    return actions.filter(action => {
      const title = action.title?.toLowerCase() || '';
      const description = action.description?.toLowerCase() || '';

      return unprofitableKeywords.some(keyword =>
        title.includes(keyword) || description.includes(keyword)
      );
    });
  }

  /**
   * Обрабатывает одну акцию - получает товары и удаляет их
   */
  private async processAction(action: any): Promise<{ products_removed: number }> {
    this.logger.logInfo(`Обрабатываем акцию: ${action.title} (ID: ${action.id})`);

    // Получаем товары из акции
    const productsResponse = await this.apiClient.getActionProducts(action.id);
    if (!productsResponse.success) {
      throw new Error(`Ошибка получения товаров акции: ${productsResponse.error}`);
    }

    const products = productsResponse.data?.result?.products || [];
    this.logger.logInfo(`Найдено товаров в акции: ${products.length}`);

    if (products.length === 0) {
      return { products_removed: 0 };
    }

    // Извлекаем ID товаров
    const productIds = products.map((product: any) => product.product_id || product.id).filter(Boolean);

    if (productIds.length === 0) {
      this.logger.logWarning('Не удалось извлечь ID товаров из акции');
      return { products_removed: 0 };
    }

    // Удаляем товары пачками по 100
    let totalRemoved = 0;
    for (let i = 0; i < productIds.length; i += 100) {
      const batch = productIds.slice(i, i + 100);

      const removeResponse = await this.apiClient.removeProductsFromAction(action.id, batch);
      if (removeResponse.success) {
        totalRemoved += batch.length;
        this.logger.logInfo(`Удалено товаров из акции: ${batch.length}`);
      } else {
        this.logger.logError(`Ошибка удаления товаров: ${removeResponse.error}`);
      }
    }

    return { products_removed: totalRemoved };
  }
}
