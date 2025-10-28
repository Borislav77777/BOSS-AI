import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Agent, Service } from '../types/agents';

interface OrbitalIconProps {
    agent: Agent | Service;
    position: { x: number; y: number };
    size: number;
    onClick?: () => void;
    isSelected?: boolean;
    isExpanded?: boolean;
    showLabel?: boolean;
    isMobile?: boolean;
    level: 1 | 2;
}

export const OrbitalIcon: React.FC<OrbitalIconProps> = ({
    agent,
    position,
    size,
    onClick,
    isSelected = false,
    isExpanded = false,
    showLabel = true,
    isMobile = false,
    level,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsHovered(false);
        }
    };

    const iconScale = isHovered ? 1.1 : 1.0;
    const iconOpacity = isExpanded ? 0.7 : 1.0;

    const labelSize = isMobile ? 'text-xs' : level === 1 ? 'text-sm' : 'text-xs';
    const labelPosition = isMobile ? 'top-16' : level === 1 ? 'top-20' : 'top-16';

    return (
        <motion.div
            className="absolute flex flex-col items-center cursor-pointer orbital-icon z-30 focus:outline-none focus-visible:outline-none"
            style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: iconOpacity, scale: 1 }}
            transition={{ type: 'tween', duration: 0.2, delay: level === 1 ? 0.1 : 0.2 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Иконка (статичная без hover-скейла/свечения) */}
            <motion.div
                className={`
                    relative rounded-full
                    bg-black/50 backdrop-blur-sm overflow-hidden
                    focus:outline-none focus-visible:outline-none
                `}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transformOrigin: '50% 50%'
                }}
                animate={{ scale: isHovered ? 1.03 : 1.0 }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
            >
                <img
                    src={agent.avatarUrl}
                    alt={agent.name}
                    className="w-full h-full rounded-full object-cover"
                    style={{
                        mixBlendMode: 'screen',
                        filter: 'contrast(1.2) brightness(1.1)',
                        objectPosition: 'center center', // Явно центрируем
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                    }}
                />
                <div
                    className="w-full h-full rounded-full items-center justify-center text-white text-4xl hidden bg-cyan-500/20"
                    style={{ display: 'none' }}
                >
                    {agent.icon}
                </div>

                {/* Эффекты отключены */}
            </motion.div>

            {/* Текст ПОД иконкой */}
            {showLabel && (
                <div className="mt-3 text-center pointer-events-none">
                    <div className="text-cyan-400 text-sm font-semibold">
                        {agent.name}
                    </div>
                    {level === 1 && isHovered && !isMobile && (
                        <div className="text-cyan-300 text-xs mt-1 opacity-80">
                            {agent.description}
                        </div>
                    )}
                </div>
            )}

            {/* Индикатор подсервисов (только для агентов уровня 1) */}
            {level === 1 && 'services' in agent && agent.services && agent.services.length > 0 && (
                <motion.div
                    className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full
                               bg-cyan-500 text-black text-xs font-bold
                               flex items-center justify-center
                               border-2 border-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                >
                    {agent.services.length}
                </motion.div>
            )}
        </motion.div>
    );
};
