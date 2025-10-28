/**
 * Типы для интеграции сервисов с чатом
 */
export interface ChatHandler {
    id: string;
    name: string;
    description: string;
    serviceId: string;
    handler: (message: string, context: ChatContext) => Promise<ChatResponse>;
    isEnabled: boolean;
    priority: number;
    triggers: string[];
    examples: string[];
}
export interface ChatContext {
    userId: string;
    sessionId: string;
    timestamp: Date;
    previousMessages: ChatMessage[];
    userPreferences: Record<string, any>;
    serviceData: Record<string, any>;
}
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
    metadata: {
        serviceId?: string;
        handlerId?: string;
        processingTime?: number;
        tokens?: number;
    };
}
export interface ChatResponse {
    content: string;
    type: 'text' | 'html' | 'markdown' | 'json' | 'file';
    metadata: {
        serviceId: string;
        handlerId: string;
        processingTime: number;
        tokens?: number;
        attachments?: ChatAttachment[];
    };
    actions?: ChatAction[];
    suggestions?: string[];
}
export interface ChatAttachment {
    id: string;
    name: string;
    type: 'image' | 'document' | 'audio' | 'video' | 'file';
    url: string;
    size: number;
    metadata: Record<string, any>;
}
export interface ChatAction {
    id: string;
    label: string;
    type: 'button' | 'link' | 'command';
    action: string;
    icon?: string;
    style?: 'primary' | 'secondary' | 'danger';
}
export interface ServiceChatIntegration {
    serviceId: string;
    handlers: ChatHandler[];
    chatButtons: ServiceChatButton[];
    autoRegister: boolean;
    eventHandlers: {
        onMessageReceived?: (message: ChatMessage) => void;
        onResponseGenerated?: (response: ChatResponse) => void;
        onHandlerExecuted?: (handler: ChatHandler, result: ChatResponse) => void;
    };
}
export interface ServiceChatButton {
    id: string;
    label: string;
    icon: string;
    action: string;
    position: 'top' | 'bottom';
    serviceId: string;
    isEnabled: boolean;
    handler: () => void | Promise<void>;
}
export interface ChatIntegrationManager {
    registerServiceIntegration(integration: ServiceChatIntegration): void;
    unregisterServiceIntegration(serviceId: string): void;
    registerHandler(handler: ChatHandler): void;
    unregisterHandler(handlerId: string): void;
    getHandler(handlerId: string): ChatHandler | null;
    getAllHandlers(): ChatHandler[];
    getServiceHandlers(serviceId: string): ChatHandler[];
    processMessage(message: string, context: ChatContext): Promise<ChatResponse[]>;
    executeHandler(handlerId: string, message: string, context: ChatContext): Promise<ChatResponse>;
    registerChatButton(button: ServiceChatButton): void;
    unregisterChatButton(buttonId: string): void;
    getChatButtons(serviceId?: string): ServiceChatButton[];
    onMessageReceived: (callback: (message: ChatMessage) => void) => void;
    onResponseGenerated: (callback: (response: ChatResponse) => void) => void;
    onHandlerExecuted: (callback: (handler: ChatHandler, result: ChatResponse) => void) => void;
    syncWithChat(): void;
    exportHandlers(serviceId?: string): ChatHandler[];
    importHandlers(handlers: ChatHandler[]): void;
}
//# sourceMappingURL=types.d.ts.map