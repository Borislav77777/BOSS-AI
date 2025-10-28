/**
 * Типы для модульной архитектуры Chat компонента
 */
export interface Model {
    id: string;
    name: string;
    description: string;
    cost: string;
    isDefault?: boolean;
}
export interface ChatProps {
    className?: string;
    onInputResize?: (e: React.MouseEvent) => void;
}
export interface ChatInputProps {
    onInputResize?: (e: React.MouseEvent) => void;
    onSendMessage: (message: string) => void;
    onVoiceRecord: () => void;
    onVoiceStop: () => void;
    onFileUpload: (file: File) => void;
    isRecording: boolean;
    isProcessing: boolean;
}
export interface ChatMessagesProps {
    messages: any[];
    isProcessing: boolean;
    onRetryMessage: (messageId: string) => void;
    onDeleteMessage: (messageId: string) => void;
}
export interface ChatControlsProps {
    onServiceSelect: (serviceId: string) => void;
    onModelSelect: (modelId: string) => void;
    onButtonClick: (button: any, serviceId?: string) => void;
    selectedService: string | null;
    selectedModel: string | null;
    availableServices: any[];
    availableModels: Model[];
}
export interface ChatState {
    isRecording: boolean;
    isProcessing: boolean;
    selectedService: string | null;
    selectedModel: string | null;
    messages: any[];
}
export interface ChatActions {
    sendMessage: (message: string) => void;
    startVoiceRecord: () => void;
    stopVoiceRecord: () => void;
    uploadFile: (file: File) => void;
    selectService: (serviceId: string) => void;
    selectModel: (modelId: string) => void;
    retryMessage: (messageId: string) => void;
    deleteMessage: (messageId: string) => void;
}
//# sourceMappingURL=types.d.ts.map