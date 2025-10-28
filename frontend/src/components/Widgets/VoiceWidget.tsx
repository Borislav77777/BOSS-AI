import { cn } from '@/utils';
import { Mic, Send, Square, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface VoiceWidgetProps {
    widget: {
        id: string;
        settings: {
            'auto-start': boolean;
            'show-transcription': boolean;
        };
    };
    onMinimize: () => void;
    onClose: () => void;
    isMinimized: boolean;
    onTranscriptionComplete: (text: string) => void;
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({
    widget,
    onMinimize,
    onClose,
    isMinimized,
    onTranscriptionComplete,
    onDragStart
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcribedText, setTranscribedText] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        } else {
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
    const formatTime = (seconds: number) => {
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
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                // Проверяем, что event.results существует и является массивом
                if (event.results && Array.isArray(event.results) && typeof event.resultIndex === 'number') {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;

                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }
                }

                // Обновляем текст транскрипции
                setTranscribedText((prev: string) => {
                    const baseText = prev.replace(/<span class="interim">.*?<\/span>/g, '');
                    const newText = baseText + finalTranscript;
                    return interimTranscript ? `${newText} <span class="interim">${interimTranscript}</span>` : newText;
                });
            };

            // Обработчик ошибок
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                console.error('Ошибка распознавания речи:', event.error);
                setTranscribedText((prev: string) => prev + ` [Ошибка: ${event.error}]`);
            };

            // Обработчик завершения
            recognition.onend = () => {
                if (isRecording && !isPaused) {
                    setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (err) {
                            console.error('Restart speech recognition failed', err);
                        }
                    }, 100);
                }
            };

            // Начинаем распознавание
            try {
                recognition.start();
            } catch (err) {
                console.error('Ошибка запуска распознавания речи', err);
                setTranscribedText('Ошибка запуска распознавания речи');
            }

            // Очистка при размонтировании
            return () => {
                try {
                    recognition.stop();
                } catch (err) {
                    console.error('Ошибка остановки распознавания', err);
                }
            };
        }
    }, [isRecording, isPaused]);

    if (isMinimized) {
        return (
            <div
                className="widget-minimized voice-widget-minimized"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onMinimize}
            >
                <div className="widget-minimized-content">
                    <button
                        className="widget-minimized-mic-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isRecording) {
                                startRecording();
                            }
                        }}
                        title={isRecording ? 'Идёт запись' : 'Начать запись'}
                    >
                        <Mic size={16} className={cn("widget-minimized-icon", isRecording && "recording")} />
                    </button>
                    {isRecording && (
                        <div className="widget-minimized-time">
                            {formatTime(recordingTime)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="widget-container voice-widget-container active"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={onDragStart}
        >
            {/* Заголовок виджета */}
            <div className="widget-header">
                <div className="widget-title">
                    <Mic size={16} className="widget-icon" />
                    <span>Голосовой ввод</span>
                </div>
                <div className={cn("widget-controls", isHovered && "widget-controls-visible")}>
                    <button
                        onClick={() => {
                            // Убираем тень с виджета
                            const widgetElement = document.querySelector('.voice-widget-container');
                            if (widgetElement) {
                                widgetElement.classList.toggle('no-shadow');
                            }
                        }}
                        className="widget-control-btn"
                        title="Убрать тень"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="widget-control-btn widget-control-close"
                        title="Закрыть"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Содержимое виджета */}
            <div className="widget-content voice-widget-content">
                <div className="voice-main-controls">
                    {!isRecording ? (
                        <button
                            className="voice-start-btn-small"
                            onClick={startRecording}
                            title="Начать запись"
                        >
                            <Mic size={20} />
                            <span>Запись</span>
                        </button>
                    ) : (
                        <div className="voice-recording-info">
                            <div className="voice-recording-time">{formatTime(recordingTime)}</div>
                            <div className="voice-recording-status">
                                {isPaused ? 'Пауза' : 'Идёт запись...'}
                            </div>
                        </div>
                    )}
                </div>

                {isRecording && (
                    <div className="voice-recording-controls">
                        <button
                            className="voice-control-btn voice-pause-btn"
                            onClick={togglePause}
                            title={isPaused ? 'Возобновить' : 'Пауза'}
                        >
                            <Square size={16} />
                        </button>
                        <button
                            className="voice-control-btn voice-send-btn"
                            onClick={sendText}
                            title="Отправить"
                            disabled={!transcribedText.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                )}

                {widget.settings['show-transcription'] && transcribedText && (
                    <div className="voice-transcription" dangerouslySetInnerHTML={{ __html: transcribedText }} />
                )}
            </div>
        </div>
    );
};
