/**
 * Zombie 3D Model - Инициализация Babylon.js сцены
 * Загрузка модели зомби, настройка камеры, освещения и материалов
 */

class BossAIScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.logoMesh = null;
        this.isLoaded = false;

        this.init();
    }

    /**
     * Инициализация движка и сцены
     */
    init() {
        // Создание Babylon.js движка
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false
        });

        // Создание сцены
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Чисто черный фон

        // Настройка камеры
        this.setupCamera();

        // Настройка освещения
        this.setupLighting();

        // Загрузка модели
        this.loadModel();

        // Настройка эффектов постобработки
        this.setupPostProcessing();

        // Запуск рендера
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Адаптация к изменению размера окна
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        console.log('✓ Zombie 3D Scene initialized');
    }

    /**
     * Настройка камеры
     */
    setupCamera() {
        const config = BOSS_AI_CONFIG.camera;

        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            config.alpha,
            config.beta,
            config.radius,
            BABYLON.Vector3.Zero(),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = config.minRadius;
        this.camera.upperRadiusLimit = config.maxRadius;
        this.camera.wheelPrecision = config.wheelPrecision;

        // Отключаем панорамирование (только вращение и зум)
        this.camera.panningSensibility = 0;

        // Плавное движение камеры
        this.camera.inertia = 0.9;
        this.camera.angularSensibilityX = 1000;
        this.camera.angularSensibilityY = 1000;

        console.log('✓ Camera setup complete');
    }

    /**
     * Настройка освещения
     */
    setupLighting() {
        const lightingConfig = BOSS_AI_CONFIG.lighting;

        // Ambient light (общее освещение)
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = lightingConfig.ambient.intensity;
        ambientLight.diffuse = BABYLON.Color3.FromHexString(lightingConfig.ambient.color);

        // Directional light (направленный свет с голубым оттенком)
        const directionalLight = new BABYLON.DirectionalLight(
            'directionalLight',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        directionalLight.position = new BABYLON.Vector3(
            lightingConfig.directional.position.x,
            lightingConfig.directional.position.y,
            lightingConfig.directional.position.z
        );
        directionalLight.intensity = lightingConfig.directional.intensity;
        directionalLight.diffuse = BABYLON.Color3.FromHexString(lightingConfig.directional.color);

        console.log('✓ Lighting setup complete');
    }

    /**
     * Загрузка 3D модели зомби
     */
    async loadModel() {
        this.showLoadingScreen();
        try {
            const modelConfig = BOSS_AI_CONFIG.model;
            const modelPath = modelConfig.path;
            console.log(`Loading zombie model from ${modelPath}`);

            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                '',
                '',
                modelPath,
                this.scene
            );

            // Получаем корневой меш
            this.logoMesh = result.meshes[0];

            if (!this.logoMesh) {
                throw new Error('Zombie mesh not found');
            }

            // Применяем настройки позиции, масштаба и поворота
            this.logoMesh.position = new BABYLON.Vector3(
                modelConfig.position.x,
                modelConfig.position.y,
                modelConfig.position.z
            );
            this.logoMesh.scaling = new BABYLON.Vector3(
                modelConfig.scale,
                modelConfig.scale,
                modelConfig.scale
            );

            // Применяем начальный поворот если указан
            if (modelConfig.rotation) {
                this.logoMesh.rotation = new BABYLON.Vector3(
                    modelConfig.rotation.x,
                    modelConfig.rotation.y,
                    modelConfig.rotation.z
                );
            }

            // Применяем материал с свечением
            this.applyGlowMaterial();

            // Центрируем модель
            this.centerModel();

            this.isLoaded = true;
            console.log('✓ Zombie model loaded successfully');

            // Событие загрузки модели
            window.dispatchEvent(new CustomEvent('bossai:modelLoaded', {
                detail: { mesh: this.logoMesh }
            }));

        } catch (error) {
            console.error('✗ Error loading zombie model:', error);
            // Создаем fallback геометрию
            this.createFallbackGeometry();
        } finally {
            this.hideLoadingScreen();
        }
    }

    /**
     * Применение материала (сохраняем оригинальные материалы модели)
     */
    applyGlowMaterial() {
        // Оставляем оригинальные материалы модели без изменений
        console.log('✓ Using original zombie model materials');
    }

    /**
     * Центрирование модели
     */
    centerModel() {
        // Вычисляем bounding box всех дочерних мешей
        const childMeshes = this.logoMesh.getChildMeshes();

        if (childMeshes.length > 0) {
            // Вычисляем общий bounding box
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

            childMeshes.forEach(mesh => {
                const boundingInfo = mesh.getBoundingInfo();
                const min = boundingInfo.boundingBox.minimumWorld;
                const max = boundingInfo.boundingBox.maximumWorld;

                minX = Math.min(minX, min.x);
                minY = Math.min(minY, min.y);
                minZ = Math.min(minZ, min.z);
                maxX = Math.max(maxX, max.x);
                maxY = Math.max(maxY, max.y);
                maxZ = Math.max(maxZ, max.z);
            });

            // Вычисляем центр
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const centerZ = (minZ + maxZ) / 2;

            // Смещаем модель чтобы центр был в (0,0,0)
            this.logoMesh.position.x -= centerX;
            this.logoMesh.position.y -= centerY;
            this.logoMesh.position.z -= centerZ;

            console.log('✓ Zombie model centered at origin');
        }
    }

    /**
     * Создание fallback геометрии если модель не загрузилась
     */
    createFallbackGeometry() {
        console.log('Creating fallback geometry...');

        // Создаем простой куб как fallback
        const box = BABYLON.MeshBuilder.CreateBox('fallback', { size: 2 }, this.scene);
        box.position.y = 0;

        const material = new BABYLON.StandardMaterial('fallbackMaterial', this.scene);
        material.emissiveColor = BABYLON.Color3.FromHexString(BOSS_AI_CONFIG.colors.primary);
        box.material = material;

        this.logoMesh = box;
        this.isLoaded = true;

        window.dispatchEvent(new CustomEvent('bossai:modelLoaded', {
            detail: { mesh: this.logoMesh, fallback: true }
        }));
    }

    /**
     * Настройка эффектов постобработки (Bloom, Glow)
     */
    setupPostProcessing() {
        const effectsConfig = BOSS_AI_CONFIG.effects;

        // Bloom эффект
        if (effectsConfig.bloom.enabled) {
            const pipeline = new BABYLON.DefaultRenderingPipeline(
                'defaultPipeline',
                true,
                this.scene,
                [this.camera]
            );

            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = effectsConfig.bloom.threshold;
            pipeline.bloomWeight = effectsConfig.bloom.weight;
            pipeline.bloomKernel = effectsConfig.bloom.kernel;
            pipeline.bloomScale = 0.5;

            console.log('✓ Bloom effect enabled');
        }

        // Glow Layer
        if (effectsConfig.glow.enabled) {
            const glowLayer = new BABYLON.GlowLayer('glowLayer', this.scene);
            glowLayer.intensity = effectsConfig.glow.intensity;
            glowLayer.blurKernelSize = effectsConfig.glow.blurKernelSize;

            console.log('✓ Glow layer enabled');
        }
    }

    /**
     * Показать экран загрузки
     */
    showLoadingScreen() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'flex';
        }
    }

    /**
     * Скрыть экран загрузки
     */
    hideLoadingScreen() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Получить меш логотипа
     */
    getLogoMesh() {
        return this.logoMesh;
    }

    /**
     * Получить сцену
     */
    getScene() {
        return this.scene;
    }

    /**
     * Получить движок
     */
    getEngine() {
        return this.engine;
    }

    /**
     * Проверка загрузки
     */
    isModelLoaded() {
        return this.isLoaded;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BossAIScene;
}
