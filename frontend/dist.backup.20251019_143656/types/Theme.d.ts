/**
 * Типы для системы управления темами
 * Централизованное управление цветовыми схемами и темами
 */
export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    muted?: string;
    destructive?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
}
export interface ServiceTheme {
    id: string;
    name: string;
    description?: string;
    colors: ColorScheme;
    variables?: Record<string, string>;
    animations?: Record<string, string>;
    version?: string;
    author?: string;
}
export interface ThemeChange {
    type: 'theme' | 'color' | 'variable' | 'animation';
    key: string;
    value: string;
    serviceId?: string;
}
export interface GroupedChanges {
    attributes: Record<string, string>;
    variables: Record<string, string>;
    animations: Record<string, string>;
}
export interface ThemeChangeListener {
    (theme: string, changes: ThemeChange[]): void;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface ThemeManagerConfig {
    defaultTheme: string;
    enableBatching: boolean;
    enableValidation: boolean;
    enableServiceThemes: boolean;
    batchDelay: number;
}
export interface ThemeState {
    currentTheme: string;
    serviceThemes: Map<string, ServiceTheme>;
    isProcessing: boolean;
    changeQueue: ThemeChange[];
    listeners: Set<ThemeChangeListener>;
}
export type ThemeType = 'light' | 'dark' | 'service';
export interface ThemeMetadata {
    id: string;
    name: string;
    type: ThemeType;
    isDefault?: boolean;
    isServiceTheme?: boolean;
    serviceId?: string;
    version: string;
    author?: string;
    description?: string;
    preview?: string;
}
//# sourceMappingURL=Theme.d.ts.map