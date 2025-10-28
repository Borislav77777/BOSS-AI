/**
 * Типы и интерфейсы для модульной архитектуры диаграммы
 */
export interface DiagramModule {
    id: string;
    name: string;
    description: string;
    mermaidCode: string;
    dependencies: string[];
    position: {
        x: number;
        y: number;
    };
    isVisible: boolean;
    isExpanded: boolean;
}
export interface DiagramNode {
    id: string;
    label: string;
    type: 'user' | 'service' | 'database' | 'cache' | 'monitoring' | 'processing';
    status: 'implemented' | 'missing' | 'raptor' | 'gpt5' | 'graph' | 'hyde' | 'monitoring' | 'database';
    position: {
        x: number;
        y: number;
    };
    connections: string[];
}
export interface DiagramConnection {
    from: string;
    to: string;
    label?: string;
    type: 'data' | 'control' | 'cache' | 'monitoring';
}
export interface DiagramState {
    zoom: number;
    isFullscreen: boolean;
    activeModule: string | null;
    visibleModules: string[];
    error: string | null;
    isLoading: boolean;
}
export interface DiagramControls {
    zoom: number;
    isFullscreen: boolean;
    showLegend: boolean;
    showMinimap: boolean;
    autoLayout: boolean;
}
export interface MermaidConfig {
    theme: 'default' | 'dark' | 'forest' | 'neutral';
    flowchart: {
        useMaxWidth: boolean;
        htmlLabels: boolean;
        curve: 'basis' | 'linear' | 'cardinal' | 'monotoneX' | 'monotoneY' | 'natural';
    };
    themeVariables: {
        primaryColor: string;
        primaryTextColor: string;
        primaryBorderColor: string;
        lineColor: string;
        secondaryColor: string;
        tertiaryColor: string;
    };
}
export interface DiagramError {
    type: 'render' | 'load' | 'validation' | 'network';
    message: string;
    details?: string;
    timestamp: number;
}
export interface DiagramPerformance {
    renderTime: number;
    loadTime: number;
    memoryUsage: number;
    nodeCount: number;
    connectionCount: number;
}
//# sourceMappingURL=types.d.ts.map