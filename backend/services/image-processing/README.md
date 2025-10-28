# Image Processing Service

Микросервис для удаления фона с изображений для BOSS AI Platform.

## Возможности

- ✅ Удаление фона с изображений с помощью rembg (AI)
- ✅ Fallback на sharp для базовой обработки
- ✅ Оптимизация изображений
- ✅ Изменение размера изображений
- ✅ REST API для интеграции
- ✅ Автоматическая очистка временных файлов

## Установка

### Node.js зависимости
```bash
cd /var/www/boss-ai/backend/services/image-processing
npm install
```

### Python зависимости
```bash
pip3 install -r requirements.txt
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

## API Endpoints

### POST /api/remove-bg
Удаляет фон с изображения

**Параметры:**
- `image` (file): Изображение для обработки

**Ответ:**
```json
{
  "success": true,
  "imageUrl": "/processed/processed_1234567890_image.png",
  "originalName": "image.png",
  "processedAt": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/status
Статус сервиса

**Ответ:**
```json
{
  "success": true,
  "service": "Image Processing Service",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/images
Список обработанных изображений

**Ответ:**
```json
{
  "success": true,
  "images": [
    {
      "filename": "processed_1234567890_image.png",
      "url": "/processed/processed_1234567890_image.png",
      "size": 12345,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Использование

### cURL
```bash
curl -X POST \
  -F "image=@/path/to/image.png" \
  http://localhost:3005/api/remove-bg
```

### JavaScript
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3005/api/remove-bg', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Processed image:', data.imageUrl);
  }
});
```

## Интеграция с BOSS AI

Сервис автоматически интегрируется с платформой BOSS AI для обработки иконок агентов и подсервисов.

## Требования

- Node.js >= 16.0.0
- Python 3.8+
- rembg библиотека
- Sharp для fallback обработки

## Структура файлов

```
image-processing/
├── server.js              # Основной сервер
├── removeBg.js            # Сервис удаления фона
├── rembg_process.py       # Python скрипт для rembg
├── package.json           # Node.js зависимости
├── requirements.txt       # Python зависимости
├── uploads/               # Временные файлы
└── public/processed/      # Обработанные изображения
```

## Мониторинг

Сервис логирует все операции и ошибки в консоль. Для продакшн использования рекомендуется настроить логирование в файлы.
