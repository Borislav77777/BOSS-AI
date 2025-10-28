import { Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface AdvancedTTSProps {
    text: string;
    isMuted: boolean;
    onToggleMute: () => void;
}

export const AdvancedTTS: React.FC<AdvancedTTSProps> = ({ text, isMuted, onToggleMute }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string>('auto');

    // Улучшенный TTS с выбором голоса
    const speakText = useCallback(async (textToSpeak: string) => {
        if (isMuted || !textToSpeak.trim()) return;

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
                selectedVoiceObj = voices.find(voice =>
                    voice.lang.startsWith('ru') &&
                    (voice.name.includes('Google') ||
                        voice.name.includes('Microsoft') ||
                        voice.name.includes('Yandex'))
                ) || voices.find(voice => voice.lang.startsWith('ru'));
            } else {
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
        } catch (error) {
            console.error('Ошибка TTS:', error);
            setIsLoading(false);
        }
    }, [isMuted, selectedVoice]);

    // Получаем доступные голоса
    const getAvailableVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        return voices.filter(voice => voice.lang.startsWith('ru'));
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => speakText(text)}
                disabled={isLoading || isMuted}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isLoading
                        ? 'bg-yellow-600 text-white cursor-not-allowed'
                        : isMuted
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                    }`}
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Озвучивание...</span>
                    </>
                ) : isMuted ? (
                    <>
                        <VolumeX className="w-4 h-4" />
                        <span className="text-sm">Звук отключен</span>
                    </>
                ) : (
                    <>
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">Озвучить</span>
                    </>
                )}
            </button>

            <button
                onClick={onToggleMute}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isMuted
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-sm">{isMuted ? 'Включить' : 'Отключить'}</span>
            </button>

            {/* Информация о внешних сервисах */}
            <div className="text-xs text-slate-400 max-w-xs">
                💡 Для лучшего качества используйте Yandex SpeechKit или Google Cloud TTS
            </div>
        </div>
    );
};
