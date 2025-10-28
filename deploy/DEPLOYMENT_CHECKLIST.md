# 🚀 Чеклист деплоя Boss AI Platform на VPS

Полный чеклист для развертывания Boss AI Platform на VPS с доменом boss-ai.online.

## 📋 Предварительные требования

### VPS характеристики

- [ ] Ubuntu 20.04+ или Debian 11+
- [ ] Минимум 2GB RAM, 2 CPU cores
- [ ] 20GB+ свободного места
- [ ] IP адрес: 217.12.38.90
- [ ] SSH доступ настроен

### Домен

- [ ] Домен boss-ai.online зарегистрирован
- [ ] DNS A-запись: boss-ai.online → 217.12.38.90
- [ ] DNS A-запись: <www.boss-ai.online> → 217.12.38.90
- [ ] Домен резолвится: `nslookup boss-ai.online`

### Telegram бот

- [ ] Бот @OzonBossAi_bot создан через @BotFather
- [ ] Токен бота сохранен
- [ ] Username бота: OzonBossAi_bot

## 🔍 Этап 0: Исследование существующего сервера

> 📖 **ВАЖНО**: Перед развертыванием обязательно исследуйте существующую конфигурацию сервера!

### 0.1 Автоматическое исследование

```bash
# Запустить скрипт исследования
chmod +x deploy/investigate-server.sh
./deploy/investigate-server.sh

# Изучить результаты
cat /tmp/boss-ai-investigation/server-config.json
cat /tmp/boss-ai-investigation/recommendations.md
```

### 0.2 Ручное исследование

```bash
# Определить веб-сервер
ps aux | grep nginx
ps aux | grep apache

# Проверить порты
netstat -tlnp | grep LISTEN

# Проверить SSL
ls -la /etc/letsencrypt/live/
certbot certificates

# Проверить Node.js
node -v
npm -v
pm2 list
```

### 0.3 Выбор стратегии развертывания

**На основе результатов исследования выберите:**

1. **Поддомен** (если есть SSL сертификат):
   - URL: `app.boss-ai.online`
   - Требует: DNS A-запись + SSL расширение

2. **Подпапка** (если нет SSL или простая интеграция):
   - URL: `boss-ai.online/app/`
   - Требует: только добавление location блоков

3. **Отдельный порт** (если веб-сервер не поддерживает прокси):
   - URL: `boss-ai.online:8080`
   - Требует: открытие порта в файрволле

## 🔧 Подготовка сервера

### 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git unzip -y
```

### 2. Установка Node.js (если не установлен)

```bash
# Проверить существующую версию
node -v || echo "Node.js не установлен"

# Установка Node.js 18.x (если нужно)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
node --version  # Должно быть 18+
npm --version
```

### 3. Установка PM2 (если не установлен)

```bash
# Проверить существующую версию
pm2 -v || echo "PM2 не установлен"

# Установка PM2 (если нужно)
sudo npm install -g pm2
pm2 --version
```

### 4. Настройка веб-сервера

#### 4.1 Для Nginx (если используется)

```bash
# Проверить статус
sudo systemctl status nginx

# Если не установлен
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 4.2 Для Apache (если используется)

```bash
# Проверить статус
sudo systemctl status apache2

# Если не установлен
sudo apt install apache2 -y
sudo systemctl enable apache2
sudo systemctl start apache2

# Включить необходимые модули
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires
```

### 5. Настройка SSL сертификата

#### 5.1 Если SSL уже настроен

```bash
# Проверить существующие сертификаты
ls -la /etc/letsencrypt/live/
certbot certificates

# Если нужно расширить для поддомена
sudo certbot --expand -d boss-ai.online -d app.boss-ai.online
```

#### 5.2 Если SSL не настроен

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx python3-certbot-apache -y

# Для Nginx
sudo certbot --nginx -d boss-ai.online -d www.boss-ai.online

# Для Apache
sudo certbot --apache -d boss-ai.online -d www.boss-ai.online

