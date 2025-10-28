/**
 * Конфигурация биллинга с поддержкой BT (BOSS TOKEN)
 */

export const BILLING_CONFIG = {
  // Курс обмена: 1 BT = 10 RUB
  BT_TO_RUB_RATE: 10,
  
  // Символы валют
  CURRENCY_SYMBOL: {
    RUB: '₽',
    BT: '💎 BT'
  },
  
  // Настройки отображения
  DISPLAY: {
    DEFAULT_CURRENCY: 'BT' as 'RUB' | 'BT',
    SHOW_BOTH_CURRENCIES: true,
    DECIMAL_PLACES: 2
  },
  
  // Минимальные суммы
  MINIMUMS: {
    RUB: 1.0,
    BT: 0.1
  }
};

/**
 * Конвертация RUB в BT
 */
export function convertRubToBT(rub: number): number {
  return Number((rub / BILLING_CONFIG.BT_TO_RUB_RATE).toFixed(BILLING_CONFIG.DISPLAY.DECIMAL_PLACES));
}

/**
 * Конвертация BT в RUB
 */
export function convertBTToRub(bt: number): number {
  return Number((bt * BILLING_CONFIG.BT_TO_RUB_RATE).toFixed(BILLING_CONFIG.DISPLAY.DECIMAL_PLACES));
}

/**
 * Форматирование суммы с символом валюты
 */
export function formatCurrency(amount: number, currency: 'RUB' | 'BT'): string {
  const symbol = BILLING_CONFIG.CURRENCY_SYMBOL[currency];
  return `${amount.toFixed(BILLING_CONFIG.DISPLAY.DECIMAL_PLACES)} ${symbol}`;
}

/**
 * Получение баланса в обеих валютах
 */
export function getBalanceInBothCurrencies(rubBalance: number) {
  return {
    balance_rub: rubBalance,
    balance_bt: convertRubToBT(rubBalance),
    currency_rub: 'RUB',
    currency_bt: 'BT'
  };
}
