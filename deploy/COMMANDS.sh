#!/bin/bash
# Boss AI Platform - Production Deployment Commands
# Выполняйте команды пошагово, проверяя результат каждой

set -e

echo "========================================="
echo "Boss AI Platform - Production Setup"
echo "========================================="

# 1. Генерация секретов
echo ""
echo "1. Генерация секретов для .env:"
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "TELEGRAM_BOT_SECRET=$(openssl rand -base64 32)"

# 2. Создание .env (вручную!)
echo ""
echo "2. Создайте /var/www/boss-ai/.env с этими переменными"
echo "   (используйте nano или vim)"
read -p "Нажмите Enter после создания .env..."

# 3. Установка PM2 logrotate
echo ""
echo "3. Установка PM2 logrotate..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
pm2 save
echo "✓ PM2 logrotate настроен"

# 4. Копирование Nginx logrotate
echo ""
echo "4. Настройка Nginx logrotate..."
sudo cp /var/www/boss-ai/deploy/logrotate-nginx /etc/logrotate.d/nginx-boss-ai
sudo chmod 644 /etc/logrotate.d/nginx-boss-ai
echo "✓ Nginx logrotate настроен"

# 5. Создание директории для бэкапов
echo ""
echo "5. Создание директории для бэкапов..."
sudo mkdir -p /var/backups/boss-ai
sudo chown $USER:$USER /var/backups/boss-ai
chmod +x /var/www/boss-ai/scripts/backup_sqlite.sh
echo "✓ Директория для бэкапов создана"

# 6. Установка cron для бэкапов
echo ""
echo "6. Добавьте в crontab -e:"
echo "0 3 * * * DB_PATH=/var/www/boss-ai/backend/data/boss_ai.db BACKUP_DIR=/var/backups/boss-ai /bin/bash /var/www/boss-ai/scripts/backup_sqlite.sh >> /var/www/boss-ai/logs/backup.log 2>&1"
read -p "Нажмите Enter после добавления в crontab..."

# 7. Nginx security headers
echo ""
echo "7. Добавьте в ваш Nginx server block (HTTPS):"
echo "   include /var/www/boss-ai/deploy/nginx-security-headers.conf;"
echo "   И проверьте WebSocket proxy из deploy/nginx-websocket-proxy.conf"
read -p "Нажмите Enter после обновления Nginx конфига..."

# 8. Проверка Nginx
echo ""
echo "8. Проверка конфигурации Nginx..."
sudo nginx -t
echo "✓ Nginx конфигурация валидна"

# 9. Перезагрузка Nginx
echo ""
echo "9. Перезагрузка Nginx..."
sudo systemctl reload nginx
echo "✓ Nginx перезагружен"

# 10. Перезапуск PM2
echo ""
echo "10. Перезапуск PM2 с новым .env..."
cd /var/www/boss-ai
pm2 reload ecosystem.config.js
pm2 save
echo "✓ PM2 перезапущен"

# 11. Установка Telegram webhook
echo ""
echo "11. Установка Telegram webhook..."
source /var/www/boss-ai/.env
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://boss-ai.online/api/telegram/webhook" \
  -d "secret_token=${TELEGRAM_BOT_SECRET}"
echo ""
echo "✓ Webhook установлен"

# 12. Проверки
echo ""
echo "========================================="
echo "Проверка работоспособности:"
echo "========================================="

echo ""
echo "Health check:"
curl https://boss-ai.online/api/health
echo ""

echo ""
echo "Security headers:"
curl -I https://boss-ai.online 2>&1 | grep -i "content-security-policy\|strict-transport\|x-content-type"
echo ""

echo ""
echo "Webhook info:"
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
echo ""

echo ""
echo "PM2 status:"
pm2 status
echo ""

echo "========================================="
echo "✓ Деплой завершен!"
echo "========================================="
echo ""
echo "Следующие шаги:"
echo "- Проверьте логи: pm2 logs"
echo "- Проверьте фронтенд: https://boss-ai.online"
echo "- Протестируйте Telegram Login"
echo "- Проверьте WebSocket соединение"
