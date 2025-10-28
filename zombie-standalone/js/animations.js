/**
 * BOSS AI Animations
 * Управление всеми анимациями 3D сцены
 */

class BossAIAnimations {
    constructor(scene, logoMesh) {
        this.scene = scene;
        this.logoMesh = logoMesh;
        this.energyRings = null; // Будет установлено извне
        this.animations = {};
    }

    /**
     * Инициализация всех анимаций
     */
    init() {
        console.log('🚀 Initializing animations...');

        this.startRotationAnimation();
        this.startPulseAnimation();
        this.startWaveAnimation();
        this.startFadeInAnimation();
        this.startScaleAnimation();

        console.log('✓ Animations initialized');
    }

    /**
     * Анимация вращения
     */
    startRotationAnimation() {
        if (!BOSS_AI_CONFIG.animations.rotation.enabled) return;

        const config = BOSS_AI_CONFIG.animations.rotation;

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.logoMesh) {
                switch(config.axis) {
                    case 'x':
                        this.logoMesh.rotation.x += config.speed;
                        break;
                    case 'y':
                        this.logoMesh.rotation.y += config.speed;
                        break;
                    case 'z':
                        this.logoMesh.rotation.z += config.speed;
                        break;
                }
            }
        });

        console.log('✓ Rotation animation started');
    }

    /**
     * Анимация пульсации (эффект "дыхания")
     */
    startPulseAnimation() {
        if (!BOSS_AI_CONFIG.animations.pulse.enabled) return;

        const config = BOSS_AI_CONFIG.animations.pulse;
        const startTime = Date.now();

        this.animations.pulse = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % config.duration) / config.duration;

            // Синусоидальная пульсация
            const intensity = config.minIntensity +
                (config.maxIntensity - config.minIntensity) *
                (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);

            // Применяем к материалам
            this.logoMesh.getChildMeshes().forEach(mesh => {
                if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
                    mesh.material.emissiveIntensity = intensity;
                }
            });
        };

        this.scene.registerBeforeRender(this.animations.pulse);
        console.log('✓ Pulse animation started');
    }

    /**
     * Волновой эффект
     */
    startWaveAnimation() {
        if (!BOSS_AI_CONFIG.animations.wave.enabled) return;

        const config = BOSS_AI_CONFIG.animations.wave;
        const startTime = Date.now();

        this.animations.wave = () => {
            const elapsed = Date.now() - startTime;
            const time = elapsed * 0.001; // В секунды

            // Волновое движение
            const waveOffset = Math.sin(time * config.frequency) * config.amplitude;

            if (this.logoMesh) {
                switch(config.direction) {
                    case 'horizontal':
                        this.logoMesh.position.x = waveOffset;
                        break;
                    case 'vertical':
                        this.logoMesh.position.y = waveOffset;
                        break;
                    case 'depth':
                        this.logoMesh.position.z = waveOffset;
                        break;
                }
            }
        };

        this.scene.registerBeforeRender(this.animations.wave);
        console.log('✓ Wave animation started');
    }

    /**
     * Плавное появление (fade-in)
     */
    startFadeInAnimation() {
        if (!BOSS_AI_CONFIG.animations.fadeIn.enabled) return;

        const config = BOSS_AI_CONFIG.animations.fadeIn;
        const startTime = Date.now();

        this.animations.fadeIn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / config.duration, 1);

            // Плавное появление
            this.logoMesh.getChildMeshes().forEach(mesh => {
                if (mesh.material) {
                    mesh.material.alpha = progress;
                }
            });

            // Удаляем анимацию после завершения
            if (progress >= 1) {
                this.scene.unregisterBeforeRender(this.animations.fadeIn);
                delete this.animations.fadeIn;
                console.log('✓ Fade-in complete');
            }
        };

        this.scene.registerBeforeRender(this.animations.fadeIn);
        console.log('✓ Fade-in animation started');
    }

    /**
     * Анимация пульсации размера (дыхание)
     */
    startScaleAnimation() {
        if (!BOSS_AI_CONFIG.animations.scale.enabled) return;

        const config = BOSS_AI_CONFIG.animations.scale;

        this.scene.onBeforeRenderObservable.add(() => {
            const time = Date.now() / config.duration;
            const scale = config.minScale +
                (config.maxScale - config.minScale) *
                (Math.sin(time * Math.PI * 2) * 0.5 + 0.5);

            if (this.logoMesh) {
                this.logoMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
            }
        });

        console.log('✓ Scale animation started');
    }


    /**
     * Остановка конкретной анимации
     */
    stopAnimation(name) {
        if (this.animations[name]) {
            this.scene.unregisterBeforeRender(this.animations[name]);
            delete this.animations[name];
            console.log(`✓ Animation "${name}" stopped`);
        }
    }

    /**
     * Остановка всех анимаций
     */
    stopAll() {
        Object.keys(this.animations).forEach(name => {
            this.stopAnimation(name);
        });
        console.log('✓ All animations stopped');
    }

    /**
     * Возобновление анимации
     */
    resumeAnimation(name) {
        switch(name) {
            case 'rotation':
                if (!this.animations.rotation) this.startRotationAnimation();
                break;
            case 'pulse':
                if (!this.animations.pulse) this.startPulseAnimation();
                break;
            case 'wave':
                if (!this.animations.wave) this.startWaveAnimation();
                break;
        }
    }

    /**
     * Изменение скорости анимации
     */
    setSpeed(multiplier) {
        BOSS_AI_CONFIG.animations.rotation.speed *= multiplier;
        BOSS_AI_CONFIG.animations.pulse.duration /= multiplier;
        BOSS_AI_CONFIG.animations.wave.speed *= multiplier;
        console.log(`✓ Animation speed set to ${multiplier}x`);
    }
}
