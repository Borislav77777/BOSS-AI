import React from 'react';

interface SimpleHeaderProps {
    onOpenZombieConfig: () => void;
    onLogout?: () => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ onOpenZombieConfig, onLogout }) => {
    return (
        <header className="h-24 md:h-32 lg:h-36 bg-black border-b-2 border-cyan-500/30 flex items-center justify-between px-3 md:px-6">
            {/* Логотип BOSS AI в центре */}
            <div className="flex-1 flex justify-center">
                <img
                    src="/images/logo.png"
                    alt="BOSS AI"
                    className="h-8 md:h-10 lg:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                />
            </div>

            {/* Правая часть - кнопки и баланс */}
            <div className="flex items-center space-x-2 md:space-x-4">
                {/* Кнопка генератора полосок удалена */}

                {/* Кнопка 3D Конфигуратор */}
                <button
                    onClick={onOpenZombieConfig}
                    className="flex items-center space-x-2 px-2 py-1.5 md:px-4 md:py-2 bg-cyan-500/20 backdrop-blur-md border-2 border-cyan-500/50 text-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all hover:scale-105"
                    title="Открыть 3D Конфигуратор"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden md:inline text-sm font-semibold">3D Конфигуратор</span>
                </button>

                {/* Баланс токенов */}
                <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-full px-2 py-1 md:px-4 md:py-2 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                    <div className="flex items-center space-x-1 md:space-x-2">
                        <span className="text-xs text-cyan-400/70 font-mono">BT</span>
                        <span className="text-xs md:text-sm font-bold text-cyan-400 font-mono">1,000</span>
                    </div>
                </div>

                {/* Кнопка выхода/демо */}
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-2 py-1.5 md:px-4 md:py-2 bg-red-500/20 backdrop-blur-md border-2 border-red-500/50 text-red-400 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] transition-all hover:scale-105"
                        title="Выход"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden md:inline text-sm font-semibold">Выход</span>
                    </button>
                )}
            </div>
        </header>
    );
};
