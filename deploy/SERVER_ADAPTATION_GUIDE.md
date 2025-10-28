# 🔧 Адаптация Boss AI Platform к существующему серверу

Полное руководство по развертыванию Boss AI Platform на VPS с существующей конфигурацией **БЕЗ изменения** текущих настроек.

## 🎯 Принципы адаптации

1. **НЕ менять** существующие конфигурации
2. **НЕ перезаписывать** существующие файлы
3. **Использовать** существующий SSL сертификат
4. **Адаптироваться** к текущей структуре директорий
5. **Найти свободные** порты для микросервисов
6. **Работать** с существующим веб-сервером

## 📋 Этап 1: Исследование сервера

### 1.1 Определение веб-сервера

```bash
# Проверить какой веб-сервер используется
ps aux | grep nginx
ps aux | grep apache
ps aux | grep httpd

# Проверить версии
nginx -v 2>/dev/null || echo "Nginx не установлен"
apache2 -v 2>/dev/null || echo "Apache не установлен"
```

### 1.2 Исследование структуры директорий

```bash
# Найти корневые директории
grep -r "DocumentRoot" /etc/apache2/ 2>/dev/null
grep -r "root" /etc/nginx/sites-enabled/ 2>/dev/null

# Проверить структуру
ls -la /var/www/
ls -la /home/*/public_html/ 2>/dev/null
ls -la /var/www/html/
```

### 1.3 Исследование SSL

```bash
# Проверить SSL сертификаты
ls -la /etc/letsencrypt/live/
certbot certificates 2>/dev/null

# Проверить SSL конфигурацию
grep -r "ssl_certificate" /etc/nginx/ 2>/dev/null
grep -r "SSLCertificate" /etc/apache2/ 2>/dev/null
```

### 1.4 Исследование портов

```bash
# Проверить занятые порты
netstat -tlnp | grep LISTEN
ss -tlnp | grep LISTEN

# Проверить Node.js приложения
ps aux | grep node
pm2 list 2>/dev/null
```

## 🏗️ Этап 2: Стратегии размещения

### 2.1 Поддомен (рекомендуется)

**URL**: `app.boss-ai.online`

**Преимущества:**

- Изолированная конфигурация
- Не влияет на основной сайт
- Легко настроить SSL

**Требования:**

- Добавить A-запись: `app.boss-ai.online → 217.12.38.90`
- Создать отдельный конфигурационный файл

### 2.2 Подпапка

**URL**: `boss-ai.online/app/`

**Преимущества:**

- Не требует DNS изменений
- Использует существующий SSL
- Простая настройка

**Недостатки:**

- Может конфликтовать с существующими маршрутами
- Сложнее настройка проксирования

### 2.3 Отдельный порт

**URL**: `boss-ai.online:8080`

**Преимущества:**

- Полная изоляция
- Не влияет на основной сайт

**Недостатки:**

- Требует открытия дополнительного порта
- Может блокироваться файрволлом

## ⚙️ Этап 3: Конфигурации по веб-серверам

### 3.1 Nginx конфигурации

#### 3.1.1 Поддомен (рекомендуется)

Создать `/etc/nginx/sites-available/app.boss-ai.online`:

```nginx
server {
    listen 443 ssl http2;
    server_name app.boss-ai.online;

    # Использовать существующий SSL сертификат
    ssl_certificate /etc/letsencrypt/live/boss-ai.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boss-ai.online/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        root /var/www/boss-ai/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Кэширование
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Gateway
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

# HTTP редирект
server {
    listen 80;
    server_name app.boss-ai.online;
    return 301 https://$server_name$request_uri;
}
```

#### 3.1.2 Подпапка

Добавить в существующий конфигурационный файл:

```nginx
# Добавить в существующий server блок
location /app/ {
    alias /var/www/boss-ai/frontend/dist/;
    try_files $uri $uri/ /app/index.html;

    # Кэширование
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

location /app/api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /app/socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### 3.2 Apache конфигурации

#### 3.2.1 Поддомен

Создать `/etc/apache2/sites-available/app.boss-ai.online.conf`:

```apache
<VirtualHost *:443>
    ServerName app.boss-ai.online
    DocumentRoot /var/www/boss-ai/frontend/dist

    # SSL конфигурация
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/boss-ai.online/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/boss-ai.online/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/boss-ai.online/chain.pem

    # Frontend
    <Directory "/var/www/boss-ai/frontend/dist">
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API Gateway
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/

    # WebSocket
    ProxyPass /socket.io/ ws://localhost:3000/socket.io/
    ProxyPassReverse /socket.io/ ws://localhost:3000/socket.io/
</VirtualHost>

<VirtualHost *:80>
    ServerName app.boss-ai.online
    Redirect permanent / https://app.boss-ai.online/
