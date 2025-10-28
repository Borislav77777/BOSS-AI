import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Mic, Send, Square, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
export const VoiceWidget = ({ widget, onMinimize, onClose, isMinimized, onTranscriptionComplete, onDragStart }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcribedText, setTranscribedText] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef(null);
    // Автозапуск записи
    React.useEffect(() => {
        if (widget.settings['auto-start'] && !isMinimized) {
            startRecording();
        }
    }, [widget.settings, isMinimized]);
    // Таймер записи
    React.useEffect(() => {
        if (isRecording && !isPaused) {
            intervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRecording, isPaused]);
    // Форматирование времени
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Запуск записи
    const startRecording = () => {
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        setTranscribedText('');
    };
    // Остановка записи
    const stopRecording = () => {
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
    };
    // Пауза/возобновление
    const togglePause = () => {
        setIsPaused(prev => !prev);
    };
    // Отправка текста
    const sendText = () => {
        if (transcribedText.trim()) {
            onTranscriptionComplete(transcribedText.trim());
            setTranscribedText('');
            stopRecording();
        }
    };
    // Реальное распознавание речи с использованием Web Speech API
    React.useEffect(() => {
        if (isRecording && !isPaused) {
            // Проверяем поддержку Web Speech API
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                setTranscribedText((prev) => {
                    const baseText = prev.replace(/<span class="interim">.*?<\/span>/g, '');
                    const newText = baseText + finalTranscript;
                    return interimTranscript ? `${newText} <span class="interim">${interimTranscript}</span>` : newText;
                });
            };
            // Обработчик ошибок
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event) => {
                console.error('Ошибка распознавания речи:', event.error);
                setTranscribedText((prev) => prev + ` [Ошибка: ${event.error}]`);
            };
            // Обработчик завершения
            recognition.onend = () => {
                if (isRecording && !isPaused) {
                    setTimeout(() => {
                        try {
                            recognition.start();
                        }
                        catch (err) {
                            console.error('Restart speech recognition failed', err);
                        }
                    }, 100);
                }
            };
            // Начинаем распознавание
            try {
                recognition.start();
            }
            catch (err) {
                console.error('Ошибка запуска распознавания речи', err);
                setTranscribedText('Ошибка запуска распознавания речи');
            }
            // Очистка при размонтировании
            return () => {
                try {
                    recognition.stop();
                }
                catch (err) {
                    console.error('Ошибка остановки распознавания', err);
                }
            };
        }
    }, [isRecording, isPaused]);
    if (isMinimized) {
        return (_jsx("div", { className: "widget-minimized voice-widget-minimized", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: onMinimize, children: _jsxs("div", { className: "widget-minimized-content", children: [_jsx("button", { className: "widget-minimized-mic-btn", onClick: (e) => {
                            e.stopPropagation();
                            if (!isRecording) {
                                startRecording();
                            }
                        }, title: isRecording ? 'Идёт запись' : 'Начать запись', children: _jsx(Mic, { size: 16, className: cn("widget-minimized-icon", isRecording && "recording") }) }), isRecording && (_jsx("div", { className: "widget-minimized-time", children: formatTime(recordingTime) }))] }) }));
    }
    return (_jsxs("div", { className: "widget-container voice-widget-container active", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onMouseDown: onDragStart, children: [_jsxs("div", { className: "widget-header", children: [_jsxs("div", { className: "widget-title", children: [_jsx(Mic, { size: 16, className: "widget-icon" }), _jsx("span", { children: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0432\u0432\u043E\u0434" })] }), _jsxs("div", { className: cn("widget-controls", isHovered && "widget-controls-visible"), children: [_jsx("button", { onClick: () => {
                                    // Убираем тень с виджета
                                    const widgetElement = document.querySelector('.voice-widget-container');
                                    if (widgetElement) {
                                        widgetElement.classList.toggle('no-shadow');
                                    }
                                }, className: "widget-control-btn", title: "\u0423\u0431\u0440\u0430\u0442\u044C \u0442\u0435\u043D\u044C", children: _jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }), _jsx("path", { d: "M2 17l10 5 10-5" }), _jsx("path", { d: "M2 12l10 5 10-5" })] }) }), _jsx("button", { onClick: onClose, className: "widget-control-btn widget-control-close", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: _jsx(X, { size: 12 }) })] })] }), _jsxs("div", { className: "widget-content voice-widget-content", children: [_jsx("div", { className: "voice-main-controls", children: !isRecording ? (_jsxs("button", { className: "voice-start-btn-small", onClick: startRecording, title: "\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C", children: [_jsx(Mic, { size: 20 }), _jsx("span", { children: "\u0417\u0430\u043F\u0438\u0441\u044C" })] })) : (_jsxs("div", { className: "voice-recording-info", children: [_jsx("div", { className: "voice-recording-time", children: formatTime(recordingTime) }), _jsx("div", { className: "voice-recording-status", children: isPaused ? 'Пауза' : 'Идёт запись...' })] })) }), isRecording && (_jsxs("div", { className: "voice-recording-controls", children: [_jsx("button", { className: "voice-control-btn voice-pause-btn", onClick: togglePause, title: isPaused ? 'Возобновить' : 'Пауза', children: _jsx(Square, { size: 16 }) }), _jsx("button", { className: "voice-control-btn voice-send-btn", onClick: sendText, title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C", disabled: !transcribedText.trim(), children: _jsx(Send, { size: 16 }) })] })), widget.settings['show-transcription'] && transcribedText && (_jsx("div", { className: "voice-transcription", dangerouslySetInnerHTML: { __html: transcribedText } }))] })] }));
};
//# sourceMappingURL=VoiceWidget.js.map