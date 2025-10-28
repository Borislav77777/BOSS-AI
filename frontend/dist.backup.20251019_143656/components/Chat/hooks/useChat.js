/**
 * Хук для управления состоянием чата
 */
import { usePlatform } from '@/hooks/usePlatform';
import { useCallback, useState } from 'react';
export const useChat = () => {
    const { state, sendMessage } = usePlatform();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleSendMessage = useCallback(async (message) => {
        if (!message.trim() || isProcessing)
            return;
        setIsProcessing(true);
        try {
            await sendMessage(message);
        }
        catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
        finally {
            setIsProcessing(false);
        }
    }, [sendMessage, isProcessing]);
    const handleStartVoiceRecord = useCallback(() => {
        setIsRecording(true);
    }, []);
    const handleStopVoiceRecord = useCallback(() => {
        setIsRecording(false);
    }, []);
    const handleUploadFile = useCallback((file) => {
        // Логика загрузки файла
        console.log('Загружаем файл:', file.name);
    }, []);
    const handleSelectService = useCallback((serviceId) => {
        // Логика выбора сервиса
        console.log('Выбран сервис:', serviceId);
    }, []);
    const handleSelectModel = useCallback((modelId) => {
        // Логика выбора модели
        console.log('Выбрана модель:', modelId);
    }, []);
    const handleRetryMessage = useCallback((messageId) => {
        // Логика повторной отправки сообщения
        console.log('Повторная отправка сообщения:', messageId);
    }, []);
    const handleDeleteMessage = useCallback((messageId) => {
        // Логика удаления сообщения
        console.log('Удаление сообщения:', messageId);
    }, []);
    const chatState = {
        isRecording,
        isProcessing,
        selectedService: state.layout.activeService,
        selectedModel: null, // TODO: добавить в state
        messages: state.activeChat?.messages || []
    };
    const chatActions = {
        sendMessage: handleSendMessage,
        startVoiceRecord: handleStartVoiceRecord,
        stopVoiceRecord: handleStopVoiceRecord,
        uploadFile: handleUploadFile,
        selectService: handleSelectService,
        selectModel: handleSelectModel,
        retryMessage: handleRetryMessage,
        deleteMessage: handleDeleteMessage
    };
    return {
        chatState,
        chatActions
    };
};
//# sourceMappingURL=useChat.js.map