import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { MicOff, Pause, Play, Send } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
export const VoiceInterface = ({ onTranscriptionComplete, onClose, isVisible }) => {
    const [isRecording, setIsRecording] = useState(true); // Сразу начинаем запись
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcribedText, setTranscribedText] = useState('');
    const [audioLevels, setAudioLevels] = useState([]);
    // const [isProcessing, setIsProcessing] = useState(false);
    // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    // Инициализация аудио контекста
    const initializeAudioContext = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });
            streamRef.current = stream;
            audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.8;
            return true;
        }
        catch (error) {
            console.error('Ошибка инициализации аудио:', error);
            return false;
        }
    }, []);
    // Получение уровня звука
    const getAudioLevel = useCallback(() => {
        if (!analyserRef.current)
            return 0;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        // Вычисляем средний уровень звука
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        return Math.min(average / 128, 1); // Нормализуем к 0-1
    }, []);
    // Анимация визуализации звука
    const animateAudioLevels = useCallback(() => {
        if (!isRecording || isPaused)
            return;
        const level = getAudioLevel();
        const timestamp = Date.now();
        setAudioLevels(prev => {
            const newLevels = [...prev, { level, timestamp }];
            // Оставляем только последние 50 уровней для визуализации
            return newLevels.slice(-50);
        });
        animationFrameRef.current = requestAnimationFrame(animateAudioLevels);
    }, [isRecording, isPaused, getAudioLevel]);
    // Запуск записи
    const startRecording = useCallback(async () => {
        try {
            const initialized = await initializeAudioContext();
            if (!initialized)
                return;
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setTranscribedText('');
            setAudioLevels([]);
            // Запускаем таймер
            intervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            // Запускаем визуализацию звука
            animateAudioLevels();
            // Запускаем транскрипцию в реальном времени
            startRealtimeTranscription();
        }
        catch (error) {
            console.error('Ошибка запуска записи:', error);
        }
    }, [initializeAudioContext, animateAudioLevels]);
    // Остановка записи
    const stopRecording = useCallback(() => {
        setIsRecording(false);
        setIsPaused(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        // Очищаем аудио ресурсы
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);
    // Пауза/возобновление
    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);
    // Отправка текста
    const sendText = useCallback(() => {
        const withoutInterim = transcribedText.replace(/<span class="interim">.*?<\/span>/g, '');
        const plainText = withoutInterim.replace(/<[^>]+>/g, '').trim();
        if (plainText) {
            onTranscriptionComplete(plainText);
            setTranscribedText('');
        }
        onClose();
    }, [transcribedText, onTranscriptionComplete, onClose]);
    // Обработка горячих клавиш
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isVisible)
                return;
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendText();
            }
            else if (event.key === ' ') {
                event.preventDefault();
                if (isRecording) {
                    togglePause();
                }
                else {
                    startRecording();
                }
            }
            else if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, isRecording, sendText, togglePause, startRecording, onClose]);
    // Реальное распознавание речи с использованием Web Speech API
    const startRealtimeTranscription = useCallback(() => {
        // Проверяем поддержку Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Web Speech API не поддерживается в этом браузере');
            setTranscribedText('Ошибка: Web Speech API не поддерживается');
            return;
        }
        const recognition = new SpeechRecognition();
        // Настройки распознавания
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ru-RU';
        recognition.maxAlternatives = 1;
        // Обработчик результатов
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            // Проверяем, что event.results существует и является массивом
            if (event.results && Array.isArray(event.results) && typeof event.resultIndex === 'number') {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                    else {
                        interimTranscript += transcript;
                    }
                }
            }
            // Обновляем текст транскрипции
            setTranscribedText(prev => {
                const baseText = prev.replace(/<span class="interim">.*?<\/span>/g, '');
                const newText = baseText + finalTranscript;
                return interimTranscript ? `${newText} <span class="interim">${interimTranscript}</span>` : newText;
            });
        };
        // Обработчик ошибок
        recognition.onerror = (event) => {
            console.error('Ошибка распознавания речи:', event.error);
            setTranscribedText(prev => prev + ` [Ошибка: ${event.error}]`);
        };
        // Обработчик завершения
        recognition.onend = () => {
            console.log('Распознавание речи завершено');
            // Автоматически перезапускаем, если запись продолжается
            if (isRecording && !isPaused) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    }
                    catch (error) {
                        console.error('Ошибка перезапуска распознавания:', error);
                    }
                }, 100);
            }
        };
        // Начинаем распознавание
        try {
            recognition.start();
        }
        catch (error) {
            console.error('Ошибка запуска распознавания:', error);
            setTranscribedText('Ошибка запуска распознавания речи');
        }
    }, [isRecording, isPaused]);
    // Форматирование времени
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);
    // Автоматический запуск записи при открытии
    useEffect(() => {
        if (isVisible && isRecording) {
            startRecording();
        }
    }, [isVisible, isRecording, startRecording]);
    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "voice-interface-overlay", children: _jsxs("div", { className: "voice-interface-container voice-interface-enter", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-primary mb-2", children: isRecording ? 'Говорите...' : 'Голосовой ввод' }), isRecording && (_jsx("div", { className: "recording-timer", children: formatTime(recordingTime) }))] }), isRecording && (_jsx("div", { className: "audio-visualizer", children: audioLevels.map((audioLevel, index) => (_jsx("div", { className: "audio-bar", "data-height": Math.max(2, audioLevel.level * 60) }, index))) })), transcribedText && (_jsxs("div", { className: "transcription-text", children: [_jsx("span", { className: "transcription-label", children: "\u0422\u0440\u0430\u043D\u0441\u043A\u0440\u0438\u043F\u0446\u0438\u044F:" }), _jsx("div", { className: "transcription-content", children: transcribedText })] })), _jsxs("div", { className: "voice-controls", children: [_jsx("button", { onClick: togglePause, className: cn("voice-button", isPaused ? "pause" : "pause"), title: isPaused ? "Возобновить запись (Пробел)" : "Приостановить запись (Пробел)", children: isPaused ? _jsx(Play, { size: 20 }) : _jsx(Pause, { size: 20 }) }), _jsx("button", { onClick: sendText, className: "voice-button send", title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u043A\u0441\u0442 (Enter)", disabled: !transcribedText.trim(), children: _jsx(Send, { size: 20 }) }), _jsx("button", { onClick: onClose, className: "voice-button close", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 (Escape)", children: _jsx(MicOff, { size: 20 }) })] }), _jsx("div", { className: "voice-status", children: isRecording
                        ? (isPaused ? 'Пауза' : 'Запись...')
                        : 'Нажмите микрофон для начала записи' })] }) }));
};
//# sourceMappingURL=VoiceInterface.js.map