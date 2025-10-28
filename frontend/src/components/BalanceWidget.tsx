import { useEffect, useState } from 'react';

interface Balance {
  balance: number;
  balance_bt: number;
  currency: string;
  currency_bt: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'deposit' | 'charge' | 'refund';
  service_name?: string;
  description?: string;
  created_at: number;
}

export const BalanceWidget = () => {
  const [balance, setBalance] = useState<Balance>({ balance: 0, balance_bt: 0, currency: 'RUB', currency_bt: 'BT' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBT, setShowBT] = useState(true); // Показывать BT по умолчанию

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const token = localStorage.getItem('barsukov-token');
        if (!token) {
          setError('Не авторизован');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/billing/balance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setBalance(data.data);
        } else {
          setError('Ошибка загрузки баланса');
        }
      } catch (error) {
        setError('Ошибка сети');
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('barsukov-token');
        if (!token) return;

        const response = await fetch('/api/billing/transactions?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.data || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки транзакций:', error);
      }
    };

    loadTransactions();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : '';
    const color = amount > 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{amount.toFixed(2)} ₽
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Основной баланс */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Текущий баланс</div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowBT(false)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                !showBT ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              ₽ RUB
            </button>
            <button
              onClick={() => setShowBT(true)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                showBT ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              💎 BT
            </button>
          </div>
        </div>
        
        <div className={`text-3xl font-bold ${
          (showBT ? balance.balance_bt : balance.balance) > 0 ? 'text-green-600' : 'text-gray-500'
        }`}>
          {showBT 
            ? `${balance.balance_bt.toFixed(2)} 💎 BT`
            : `${balance.balance.toFixed(2)} ₽`
          }
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {showBT 
            ? `≈ ${balance.balance.toFixed(2)} ₽` 
            : `≈ ${balance.balance_bt.toFixed(2)} 💎 BT`
          }
        </div>
      </div>

      {/* Кнопка пополнения */}
      <div className="mb-6">
        <a
          href="/billing/topup"
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Пополнить баланс
        </a>
      </div>

      {/* Последние транзакции */}
      {transactions.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">Последние операции</div>
          <div className="space-y-2">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <div className="text-gray-900">
                    {transaction.service_name || transaction.description || 'Операция'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  {formatAmount(transaction.amount)}
                </div>
              </div>
            ))}
          </div>

          {transactions.length > 3 && (
            <div className="mt-3 text-center">
              <a
                href="/billing/transactions"
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                Показать все операции
              </a>
            </div>
          )}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Операций пока нет
        </div>
      )}
    </div>
  );
};
