# Boss AI Platform - Deployment Guide

## Описание

Этот каталог содержит все необходимые файлы и скрипты для развертывания Boss AI Platform на VPS сервере.

## Файлы

- `nginx.conf` - Конфигурация Nginx для проксирования и статических файлов
- `ecosystem.config.js` - Конфигурация PM2 для управления процессами
- `deploy.sh` - Скрипт автоматического развертывания
- `.env.production.example` - Пример production переменных окружения

## Требования к серверу

### Минимальные требования

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 2 CPU cores
- 4GB RAM
- 20GB SSD
- Node.js 18+
- Nginx
- PM2
- SSL сертификат (Let's Encrypt)

### Рекомендуемые требования

- Ubuntu 22.04 LTS
- 4 CPU cores
- 8GB RAM
- 50GB SSD
- Node.js 20+
- Nginx с HTTP/2
- PM2 с кластером
- SSL сертификат

## Быстрый старт

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Nginx
sudo apt install nginx -y

# Установка PM2
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Настройка проекта

```bash
# Клонирование проекта
git clone <your-repo-url> /var/www/boss-ai
cd /var/www/boss-ai

# Настройка прав доступа
sudo chown -R $USER:$USER /var/www/boss-ai
chmod +x deploy/deploy.sh
```

### 3. Настройка переменных окружения

```bash
# Копирование примера
cp deploy/.env.production.example backend/.env.production

# Редактирование конфигурации
nano backend/.env.production
```

**Обязательно настройте:**

- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота
- `JWT_SECRET` - секретный ключ для JWT
- `CORS_ORIGIN` - ваш домен
- `API_TOKEN` - API токен для аутентификации

### 4. Развертывание

```bash
# Запуск скрипта развертывания
./deploy/deploy.sh production
```

### 5. Настройка Telegram Bot

1. Создайте бота через @BotFather
2. Получите токен бота
3. Установите webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

## Управление

### PM2 команды

```bash
# Статус процессов
pm2 status

# Логи
pm2 logs boss-ai-backend

# Перезапуск
pm2 restart boss-ai-backend

# Остановка
pm2 stop boss-ai-backend

# Удаление
pm2 delete boss-ai-backend
```

### Nginx команды

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Статус
sudo systemctl status nginx
```

### Обновление

```bash
# Обновление кода
cd /var/www/boss-ai
git pull origin main

# Перезапуск
./deploy/deploy.sh production
```

## Мониторинг

### Логи

- Backend: `/var/www/boss-ai/backend/logs/`
- Nginx: `/var/log/nginx/`
- PM2: `pm2 logs`

### Метрики

- CPU: `htop`
- Память: `free -h`
- Диск: `df -h`
- Сеть: `netstat -tulpn`

## Безопасность

### Firewall

```bash
# UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL

```bash
# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Backup

```bash
# Автоматический backup
sudo crontab -e
# Добавить: 0 2 * * * /var/www/boss-ai/deploy/backup.sh
```

## Troubleshooting

### Проблемы с PM2

```bash
# Сброс PM2
pm2 kill
pm2 start deploy/ecosystem.config.js
```

### Проблемы с Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx
```

### Проблемы с SSL

```bash
# Обновление сертификата
sudo certbot renew --force-renewal
```

## Поддержка

При возникновении проблем:

1. Проверьте логи: `pm2 logs boss-ai-backend`
2. Проверьте статус: `pm2 status`
3. Проверьте Nginx: `sudo nginx -t`
4. Проверьте SSL: `sudo certbot certificates`
