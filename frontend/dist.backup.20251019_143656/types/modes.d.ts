/**
 * Типы для системы режимов работы с сервисами
 */
export interface ServiceMode {
    id: string;
    name: string;
    description: string;
    icon: string;
    serviceId: string;
    isActive: boolean;
    priority: number;
    capabilities: string[];
    promptTemplate?: string;
    responseFormat?: 'text' | 'json' | 'html' | 'markdown';
}
export interface ModeActivation {
    modeId: string;
    serviceId: string;
    activatedAt: Date;
    context?: Record<string, unknown>;
    userIntent?: string;
}
export interface BossAIResponse {
    mode: ServiceMode;
    response: string;
    suggestions: string[];
    nextActions: string[];
    confidence: number;
}
//# sourceMappingURL=modes.d.ts.map