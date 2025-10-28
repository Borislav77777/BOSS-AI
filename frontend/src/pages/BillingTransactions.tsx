import { useEffect, useState } from 'react';

interface Transaction {
  id: number;
  amount: number;
  type: 'deposit' | 'charge' | 'refund';
  service_name?: string;
  description?: string;
  created_at: number;
}

export const BillingTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Не авторизован');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/billing/transactions?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.data || []);
        } else {
          setError('Ошибка загрузки транзакций');
        }
      } catch (error) {
        setError('Ошибка сети');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : '';
    const color = amount > 0 ? 'text-green-600' : 'text-red-600';
    const btAmount = (amount / 10).toFixed(2);
    return (
      <div className="flex flex-col items-end">
        <span className={color}>
          {sign}{amount.toFixed(2)} ₽
        </span>
        <span className="text-xs text-gray-500">
          {sign}{btAmount} 💎 BT
        </span>
      </div>
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'charge':
        return '💸';
      case 'refund':
        return '↩️';
      default:
        return '📄';
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    if (transaction.service_name) {
      return `${transaction.service_name}`;
    }
    if (transaction.description) {
      return transaction.description;
    }
    return 'Операция';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold">📊 История операций</h1>
            <p className="text-gray-600 mt-1">
              Все ваши транзакции и операции с балансом
            </p>
          </div>

          {transactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getTransactionTitle(transaction)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">
                        {formatAmount(transaction.amount)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.type === 'deposit' ? 'Пополнение' :
                         transaction.type === 'charge' ? 'Списание' : 'Возврат'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Операций пока нет
              </h3>
              <p className="text-gray-500 mb-6">
                После пополнения баланса или использования сервисов здесь появятся записи
              </p>
              <a
                href="/billing/topup"
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Пополнить баланс
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
