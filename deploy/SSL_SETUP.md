# 🔒 Настройка SSL сертификата для boss-ai.online

Инструкция по установке и настройке SSL сертификата Let's Encrypt на VPS.

## 📋 Предварительные требования

- VPS с Ubuntu/Debian
- Домен boss-ai.online указывает на IP сервера (217.12.38.90)
- Nginx установлен и запущен
- SSH доступ к серверу

## 🚀 Установка SSL сертификата

### Шаг 1: Установка Certbot

```bash
# Обновление пакетов
sudo apt update

# Установка Certbot и плагина для Nginx
sudo apt install certbot python3-certbot-nginx

# Проверка установки
certbot --version
```

### Шаг 2: Получение SSL сертификата

```bash
# Получение сертификата для основного домена и www
sudo certbot --nginx -d boss-ai.online -d www.boss-ai.online

# Следуйте инструкциям:
# 1. Введите email для уведомлений
# 2. Примите условия использования (A)
# 3. Выберите, делиться ли email с EFF (Y/N)
# 4. Certbot автоматически настроит Nginx
```

### Шаг 3: Проверка установки

```bash
# Проверка статуса сертификата
sudo certbot certificates

# Тест автообновления
sudo certbot renew --dry-run

# Проверка SSL
curl -I https://boss-ai.online
```

## ⚙️ Настройка автообновления

### Автоматическое обновление

```bash
# Проверка cron задачи (должна создаться автоматически)
sudo crontab -l

# Если не создалась, добавьте вручную:
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Тестирование автообновления

```bash
# Проверка что сертификат обновится
sudo certbot renew --dry-run

# Принудительное обновление (если нужно)
sudo certbot renew --force-renewal
```

## 🔧 Настройка Nginx для HTTPS

### Базовая конфигурация

Создайте файл `/etc/nginx/sites-available/boss-ai.online`:

```nginx
# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name boss-ai.online www.boss-ai.online;
    return 301 https://$server_name$request_uri;
}

# HTTPS конфигурация
server {
    listen 443 ssl http2;
    server_name boss-ai.online www.boss-ai.online;

    # SSL сертификаты (автоматически настроены Certbot)
    ssl_certificate /etc/letsencrypt/live/boss-ai.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boss-ai.online/privkey.pem;

    # SSL настройки безопасности
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS заголовок
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React приложение)
    location / {
        root /var/www/boss-ai/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Gateway (порт 3000)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket для Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket специфичные настройки
        proxy_buffering off;
        proxy_cache off;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Активация конфигурации

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/boss-ai.online /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl reload nginx
```

## 🔍 Проверка SSL

### Онлайн проверка

1. Откройте https://www.ssllabs.com/ssltest/
2. Введите `boss-ai.online`
3. Дождитесь результатов
4. Оценка должна быть A или A+

### Локальная проверка

```bash
# Проверка SSL сертификата
openssl s_client -connect boss-ai.online:443 -servername boss-ai.online

# Проверка цепочки сертификатов
curl -I https://boss-ai.online

# Проверка редиректа с HTTP на HTTPS
curl -I http://boss-ai.online
```

## 🚨 Устранение неполадок

### Ошибка "certbot: command not found"

```bash
# Переустановка Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Ошибка "Failed to connect to boss-ai.online"

**Проверьте:**
1. DNS записи указывают на правильный IP
2. Файрволл не блокирует порты 80 и 443
3. Nginx запущен и слушает порты

```bash
# Проверка DNS
nslookup boss-ai.online

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Проверка Nginx
sudo systemctl status nginx
```

### Ошибка "SSL certificate problem"

```bash
# Проверка сертификата
sudo certbot certificates

# Принудительное обновление
sudo certbot renew --force-renewal

# Перезапуск Nginx
sudo systemctl reload nginx
```

### Проблемы с автообновлением

```bash
# Проверка cron
sudo crontab -l

# Ручное обновление
sudo certbot renew

# Логи автообновления
sudo tail -f /var/log/cron
```

## 📊 Мониторинг SSL

### Скрипт проверки SSL

Создайте скрипт `/usr/local/bin/ssl-check.sh`:

```bash
#!/bin/bash

DOMAIN="boss-ai.online"
EMAIL="your-email@example.com"

# Проверка срока действия сертификата
DAYS_LEFT=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
CURRENT_DATE=$(date +%s)
DAYS_DIFF=$(( ($DAYS_LEFT - $CURRENT_DATE) / 86400 ))

if [ $DAYS_DIFF -lt 30 ]; then
    echo "WARNING: SSL certificate expires in $DAYS_DIFF days"
    # Отправка уведомления (если настроено)
fi

echo "SSL certificate is valid for $DAYS_DIFF days"
```

```bash
# Сделать скрипт исполняемым
sudo chmod +x /usr/local/bin/ssl-check.sh

# Добавить в cron для ежедневной проверки
echo "0 9 * * * /usr/local/bin/ssl-check.sh" | sudo crontab -
```

## 🎯 Чеклист настройки SSL

- [ ] Certbot установлен
- [ ] SSL сертификат получен для boss-ai.online и www.boss-ai.online
- [ ] Nginx настроен для HTTPS
- [ ] HTTP редиректит на HTTPS
- [ ] Автообновление настроено
- [ ] SSL тест пройден (оценка A+)
- [ ] Сайт доступен по https://boss-ai.online
- [ ] Telegram Login Widget работает

## 📚 Дополнительные ресурсы

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Boss AI Platform** - Безопасная авторизация через Telegram! 🔐
