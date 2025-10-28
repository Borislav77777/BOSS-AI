/**
 * Компонент для записи голосовых сообщений
 */

import { CHAT } from '@/constants';
import { notificationService } from '@/services/NotificationService';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Pause, Play, Square, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    className?: string;
}

interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    audioBlob?: Blob;
    audioUrl?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, className }) => {
    const [state, setState] = useState<RecordingState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            setState(prev => ({
                ...prev,
                duration: prev.duration + 1,
            }));
        }, 1000);
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startRecording = useCallback(async () => {
        try {
            // Запрашиваем доступ к микрофону
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: CHAT.AUDIO.SAMPLE_RATE,
                    channelCount: 1,
                }
            });

            streamRef.current = stream;

            // Создаем MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: CHAT.AUDIO.FORMATS.find(format => MediaRecorder.isTypeSupported(format)) || 'audio/webm'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Обработчики событий
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mediaRecorder.mimeType
                });

                // Проверяем длительность записи
                if (state.duration > CHAT.AUDIO.MAX_DURATION) {
                    notificationService.warning(
                        'Запись слишком длинная',
                        `Максимальная длительность: ${CHAT.AUDIO.MAX_DURATION} секунд`
                    );
                    return;
                }

                const audioUrl = URL.createObjectURL(audioBlob);

                setState(prev => ({
                    ...prev,
                    audioBlob,
                    audioUrl,
                }));

                onRecordingComplete(audioBlob);
            };

            // Начинаем запись
            mediaRecorder.start(100); // Записываем данные каждые 100мс

            setState(prev => ({
                ...prev,
                isRecording: true,
                isPaused: false,
                duration: 0,
            }));

            startTimer();

        } catch (error) {
            console.error('Ошибка доступа к микрофону:', error);
            notificationService.error(
                'Ошибка доступа к микрофону',
                'Не удалось получить доступ к микрофону. Проверьте разрешения браузера.'
            );
        }
    }, [state.duration, onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.isRecording) {
            mediaRecorderRef.current.stop();

            // Останавливаем поток
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            stopTimer();

            setState(prev => ({
                ...prev,
                isRecording: false,
                isPaused: false,
            }));
        }
    }, [state.isRecording]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
            mediaRecorderRef.current.pause();
            stopTimer();

            setState(prev => ({
                ...prev,
                isPaused: true,
            }));
        }
    }, [state.isRecording, state.isPaused]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
            mediaRecorderRef.current.resume();
            startTimer();

            setState(prev => ({
                ...prev,
                isPaused: false,
            }));
        }
    }, [state.isRecording, state.isPaused]);

    const playRecording = useCallback(() => {
        if (state.audioUrl && audioRef.current) {
            audioRef.current.play();
        }
    }, [state.audioUrl]);

    // const pausePlayback = useCallback(() => {
    //     if (audioRef.current) {
    //         audioRef.current.pause();
    //     }
    // }, []);

    const deleteRecording = useCallback(() => {
        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl);
        }

        setState({
            isRecording: false,
            isPaused: false,
            duration: 0,
        });
    }, [state.audioUrl]);

    // Автоматически начинаем запись при монтировании компонента
    useEffect(() => {
        startRecording();
    }, []); // Пустой массив зависимостей означает, что эффект выполнится только при монтировании

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            stopTimer();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (state.audioUrl) {
                URL.revokeObjectURL(state.audioUrl);
            }
        };
    }, [state.audioUrl]);

    return (
        <div className={cn("voice-recorder-container", className)}>
            {/* Скрытый audio элемент для воспроизведения */}
            <audio
                ref={audioRef}
                src={state.audioUrl}
                onEnded={() => {
                    // Сброс состояния воспроизведения
                }}
            />


            {state.isRecording && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-3"
                >
                    {/* Индикатор записи */}
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">
                            {formatTime(state.duration)}
                        </span>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex space-x-2">
                        {state.isPaused ? (
                            <button
                                onClick={resumeRecording}
                                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                title="Продолжить запись"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={pauseRecording}
                                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                title="Пауза"
                            >
                                <Pause className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={stopRecording}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Остановить запись"
                        >
                            <Square className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {state.audioBlob && !state.isRecording && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-3 p-3 bg-black rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={playRecording}
                            className="p-2 bg-primary text-background rounded hover:bg-primary/80 transition-colors"
                            title="Воспроизвести"
                        >
                            <Play className="w-4 h-4" />
                        </button>

                        <span className="text-sm font-medium">
                            {formatTime(state.duration)}
                        </span>
                    </div>

                    <button
                        onClick={deleteRecording}
                        className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="Удалить запись"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default VoiceRecorder;
