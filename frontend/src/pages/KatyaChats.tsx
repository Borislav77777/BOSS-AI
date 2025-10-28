import {
    AlertCircle,
    Bot,
    Brain,
    Clock,
    Loader2,
    MessageSquare,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import KatyaChatInterface from './KatyaChatInterface';

interface KatyaChat {
  telegram_chat_id: number;
  chat_name: string;
  chat_type: 'group' | 'supergroup' | 'private';
  is_active: boolean;
  message_count: number;
  last_activity: string | null;
  created_at: string;
}

interface KatyaChatsResponse {
  success: boolean;
  data: {
    chats: KatyaChat[];
    total: number;
  };
}

const KatyaChats: React.FC = () => {
  const [chats, setChats] = useState<KatyaChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('barsukov-token');

      if (!token) {
        setError('Необходима авторизация');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/katya-chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: KatyaChatsResponse = await response.json();

      if (data.success) {
        setChats(data.data.chats);
      } else {
        setError('Ошибка загрузки чатов');
      }
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'Нет активности';

    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Только что';
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    return date.toLocaleDateString();
  };

  const getChatIcon = (chatType: string) => {
    switch (chatType) {
      case 'group':
      case 'supergroup':
        return <Users className="w-5 h-5" />;
      case 'private':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const handleOpenChat = (chatId: number) => {
    setSelectedChatId(chatId.toString());
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  const handleSummarize = async (chatId: number, chatName: string) => {
    try {
      const token = localStorage.getItem('barsukov-token');

      if (!token) {
        alert('Необходима авторизация');
        return;
      }

      const response = await fetch(`/api/katya-chats/${chatId}/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message_count: 50
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          alert('Недостаточно средств. Пополните баланс BT токенов.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Показать результат суммаризации в модальном окне
        const summary = data.data.summary;
        const topics = data.data.topics;
        const decisions = data.data.decisions;

        alert(`📊 Суммаризация чата "${chatName}"\n\n${summary}\n\n🔑 Темы: ${topics.join(', ')}\n✅ Решения: ${decisions.map((d: any) => d.decision).join(', ') || 'Нет'}`);
      } else {
        alert('Ошибка суммаризации');
      }
    } catch (err: any) {
      console.error('Error summarizing chat:', err);
      alert(err.message || 'Ошибка суммаризации');
    }
  };

  // Если выбран конкретный чат, показываем его интерфейс
  if (selectedChatId) {
    return (
      <KatyaChatInterface
        chatId={selectedChatId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchChats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Катя AI - Мои чаты</h1>
            </div>
            <button
              onClick={fetchChats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {chats.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              У вас пока нет чатов с Катей
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Добавьте бота @katya_boss_ai_bot в ваши Telegram чаты, чтобы начать использовать
              распределенную память команды.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">Как добавить Катю в чат:</h4>
              <ol className="text-sm text-blue-800 text-left space-y-1">
                <li>1. Найдите @katya_boss_ai_bot в Telegram</li>
                <li>2. Добавьте бота в ваш чат</li>
                <li>3. Упоминайте @Катя в сообщениях</li>
                <li>4. Чат появится здесь автоматически</li>
              </ol>
            </div>
          </div>
        ) : (
          // Chats list
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Ваши чаты с Катей ({chats.length})
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chats.map((chat) => (
                <div
                  key={chat.telegram_chat_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {getChatIcon(chat.chat_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.chat_name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {chat.chat_type === 'private' ? 'Личный чат' :
                           chat.chat_type === 'group' ? 'Группа' : 'Супергруппа'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatLastActivity(chat.last_activity)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{chat.message_count} сообщений</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Добавлен {new Date(chat.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenChat(chat.telegram_chat_id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Открыть чат
                    </button>
                    <button
                      onClick={() => handleSummarize(chat.telegram_chat_id, chat.chat_name)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Суммаризировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KatyaChats;
