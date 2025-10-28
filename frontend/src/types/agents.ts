// Типы для орбитальной системы навигации BOSS AI

export interface Service {
    id: string;
    name: string;
    description: string;
    icon: string;
    avatarUrl: string;
    chatAvatarUrl: string;
    color: string;
    isActive: boolean;
    isComingSoon?: boolean;
    price?: string; // Цена услуги (например: "50к-2кк", "10к+")
    level: 1 | 2; // Уровень сервиса (1 - основной, 2 - подсервис)
    parentId?: string; // ID родительского агента для подсервисов
}

export interface Agent {
    id: string;
    name: string;
    description: string;
    icon: string;
    avatarUrl: string;
    chatAvatarUrl: string;
    color: string;
    isActive: boolean;
    isComingSoon?: boolean;
    services?: Service[];
    level: 0 | 1 | 2; // 0 = центр, 1 = первый круг, 2 = второй круг
    parentId?: string; // ID родительского агента для уровня 2
}

export interface OrbitalNavigationState {
    currentLevel: 0 | 1 | 2;
    selectedAgentId: string | null;
    selectedServiceId: string | null;
    expandedAgentId: string | null; // ID агента, чьи сервисы раскрыты
    isAnimating: boolean;
}

export interface NavigationAction {
    type: 'SELECT_AGENT' | 'SELECT_SERVICE' | 'EXPAND_AGENT' | 'COLLAPSE_AGENT' | 'RESET_NAVIGATION' | 'SET_ANIMATING';
    payload?: {
        agentId?: string;
        serviceId?: string;
        isAnimating?: boolean;
    };
}

// Цвета для категорий агентов
export const AGENT_COLORS = {
    SALES: 'bg-blue-500',
    CONTENT: 'bg-green-500',
    BUSINESS: 'bg-purple-500',
    OZON: 'bg-orange-500',
    SPECIALIZED: 'bg-red-500',
    CONFIGURATOR: 'bg-cyan-500',
    ANALYTICS: 'bg-yellow-500',
    CUSTOM: 'bg-gray-500',
} as const;

// Размеры для 3-уровневой орбитальной навигации BOSS AI v2.0
export const ORBITAL_SIZES = {
    CENTER: {
        mobile: 120,    // 0-767px
        tablet: 150,    // 768-1023px
        desktop: 180,   // 1024-1439px
        wide: 200,      // 1440px+
    },
    LEVEL_1: {
        radius: {
            mobile: 140,
            tablet: 200,
            desktop: 280,
            wide: 320
        },
        iconSize: {
            mobile: 84,
            tablet: 100,
            desktop: 118,
            wide: 128
        },
    },
    LEVEL_2: {
        radius: {
            mobile: 90,
            tablet: 120,
            desktop: 150,
            wide: 170
        },
        iconSize: {
            mobile: 60,
            tablet: 72,
            desktop: 82,
            wide: 90
        },
    },
} as const;

// Breakpoints для адаптивности
export const BREAKPOINTS = {
    mobile: 0,      // 0-767px
    tablet: 768,    // 768-1023px
    desktop: 1024,  // 1024-1439px
    wide: 1440,     // 1440px+
} as const;
