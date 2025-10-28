# 🤖 Настройка Telegram Bot для Boss AI

## Цель
Настроить Telegram бота для подтверждения пользовательского соглашения через deep linking и inline кнопки.

## 1. Создание бота через @BotFather

### Шаг 1: Создание бота
1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Введите имя бота: `Boss AI Assistant` (или любое другое)
4. Введите username: `boss_ai_assistant_bot` (должен заканчиваться на `_bot`)
5. Скопируйте полученный **TOKEN** - он понадобится для `.env`

### Шаг 2: Настройка бота
1. Отправьте `/setdescription` и введите:
   ```
   Бот для подтверждения пользовательского соглашения платформы Boss AI
   ```

2. Отправьте `/setabouttext` и введите:
   ```
   Подтверждение соглашения для доступа к платформе Boss AI
   ```

3. Отправьте `/setuserpic` и загрузите иконку (опционально)

## 2. Настройка переменных окружения

Добавьте в ваш `.env` файл:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=boss_ai_assistant_bot
```

## 3. Настройка Domain для Login Widget

### Для локальной разработки:
1. Отправьте боту `/setdomain`
2. Введите: `localhost:3000` (ваш frontend URL)

### Для продакшена:
1. Отправьте боту `/setdomain`
2. Введите: `yourdomain.com` (ваш домен)

## 4. Настройка Webhook

### Локальная разработка с ngrok:

1. **Установите ngrok:**
   ```bash
   # Скачайте с https://ngrok.com/download
   # Или через npm: npm install -g ngrok
   ```

2. **Запустите ngrok:**
   ```bash
   ngrok http 4200
   ```

3. **Скопируйте HTTPS URL** (например: `https://abc123.ngrok.io`)

4. **Установите webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook"}'
   ```

5. **Проверьте webhook:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

### Продакшен:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

## 5. Тестирование

### Тестовый сценарий:

1. **Запустите backend:**
   ```bash
   cd Ozo_Api/backend
   npm run dev
   ```

2. **Запустите frontend:**
   ```bash
   cd barsukov-platform-ts
   npm run dev
   ```

3. **Откройте приложение** в браузере

4. **Авторизуйтесь** через Telegram Login Widget

5. **При появлении AgreementDialog:**
   - Нажмите "Открыть бота в Telegram"
   - В Telegram нажмите "Принять"
   - Вернитесь в приложение

6. **Проверьте логи** backend для отладки

## 6. Отладка

### Проверка webhook:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

### Очистка webhook (для отладки):
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

### Логи backend:
```bash
tail -f Ozo_Api/backend/logs/ozon_manager.log
```

## 7. Структура сообщений бота

### Команда /start:
```
📋 Пользовательское соглашение Boss AI

Для использования платформы необходимо принять условия использования:

• Обработка данных Telegram (ID, имя, username, фото)
• Конфиденциальность и безопасность данных
• Возможность удаления аккаунта
• Соблюдение законодательства

Выберите действие:

[✅ Принять] [❌ Отклонить]
```

### После принятия:
```
✅ Соглашение принято!

Спасибо! Теперь вы можете вернуться в приложение и продолжить работу с Boss AI.
```

### После отклонения:
```
❌ Соглашение отклонено

Без принятия соглашения вы не сможете использовать платформу Boss AI.

Если передумаете, можете снова открыть ссылку из приложения.
```

## 8. Безопасность

- ✅ Валидация `telegram_id` - проверяем что пользователь тот же
- ✅ Deep linking с `userId` для предотвращения подделки
- ✅ Проверка существования пользователя в БД
- ✅ Логирование всех действий
- ✅ Обработка ошибок

## 9. Мониторинг

### Логи бота:
- Все действия логируются в `logs/ozon_manager.log`
- Уровни: `INFO`, `WARN`, `ERROR`
- Контекст: `telegram_id`, `userId`, `action`

### Метрики:
- Количество принятых соглашений
- Количество отклонений
- Ошибки webhook
- Время ответа

## 10. Troubleshooting

### Проблема: "Bot not initialized"
**Решение:** Проверьте `TELEGRAM_BOT_TOKEN` в `.env`

### Проблема: "Webhook not set"
**Решение:** Установите webhook через API (см. раздел 4)

### Проблема: "User not found"
**Решение:** Убедитесь что пользователь авторизовался через Login Widget

### Проблема: "Invalid callback data"
**Решение:** Проверьте формат `callback_data` в коде

## 11. Продакшен

### Nginx конфигурация:
```nginx
location /api/telegram/webhook {
    proxy_pass http://localhost:4200;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### PM2 для автозапуска:
```bash
pm2 start Ozo_Api/backend/dist/index.js --name "boss-ai-backend"
```

### SSL сертификаты:
- Обязательно HTTPS для webhook
- Let's Encrypt или коммерческий сертификат
