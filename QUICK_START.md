# 🚀 BOSS AI v2.0 - Быстрый старт с иконками

## ⚡ Экспресс-инструкция

### 1. Получите иконки от дизайнера
```bash
# Создайте директорию для иконок
mkdir -p /var/www/boss-ai/icons-upload

# Скопируйте все 12 иконок в эту директорию:
# ur.png, tg.png, ra.png, ozon.png, katya.png, dev.png, fz.png
# 3d.png, app.png, CALC.png, lend.png
```

### 2. Установите микросервис
```bash
cd /var/www/boss-ai
sudo ./scripts/setup-image-service.sh
```

### 3. Обработайте иконки
```bash
cd /var/www/boss-ai
./scripts/process-icons.sh
```

### 4. Соберите и обновите frontend
```bash
cd /var/www/boss-ai/frontend
npm run build
cp -r dist/* /var/www/boss-ai/frontend/dist/
systemctl reload nginx
```

### 5. Проверьте результат
Откройте https://boss-ai.online и нажмите "Попробовать демо"

## 📋 Требования к иконкам

- **Формат:** PNG с прозрачностью
- **Размеры:** 512x512px (уровень 1), 256x256px (уровень 2)
- **Фон:** Черный (#000000) для автоматического удаления
- **Объект:** Cyan (#00FFFF)
- **Стиль:** Минималистичный, технологичный

## 🔧 Если что-то не работает

### Иконки не отображаются
```bash
# Проверьте, что файлы в корне проекта
ls -la /var/www/boss-ai/*.png

# Проверьте статус микросервиса
systemctl status image-processing
curl http://localhost:3005/api/status
```

### Черный фон не удаляется
```bash
# Перезапустите микросервис
systemctl restart image-processing

# Проверьте логи
journalctl -u image-processing -f
```

### Saber-эффект не работает
```bash
# Очистите кэш браузера (Ctrl+F5)
# Проверьте консоль на ошибки (F12)
```

## 📚 Подробная документация

- **ТЗ для дизайнера:** `DESIGNER_BRIEF.md`
- **Инструкция по загрузке:** `ICONS_DEPLOYMENT.md`
- **Полный workflow:** `COMPLETE_WORKFLOW.md`
- **Визуальные эффекты:** `VISUAL_EFFECTS_GUIDE.md`

## 🎯 Ожидаемый результат

После выполнения всех шагов вы получите:
- ✅ Монолитный профессиональный вид
- ✅ Неоновое свечение (Saber-эффект)
- ✅ Эффект парения иконок
- ✅ Чередование часов/слоганов
- ✅ Полную функциональность платформы

**Готово! Платформа BOSS AI v2.0 с иконками работает!** 🎉✨
