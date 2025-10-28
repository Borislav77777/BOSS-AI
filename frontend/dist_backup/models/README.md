# 3D Модели для агентов

## Как добавить 3D модель для Фото Студии:

### 1. Подготовка модели:
- Формат: **GLB** (рекомендуется) или **GLTF**
- Размер: оптимально до 5MB
- Полигоны: до 50k для хорошей производительности
- Текстуры: сжатые, оптимально до 2048x2048px

### 2. Загрузка модели:
Поместите файл модели в эту папку:
```
/var/www/boss-ai/frontend/public/models/photo-studio.glb
```

### 3. Активация 3D модели:
В файле `frontend/src/components/ChatInterface.tsx` найдите агента "Фото Студия" и измените:
```typescript
use3DModel: false,  // ← Измените на true
```

### 4. Настройка отображения:
В файле `frontend/src/components/Model3DAvatar.tsx` можно настроить:
- `scale` - масштаб модели (по умолчанию 1.5)
- `autoRotateSpeed` - скорость вращения (по умолчанию 2)
- Освещение (ambientLight, spotLight, pointLight)
- Позицию камеры

### 5. Пересборка:
```bash
cd /var/www/boss-ai/frontend
npm run build
```

## Рекомендуемые инструменты для создания GLB:

- **Blender** (бесплатно) - экспорт в GLB
- **Sketchfab** - онлайн библиотека 3D моделей
- **glTF-Transform** - оптимизация GLB файлов
- **gltf.report** - анализ размера и производительности

## Оптимизация модели:

```bash
# Установка gltf-transform
npm install -g @gltf-transform/cli

# Оптимизация модели
gltf-transform optimize input.glb output.glb --texture-compress webp
```

## Текущий статус:
- ✅ Three.js установлен
- ✅ React Three Fiber настроен
- ✅ Компонент Model3DAvatar создан
- ⏳ Ожидается GLB модель для Фото Студии
