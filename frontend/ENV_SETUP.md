# 🔧 Настройка переменных окружения Frontend

## Создание `.env` файла

Создайте файл `.env` в корне директории `barsukov-platform-ts/` со следующим содержимым:

```env
# BARSUKOV PLATFORM - FRONTEND CONFIGURATION

# API Configuration
# URL API Gateway для всех запросов
VITE_API_BASE_URL=http://localhost:3000

# Telegram Bot Configuration
# Username бота (без @) для авторизации
# Получить: https://t.me/BotFather
VITE_TELEGRAM_BOT_USERNAME=your_bot_username_here

# Environment
NODE_ENV=development
```

## 📋 Описание переменных

### VITE_API_BASE_URL
- **Описание:** URL API Gateway для всех запросов
- **Development:** `http://localhost:3000`
- **Production:** `https://api.your-domain.com`

### VITE_TELEGRAM_BOT_USERNAME
- **Описание:** Username вашего Telegram бота (без @)
- **Как получить:**
  1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
  2. Используйте существующего бота или создайте нового командой `/newbot`
  3. Скопируйте username бота (отображается как `@your_bot_username`)
  4. Вставьте username **без символа @** в переменную

## 🚀 Применение изменений

После создания/изменения `.env` файла:

1. **Остановите dev-сервер** (Ctrl+C)
2. **Перезапустите dev-сервер:**
   ```bash
   npm run dev
   ```

## ⚠️ Важно

- Файл `.env` **НЕ должен** коммититься в Git (уже добавлен в `.gitignore`)
- Все переменные для Vite **должны** начинаться с префикса `VITE_`
- Переменные доступны через `import.meta.env.VITE_*`

## 🔐 Production

Для production окружения создайте `.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_TELEGRAM_BOT_USERNAME=your_production_bot
NODE_ENV=production
```

## ✅ Проверка настройки

После настройки переменных окружения:

1. Запустите frontend: `npm run dev`
2. Откройте консоль браузера (F12)
3. Проверьте, что нет ошибок загрузки Telegram Widget
4. AuthService должен использовать правильный API URL

## 📚 Дополнительная информация

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Telegram Login Widget](https://core.telegram.org/widgets/login)
