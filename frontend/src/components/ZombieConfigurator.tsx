import React, { useEffect, useRef, useState } from 'react';

interface ZombieConfiguratorProps {
    isOpen: boolean;
    onClose: () => void;
}

declare global {
    interface Window {
        BOSS_AI_CONFIG: any;
        BossAIScene: any;
        BossAIAnimations: any;
        BossAIParticles: any;
        ZOMBIE_3D: any;
    }
}

export const ZombieConfigurator: React.FC<ZombieConfiguratorProps> = ({ isOpen, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Загружаем Babylon.js и скрипты только при открытии
        const loadScripts = async () => {
            try {
                // Загружаем Babylon.js
                if (!window.BABYLON) {
                    await loadScript('https://cdn.babylonjs.com/babylon.js');
                    await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
                }

                // Загружаем конфигурацию
                if (!window.BOSS_AI_CONFIG) {
                    await loadScript('/zombie-config/js/config.js');
                }

                // Загружаем модули только если они еще не загружены
                if (!window.BossAIScene) {
                    await loadScript('/zombie-config/js/scene.js');
                }
                if (!window.BossAIAnimations) {
                    await loadScript('/zombie-config/js/animations.js');
                }
                if (!window.BossAIParticles) {
                    await loadScript('/zombie-config/js/particles.js');
                }

                console.log('[ZombieConfigurator] Скрипты загружены успешно', {
                    BABYLON: !!window.BABYLON,
                    BOSS_AI_CONFIG: !!window.BOSS_AI_CONFIG,
                    BossAIScene: typeof window.BossAIScene
                });
                setIsLoaded(true);
            } catch (err) {
                console.error('Ошибка загрузки скриптов:', err);
                setError('Ошибка загрузки 3D конфигуратора');
            }
        };

        loadScripts();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isLoaded || !canvasRef.current) return;

        let bossAIScene: any = null;
        let bossAIAnimations: any = null;
        let bossAIParticles: any = null;

        // Ждем небольшую задержку для завершения загрузки скриптов
        const initTimer = setTimeout(() => {
            try {
                // Проверяем что все конструкторы доступны
                if (typeof window.BossAIScene !== 'function') {
                    console.error('[ZombieConfigurator] BossAIScene не доступен', {
                        BABYLON: !!window.BABYLON,
                        BOSS_AI_CONFIG: !!window.BOSS_AI_CONFIG,
                        BossAIScene: typeof window.BossAIScene,
                        BossAIAnimations: typeof window.BossAIAnimations,
                        BossAIParticles: typeof window.BossAIParticles
                    });
                    setError('Ошибка загрузки 3D сцены');
                    return;
                }

                // Создание сцены
                bossAIScene = new window.BossAIScene('zombie-canvas');

                // Ожидание загрузки модели
                const handleModelLoaded = (event: any) => {
                    const logoMesh = event.detail.mesh;
                    console.log('✓ Zombie model loaded, starting animations and particles');

                    // Инициализация анимаций
                    bossAIAnimations = new window.BossAIAnimations(
                        bossAIScene.getScene(),
                        logoMesh
                    );

                    // Инициализация частиц
                    bossAIParticles = new window.BossAIParticles(
                        bossAIScene.getScene(),
                        logoMesh
                    );

                    console.log('✓ Zombie 3D Model fully initialized');
                };

                window.addEventListener('bossai:modelLoaded', handleModelLoaded);

                // Экспорт для консоли
                window.ZOMBIE_3D = {
                    scene: () => bossAIScene,
                    animations: () => bossAIAnimations,
                    particles: () => bossAIParticles,
                    config: window.BOSS_AI_CONFIG
                };

            } catch (err) {
                console.error('Ошибка инициализации 3D сцены:', err);
                setError('Ошибка инициализации 3D сцены');
            }
        }, 500); // Задержка 500ms для надежной загрузки скриптов

        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('bossai:modelLoaded', () => { });
            if (bossAIScene && typeof bossAIScene.dispose === 'function') {
                bossAIScene.dispose();
            }
        };
    }, [isOpen, isLoaded]);

    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже этот скрипт
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-2 left-2 md:top-4 md:left-4 z-40 w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
            {/* Canvas Container - без рамки, в углу слева */}
            <div className="relative w-full h-full bg-transparent rounded-lg overflow-hidden">
                {error ? (
                    <div className="flex items-center justify-center h-full text-red-400">
                        <div className="text-center">
                            <div className="text-2xl mb-2">❌</div>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : !isLoaded ? (
                    <div className="flex items-center justify-center h-full text-cyan-400">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm">Загрузка...</p>
                        </div>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        id="zombie-canvas"
                        className="w-full h-full"
                    />
                )}
            </div>
        </div>
    );
};
