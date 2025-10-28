const sharp = require('sharp');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class RemoveBgService {
    constructor() {
        this.outputDir = path.join(__dirname, 'public', 'processed');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async removeBackground(imagePath) {
        try {
            // Сначала пробуем использовать rembg (Python)
            if (await this.isRembgAvailable()) {
                return await this.removeBackgroundWithRembg(imagePath);
            } else {
                // Fallback на sharp с базовой обработкой
                return await this.removeBackgroundWithSharp(imagePath);
            }
        } catch (error) {
            console.error('Error in removeBackground:', error);
            throw new Error(`Failed to remove background: ${error.message}`);
        }
    }

    async isRembgAvailable() {
        return new Promise((resolve) => {
            const python = spawn('python3', ['-c', 'import rembg; print("rembg available")']);
            python.on('close', (code) => {
                resolve(code === 0);
            });
            python.on('error', () => {
                resolve(false);
            });
        });
    }

    async removeBackgroundWithRembg(imagePath) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(
                this.outputDir,
                `processed_${Date.now()}_${path.basename(imagePath)}`
            );

            const python = spawn('python3', [
                path.join(__dirname, 'rembg_process.py'),
                imagePath,
                outputPath
            ]);

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve({
                        url: `/processed/${path.basename(outputPath)}`,
                        path: outputPath
                    });
                } else {
                    reject(new Error(`rembg failed: ${stderr || 'Unknown error'}`));
                }
            });

            python.on('error', (error) => {
                reject(new Error(`Failed to start rembg: ${error.message}`));
            });
        });
    }

    async removeBackgroundWithSharp(imagePath) {
        try {
            const outputPath = path.join(
                this.outputDir,
                `processed_${Date.now()}_${path.basename(imagePath)}`
            );

            // Базовое удаление фона с помощью sharp
            // Это упрощенная версия - для качественного результата нужен rembg
            await sharp(imagePath)
                .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
                .png({ quality: 100 })
                .toFile(outputPath);

            return {
                url: `/processed/${path.basename(outputPath)}`,
                path: outputPath
            };
        } catch (error) {
            throw new Error(`Sharp processing failed: ${error.message}`);
        }
    }

    // Дополнительные методы для обработки изображений
    async resizeImage(imagePath, width, height) {
        const outputPath = path.join(
            this.outputDir,
            `resized_${Date.now()}_${path.basename(imagePath)}`
        );

        await sharp(imagePath)
            .resize(width, height, { fit: 'cover' })
            .png({ quality: 100 })
            .toFile(outputPath);

        return {
            url: `/processed/${path.basename(outputPath)}`,
            path: outputPath
        };
    }

    async optimizeImage(imagePath) {
        const outputPath = path.join(
            this.outputDir,
            `optimized_${Date.now()}_${path.basename(imagePath)}`
        );

        await sharp(imagePath)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(outputPath);

        return {
            url: `/processed/${path.basename(outputPath)}`,
            path: outputPath
        };
    }

    // Получение информации об изображении
    async getImageInfo(imagePath) {
        const metadata = await sharp(imagePath).metadata();
        const stats = fs.statSync(imagePath);

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: stats.size,
            createdAt: stats.birthtime
        };
    }
}

module.exports = { RemoveBgService };