# Проверка автообновления
sudo certbot renew --dry-run
```

## 📁 Развертывание приложения

### 1. Создание директорий

```bash
# Создать директорию для приложения
sudo mkdir -p /var/www/boss-ai
sudo chown -R $USER:$USER /var/www/boss-ai

# Создать директории для данных и логов
sudo mkdir -p /var/www/boss-ai/data
sudo mkdir -p /var/www/boss-ai/logs
sudo chown -R $USER:$USER /var/www/boss-ai/data
sudo chown -R $USER:$USER /var/www/boss-ai/logs

cd /var/www/boss-ai
```

### 2. Загрузка кода приложения

```bash
# Вариант 1: Клонирование из Git
git clone <your-repo-url> .

# Вариант 2: Загрузка архива
# wget <archive-url> -O boss-ai.tar.gz
# tar -xzf boss-ai.tar.gz
# rm boss-ai.tar.gz
```

### 3. Установка зависимостей

```bash
# Установка всех зависимостей
npm run install:all

# Или по отдельности
cd frontend && npm install
cd ../backend/main && npm install
cd ../backend/ozon-manager && npm install
cd ../../
```

### 4. Сборка frontend

```bash
cd frontend
npm run build
# Проверить что создалась папка dist/
ls -la dist/
```

### 5. Настройка переменных окружения

#### 5.1 Backend main (.env)

```bash
cp backend/main/.env.example backend/main/.env
nano backend/main/.env
```

**Содержимое backend/main/.env:**

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://boss-ai.online
# или для поддомена: https://app.boss-ai.online

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=OzonBossAi_bot

# JWT
JWT_SECRET=your_jwt_secret_here

# Microservices
OZON_MANAGER_URL=http://localhost:4200
AI_SERVICES_URL=http://localhost:5000
```

#### 5.2 Frontend (.env)

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

**Содержимое frontend/.env:**

```env
# Для поддомена
VITE_API_BASE_URL=https://app.boss-ai.online/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot

# Или для подпапки
VITE_API_BASE_URL=https://boss-ai.online/app/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot

VITE_NODE_ENV=production
```

## ⚙️ Настройка веб-сервера

> 📖 **Выберите конфигурацию на основе результатов исследования сервера!**

### Вариант A: Поддомен (app.boss-ai.online)

#### A.1 DNS настройка

```bash
# Добавить A-запись в DNS:
# app.boss-ai.online → 217.12.38.90
```

#### A.2 SSL для поддомена

```bash
# Расширить существующий сертификат
sudo certbot --expand -d boss-ai.online -d app.boss-ai.online

# Или создать новый
sudo certbot --nginx -d app.boss-ai.online
```

#### A.3 Nginx конфигурация

```bash
# Копировать конфигурацию для поддомена
sudo cp deploy/nginx-configs/subdomain.conf /etc/nginx/sites-available/app.boss-ai.online

# Активировать сайт
sudo ln -s /etc/nginx/sites-available/app.boss-ai.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### A.4 Apache конфигурация

```bash
# Копировать конфигурацию для поддомена
sudo cp deploy/apache-configs/virtualhost-subdomain.conf /etc/apache2/sites-available/app.boss-ai.online.conf

# Активировать сайт
sudo a2ensite app.boss-ai.online
sudo systemctl reload apache2
```

### Вариант B: Подпапка (boss-ai.online/app/)

#### B.1 Nginx конфигурация

```bash
# Добавить location блоки в существующий конфиг
sudo nano /etc/nginx/sites-available/boss-ai.online

# Скопировать содержимое из:
# deploy/nginx-configs/subfolder-location-blocks.conf

sudo nginx -t
sudo systemctl reload nginx
```

#### B.2 Apache конфигурация

```bash
# Создать .htaccess файл
sudo cp deploy/apache-configs/.htaccess /var/www/html/boss-ai/

