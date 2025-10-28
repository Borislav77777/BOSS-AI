import React, { useState } from 'react';

export const BillingTopup = () => {
  const [selectedMethod, setSelectedMethod] = useState<'yoomoney' | 'card'>('yoomoney');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Введите корректную сумму');
      return;
    }

    // В реальном приложении здесь была бы интеграция с платежной системой
    setMessage(`
      💳 Инструкция по пополнению:

      1. Переведите ${amount} ₽ на карту: 1234 5678 9012 3456
      2. В комментарии укажите ваш Telegram ID
      3. Напишите @admin_bot для подтверждения

      ⏱️ Обработка: до 15 минут в рабочее время
    `);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">💰 Пополнение баланса</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Способы оплаты */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Способ пополнения
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="method"
                  value="yoomoney"
                  checked={selectedMethod === 'yoomoney'}
                  onChange={(e) => setSelectedMethod(e.target.value as 'yoomoney')}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">ЮMoney</div>
                  <div className="text-sm text-gray-500">Быстро и безопасно</div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="method"
                  value="card"
                  checked={selectedMethod === 'card'}
                  onChange={(e) => setSelectedMethod(e.target.value as 'card')}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Банковская карта</div>
                  <div className="text-sm text-gray-500">Visa, MasterCard, МИР</div>
                </div>
              </label>
            </div>
          </div>

          {/* Сумма */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма пополнения (₽)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Быстрые суммы */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Быстрый выбор:</div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {quickAmount} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Получить реквизиты
          </button>
        </form>

        {/* Сообщение с инструкциями */}
        {message && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 whitespace-pre-line">
              {message}
            </div>
          </div>
        )}

        {/* Дополнительная информация */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 После перевода средства появятся на балансе в течение 15 минут</p>
          <p>📞 Нужна помощь? Напишите @admin_bot</p>
        </div>
      </div>
    </div>
  );
};
