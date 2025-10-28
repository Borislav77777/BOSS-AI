import React from 'react';

interface BossAIIconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const BossAIIcon: React.FC<BossAIIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor'
}) => {
    return (
        <div className={`flex items-center ${className}`}>
            {/* Boss Ai логотип */}
            <div className="relative">
                {/* Основная буква B */}
                <div className="relative flex items-center justify-center w-6 h-6">
                    {/* Буква B с градиентом */}
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill="none"
                        className="absolute"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H4V2z"
                            fill="url(#bossGradient)"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8 6h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8v4h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* OS надпись слева */}
                    <div className="absolute -left-8 top-0 text-xs font-bold boss-os-text text-current">
                        OS
                    </div>

                    {/* S надпись справа */}
                    <div className="absolute -right-6 top-0 text-xs font-bold boss-s-text text-current">
                        S
                    </div>

                    {/* Ai надпись снизу */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-bold boss-ai-text text-current">
                        Ai
                    </div>
                </div>

                {/* Градиент для Boss Ai */}
                <defs>
                    <linearGradient id="bossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                </defs>
            </div>
        </div>
    );
};

export default BossAIIcon;
