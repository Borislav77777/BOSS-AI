import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { bossAiAgent, level1Agents } from '../data/agentsData';
import '../styles/saber-effects.css';
import { Agent, ORBITAL_SIZES } from '../types/agents';
import { calculatePosition, calculateSubServicePositions, debounce, getCurrentBreakpoint, throttle } from '../utils/orbital';
import { OrbitalIcon } from './OrbitalIcon';
import { OrbitalGradient, OrbitalLine } from './OrbitalLine';


interface AgentSelectionProps {
    agents: Agent[];
    onSelectAgent: (agentId: string) => void;
}

export const AgentSelection: React.FC<AgentSelectionProps> = ({ agents, onSelectAgent }) => {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
    const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

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

    // Вычисление позиций подсервисов для выбранного агента (внешний радиус)
    const subServicePositions = useMemo(() => {
        if (!expandedAgentId) return [];

        const agent = level1Agents.find(a => a.id === expandedAgentId);
        if (!agent?.services) return [];

        const agentIndex = level1Agents.findIndex(a => a.id === expandedAgentId);
        const agentPosition = level1Positions[agentIndex];

        return calculateSubServicePositions(
            agentIndex,
            agentPosition,
            agent.services.length,
            sizes.level1Radius
        );
    }, [expandedAgentId, level1Positions, sizes.level1Radius]);

    // Стабилизированные обработчики кликов
    const handleCenterClick = useCallback(() => {
        setExpandedAgentId(null);
    }, []);

    const handleAgentClick = useCallback((agent: Agent) => {
        if (isAnimating) return; // Блокируем во время анимации

        setIsAnimating(true);

        if (expandedAgentId === agent.id) {
            // Закрываем текущий агент
            setExpandedAgentId(null);
        } else {
            // Открываем новый агент
            if (expandedAgentId) {
                // Сначала закрываем предыдущий
                setExpandedAgentId(null);
                setTimeout(() => {
                    setExpandedAgentId(agent.id);
                }, 300); // Ждем завершения анимации закрытия
            } else {
                setExpandedAgentId(agent.id);
            }
        }

        setTimeout(() => setIsAnimating(false), 600);
    }, [expandedAgentId, isAnimating, onSelectAgent]);

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
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden app-center">
            {/* SVG для линий */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-5"
                style={{ width: '100%', height: '100%' }}
            >
                <OrbitalGradient />

                {/* Линии от центра к агентам уровня 1 - ВСЕГДА видны */}
                {level1Agents.map((agent, index) => (
                    <OrbitalLine
                        key={`line-level1-${index}`}
                        from={{ x: 0, y: 0 }}
                        to={level1Positions[index]}
                        animated={true}
                        delay={0.3 + index * 0.05}
                        duration={1.0}
                        opacity={0.08}
                        strokeWidth={1}
                    />
                ))}

                {/* Линии от агента к подсервисам - только при раскрытии */}
                {expandedAgentId && subServicePositions.map((pos, index) => {
                    const agentIndex = level1Agents.findIndex(a => a.id === expandedAgentId);
                    const agentPos = level1Positions[agentIndex];

                    return (
                        <OrbitalLine
                            key={`line-level2-${index}`}
                            from={agentPos}
                            to={pos}
                            animated={true}
                            delay={0.1 + index * 0.05}
                            duration={0.6}
                            opacity={0.3}
                            strokeWidth={1}
                        />
                    );
                })}
            </svg>


            {/* Центральный логотип BOSS AI */}
            <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
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
                    showLabel={true}
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