</VirtualHost>
```

#### 3.2.2 Подпапка (.htaccess)

Создать `/var/www/html/boss-ai/.htaccess`:

```apache
RewriteEngine On

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/boss-ai/api
RewriteCond %{REQUEST_URI} !^/boss-ai/socket.io
RewriteRule ^boss-ai/(.*)$ /boss-ai/index.html [L]

# API Gateway
RewriteRule ^boss-ai/api/(.*)$ http://localhost:3000/api/$1 [P,L]

# WebSocket
RewriteRule ^boss-ai/socket.io/(.*)$ http://localhost:3000/socket.io/$1 [P,L]

# CORS headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"

# Handle preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

## 🔧 Этап 4: Настройка переменных окружения

### 4.1 Для поддомена

**Frontend (.env):**

```env
VITE_API_BASE_URL=https://app.boss-ai.online/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_NODE_ENV=production
```

**Backend (.env):**

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.boss-ai.online
```

### 4.2 Для подпапки

**Frontend (.env):**

```env
VITE_API_BASE_URL=https://boss-ai.online/boss-ai/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_NODE_ENV=production
```

**Backend (.env):**

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://boss-ai.online
```

## 🚀 Этап 5: Развертывание

### 5.1 Подготовка директорий

```bash
# Создать директорию для приложения
sudo mkdir -p /var/www/boss-ai
sudo chown -R $USER:$USER /var/www/boss-ai

# Создать директории для данных
sudo mkdir -p /var/www/boss-ai/data
sudo mkdir -p /var/www/boss-ai/logs
sudo chown -R $USER:$USER /var/www/boss-ai/data
sudo chown -R $USER:$USER /var/www/boss-ai/logs
```

### 5.2 Установка приложения

```bash
cd /var/www/boss-ai

# Клонирование или загрузка кода
git clone <your-repo> . || # или загрузить архив

# Установка зависимостей
npm run install:all

# Сборка frontend
cd frontend
npm run build
cd ..
```

### 5.3 Настройка PM2

```bash
# Копирование конфигурации PM2
cp deploy/ecosystem.config.js .

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5.4 Активация конфигурации веб-сервера

#### Для Nginx

```bash
# Поддомен
sudo ln -s /etc/nginx/sites-available/app.boss-ai.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Подпапка - добавить в существующий конфиг
sudo nano /etc/nginx/sites-available/boss-ai.online
# Добавить location блоки
sudo nginx -t
sudo systemctl reload nginx
```

#### Для Apache

```bash
# Поддомен
sudo a2ensite app.boss-ai.online
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
sudo systemctl reload apache2

# Подпапка
sudo cp deploy/apache-configs/.htaccess /var/www/html/boss-ai/
sudo systemctl reload apache2
```

## 🔍 Этап 6: Проверка и тестирование

### 6.1 Проверка сервисов

```bash
# Проверка PM2
pm2 status
pm2 logs

# Проверка портов
netstat -tlnp | grep :3000
netstat -tlnp | grep :4200

# Проверка веб-сервера
sudo systemctl status nginx
sudo systemctl status apache2
```

### 6.2 Тестирование доступа

```bash
# Проверка API
curl https://app.boss-ai.online/api/health
curl https://boss-ai.online/boss-ai/api/health

# Проверка frontend
curl -I https://app.boss-ai.online
curl -I https://boss-ai.online/boss-ai/
```

### 6.3 Тестирование Telegram авторизации

1. Открыть приложение в браузере
2. Нажать "Войти через Telegram"
3. Проверить что появляется кнопка Telegram Login Widget
4. Протестировать авторизацию

## 🚨 Устранение неполадок

### Проблема: 502 Bad Gateway

**Причины:**

- Node.js приложение не запущено
- Неправильный порт в прокси
- Файрволл блокирует соединение

**Решение:**

```bash
# Проверить PM2
pm2 status
pm2 logs

# Проверить порты
netstat -tlnp | grep :3000

# Проверить файрволл
sudo ufw status
```

### Проблема: 404 Not Found

**Причины:**

- Неправильный путь к файлам
- Неправильная конфигурация веб-сервера
- Файлы не собраны

**Решение:**

```bash
# Проверить файлы
ls -la /var/www/boss-ai/frontend/dist/

# Пересобрать frontend
cd /var/www/boss-ai/frontend
npm run build
```

### Проблема: CORS ошибки

**Причины:**

- Неправильный CORS_ORIGIN
- Отсутствуют CORS заголовки

**Решение:**

```bash
# Проверить переменные окружения
cat /var/www/boss-ai/backend/main/.env

# Обновить CORS_ORIGIN
nano /var/www/boss-ai/backend/main/.env
```

## 📚 Дополнительные ресурсы

- [Nginx Location Directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
- [Apache mod_proxy](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)
- [PM2 Process Manager](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Boss AI Platform** - Адаптируемся к любой конфигурации сервера! 🚀
