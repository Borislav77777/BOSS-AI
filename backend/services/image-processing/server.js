const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { RemoveBgService } = require('./removeBg');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const removeBgService = new RemoveBgService();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Создаем папки если их нет
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'public', 'processed');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// API для удаления фона
app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        console.log(`Processing image: ${req.file.originalname}`);

        const result = await removeBgService.removeBackground(req.file.path);

        // Удаляем временный файл
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            imageUrl: result.url,
            originalName: req.file.originalname,
            processedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing image:', error);

        // Удаляем временный файл в случае ошибки
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API для получения статуса сервиса
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        service: 'Image Processing Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// API для получения списка обработанных изображений
app.get('/api/images', (req, res) => {
    try {
        const files = fs.readdirSync(outputDir);
        const images = files
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map(file => ({
                filename: file,
                url: `/processed/${file}`,
                size: fs.statSync(path.join(outputDir, file)).size,
                createdAt: fs.statSync(path.join(outputDir, file)).birthtime
            }));

        res.json({
            success: true,
            images: images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`🚀 Image Processing Service running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`🌐 API endpoints:`);
    console.log(`   POST /api/remove-bg - Remove background from image`);
    console.log(`   GET  /api/status - Service status`);
    console.log(`   GET  /api/images - List processed images`);
});

module.exports = app;
