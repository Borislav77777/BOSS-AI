# 🔐 Настройка Telegram авторизации

Полная инструкция по настройке Telegram Login Widget для Boss AI Platform.

## 📋 Обзор

Telegram Login Widget позволяет пользователям авторизоваться через свой Telegram аккаунт. Требует настройки домена в @BotFather.

## 🏠 Сценарий 1: Localhost (разработка)

### Предварительные требования

- Telegram аккаунт
- Бот создан через @BotFather
- Boss AI Platform запущен локально

### Шаг 1: Настройка домена в @BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/setdomain`
3. Выберите вашего бота: `@OzonBossAi_bot`
4. Введите домен: `localhost` (просто слово, без http://)
5. BotFather ответит: "Success! Domain updated."

### Шаг 2: Проверка переменных окружения

Убедитесь что в `frontend/.env` указаны правильные значения:

```env
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_API_BASE_URL=http://localhost:3000
VITE_DOMAIN=localhost
```

### Шаг 3: Тестирование

1. Перезагрузите страницу в браузере (`Ctrl+Shift+R`)
2. Откройте http://localhost:5173
3. Нажмите кнопку "Войти через Telegram"
4. Должна появиться кнопка Telegram Login Widget
5. Нажмите на неё и авторизуйтесь

### ✅ Ожидаемый результат

- Ошибка "Bot domain invalid" исчезает
- Появляется кнопка Telegram Login Widget
- Авторизация работает корректно

---

## 🌐 Сценарий 2: VPS boss-ai.online (продакшн)

### Предварительные требования

- VPS с доменом boss-ai.online
- SSH доступ к серверу
- Nginx установлен
- Boss AI Platform развернут на VPS

### Шаг 1: Установка SSL сертификата

```bash
# Установка Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d boss-ai.online -d www.boss-ai.online

# Проверка автообновления
sudo certbot renew --dry-run
```

### Шаг 2: Настройка домена в @BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/setdomain`
3. Выберите вашего бота: `@OzonBossAi_bot`
4. Введите домен: `boss-ai.online` (без https://)
5. BotFather ответит: "Success! Domain updated."

### Шаг 3: Настройка переменных окружения на VPS

Создайте/обновите `frontend/.env` на VPS:

```env
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_API_BASE_URL=https://boss-ai.online/api
VITE_DOMAIN=boss-ai.online
VITE_NODE_ENV=production
```

### Шаг 4: Настройка Nginx

Убедитесь что в `/etc/nginx/sites-available/boss-ai.online` настроен HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name boss-ai.online www.boss-ai.online;

    ssl_certificate /etc/letsencrypt/live/boss-ai.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boss-ai.online/privkey.pem;

    # Frontend
    location / {
        root /var/www/boss-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
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
        proxy_cache_bypass $http_upgrade;
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
    }
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name boss-ai.online www.boss-ai.online;
    return 301 https://$server_name$request_uri;
}
```

### Шаг 5: Перезапуск сервисов

```bash
# Перезапуск Nginx
sudo systemctl reload nginx

# Перезапуск Boss AI Platform
pm2 restart all
```

### Шаг 6: Тестирование

1. Откройте https://boss-ai.online
2. Нажмите кнопку "Войти через Telegram"
3. Должна появиться кнопка Telegram Login Widget
4. Нажмите на неё и авторизуйтесь

### ✅ Ожидаемый результат

- Сайт доступен по HTTPS
- Telegram Login Widget работает
- Авторизация проходит успешно
- Нет ошибок в консоли браузера

---

## 🔄 Переключение между окружениями

### Проблема: Один бот = один домен

Telegram бот может быть привязан только к одному домену через `/setdomain`.

### Решение 1: Смена домена в @BotFather

Для переключения между localhost и VPS:

```bash
# Для разработки
/setdomain → @OzonBossAi_bot → localhost

# Для продакшна
/setdomain → @OzonBossAi_bot → boss-ai.online
```

### Решение 2: Два бота (рекомендуется)

Создайте двух ботов:

1. **@OzonBossAi_dev_bot** - для localhost разработки
2. **@OzonBossAi_bot** - для VPS продакшна

**Настройка для разработки:**
```env
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_dev_bot
```

**Настройка для продакшна:**
```env
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
```

---

## 🚨 Устранение неполадок

### Ошибка "Bot domain invalid"

**Причины:**
- Домен не настроен в @BotFather
- Неправильный домен в переменных окружения
- Проблемы с SSL (для продакшна)

**Решение:**
1. Проверьте настройку домена в @BotFather
2. Убедитесь что домен в `.env` совпадает с доменом в @BotFather
3. Для продакшна проверьте SSL сертификат

### Ошибка "This domain is not authorized"

**Причины:**
- Домен не добавлен в @BotFather
- Неправильный формат домена

**Решение:**
1. В @BotFather: `/setdomain` → выберите бота → введите домен
2. Домен должен быть без `http://` и `https://`

### Telegram Widget не загружается

**Причины:**
- Проблемы с интернет-соединением
- Блокировка Telegram в регионе
- Проблемы с SSL сертификатом

**Решение:**
1. Проверьте доступность https://telegram.org
2. Убедитесь что SSL сертификат действителен
3. Проверьте консоль браузера на ошибки

---

## 📚 Дополнительные ресурсы

- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

## 🎯 Быстрый чеклист

### Для localhost:
- [ ] `/setdomain` → `localhost` в @BotFather
- [ ] `VITE_TELEGRAM_BOT_USERNAME` в `.env`
- [ ] Перезагрузка страницы
- [ ] Тест авторизации

### Для VPS:
- [ ] SSL сертификат установлен
- [ ] `/setdomain` → `boss-ai.online` в @BotFather
- [ ] Nginx настроен для HTTPS
- [ ] Переменные окружения обновлены
- [ ] Сервисы перезапущены
- [ ] Тест авторизации

---

**Boss AI Platform** - Ваш AI-помощник для автоматизации бизнеса! 🚀
