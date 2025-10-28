/**
 * BOSS AI - Система частиц
 * Голубоватые светящиеся частицы вокруг букв
 */

class BossAIParticles {
    constructor(scene, logoMesh) {
        this.scene = scene;
        this.logoMesh = logoMesh;
        this.particleSystem = null;

        this.init();
    }

    /**
     * Инициализация системы частиц
     */
    init() {
        if (!BOSS_AI_CONFIG.particles.enabled) {
            console.log('Particles disabled in config');
            return;
        }

        this.createParticleSystem();
        console.log('✓ Particle system initialized');
    }

    /**
     * Создание системы частиц
     */
    createParticleSystem() {
        const config = BOSS_AI_CONFIG.particles;

        // Создание системы частиц
        this.particleSystem = new BABYLON.ParticleSystem(
            'bossAIParticles',
            config.count,
            this.scene
        );

        // Создание процедурной текстуры для частиц (светящаяся точка)
        this.particleSystem.particleTexture = this.createParticleTexture();

        // Эмиттер - позиция логотипа или центр сцены
        if (this.logoMesh) {
            this.particleSystem.emitter = this.logoMesh.position;
        } else {
            this.particleSystem.emitter = BABYLON.Vector3.Zero();
        }

        // Область испускания частиц
        this.particleSystem.minEmitBox = new BABYLON.Vector3(
            config.emitBox.min.x,
            config.emitBox.min.y,
            config.emitBox.min.z
        );
        this.particleSystem.maxEmitBox = new BABYLON.Vector3(
            config.emitBox.max.x,
            config.emitBox.max.y,
            config.emitBox.max.z
        );

        // Цвета частиц (градиент от cyan к голубому)
        const colors = BOSS_AI_CONFIG.colors.particles;
        this.particleSystem.color1 = BABYLON.Color4.FromHexString(colors.start + 'FF');
        this.particleSystem.color2 = BABYLON.Color4.FromHexString(colors.end + 'FF');
        this.particleSystem.colorDead = new BABYLON.Color4(0, 0.6, 1, 0);

        // Размер частиц
        this.particleSystem.minSize = config.minSize;
        this.particleSystem.maxSize = config.maxSize;

        // Время жизни частиц
        this.particleSystem.minLifeTime = config.minLifeTime;
        this.particleSystem.maxLifeTime = config.maxLifeTime;

        // Скорость испускания
        this.particleSystem.emitRate = config.emitRate;

        // Режим смешивания (аддитивный для свечения)
        this.particleSystem.blendMode = config.blendMode;

        // Гравитация (легкий подъем вверх)
        this.particleSystem.gravity = new BABYLON.Vector3(
            config.gravity.x,
            config.gravity.y,
            config.gravity.z
        );

        // Направление и скорость частиц
        this.particleSystem.direction1 = new BABYLON.Vector3(
            config.velocity.min.x,
            config.velocity.min.y,
            config.velocity.min.z
        );
        this.particleSystem.direction2 = new BABYLON.Vector3(
            config.velocity.max.x,
            config.velocity.max.y,
            config.velocity.max.z
        );

        // Скорость частиц
        this.particleSystem.minEmitPower = 0.5;
        this.particleSystem.maxEmitPower = 1.5;
        this.particleSystem.updateSpeed = config.updateSpeed;

        // Запуск системы частиц
        this.particleSystem.start();

        console.log(`✓ Particle system started (${config.count} particles)`);
    }

    /**
     * Создание процедурной текстуры для частиц
     */
    createParticleTexture() {
        // Создаем динамическую текстуру
        const textureSize = 128;
        const texture = new BABYLON.DynamicTexture(
            'particleTexture',
            textureSize,
            this.scene,
            false
        );

        const context = texture.getContext();
        const centerX = textureSize / 2;
        const centerY = textureSize / 2;
        const radius = textureSize / 2;

        // Рисуем радиальный градиент (светящаяся точка)
        const gradient = context.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );

        gradient.addColorStop(0, 'rgba(0, 255, 255, 1)');      // Яркий cyan в центре
        gradient.addColorStop(0.3, 'rgba(0, 200, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(0, 150, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');      // Прозрачный по краям

        context.fillStyle = gradient;
        context.fillRect(0, 0, textureSize, textureSize);

        texture.update();

        return texture;
    }

    /**
     * Обновление позиции эмиттера (если логотип двигается)
     */
    updateEmitter() {
        if (this.particleSystem && this.logoMesh) {
            this.particleSystem.emitter = this.logoMesh.position;
        }
    }

    /**
     * Остановка системы частиц
     */
    stop() {
        if (this.particleSystem) {
            this.particleSystem.stop();
            console.log('✓ Particle system stopped');
        }
    }

    /**
     * Запуск системы частиц
     */
    start() {
        if (this.particleSystem) {
            this.particleSystem.start();
            console.log('✓ Particle system started');
        }
    }

    /**
     * Изменение интенсивности частиц
     */
    setIntensity(multiplier) {
        if (this.particleSystem) {
            const config = BOSS_AI_CONFIG.particles;
            this.particleSystem.emitRate = config.emitRate * multiplier;
            console.log(`✓ Particle intensity set to ${multiplier}x`);
        }
    }

    /**
     * Уничтожение системы частиц
     */
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.dispose();
            this.particleSystem = null;
            console.log('✓ Particle system disposed');
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BossAIParticles;
}