# Убедиться что модули включены
sudo a2enmod rewrite proxy proxy_http proxy_wstunnel headers
sudo systemctl reload apache2
```

## 🔐 Настройка SSL сертификата (если не настроен)

### 1. Получение SSL сертификата

```bash
# Для Nginx
sudo certbot --nginx -d boss-ai.online -d www.boss-ai.online

# Для Apache
sudo certbot --apache -d boss-ai.online -d www.boss-ai.online
```

### 2. Проверка SSL

```bash
# Проверка сертификата
sudo certbot certificates

# Тест автообновления
sudo certbot renew --dry-run
```

## 🚀 Запуск приложения

### 1. Настройка PM2

```bash
# Копирование конфигурации PM2
cp deploy/ecosystem.config.js .

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Проверка конфигурации

```bash
# Для Nginx
sudo nginx -t

# Для Apache
sudo apache2ctl configtest
```

### 3. Перезапуск веб-сервера

```bash
# Для Nginx
sudo systemctl reload nginx

# Для Apache
sudo systemctl reload apache2
```

## ✅ Тестирование развертывания

### 1. Проверка PM2 процессов

```bash
# Проверить статус всех процессов
pm2 status

# Проверить логи
pm2 logs

# Проверить конкретный сервис
pm2 logs boss-ai-api-gateway
pm2 logs boss-ai-ozon-manager
```

### 2. Проверка портов

```bash
# Проверить что порты слушаются
netstat -tlnp | grep :3000  # API Gateway
netstat -tlnp | grep :4200  # Ozon Manager
```

### 3. Проверка API

```bash
# Проверить health endpoint
curl http://localhost:3000/api/health

# Проверить Ozon Manager
curl http://localhost:4200/health
```

### 4. Проверка веб-доступа

```bash
# Проверить frontend
curl -I https://boss-ai.online/app/
# или для поддомена
curl -I https://app.boss-ai.online/

# Проверить API через веб-сервер
curl https://boss-ai.online/app/api/health
# или для поддомена
curl https://app.boss-ai.online/api/health
```

### 5. Проверка Telegram авторизации

1. Открыть приложение в браузере
2. Нажать "Войти через Telegram"
3. Проверить что появляется кнопка Telegram Login Widget
4. Протестировать авторизацию

### 6. Проверка WebSocket

```bash
# Проверить WebSocket соединение
curl -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" https://boss-ai.online/app/socket.io/
```

## 🚨 Устранение неполадок

### Проблема: 502 Bad Gateway

```bash
# Проверить PM2
pm2 status
pm2 logs

# Проверить порты
netstat -tlnp | grep :3000

# Проверить конфигурацию веб-сервера
sudo nginx -t
sudo apache2ctl configtest
```

### Проблема: 404 Not Found

```bash
# Проверить файлы frontend
ls -la /var/www/boss-ai/frontend/dist/

# Пересобрать frontend
cd /var/www/boss-ai/frontend
npm run build
```

### Проблема: CORS ошибки

```bash
# Проверить переменные окружения
cat /var/www/boss-ai/backend/main/.env

# Обновить CORS_ORIGIN
nano /var/www/boss-ai/backend/main/.env
```

### Проблема: SSL ошибки

```bash
# Проверить SSL сертификат
sudo certbot certificates

# Обновить сертификат
sudo certbot renew
```

## 🎉 Развертывание завершено

**Boss AI Platform успешно развернута на VPS!**

### Доступные URL

- **Frontend**: <https://boss-ai.online/app/> (или <https://app.boss-ai.online/>)
- **API**: <https://boss-ai.online/app/api/> (или <https://app.boss-ai.online/api/>)
- **Health Check**: <https://boss-ai.online/app/api/health>

### Полезные команды

```bash
# Перезапуск приложения
pm2 restart all

# Просмотр логов
pm2 logs

# Мониторинг
pm2 monit

# Обновление приложения
git pull
npm run install:all
cd frontend && npm run build
pm2 restart all
```
