import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AgentSelection } from './AgentSelection';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
    buttons?: Array<{
        id: string;
        text: string;
        action: string;
    }>;
}

interface Agent {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    chatAvatarUrl: string;
    icon: string;
    color: string;
    modelUrl?: string;
    use3DModel?: boolean;
    welcomeMessage: string;
    initialButtons: Array<{
        id: string;
        text: string;
        action: string;
    }>;
}

interface ChatInterfaceProps {
    agents: Agent[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ agents }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const [isMobileView, setIsMobileView] = useState(false);
    const [showAgentList, setShowAgentList] = useState(true);
    const [view, setView] = useState<'selection' | 'chat'>('selection');


    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    // Определение мобильного вида
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Обработка ошибок загрузки изображений
    const handleImageError = (agentId: string) => {
        setImageErrors(prev => new Set(prev).add(agentId));
    };

    // Обработка действий OZON агента
    const handleOzonAction = (action: string) => {
        const actionMessage = action === 'removeFromPromotions'
            ? 'Удаляю товары из акций...'
            : 'Разархивирую товары...';

        const buttonMessage: Message = {
            id: `ozon-action-${Date.now()}`,
            text: actionMessage,
            sender: 'agent',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, buttonMessage]);
    };

    // Вернуться к выбору агентов
    const handleBackToSelection = () => {
        setView('selection');
        setSelectedAgentId(null);
        setMessages([]);
    };

    // Выбор агента
    const handleAgentSelect = (agentId: string) => {
        setSelectedAgentId(agentId);
        setView('chat'); // Переключиться на чат
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            // Очищаем предыдущие сообщения и добавляем приветственное
            setMessages([{
                id: `welcome-${agentId}`,
                text: agent.welcomeMessage,
                sender: 'agent',
                timestamp: new Date(),
                buttons: agent.initialButtons
            }]);
        }
    };

    // Отправка сообщения
    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedAgent) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Имитация ответа агента
        setTimeout(() => {
            const agentResponse: Message = {
                id: `agent-${Date.now()}`,
                text: `Понял ваше сообщение: "${inputMessage}". Обрабатываю запрос...`,
                sender: 'agent',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentResponse]);
        }, 1000);
    };

    // Обработка кнопок действий
    const handleButtonClick = (action: string) => {
        if (!selectedAgent) return;

        const buttonMessage: Message = {
            id: `button-${Date.now()}`,
            text: `Выполняю действие: ${action}`,
            sender: 'agent',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, buttonMessage]);
    };

    return (
        <div className="h-screen bg-black" style={{ height: 'calc(100vh - 6rem)' }}>
            {view === 'selection' ? (
                agents.length > 0 ? (
                    <AgentSelection
                        agents={agents}
                        onSelectAgent={handleAgentSelect}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <div className="text-2xl mb-4">⚠️</div>
                            <div>No agents available</div>
                            <div className="text-sm text-gray-400 mt-2">Agents count: {agents.length}</div>
                        </div>
                    </div>
                )
            ) : (
                <div className="h-full bg-black/20 backdrop-blur-md p-2 md:p-4 flex flex-col">
                    {selectedAgent ? (
                        <>
                            {/* Заголовок чата - упрощенный */}
                            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-cyan-500/30">
                                {/* Кнопка "Назад" */}
                                <button
                                    onClick={handleBackToSelection}
                                    className="flex items-center justify-center w-8 h-8 text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 relative">
                                    {!imageErrors.has(selectedAgent.id) ? (
                                        <img
                                            src={selectedAgent.chatAvatarUrl}
                                            alt={selectedAgent.name}
                                            className="w-full h-full rounded-full object-cover"
                                            onError={() => handleImageError(selectedAgent.id)}
                                        />
                                    ) : (
                                        <div className={`w-full h-full rounded-full ${selectedAgent.color} flex items-center justify-center text-white text-2xl`}>
                                            {selectedAgent.icon}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-cyan-400 font-mono text-lg font-bold">{selectedAgent.name}</h3>
                                </div>
                            </div>

                            {/* Кнопки действий для OZON агента */}
                            {selectedAgent.id === 'ozon' && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleOzonAction('removeFromPromotions')}
                                        className="px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                    >
                                        Удалить из акций
                                    </button>
                                    <button
                                        onClick={() => handleOzonAction('unarchiveProducts')}
                                        className="px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                                    >
                                        Разархивировать товары
                                    </button>
                                </div>
                            )}

                            {/* Сообщения */}
                            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                                <AnimatePresence>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                                ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/50'
                                                : 'bg-black/30 text-cyan-200 border border-cyan-500/30'
                                                }`}>
                                                <p className="text-sm font-mono">{message.text}</p>
                                                {message.buttons && (
                                                    <div className="mt-3 space-y-2">
                                                        {message.buttons.map((button) => (
                                                            <button
                                                                key={button.id}
                                                                onClick={() => handleButtonClick(button.action)}
                                                                className="block w-full text-left px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded text-xs font-mono text-cyan-300 transition-colors"
                                                            >
                                                                {button.text}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Поле ввода - компактное */}
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Введите сообщение..."
                                    className="flex-1 px-3 py-2 bg-black/30 border border-cyan-500/50 rounded-lg text-cyan-100 placeholder-cyan-400/50 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 hover:border-cyan-400 rounded-lg text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🤖</div>
                                <p className="text-cyan-400 font-mono text-lg">Выберите агента для начала работы</p>
                                <p className="text-cyan-300/70 font-mono text-sm mt-2">Нажмите на аватарку слева</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
