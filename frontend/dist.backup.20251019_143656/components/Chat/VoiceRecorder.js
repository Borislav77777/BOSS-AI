import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для записи голосовых сообщений
 */
import { CHAT } from '@/constants';
import { notificationService } from '@/services/NotificationService';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Pause, Play, Square, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
export const VoiceRecorder = ({ onRecordingComplete, className }) => {
    const [state, setState] = useState({
        isRecording: false,
        isPaused: false,
        duration: 0,
    });
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);
    const formatTime = (seconds) => {
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
                    notificationService.warning('Запись слишком длинная', `Максимальная длительность: ${CHAT.AUDIO.MAX_DURATION} секунд`);
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
        }
        catch (error) {
            console.error('Ошибка доступа к микрофону:', error);
            notificationService.error('Ошибка доступа к микрофону', 'Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
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
    return (_jsxs("div", { className: cn("voice-recorder-container", className), children: [_jsx("audio", { ref: audioRef, src: state.audioUrl, onEnded: () => {
                    // Сброс состояния воспроизведения
                } }), state.isRecording && (_jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm font-medium", children: formatTime(state.duration) })] }), _jsxs("div", { className: "flex space-x-2", children: [state.isPaused ? (_jsx("button", { onClick: resumeRecording, className: "p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors", title: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C", children: _jsx(Play, { className: "w-4 h-4" }) })) : (_jsx("button", { onClick: pauseRecording, className: "p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors", title: "\u041F\u0430\u0443\u0437\u0430", children: _jsx(Pause, { className: "w-4 h-4" }) })), _jsx("button", { onClick: stopRecording, className: "p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors", title: "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C", children: _jsx(Square, { className: "w-4 h-4" }) })] })] })), state.audioBlob && !state.isRecording && (_jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "flex items-center space-x-3 p-3 bg-black rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: playRecording, className: "p-2 bg-primary text-background rounded hover:bg-primary/80 transition-colors", title: "\u0412\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438", children: _jsx(Play, { className: "w-4 h-4" }) }), _jsx("span", { className: "text-sm font-medium", children: formatTime(state.duration) })] }), _jsx("button", { onClick: deleteRecording, className: "p-2 text-red-500 hover:bg-red-100 rounded transition-colors", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }))] }));
};
export default VoiceRecorder;
//# sourceMappingURL=VoiceRecorder.js.map