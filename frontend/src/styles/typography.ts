// Система типографики BOSS AI v2.0 - мирового класса

export const TYPOGRAPHY = {
    // Заголовки
    h1: {
        size: '48px',
        weight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        textShadow: '0 4px 8px rgba(0,0,0,0.3)'
    },
    h2: {
        size: '36px',
        weight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        textShadow: '0 3px 6px rgba(0,0,0,0.3)'
    },
    h3: {
        size: '24px',
        weight: 600,
        lineHeight: 1.4,
        letterSpacing: '0',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },

    // Названия агентов
    agentTitle: {
        size: '16px',
        weight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,255,255,0.3)'
    },

    // Описания агентов
    agentDescription: {
        size: '13px',
        weight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.005em',
        opacity: 0.9,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
    },

    // Метки подсервисов
    serviceLabel: {
        size: '14px',
        weight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
        textShadow: '0 1px 3px rgba(0,0,0,0.4)'
    },

    // Слоганы
    slogan: {
        size: '18px',
        weight: 700,
        lineHeight: 1.4,
        letterSpacing: '0.02em',
        fontStyle: 'italic',
        textShadow: '0 2px 6px rgba(0,255,255,0.4)'
    },

    // Часы обратного отсчета
    countdown: {
        size: '32px',
        weight: 700,
        lineHeight: 1.1,
        letterSpacing: '0.05em',
        fontFamily: 'monospace',
        textShadow: '0 3px 8px rgba(0,255,255,0.5)'
    }
} as const;

// Адаптивная типографика с clamp
export const RESPONSIVE_TYPOGRAPHY = {
    agentTitle: {
        mobile: '14px',
        tablet: '15px',
        desktop: '16px',
        wide: '18px'
    },
    agentDescription: {
        mobile: '11px',
        tablet: '12px',
        desktop: '13px',
        wide: '14px'
    },
    serviceLabel: {
        mobile: '12px',
        tablet: '13px',
        desktop: '14px',
        wide: '15px'
    },
    slogan: {
        mobile: '14px',
        tablet: '16px',
        desktop: '18px',
        wide: '20px'
    },
    countdown: {
        mobile: '24px',
        tablet: '28px',
        desktop: '32px',
        wide: '36px'
    }
} as const;

// CSS классы для типографики
export const TYPOGRAPHY_CLASSES = {
    agentTitle: 'agent-title',
    agentDescription: 'agent-description',
    serviceLabel: 'service-label',
    slogan: 'slogan-text',
    countdown: 'countdown-text'
} as const;

// Функция для получения адаптивного размера
export const getResponsiveSize = (
    breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide',
    type: keyof typeof RESPONSIVE_TYPOGRAPHY
): string => {
    return RESPONSIVE_TYPOGRAPHY[type][breakpoint];
};

// Функция для создания fluid typography
export const createFluidTypography = (
    minSize: string,
    maxSize: string,
    minWidth: string = '320px',
    maxWidth: string = '1920px'
): string => {
    return `clamp(${minSize}, calc(${minSize} + (${parseInt(maxSize)} - ${parseInt(minSize)}) * ((100vw - ${minWidth}) / (${parseInt(maxWidth)} - ${parseInt(minWidth)}))), ${maxSize})`;
};
