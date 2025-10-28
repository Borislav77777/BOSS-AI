import { ServiceTheme } from './Theme';
export interface ServiceTool {
    id: string;
    name: string;
    description: string;
    icon: string;
    action: string;
    isEnabled: boolean;
    category?: string;
    isChatFunction?: boolean;
    chatApiEndpoint?: string;
    chatPrompt?: string;
    chatResponseHandler?: string;
}
export interface ServiceConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    version: string;
    isActive: boolean;
    tools: ServiceTool[];
    settings: Record<string, boolean | string | number | string[] | object>;
    dependencies: string[];
    author?: string;
    category: string;
    priority: number;
    chatApiBaseUrl?: string;
    chatApiKey?: string;
    chatFunctions?: ServiceTool[];
    chatButtons?: ChatButton[];
    theme?: ServiceTheme;
}
export interface ChatButton {
    id: string;
    name: string;
    icon: string;
    description: string;
    action: string;
    isEnabled: boolean;
    disabled?: boolean;
    color?: string;
    position?: 'top' | 'bottom';
}
export interface ServiceModule {
    config: ServiceConfig;
    module: ServiceModuleInterface | null;
    isLoaded: boolean;
    error?: string;
}
export interface ServiceModuleInterface {
    initialize?: () => Promise<void>;
    execute?: (toolId: string, params?: Record<string, unknown>) => Promise<unknown>;
    cleanup?: () => Promise<void>;
    [key: string]: unknown;
}
export interface ServiceManager {
    services: ServiceModule[];
    loadService: (serviceId: string) => Promise<void>;
    unloadService: (serviceId: string) => void;
    getService: (serviceId: string) => ServiceModule | undefined;
    executeTool: (serviceId: string, toolId: string) => Promise<unknown>;
}
//# sourceMappingURL=services.d.ts.map