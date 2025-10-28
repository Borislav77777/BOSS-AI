import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MessageCircle, Mic, MicOff, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdvancedTTS } from './AdvancedTTS';
import './InteractiveGuide.css';
const guideSteps = [
    {
        id: 'user-input',
        title: '👤 Пользователь задает вопрос',
        description: 'Пользователь вводит вопрос через чат, голос или загружает документ',
        technicalDetails: 'Nginx Load Balancer → Redis Queue → Worker Pool',
        userFriendlyExplanation: 'Представьте, что вы заходите в умную юридическую контору и рассказываете о своей проблеме. Система сразу понимает, что вам нужно, и направляет к нужному специалисту.',
        visualElement: '💬',
        position: { x: 50, y: 20 },
        connections: ['intelligent-router'],
        voiceScript: 'Вы начинаете диалог с AI-юристом. Система анализирует ваш запрос и выбирает лучший способ помочь.'
    },
    {
        id: 'intelligent-router',
        title: '🧭 Умный маршрутизатор',
        description: 'AI анализирует сложность вопроса и выбирает подходящую модель',
        technicalDetails: 'Intelligent Router → GPT-5 Nano/Mini/Standard',
        userFriendlyExplanation: 'Как опытный адвокат, который сразу понимает: нужна ли быстрая справка или серьезная консультация. Простые вопросы решаются быстро, сложные получают больше внимания.',
        visualElement: '⚡',
        position: { x: 50, y: 40 },
        connections: ['gpt5-nano', 'gpt5-mini', 'gpt5-standard'],
        voiceScript: 'Система определяет сложность вашего вопроса. Простые вопросы решаются за секунды, сложные получают глубокий анализ.'
    },
    {
        id: 'gpt5-nano',
        title: '⚡ GPT-5 Nano (80% вопросов)',
        description: 'Быстрые ответы на простые вопросы',
        technicalDetails: '1-2 секунды, низкая стоимость, высокая скорость',
        userFriendlyExplanation: 'Как младший юрист, который быстро отвечает на стандартные вопросы: "Как оформить договор?", "Какие документы нужны?"',
        visualElement: '🚀',
        position: { x: 20, y: 60 },
        connections: ['response-generator'],
        voiceScript: 'Для простых вопросов используется быстрая модель - как младший юрист, который знает все стандартные ответы.'
    },
    {
        id: 'gpt5-mini',
        title: '🚀 GPT-5 Mini (15% вопросов)',
        description: 'Средние задачи с балансом скорости и качества',
        technicalDetails: '2-3 секунды, средняя стоимость, хорошее качество',
        userFriendlyExplanation: 'Как опытный юрист, который разбирается в нюансах и может дать развернутый совет по сложным ситуациям.',
        visualElement: '⚖️',
        position: { x: 50, y: 60 },
        connections: ['response-generator'],
        voiceScript: 'Для более сложных вопросов включается опытный юрист, который может разобрать нюансы вашей ситуации.'
    },
    {
        id: 'gpt5-standard',
        title: '🎯 GPT-5 Standard (5% вопросов)',
        description: 'Сложные рассуждения и максимальное качество',
        technicalDetails: '3-5 секунд, высокая стоимость, максимальное качество',
        userFriendlyExplanation: 'Как главный партнер юридической фирмы, который берется за самые сложные дела и дает экспертное мнение.',
        visualElement: '👨‍⚖️',
        position: { x: 80, y: 60 },
        connections: ['response-generator'],
        voiceScript: 'Для самых сложных вопросов включается главный эксперт - как партнер юридической фирмы с многолетним опытом.'
    },
    {
        id: 'raptor-engine',
        title: '🌳 RAPTOR Engine',
        description: 'Локальная обработка документов и поиск',
        technicalDetails: 'Рекурсивная кластеризация, древовидная организация',
        userFriendlyExplanation: 'Как умная библиотека, которая мгновенно находит нужные документы и связывает их между собой. Работает локально - ваши данные никуда не передаются.',
        visualElement: '🌲',
        position: { x: 20, y: 80 },
        connections: ['local-processing'],
        voiceScript: 'RAPTOR - это как умная библиотека, которая мгновенно находит нужные документы. Все работает локально, ваши данные в безопасности.'
    },
    {
        id: 'local-processing',
        title: '🏠 Локальная обработка',
        description: 'OCR, эмбеддинги и поиск работают локально',
        technicalDetails: 'BGE-M3, Tesseract 5, Qdrant - все локально',
        userFriendlyExplanation: 'Все ваши документы обрабатываются прямо на вашем сервере. Никто не видит ваши данные - полная конфиденциальность.',
        visualElement: '🔒',
        position: { x: 20, y: 100 },
        connections: ['security'],
        voiceScript: 'Все ваши документы обрабатываются локально. Это как иметь личного секретаря, который работает только для вас.'
    },
    {
        id: 'security',
        title: '🛡️ Безопасность 152-ФЗ',
        description: 'Полное соответствие требованиям защиты данных',
        technicalDetails: 'PII анонимизация, шифрование, аудит доступа',
        userFriendlyExplanation: 'Система полностью соответствует российскому законодательству о персональных данных. Ваша информация под надежной защитой.',
        visualElement: '🛡️',
        position: { x: 20, y: 120 },
        connections: ['response-generator'],
        voiceScript: 'Ваши данные защищены по всем стандартам. Система соответствует 152-ФЗ и работает как швейцарский банк.'
    },
    {
        id: 'response-generator',
        title: '📝 Генератор ответов',
        description: 'Форматирование и отправка ответа пользователю',
        technicalDetails: 'Структурированный вывод, контекстная адаптация',
        userFriendlyExplanation: 'AI оформляет ответ в понятном виде и отправляет вам. Как опытный юрист, который объясняет сложные вещи простыми словами.',
        visualElement: '📄',
        position: { x: 50, y: 100 },
        connections: ['user-output'],
        voiceScript: 'AI оформляет ответ и отправляет вам. Как опытный юрист, который объясняет сложные вещи простыми словами.'
    },
    {
        id: 'user-output',
        title: '✅ Готовый ответ',
        description: 'Пользователь получает структурированный ответ',
        technicalDetails: 'Персонализированный формат, обратная связь',
        userFriendlyExplanation: 'Вы получаете четкий, понятный ответ с рекомендациями. Система запоминает ваш вопрос для будущих улучшений.',
        visualElement: '🎉',
        position: { x: 50, y: 120 },
        connections: [],
        voiceScript: 'Готово! Вы получили профессиональный юридический совет. Система запомнила ваш вопрос для будущих улучшений.'
    }
];
const InteractiveArchitectureGuide = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    // const audioRef = useRef<HTMLAudioElement>(null);
    const speechSynthesis = window.speechSynthesis;
    // Улучшенное голосовое сопровождение
    const speakText = useCallback((text) => {
        if (isMuted)
            return;
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9; // Немного быстрее
        utterance.pitch = 1.1; // Чуть выше
        utterance.volume = 0.8; // Громче
        // Попробуем найти лучший голос
        const voices = speechSynthesis.getVoices();
        const russianVoice = voices.find(voice => voice.lang.startsWith('ru') &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft')));
        if (russianVoice) {
            utterance.voice = russianVoice;
        }
        speechSynthesis.speak(utterance);
    }, [isMuted, speechSynthesis]);
    const handleNext = useCallback(() => {
        if (currentStep < guideSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            speakText(guideSteps[currentStep + 1].voiceScript);
        }
    }, [currentStep, speakText]);
    // Автовоспроизведение
    useEffect(() => {
        if (isAutoPlay && !isPlaying) {
            const timer = setTimeout(() => {
                handleNext();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isAutoPlay, isPlaying, handleNext]);
    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            speakText(guideSteps[currentStep - 1].voiceScript);
        }
    };
    const handlePlay = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            speakText(guideSteps[currentStep].voiceScript);
        }
        else {
            speechSynthesis.cancel();
        }
    };
    const handleAutoPlay = () => {
        setIsAutoPlay(!isAutoPlay);
        setIsPlaying(!isAutoPlay);
    };
    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            speechSynthesis.cancel();
        }
    };
    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
        setIsAutoPlay(false);
        speechSynthesis.cancel();
    };
    const handleVoiceInput = () => {
        setIsRecording(!isRecording);
        // Здесь будет интеграция с Web Speech API
    };
    const handleSendMessage = () => {
        if (userMessage.trim()) {
            const newMessage = { role: 'user', content: userMessage };
            setChatHistory([...chatHistory, newMessage]);
            setUserMessage('');
            // Симуляция ответа AI
            setTimeout(() => {
                const aiResponse = { role: 'assistant', content: `Отлично! Я помогу вам разобраться с ${userMessage}. Давайте посмотрим на архитектуру системы...` };
                setChatHistory(prev => [...prev, aiResponse]);
            }, 1000);
        }
    };
    const currentStepData = guideSteps[currentStep];
    return (_jsxs("div", { className: "h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-700", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-2", children: "\uD83C\uDFAF \u0418\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0433\u0438\u0434 \u043F\u043E \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0435 AI-\u042E\u0440\u0438\u0441\u0442\u0430" }), _jsx("p", { className: "text-slate-300 mb-4", children: "\u041F\u043E\u043D\u044F\u0442\u043D\u043E\u0435 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u0441\u043B\u043E\u0436\u043D\u044B\u0445 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0439 \u043F\u0440\u043E\u0441\u0442\u044B\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438" }), _jsx("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-300", children: ["\uD83D\uDCAC ", _jsx("strong", { children: "\u041E\u0431\u0449\u0430\u0439\u0442\u0435\u0441\u044C \u0447\u0435\u0440\u0435\u0437 \u0447\u0430\u0442!" }), " \u0417\u0430\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u043E \u043B\u044E\u0431\u043E\u043C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0435 \u0441\u0438\u0441\u0442\u0435\u043C\u044B, \u0438 AI-\u042E\u0440\u0438\u0441\u0442 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E \u043E\u0431\u044A\u044F\u0441\u043D\u0438\u0442, \u043A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442."] }) })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx("div", { className: "w-80 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-slate-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-300", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441" }), _jsxs("span", { className: "text-sm text-slate-300", children: [currentStep + 1, "/", guideSteps.length] })] }), _jsx("div", { className: "w-full bg-slate-600 rounded-full h-2", children: _jsx("div", { className: `bg-blue-500 progress-bar-fill progress-bar progress-${Math.round(((currentStep + 1) / guideSteps.length) * 100)}` }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { onClick: handlePrevious, disabled: currentStep === 0, className: "w-full flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439"] }), _jsxs("button", { onClick: handleNext, disabled: currentStep === guideSteps.length - 1, className: "w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors", children: ["\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { onClick: handlePlay, className: "flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors", children: [isPlaying ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }), isPlaying ? 'Пауза' : 'Играть'] }), _jsx(AdvancedTTS, { text: guideSteps[currentStep]?.voiceScript || '', isMuted: isMuted, onToggleMute: handleToggleMute })] }), _jsxs("button", { onClick: handleAutoPlay, className: `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isAutoPlay ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`, children: [_jsx(Zap, { className: "w-4 h-4" }), isAutoPlay ? 'Автоплей включен' : 'Включить автоплей'] }), _jsxs("button", { onClick: handleReset, className: "w-full flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C"] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-300", children: "\u0428\u0430\u0433\u0438:" }), guideSteps.map((step, index) => (_jsxs("button", { onClick: () => {
                                                setCurrentStep(index);
                                                speakText(step.voiceScript);
                                            }, className: `w-full text-left p-3 rounded-lg transition-colors interactive-button ${index === currentStep
                                                ? ''
                                                : 'secondary'}`, children: [_jsx("div", { className: "text-sm font-medium", children: step.title }), _jsx("div", { className: "text-xs opacity-75", children: step.description })] }, step.id)))] })] }) }), _jsx("div", { className: "flex-1 p-6 overflow-y-auto", children: _jsx("div", { className: "relative h-full bg-slate-800 rounded-lg overflow-hidden", children: _jsxs("div", { className: "relative w-full h-full", children: [guideSteps.map((step, index) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: {
                                            opacity: index <= currentStep ? 1 : 0.3,
                                            scale: index === currentStep ? 1.1 : 1,
                                            x: step.position.x * 8,
                                            y: step.position.y * 4
                                        }, transition: { duration: 0.5, delay: index * 0.1 }, className: `absolute transform -translate-x-1/2 -translate-y-1/2 ${index === currentStep ? 'z-10' : 'z-0'}`, children: _jsxs("div", { className: `
                                        p-4 rounded-lg border-2 transition-all duration-300
                                        ${index === currentStep
                                                ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50'
                                                : 'bg-slate-700 border-slate-600'}
                                    `, children: [_jsx("div", { className: "text-2xl mb-2", children: step.visualElement }), _jsx("div", { className: "text-sm font-semibold text-white mb-1", children: step.title }), _jsx("div", { className: "text-xs text-slate-300", children: step.description })] }) }, step.id))), _jsx(AnimatePresence, { children: currentStep > 0 && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", children: _jsx(ArrowRight, { className: "w-8 h-8 text-blue-400 animate-pulse" }) })) })] }) }) }), _jsx("div", { className: "w-80 bg-slate-800 border-l border-slate-700 p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-700 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: currentStepData.title }), _jsx("p", { className: "text-sm text-slate-300 mb-3", children: currentStepData.userFriendlyExplanation }), _jsxs("div", { className: "text-xs text-slate-400", children: [_jsx("strong", { children: "\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438:" }), " ", currentStepData.technicalDetails] })] }), _jsxs("div", { className: "bg-slate-700 rounded-lg p-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-white mb-3 flex items-center gap-2", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), "\u0427\u0430\u0442 \u0441 AI-\u0433\u0438\u0434\u043E\u043C"] }), _jsx("div", { className: "space-y-2 mb-4 max-h-40 overflow-y-auto", children: chatHistory.map((message, index) => (_jsx("div", { className: `text-xs p-2 rounded ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white ml-4'
                                                    : 'bg-slate-600 text-slate-300 mr-4'}`, children: message.content }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: userMessage, onChange: (e) => setUserMessage(e.target.value), placeholder: "\u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441...", className: "flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:outline-none focus:border-blue-500", onKeyPress: (e) => e.key === 'Enter' && handleSendMessage() }), _jsx("button", { onClick: handleSendMessage, className: "px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C" })] }), _jsxs("button", { onClick: handleVoiceInput, className: `w-full mt-2 flex items-center gap-2 px-3 py-2 rounded transition-colors ${isRecording
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-slate-600 hover:bg-slate-500'}`, children: [isRecording ? _jsx(MicOff, { className: "w-4 h-4" }) : _jsx(Mic, { className: "w-4 h-4" }), isRecording ? 'Остановить запись' : 'Голосовой ввод'] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F:" }), _jsx("button", { className: "w-full text-left p-2 rounded text-sm transition-colors interactive-button secondary", children: "\uD83E\uDD14 \u041E\u0431\u044A\u044F\u0441\u043D\u0438 \u043F\u0440\u043E\u0449\u0435" }), _jsx("button", { className: "w-full text-left p-2 rounded text-sm transition-colors interactive-button secondary", children: "\uD83D\uDCA1 \u041F\u043E\u043A\u0430\u0436\u0438 \u043F\u0440\u0438\u043C\u0435\u0440" }), _jsx("button", { className: "w-full text-left p-2 rounded text-sm transition-colors interactive-button secondary", children: "\uD83D\uDD0D \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435" })] })] }) })] })] }));
};
export { InteractiveArchitectureGuide };
export default InteractiveArchitectureGuide;
//# sourceMappingURL=InteractiveArchitectureGuide.js.map