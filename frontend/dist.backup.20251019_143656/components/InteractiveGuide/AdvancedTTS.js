import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useState } from 'react';
export const AdvancedTTS = ({ text, isMuted, onToggleMute }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('auto');
    // Улучшенный TTS с выбором голоса
    const speakText = useCallback(async (textToSpeak) => {
        if (isMuted || !textToSpeak.trim())
            return;
        setIsLoading(true);
        try {
            // Останавливаем текущее воспроизведение
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            // Ждем немного для корректной остановки
            await new Promise(resolve => setTimeout(resolve, 100));
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            // Выбираем лучший голос
            const voices = window.speechSynthesis.getVoices();
            let selectedVoiceObj = null;
            if (selectedVoice === 'auto') {
                // Автоматический выбор лучшего русского голоса
                selectedVoiceObj = voices.find(voice => voice.lang.startsWith('ru') &&
                    (voice.name.includes('Google') ||
                        voice.name.includes('Microsoft') ||
                        voice.name.includes('Yandex'))) || voices.find(voice => voice.lang.startsWith('ru'));
            }
            else {
                selectedVoiceObj = voices.find(voice => voice.name === selectedVoice);
            }
            if (selectedVoiceObj) {
                utterance.voice = selectedVoiceObj;
            }
            // Обработчики событий
            utterance.onstart = () => setIsLoading(false);
            utterance.onend = () => setIsLoading(false);
            utterance.onerror = () => setIsLoading(false);
            window.speechSynthesis.speak(utterance);
        }
        catch (error) {
            console.error('Ошибка TTS:', error);
            setIsLoading(false);
        }
    }, [isMuted, selectedVoice]);
    // Получаем доступные голоса
    const getAvailableVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        return voices.filter(voice => voice.lang.startsWith('ru'));
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => speakText(text), disabled: isLoading || isMuted, className: `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isLoading
                    ? 'bg-yellow-600 text-white cursor-not-allowed'
                    : isMuted
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm", children: "\u041E\u0437\u0432\u0443\u0447\u0438\u0432\u0430\u043D\u0438\u0435..." })] })) : isMuted ? (_jsxs(_Fragment, { children: [_jsx(VolumeX, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "\u0417\u0432\u0443\u043A \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D" })] })) : (_jsxs(_Fragment, { children: [_jsx(Volume2, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "\u041E\u0437\u0432\u0443\u0447\u0438\u0442\u044C" })] })) }), _jsxs("button", { onClick: onToggleMute, className: `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isMuted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'}`, children: [isMuted ? _jsx(VolumeX, { className: "w-4 h-4" }) : _jsx(Volume2, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: isMuted ? 'Включить' : 'Отключить' })] }), _jsx("div", { className: "text-xs text-slate-400 max-w-xs", children: "\uD83D\uDCA1 \u0414\u043B\u044F \u043B\u0443\u0447\u0448\u0435\u0433\u043E \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 Yandex SpeechKit \u0438\u043B\u0438 Google Cloud TTS" })] }));
};
//# sourceMappingURL=AdvancedTTS.js.map