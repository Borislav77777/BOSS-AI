import { motion } from 'framer-motion';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { bossAiAgent, getServicesByAgentId, level1Agents } from '../data/agentsData';
import { getRandomSlogan } from '../data/slogans';
import '../styles/saber-effects.css';
import { Agent, ORBITAL_SIZES, BREAKPOINTS } from '../types/agents';
import { calculatePosition, getCurrentBreakpoint, throttle, debounce } from '../utils/orbital';
import { OrbitalIcon } from './OrbitalIcon';
import { OrbitalLine, OrbitalGradient } from './OrbitalLine';

// Интерфейс для обратного отсчета
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface AgentSelectionProps {
    agents: Agent[];
    onSelectAgent: (agentId: string) => void;
}

export const AgentSelection: React.FC<AgentSelectionProps> = ({ agents, onSelectAgent }) => {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
    const [currentSlogan, setCurrentSlogan] = useState<string>(getRandomSlogan());
    const [showCountdown, setShowCountdown] = useState<boolean>(true);

    // Определяем текущий breakpoint
    const currentBreakpoint = useMemo(() => getCurrentBreakpoint(windowWidth), [windowWidth]);
    const isMobile = currentBreakpoint === 'mobile';
    const isTablet = currentBreakpoint === 'tablet';

    // Throttled resize handler для оптимизации производительности
    const handleResize = useCallback(
        throttle(() => {
            setWindowWidth(window.innerWidth);
        }, 100),
        []
    );

    // Адаптивные размеры
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Обратный отсчет до 01.01.2025
    useEffect(() => {
        const targetDate = new Date('2025-01-01T00:00:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Чередование часов и слоганов каждые 10 секунд
    useEffect(() => {
        const alternationInterval = setInterval(() => {
            setShowCountdown(prev => !prev);
            if (!showCountdown) {
                setCurrentSlogan(getRandomSlogan());
            }
        }, 10000);

        return () => clearInterval(alternationInterval);
    }, [showCountdown]);

    // Получение размеров для текущего breakpoint
    const sizes = useMemo(() => ({
        centerSize: ORBITAL_SIZES.CENTER[currentBreakpoint],
        level1Radius: ORBITAL_SIZES.LEVEL_1.radius[currentBreakpoint],
        level1IconSize: ORBITAL_SIZES.LEVEL_1.iconSize[currentBreakpoint],
        level2Radius: ORBITAL_SIZES.LEVEL_2.radius[currentBreakpoint],
        level2IconSize: ORBITAL_SIZES.LEVEL_2.iconSize[currentBreakpoint],
    }), [currentBreakpoint]);

    // Вычисление позиций агентов уровня 1
    const level1Positions = useMemo(() => {
        return level1Agents.map((_, index) => 
            calculatePosition(index, level1Agents.length, sizes.level1Radius, -90)
        );
    }, [sizes.level1Radius]);

    // Вычисление позиций подсервисов для выбранного агента
    const subServicePositions = useMemo(() => {
        if (!expandedAgentId) return [];
        
        const agent = level1Agents.find(a => a.id === expandedAgentId);
        if (!agent?.services) return [];

        const agentIndex = level1Agents.findIndex(a => a.id === expandedAgentId);
        const agentPosition = level1Positions[agentIndex];
        
        return agent.services.map((_, index) => {
            const angle = (-45 + (90 / (agent.services!.length - 1)) * index) * (Math.PI / 180);
            return {
                x: agentPosition.x + Math.cos(angle) * sizes.level2Radius,
                y: agentPosition.y + Math.sin(angle) * sizes.level2Radius,
            };
        });
    }, [expandedAgentId, level1Positions, sizes.level2Radius]);

    // Стабилизированные обработчики кликов
    const handleCenterClick = useCallback(() => {
        setExpandedAgentId(null);
    }, []);

    const handleAgentClick = useCallback((agent: Agent) => {
        if (agent.services && agent.services.length > 0) {
            setExpandedAgentId(agent.id);
        } else {
            onSelectAgent(agent.id);
        }
    }, [onSelectAgent]);

    const handleServiceClick = useCallback((serviceId: string) => {
        onSelectAgent(serviceId);
    }, [onSelectAgent]);

    const handleBackToAgents = useCallback(() => {
        setExpandedAgentId(null);
    }, []);

    // Debounced обработчик для предотвращения спама
    const debouncedAgentClick = useMemo(
        () => debounce(handleAgentClick, 100),
        [handleAgentClick]
    );

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {/* Соединительные линии (SVG) с анимированными градиентами */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ width: '100%', height: '100%' }}
            >
                {/* Линии от центра к агентам */}
                {level1Agents.map((agent, index) => {
                    const angle = (360 / level1Agents.length) * index;
                    const x = Math.cos(angle * Math.PI / 180) * sizes.level1Radius;
                    const y = Math.sin(angle * Math.PI / 180) * sizes.level1Radius;

                    return (
                        <motion.line
                            key={`line-${index}`}
                            x1="50%"
                            y1="50%"
                            x2={`calc(50% + ${x}px)`}
                            y2={`calc(50% + ${y}px)`}
                            stroke="url(#animatedCyanGradient)"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 1.5,
                                delay: 0.5 + index * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    );
                })}

                {/* Анимированный градиент для линий */}
                <defs>
                    <linearGradient id="animatedCyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00FFFF">
                            <animate
                                attributeName="stop-opacity"
                                values="0.2;0.8;0.2"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop offset="50%" stopColor="#00FFFF">
                            <animate
                                attributeName="stop-opacity"
                                values="0.8;0.2;0.8"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop offset="100%" stopColor="#00FFFF">
                            <animate
                                attributeName="stop-opacity"
                                values="0.2;0.8;0.2"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </stop>
                    </linearGradient>
                </defs>
            </svg>

            {/* Чередование часов и слоганов */}
            <motion.div
                className="absolute z-60 top-8 left-1/2 transform -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.8 }}
            >
                {showCountdown ? (
                    <motion.div
                        key="countdown"
                        className="fade-in-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-cyan-400 font-mono text-2xl md:text-3xl font-bold text-center glow-text">
                            {String(timeLeft.days).padStart(2, '0')}:
                            {String(timeLeft.hours).padStart(2, '0')}:
                            {String(timeLeft.minutes).padStart(2, '0')}:
                            {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="slogan"
                        className="fade-in-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-cyan-300 font-mono text-sm md:text-base text-center opacity-90 typewriter glow-text font-bold italic">
                            {currentSlogan}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Центральный логотип BOSS AI (без текста) */}
            <motion.div
                className="absolute z-50 flex flex-col items-center justify-center cursor-pointer group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2
                }}
                style={{
                    width: `${sizes.centerSize}px`,
                    height: `${sizes.centerSize}px`,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onClick={handleCenterClick}
            >
                {/* Логотип с Saber-эффектом */}
                <motion.div
                    className="relative rounded-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)] bg-black/50 backdrop-blur-sm group-hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 saber-glow-cyan center-pulse"
                    style={{
                        width: `${sizes.centerSize}px`,
                        height: `${sizes.centerSize}px`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img
                        src={bossAiAgent.avatarUrl}
                        alt={bossAiAgent.name}
                        className="w-full h-full rounded-full object-cover"
                        style={{
                            mixBlendMode: 'screen', // Убирает черный фон
                            filter: 'contrast(1.2) brightness(1.1)', // Улучшает контраст
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Агенты с эффектом парения */}
            {level1Agents.map((agent, index) => {
                const angle = (360 / level1Agents.length) * index;
                const x = Math.cos(angle * Math.PI / 180) * sizes.level1Radius;
                const y = Math.sin(angle * Math.PI / 180) * sizes.level1Radius;
                const isExpanded = expandedAgentId === agent.id;
                const scale = isExpanded ? 1.2 : 1;

                return (
                    <motion.div
                        key={agent.id}
                        className="absolute z-40 flex flex-col items-center cursor-pointer group"
                        style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)',
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: scale,
                            y: [-5, 5, -5] // Эффект парения
                        }}
                        transition={{
                            delay: 1.5 + index * 0.15,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            y: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 0.2
                            }
                        }}
                        onClick={() => handleAgentClick(agent)}
                    >
                        {/* Название агента наверху */}
                        <motion.p
                            className="text-cyan-300 font-mono text-sm md:text-base font-semibold mb-2 text-center max-w-[120px] group-hover:text-cyan-200 transition-colors duration-300"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.8 + index * 0.15 }}
                        >
                            {agent.name}
                        </motion.p>

                        {/* Иконка агента с Saber-эффектом и парением */}
                        <motion.div
                            className="relative"
                            style={{
                                width: `${sizes.level1IconSize}px`,
                                height: `${sizes.level1IconSize}px`,
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Основная иконка с Saber-эффектом */}
                            <div className="relative rounded-full border-2 border-cyan-500 shadow-[0_10px_30px_rgba(0,255,255,0.3)] bg-black/50 backdrop-blur-sm overflow-hidden saber-glow-cyan saber-hover">
                                <img
                                    src={agent.avatarUrl}
                                    alt={agent.name}
                                    className="w-full h-full rounded-full object-cover"
                                    style={{
                                        mixBlendMode: 'screen', // Убирает черный фон
                                        filter: 'contrast(1.2) brightness(1.1)', // Улучшает контраст
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                {/* Fallback иконка */}
                                <div
                                    className="w-full h-full rounded-full items-center justify-center text-white text-4xl hidden bg-cyan-500/20"
                                    style={{ display: 'none' }}
                                >
                                    {agent.icon}
                                </div>
                            </div>

                            {/* Динамическая тень под иконкой */}
                            <div className="levitation-shadow" />
                        </motion.div>
                    </motion.div>
                );
            })}


            {/* Подсервисы (второй уровень) */}
            {expandedAgentId && (() => {
                const services = getServicesByAgentId(expandedAgentId);
                const agent = level1Agents.find(a => a.id === expandedAgentId);
                if (!agent || !services.length) return null;

                const agentAngle = (360 / level1Agents.length) * level1Agents.findIndex(a => a.id === expandedAgentId);
                const agentX = Math.cos(agentAngle * Math.PI / 180) * sizes.level1Radius;
                const agentY = Math.sin(agentAngle * Math.PI / 180) * sizes.level1Radius;
                const serviceRadius = 200; // Радиус для подсервисов

                return (
                    <>
                        {/* Линии к подсервисам */}
                        {services.map((service, index) => {
                            const serviceAngle = (360 / services.length) * index;
                            const serviceX = agentX + Math.cos(serviceAngle * Math.PI / 180) * serviceRadius;
                            const serviceY = agentY + Math.sin(serviceAngle * Math.PI / 180) * serviceRadius;

                            return (
                                <motion.line
                                    key={`service-line-${service.id}`}
                                    x1={`calc(50% + ${agentX}px)`}
                                    y1={`calc(50% + ${agentY}px)`}
                                    x2={`calc(50% + ${serviceX}px)`}
                                    y2={`calc(50% + ${serviceY}px)`}
                                    stroke="url(#animatedCyanGradient)"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.6 }}
                                    transition={{
                                        duration: 1,
                                        delay: 0.5 + index * 0.1,
                                        ease: "easeInOut"
                                    }}
                                />
                            );
                        })}

                        {/* Иконки подсервисов с Saber-эффектом */}
                        {services.map((service, index) => {
                            const serviceAngle = (360 / services.length) * index;
                            const serviceX = agentX + Math.cos(serviceAngle * Math.PI / 180) * sizes.level2Radius;
                            const serviceY = agentY + Math.sin(serviceAngle * Math.PI / 180) * sizes.level2Radius;

                            return (
                                <motion.div
                                    key={service.id}
                                    className="absolute z-30 flex flex-col items-center cursor-pointer group"
                                    style={{
                                        left: `calc(50% + ${serviceX}px)`,
                                        top: `calc(50% + ${serviceY}px)`,
                                        transform: 'translate(-50%, -50%)',
                                        outline: 'none',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: 0.8 + index * 0.1,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                    onClick={() => handleServiceClick(service.id)}
                                >
                                    {/* Название подсервиса */}
                                    <motion.p
                                        className="text-cyan-200 font-mono text-xs font-semibold mb-1 text-center max-w-[100px] group-hover:text-cyan-100 transition-colors duration-300"
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1 + index * 0.1 }}
                                    >
                                        {service.name}
                                    </motion.p>

                                    {/* Иконка подсервиса с Saber-эффектом */}
                                    <motion.div
                                        className="relative rounded-full border border-cyan-400 shadow-[0_5px_15px_rgba(0,255,255,0.3)] bg-black/30 backdrop-blur-sm saber-glow-cyan saber-hover"
                                        style={{
                                            width: `${sizes.level2IconSize}px`,
                                            height: `${sizes.level2IconSize}px`,
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <img
                                            src={service.avatarUrl}
                                            alt={service.name}
                                            className="w-full h-full rounded-full object-cover"
                                            style={{
                                                mixBlendMode: 'screen', // Убирает черный фон
                                                filter: 'contrast(1.2) brightness(1.1)', // Улучшает контраст
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback иконка */}
                                        <div
                                            className="w-full h-full rounded-full items-center justify-center text-cyan-400 text-2xl hidden"
                                            style={{ display: 'none' }}
                                        >
                                            {service.icon}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}

                        {/* Кнопка "Назад" */}
                        <motion.button
                            className="absolute z-50 top-4 right-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={handleBackToAgents}
                        >
                            ← Назад
                        </motion.button>
                    </>
                );
            })()}
        </div>
    );
};
