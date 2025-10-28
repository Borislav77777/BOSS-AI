import {
    AlertCircle,
    ArrowLeft,
    Bot,
    Brain,
    Loader2,
    User
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: number;
  message_id: number;
  telegram_user_id: number;
  username: string;
  first_name: string;
  text: string;
  is_katya_mention: boolean;
  created_at: string;
}

interface ChatDetails {
  telegram_chat_id: number;
  chat_name: string;
  chat_type: string;
  is_active: boolean;
  message_count: number;
  katya_mentions: number;
  last_activity: string | null;
  first_message: string | null;
  created_at: string;
}

interface ChatStats {
  total_messages: number;
  katya_mentions: number;
  unique_users: number;
  first_message_at: string | null;
  last_message_at: string | null;
  top_users: Array<{
    telegram_user_id: number;
    username: string;
    first_name: string;
    message_count: number;
  }>;
}

interface KatyaChatInterfaceProps {
  chatId: string;
  onBack: () => void;
}

const KatyaChatInterface: React.FC<KatyaChatInterfaceProps> = ({ chatId, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (chatId) {
      fetchChatDetails();
      fetchMessages();
      fetchStats();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatDetails = async () => {
    try {
      const token = localStorage.getItem('barsukov-token');

      if (!token) {
        setError('Необходима авторизация');
        return;
      }

      const response = await fetch(`/api/katya-chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setChatDetails(data.data);
      } else {
        setError('Ошибка загрузки деталей чата');
      }
    } catch (err: any) {
      console.error('Error fetching chat details:', err);
      setError(err.message || 'Ошибка загрузки деталей чата');
    }
  };

  const fetchMessages = async (loadMore = false) => {
    try {
      if (loadMore) {
        setMessagesLoading(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('barsukov-token');

      if (!token) {
        setError('Необходима авторизация');
        return;
      }

      const currentOffset = loadMore ? offset : 0;
      const response = await fetch(`/api/katya-chats/${chatId}/messages?limit=50&offset=${currentOffset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const newMessages = data.data.messages;

        if (loadMore) {
          setMessages(prev => [...prev, ...newMessages]);
        } else {
          setMessages(newMessages);
        }

        setOffset(data.data.pagination.offset + data.data.pagination.limit);
        setHasMore(data.data.pagination.has_more);
      } else {
        setError('Ошибка загрузки сообщений');
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
      setMessagesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('barsukov-token');

      if (!token) return;

      const response = await fetch(`/api/katya-chats/${chatId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
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
          message_count: 100
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
        const keywords = data.data.keywords;

        const summaryText = `📊 Суммаризация чата "${chatDetails?.chat_name}"\n\n${summary}\n\n🔑 Темы: ${topics.join(', ')}\n✅ Решения: ${decisions.map((d: any) => d.decision).join(', ') || 'Нет'}\n🏷️ Ключевые слова: ${keywords.join(', ')}`;

        alert(summaryText);
      } else {
        alert('Ошибка суммаризации');
      }
    } catch (err: any) {
      console.error('Error summarizing chat:', err);
      alert(err.message || 'Ошибка суммаризации');
    } finally {
      setSummarizing(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Только что';
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка чата...</p>
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
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Вернуться к списку чатов
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
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {chatDetails?.chat_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {chatDetails?.message_count} сообщений • {chatDetails?.katya_mentions} упоминаний Кати
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {summarizing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                Суммаризировать
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">История сообщений</h2>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_katya_mention ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.is_katya_mention ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {message.is_katya_mention ? (
                          <Bot className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {message.first_name} {message.username && `(@${message.username})`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {message.text}
                      </p>
                      {message.is_katya_mention && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            @Катя упоминание
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {messagesLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}

                {hasMore && !messagesLoading && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => fetchMessages(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Загрузить еще
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>

              {stats && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Всего сообщений</span>
                    <span className="text-sm font-medium">{stats.total_messages}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Упоминаний Кати</span>
                    <span className="text-sm font-medium">{stats.katya_mentions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Участников</span>
                    <span className="text-sm font-medium">{stats.unique_users}</span>
                  </div>

                  {stats.first_message_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Первый пост</span>
                      <span className="text-sm font-medium">
                        {new Date(stats.first_message_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {stats.last_message_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Последний пост</span>
                      <span className="text-sm font-medium">
                        {new Date(stats.last_message_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {stats.top_users.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Топ участников</h4>
                      <div className="space-y-2">
                        {stats.top_users.slice(0, 3).map((user, index) => (
                          <div key={user.telegram_user_id} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {user.first_name} {user.username && `(@${user.username})`}
                            </span>
                            <span className="text-xs font-medium">{user.message_count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KatyaChatInterface;
