# Boss AI - Production Server Setup

## Пошаговая инструкция для безопасного деплоя

### 1. Создание .env файла

```bash
cd /var/www/boss-ai
nano .env
```

Скопируйте содержимое из `.env.example` и заполните реальными значениями:

- `JWT_SECRET` — сгенерируйте командой: `openssl rand -base64 48`
- `TELEGRAM_BOT_TOKEN` — получите у @BotFather
- `TELEGRAM_BOT_SECRET` — сгенерируйте: `openssl rand -base64 32`

**Важно:** Файл `.env` должен быть только на сервере, права 600:

```bash
chmod 600 /var/www/boss-ai/.env
```

### 2. PM2 Logrotate

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
pm2 save
```

### 3. Nginx Security Headers

Вариант A (рекомендуется): добавить include в существующий server block

```nginx
server {
    listen 443 ssl http2;
    server_name boss-ai.online;

    # Добавьте эту строку
    include /var/www/boss-ai/deploy/nginx-security-headers.conf;

    # ... остальная конфигурация
}
```

Вариант B: скопировать содержимое файла `deploy/nginx-security-headers.conf` напрямую в server block.

**Проверка и применение:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. WebSocket Proxy (если используется)

Добавьте в Nginx server block содержимое `deploy/nginx-websocket-proxy.conf` или весь блок location.

### 5. Nginx Logrotate

```bash
sudo cp /var/www/boss-ai/deploy/logrotate-nginx /etc/logrotate.d/nginx-boss-ai
sudo chmod 644 /etc/logrotate.d/nginx-boss-ai
```

### 6. SQLite Backup Cron

```bash
# Создать директорию для бэкапов
sudo mkdir -p /var/backups/boss-ai
sudo chown $USER:$USER /var/backups/boss-ai

# Сделать скрипт исполняемым
chmod +x /var/www/boss-ai/scripts/backup_sqlite.sh

# Добавить в crontab
crontab -e
```

Добавьте строку:

```
0 3 * * * DB_PATH=/var/www/boss-ai/backend/data/boss_ai.db BACKUP_DIR=/var/backups/boss-ai /bin/bash /var/www/boss-ai/scripts/backup_sqlite.sh >> /var/www/boss-ai/logs/backup.log 2>&1
```

### 7. Перезапуск приложения с новыми env

```bash
cd /var/www/boss-ai
pm2 reload ecosystem.config.js
pm2 save
```

### 8. Установка Telegram Webhook

```bash
# Загрузите переменные из .env
source /var/www/boss-ai/.env

# Установите webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://boss-ai.online/api/telegram/webhook" \
  -d "secret_token=${TELEGRAM_BOT_SECRET}"
```

Должен вернуться ответ: `{"ok":true,"result":true,"description":"Webhook was set"}`

### 9. Проверка работоспособности

```bash
# Health check
curl https://boss-ai.online/api/health

# Проверка заголовков безопасности
curl -I https://boss-ai.online | grep -i "content-security-policy\|strict-transport\|x-content-type"

# Проверка webhook (должен быть установлен)
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"

# Логи PM2
pm2 logs --lines 50

# Логи Nginx
sudo tail -f /var/log/nginx/boss-ai.error.log
```

### 10. Frontend Deploy (если требуется)

```bash
cd /var/www/boss-ai/frontend
echo "VITE_API_BASE_URL=https://boss-ai.online/api" > .env.production
npm run build
# Статика должна быть в dist/ и раздаваться через Nginx
```

## Безопасность

- Меняйте `JWT_SECRET` и `TELEGRAM_BOT_TOKEN` каждые 90 дней
- Храните `.env` только на сервере (права 600)
- Регулярно проверяйте логи на подозрительную активность
- Мониторьте использование диска для бэкапов
- Настройте файрвол (ufw) для ограничения доступа к портам

## Мониторинг

```bash
# Статус PM2
pm2 status

# Использование ресурсов
pm2 monit

# Размер базы данных
du -h /var/www/boss-ai/backend/data/*.db

# Размер бэкапов
du -sh /var/backups/boss-ai/
```

## Troubleshooting

### PM2 не видит .env

- Проверьте путь `env_file` в `ecosystem.config.js`
- Убедитесь что файл существует и читаемый
- Перезапустите: `pm2 delete all && pm2 start ecosystem.config.js`

### Nginx не применяет заголовки

- Проверьте синтаксис: `sudo nginx -t`
- Убедитесь что include подключен в server block (HTTPS, не HTTP)
- Перезагрузите: `sudo systemctl reload nginx`

### Webhook не работает

- Проверьте что API запущен и отвечает на `/api/telegram/webhook`
- Проверьте логи: `pm2 logs boss-ai-api-gateway`
- Убедитесь что TELEGRAM_BOT_SECRET в .env совпадает с установленным в webhook
