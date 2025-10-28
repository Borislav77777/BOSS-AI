import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { bossAiAgent, level1Agents } from '../data/agentsData';
import { getRandomSlogan } from '../data/slogans';
import '../styles/saber-effects.css';
import { Agent, ORBITAL_SIZES } from '../types/agents';
import { calculatePosition, debounce, getCurrentBreakpoint, throttle } from '../utils/orbital';
import { OrbitalIcon } from './OrbitalIcon';
import { OrbitalGradient, OrbitalLine } from './OrbitalLine';

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
            {/* SVG для линий */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ width: '100%', height: '100%' }}
            >
                <OrbitalGradient />

                {/* Линии от центра к агентам уровня 1 */}
                {level1Agents.map((agent, index) => (
                    <OrbitalLine
                        key={`line-${index}`}
                        from={{ x: 0, y: 0 }}
                        to={level1Positions[index]}
                        animated={true}
                        delay={0.5 + index * 0.1}
                        duration={1.5}
                    />
                ))}

                {/* Линии к подсервисам */}
                {expandedAgentId && level1Agents.find(a => a.id === expandedAgentId)?.services?.map((service, index) => {
                    const agentIndex = level1Agents.findIndex(a => a.id === expandedAgentId);
                    const agentPosition = level1Positions[agentIndex];
                    const servicePosition = subServicePositions[index];

                    return (
                        <OrbitalLine
                            key={`subline-${index}`}
                            from={agentPosition}
                            to={servicePosition}
                            animated={true}
                            delay={0.2 + index * 0.1}
                            duration={0.8}
                            opacity={0.4}
                        />
                    );
                })}
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

            {/* Центральный логотип BOSS AI */}
            <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                onClick={handleCenterClick}
            >
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
                            mixBlendMode: 'screen',
                            filter: 'contrast(1.2) brightness(1.1)',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Агенты уровня 1 */}
            {level1Agents.map((agent, index) => (
                <OrbitalIcon
                    key={agent.id}
                    agent={agent}
                    position={level1Positions[index]}
                    size={sizes.level1IconSize}
                    onClick={() => debouncedAgentClick(agent)}
                    isSelected={expandedAgentId === agent.id}
                    isExpanded={expandedAgentId === agent.id}
                    showLabel={!isMobile || expandedAgentId === agent.id}
                    isMobile={isMobile}
                    level={1}
                />
            ))}

            {/* Подсервисы для выбранного агента */}
            {expandedAgentId && level1Agents.find(a => a.id === expandedAgentId)?.services?.map((service, index) => (
                <OrbitalIcon
                    key={service.id}
                    agent={service}
                    position={subServicePositions[index]}
                    size={sizes.level2IconSize}
                    onClick={() => handleServiceClick(service.id)}
                    isSelected={false}
                    isExpanded={false}
                    showLabel={!isMobile}
                    isMobile={isMobile}
                    level={2}
                />
            ))}

            {/* Кнопка "Назад" для подсервисов */}
            {expandedAgentId && (
                <motion.button
                    className="absolute top-4 left-4 z-50 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg border border-cyan-500/50 backdrop-blur-sm transition-all duration-200"
                    onClick={handleBackToAgents}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    ← Назад
                </motion.button>
            )}
        </div>
    );
};
