import { Agent, Service } from '../types/agents';

// Фирменные цвета BOSS AI
const BOSS_AI_CYAN = '#00FFFF';
const BOSS_AI_WHITE = '#FFFFFF';
const BOSS_AI_BLACK = '#000000';

// Универсальная иконка для всех агентов
const UNIVERSAL_AVATAR = '/images/agents/universal-agent.png';

// Центральный агент BOSS AI
export const bossAiAgent: Agent = {
    id: 'boss-ai',
    name: 'BOSS AI',
    description: 'Главная платформа-агрегатор и конструктор AI-агентов',
    icon: '👑',
    avatarUrl: '/images/BOSS_AI_AVA.jpg',
    chatAvatarUrl: '/images/BOSS_AI_AVA.jpg',
    color: `bg-gradient-to-r from-cyan-400 to-cyan-600`,
    isActive: true,
    level: 0,
};

// Подсервисы для Developer (уровень 2)
const studioServices: Service[] = [
    {
        id: '3d-config',
        name: '3D Конфигураторы',
        description: 'Интерактивные 3D конфигураторы товаров',
        icon: '🎮',
        avatarUrl: '/images/3d.png',
        chatAvatarUrl: '/images/3d.png',
        color: 'bg-cyan-500',
        isActive: true,
        price: '50к-2кк',
        level: 2,
        parentId: 'developer',
    },
    {
        id: 'applications',
        name: 'Приложения',
        description: 'Мобильные и веб-приложения',
        icon: '📱',
        avatarUrl: '/images/app.png',
        chatAvatarUrl: '/images/app.png',
        color: 'bg-cyan-500',
        isActive: true,
        price: '100к+',
        level: 2,
        parentId: 'developer',
    },
    {
        id: 'calculators',
        name: 'Калькуляторы',
        description: 'Интерактивные калькуляторы стоимости',
        icon: '🧮',
        avatarUrl: '/images/CALC.png',
        chatAvatarUrl: '/images/CALC.png',
        color: 'bg-cyan-500',
        isActive: true,
        price: '10к+',
        level: 2,
        parentId: 'developer',
    },
    {
        id: 'landings',
        name: 'Лендинги',
        description: 'Продающие лендинги под ключ',
        icon: '🌐',
        avatarUrl: '/images/lend.png',
        chatAvatarUrl: '/images/lend.png',
        color: 'bg-cyan-500',
        isActive: true,
        price: '20к-200к',
        level: 2,
        parentId: 'developer',
    },
    {
        id: 'telegram-bots',
        name: 'Telegram Боты',
        description: 'Умные боты для автоматизации',
        icon: '🤖',
        avatarUrl: '/images/tg.png',
        chatAvatarUrl: '/images/tg.png',
        color: 'bg-cyan-500',
        isActive: true,
        price: '20к-2кк',
        level: 2,
        parentId: 'developer',
    },
];

// 7 основных агентов уровня 1 (BOSS AI v2.0)
export const level1Agents: Agent[] = [
    {
        id: 'lawyer',
        name: 'Юрист',
        description: 'Правовая помощь и консультации',
        icon: '⚖️',
        avatarUrl: '/images/ur.png',
        chatAvatarUrl: '/images/ur.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Telegram боты и автоматизация',
        icon: '📱',
        avatarUrl: '/images/tg.png',
        chatAvatarUrl: '/images/tg.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
    {
        id: 'mailing',
        name: 'Рассылка',
        description: 'Email и SMS рассылки',
        icon: '📧',
        avatarUrl: '/images/ra.png',
        chatAvatarUrl: '/images/ra.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
    {
        id: 'ozon',
        name: 'Ozon Manager',
        description: 'Управление продажами на Ozon',
        icon: '📦',
        avatarUrl: '/images/ozon.png',
        chatAvatarUrl: '/images/ozon.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
    {
        id: 'katya',
        name: 'Katya AI',
        description: 'AI-ассистент для команды',
        icon: '🤖',
        avatarUrl: '/images/katya.png',
        chatAvatarUrl: '/images/katya.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
    {
        id: 'developer',
        name: 'Developer',
        description: 'Кастомная разработка и интеграции',
        icon: '💻',
        avatarUrl: '/images/dev.png',
        chatAvatarUrl: '/images/dev.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
        services: studioServices,
    },
    {
        id: 'fz',
        name: 'Законодательство',
        description: 'Соблюдение ФЗ и правовых норм',
        icon: '⚖️',
        avatarUrl: '/images/fz.png',
        chatAvatarUrl: '/images/fz.png',
        color: 'bg-cyan-500',
        isActive: true,
        level: 1,
    },
];

// Все агенты для совместимости с существующим кодом
export const allAgents: Agent[] = [bossAiAgent, ...level1Agents];

// Функция для получения агента по ID
export const getAgentById = (id: string): Agent | undefined => {
    return allAgents.find(agent => agent.id === id);
};

// Функция для получения подсервисов агента
export const getServicesByAgentId = (agentId: string): Service[] => {
    const agent = getAgentById(agentId);
    return agent?.services || [];
};

// Функция для получения всех подсервисов
export const getAllServices = (): Service[] => {
    return level1Agents.flatMap(agent => agent.services || []);
};

// Функция для получения подсервиса по ID
export const getServiceById = (serviceId: string): Service | undefined => {
    return getAllServices().find(service => service.id === serviceId);
};

// Экспорт подсервисов для использования в компонентах
export { studioServices };
