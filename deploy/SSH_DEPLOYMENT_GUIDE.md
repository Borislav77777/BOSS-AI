# 🚀 Пошаговая инструкция развертывания Boss AI Platform через SSH

Полное руководство для развертывания приложения на сервере boss-ai.online (217.12.38.90) через SSH.

## 📋 Предварительные требования

- SSH доступ к серверу
- Root или sudo права
- Домен boss-ai.online с настроенными DNS записями
- Email для SSL сертификата

## 🔐 Этап 1: Подключение к серверу

### Windows (PowerShell/CMD)
```powershell
# Через домен
ssh user@boss-ai.online

# Через IP
ssh user@217.12.38.90

# С указанием порта (если не стандартный 22)
ssh -p 22 user@boss-ai.online
```

### Использование screen/tmux для стабильности соединения

```bash
# После подключения запустить screen
screen -S boss-ai-deploy

# Или tmux
tmux new -s boss-ai-deploy

# Отключение от сессии: Ctrl+A, D (screen) или Ctrl+B, D (tmux)
# Возврат к сессии: screen -r boss-ai-deploy или tmux attach -t boss-ai-deploy
```

## 📦 Этап 2: Загрузка проекта на сервер

### Вариант A: Через Git (рекомендуется)

```bash
# На сервере
cd /var/www
sudo mkdir -p boss-ai
sudo chown -R $USER:$USER boss-ai
cd boss-ai

# Клонирование репозитория
git clone https://github.com/your-username/boss-ai-platform.git .

# Или если уже клонирован
git pull origin main
```

### Вариант B: Загрузка с локального компьютера через rsync

```powershell
# С локального компьютера (PowerShell)
# Установить rsync для Windows если нужно: https://github.com/cwRsync/cwRsync

rsync -avz -e ssh `
  --exclude 'node_modules' `
  --exclude 'dist' `
  --exclude '.git' `
  --exclude 'logs' `
  C:\Users\BAZA\BossAIPABOTA\ `
  user@boss-ai.online:/var/www/boss-ai/
```

### Вариант C: Через scp

```powershell
# С локального компьютера
scp -r C:\Users\BAZA\BossAIPABOTA user@boss-ai.online:/var/www/boss-ai/

# Исключить ненужные файлы вручную на сервере
ssh user@boss-ai.online
cd /var/www/boss-ai
rm -rf node_modules frontend/node_modules backend/*/node_modules
rm -rf frontend/dist backend/*/dist
```

### Вариант D: Через архив

```powershell
# Локально создать архив
cd C:\Users\BAZA\BossAIPABOTA
tar -czf boss-ai.tar.gz --exclude='node_modules' --exclude='dist' --exclude='.git' .

# Загрузить на сервер
scp boss-ai.tar.gz user@boss-ai.online:/var/www/

# На сервере распаковать
ssh user@boss-ai.online
cd /var/www
sudo mkdir -p boss-ai
sudo chown -R $USER:$USER boss-ai
tar -xzf boss-ai.tar.gz -C boss-ai/
rm boss-ai.tar.gz
```

## 🔍 Этап 3: Исследование сервера

```bash
# Переход в директорию проекта
cd /var/www/boss-ai

# Даем права на выполнение всем скриптам
chmod +x deploy/*.sh

# Запускаем исследование в интерактивном режиме
./deploy/investigate-server.sh --interactive

# Результаты сохранятся в /tmp/boss-ai-investigation/
```

### Изучение результатов исследования

```bash
# Общая информация о системе
cat /tmp/boss-ai-investigation/system-info.txt

# Информация о веб-сервере
cat /tmp/boss-ai-investigation/webserver-info.txt

# Занятые порты
cat /tmp/boss-ai-investigation/occupied_ports.txt

# SSL сертификаты
ls -la /tmp/boss-ai-investigation/ssl_*

# Firewall
cat /tmp/boss-ai-investigation/firewall_status.txt

# JSON отчет для программной обработки
cat /tmp/boss-ai-investigation/investigation-report.json
```

## 💾 Этап 4: Создание бэкапа

**⚠️ КРИТИЧЕСКИ ВАЖНО: Всегда создавайте бэкап перед любыми изменениями!**

```bash
cd /var/www/boss-ai

# Полный бэкап системы
sudo ./deploy/backup.sh --domain boss-ai.online

# Бэкап сохранится в /var/backups/boss-ai/
# Проверяем создание бэкапа
ls -lh /var/backups/boss-ai/

# Запоминаем путь к бэкапу для возможного отката
BACKUP_FILE=$(ls -t /var/backups/boss-ai/*.tar.gz | head -1)
echo "Бэкап создан: $BACKUP_FILE"
```

## 🔒 Этап 5: Установка SSL сертификата

### Автоматическая установка (рекомендуется)

```bash
cd /var/www/boss-ai

# Автоматический выбор метода
sudo ./deploy/setup-ssl.sh \
  --domain boss-ai.online \
  --email admin@boss-ai.online

# Скрипт автоматически:
# 1. Определит веб-сервер
# 2. Выберет оптимальный метод
# 3. Установит Certbot если нужно
# 4. Получит SSL сертификат
# 5. Настроит автообновление
```

### Webroot метод (если сайт уже работает)

```bash
sudo ./deploy/setup-ssl.sh \
  --domain boss-ai.online \
  --email admin@boss-ai.online \
  --method webroot \
  --webroot /var/www/html
```

### Standalone метод (если порт 80 свободен)

```bash
sudo ./deploy/setup-ssl.sh \
  --domain boss-ai.online \
  --email admin@boss-ai.online \
  --method standalone
```

### Проверка установки SSL

```bash
# Список сертификатов
sudo certbot certificates

# Проверка работы SSL
curl -I https://boss-ai.online

# Детальная проверка
openssl s_client -connect boss-ai.online:443 -servername boss-ai.online < /dev/null
```

## 🔧 Этап 6: Генерация конфигураций

```bash
cd /var/www/boss-ai

# Определяем веб-сервер (из результатов исследования)
# Смотрим файл investigation-report.json
cat /tmp/boss-ai-investigation/investigation-report.json | grep web_server

# Для Nginx
./deploy/generate-configs.sh \
  --web-server nginx \
  --domain boss-ai.online \
  --app-path /var/www/boss-ai

# Для Apache
./deploy/generate-configs.sh \
  --web-server apache2 \
  --domain boss-ai.online \
  --app-path /var/www/boss-ai

# Изучаем инструкции по установке
cat /tmp/boss-ai-configs/INSTALLATION_INSTRUCTIONS.md
```

### Просмотр сгенерированных конфигураций

```bash
# Nginx конфигурации
ls -la /tmp/boss-ai-configs/nginx/

# Apache конфигурации
ls -la /tmp/boss-ai-configs/apache/

# .env файлы
ls -la /tmp/boss-ai-configs/env/

# PM2 конфигурация
cat /tmp/boss-ai-configs/ecosystem.config.js
```

## 📦 Этап 7: Установка зависимостей

```bash
cd /var/www/boss-ai

# Проверка наличия Node.js
node --version
npm --version

# Если Node.js не установлен
# Для Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Для CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Установка PM2 глобально
sudo npm install -g pm2

# Установка зависимостей для backend/main
cd backend/main
npm install
cd ../..

# Установка зависимостей для backend/ozon-manager
cd backend/ozon-manager
npm install
cd ../..

# Установка зависимостей для frontend
cd frontend
npm install
cd ..
```

## ⚙️ Этап 8: Настройка переменных окружения

### Backend Main

```bash
# Копирование шаблона
cp /tmp/boss-ai-configs/env/backend-main.env backend/main/.env

# Редактирование
nano backend/main/.env
```

Обязательные переменные для `backend/main/.env`:
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://boss-ai.online
JWT_SECRET=<сгенерированный_секрет>
TELEGRAM_BOT_TOKEN=<ваш_токен_от_BotFather>
TELEGRAM_BOT_USERNAME=OzonBossAi_bot
OZON_MANAGER_URL=http://localhost:4200
```

### Backend Ozon Manager

```bash
# Копирование шаблона
cp /tmp/boss-ai-configs/env/backend-ozon-manager.env backend/ozon-manager/.env

# Редактирование
nano backend/ozon-manager/.env
```

Обязательные переменные для `backend/ozon-manager/.env`:
```env
NODE_ENV=production
PORT=4200
API_GATEWAY_URL=http://localhost:3000
OZON_CLIENT_ID=<ваш_client_id>
OZON_API_KEY=<ваш_api_key>
```

### Frontend

```bash
# Копирование шаблона
cp /tmp/boss-ai-configs/env/frontend.env frontend/.env

# Редактирование
nano frontend/.env
```

Обязательные переменные для `frontend/.env`:
```env
VITE_API_BASE_URL=https://boss-ai.online/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_NODE_ENV=production
VITE_DOMAIN=boss-ai.online
```

### Генерация JWT секрета

```bash
# Генерация случайного секрета
openssl rand -base64 32
```

## 🏗️ Этап 9: Сборка Frontend

```bash
cd /var/www/boss-ai/frontend

# Production сборка
npm run build

# Проверка создания dist/
ls -la dist/
du -sh dist/

# Проверка содержимого
ls -la dist/assets/
```

## 🌐 Этап 10: Настройка веб-сервера

### Вариант A: Nginx - Поддомен (app.boss-ai.online)

```bash
# Копирование конфигурации
sudo cp /tmp/boss-ai-configs/nginx/app.boss-ai.online.conf /etc/nginx/sites-available/

# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/app.boss-ai.online.conf /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx

# Проверка статуса
sudo systemctl status nginx
```

**Не забудьте добавить DNS запись:**
```
A запись: app.boss-ai.online → 217.12.38.90
```

### Вариант B: Nginx - Подпапка (boss-ai.online/app/)

```bash
# Открываем существующий конфиг
sudo nano /etc/nginx/sites-available/boss-ai.online

# Добавляем location блоки из
cat /tmp/boss-ai-configs/nginx/boss-ai.online-location-blocks.conf

# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx
```

### Вариант C: Apache - Поддомен

```bash
# Копирование конфигурации
sudo cp /tmp/boss-ai-configs/apache/app.boss-ai.online.conf /etc/apache2/sites-available/

# Включение необходимых модулей
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Активация сайта
sudo a2ensite app.boss-ai.online

# Проверка конфигурации
sudo apache2ctl configtest

# Перезагрузка Apache
sudo systemctl reload apache2
```

### Вариант D: Apache - Подпапка

```bash
# Создание директории если нужно
sudo mkdir -p /var/www/html/boss-ai

# Копирование .htaccess
sudo cp /tmp/boss-ai-configs/apache/.htaccess /var/www/html/boss-ai/

# Копирование frontend файлов
sudo cp -r /var/www/boss-ai/frontend/dist/* /var/www/html/boss-ai/

# Перезагрузка Apache
sudo systemctl reload apache2
```

## 🔄 Этап 11: Настройка PM2 и запуск

```bash
cd /var/www/boss-ai

# Копирование конфигурации PM2
cp /tmp/boss-ai-configs/ecosystem.config.js .

# Создание директорий для логов
mkdir -p logs/pm2

# Проверка конфигурации
cat ecosystem.config.js

# Запуск приложений
pm2 start ecosystem.config.js

# Проверка статуса
pm2 status

# Просмотр логов
pm2 logs

# Сохранение конфигурации
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup
# Выполните команду, которую покажет PM2

# Пример для systemd:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user
```

### Управление PM2

```bash
# Просмотр всех процессов
pm2 list

# Логи всех процессов
pm2 logs

# Логи конкретного процесса
pm2 logs boss-ai-api-gateway
pm2 logs boss-ai-ozon-manager

# Перезапуск всех
pm2 restart all

# Перезапуск конкретного
pm2 restart boss-ai-api-gateway

# Остановка
pm2 stop all
pm2 stop boss-ai-api-gateway

# Удаление
pm2 delete all
pm2 delete boss-ai-api-gateway

# Мониторинг в реальном времени
pm2 monit
```

## ✅ Этап 12: Проверка работоспособности

### Проверка портов

```bash
# Проверка, что порты слушают
netstat -tlnp | grep :3000  # API Gateway
netstat -tlnp | grep :4200  # Ozon Manager

# Альтернатива
ss -tlnp | grep :3000
ss -tlnp | grep :4200
```

### Проверка API

```bash
# Health check API Gateway
curl http://localhost:3000/api/health

# Health check через домен
curl https://boss-ai.online/api/health

# Подробный вывод
curl -v https://boss-ai.online/api/health
```

### Проверка Frontend

```bash
# HTTP статус
curl -I https://boss-ai.online
curl -I https://app.boss-ai.online  # если поддомен

# Проверка загрузки index.html
curl https://boss-ai.online | grep "<title>"
```

### Проверка SSL

```bash
# Быстрая проверка
curl -I https://boss-ai.online | grep "HTTP"

# Детальная проверка сертификата
openssl s_client -connect boss-ai.online:443 -servername boss-ai.online < /dev/null | grep -A 5 "Certificate"

# Проверка через внешний сервис
curl -I https://boss-ai.online | grep -i "strict-transport"
```

### Проверка логов

```bash
# PM2 логи
pm2 logs --lines 50

# Backend main логи
tail -f /var/www/boss-ai/backend/main/logs/*.log

# Backend ozon-manager логи
tail -f /var/www/boss-ai/backend/ozon-manager/logs/*.log

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Apache логи
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

## 🤖 Этап 13: Настройка Telegram бота

### Через BotFather

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/setdomain`
3. Выберите вашего бота: `@OzonBossAi_bot`
4. Введите домен: `boss-ai.online` (или `app.boss-ai.online`)

### Проверка Telegram авторизации

```bash
# Откройте в браузере
# https://boss-ai.online

# Нажмите кнопку "Войти через Telegram"
# Должен появиться Telegram Login Widget
# Проверьте авторизацию
```

### Обновление переменных (если нужно)

```bash
# Редактирование backend .env
nano /var/www/boss-ai/backend/main/.env

# Убедитесь что есть:
# TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
# TELEGRAM_WEBHOOK_URL=https://boss-ai.online/api/telegram/webhook

# Редактирование frontend .env
nano /var/www/boss-ai/frontend/.env

# VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot

# Перезапуск после изменений
pm2 restart all
```

## 📊 Этап 14: Мониторинг и обслуживание

### Мониторинг в реальном времени

```bash
# PM2 dashboard
pm2 monit

# Системные ресурсы
htop

# Использование диска
df -h

# Использование памяти
free -h

# Сетевые соединения
netstat -an | grep :3000
netstat -an | grep :4200
```

### Ежедневная проверка

```bash
# Статус всех сервисов
pm2 status
sudo systemctl status nginx
sudo systemctl status apache2

# Проверка логов на ошибки
pm2 logs --err --lines 20

# Проверка SSL сертификата
sudo certbot certificates

# Проверка доступности
curl -I https://boss-ai.online
```

### Очистка логов (если накопились)

```bash
# Очистка PM2 логов
pm2 flush

# Ротация логов Nginx/Apache через logrotate
# (обычно настраивается автоматически)

# Ручная очистка старых логов
find /var/log/nginx -name "*.log" -mtime +30 -delete
find /var/log/apache2 -name "*.log" -mtime +30 -delete
```

## 🔄 Этап 15: Обновление приложения

```bash
# 1. Создание бэкапа
sudo ./deploy/backup.sh --domain boss-ai.online

# 2. Обновление кода
cd /var/www/boss-ai
git pull origin main

# 3. Обновление зависимостей backend/main
cd backend/main
npm install
cd ../..

# 4. Обновление зависимостей backend/ozon-manager
cd backend/ozon-manager
npm install
cd ../..

# 5. Обновление зависимостей frontend
cd frontend
npm install
cd ..

# 6. Пересборка frontend
cd frontend
npm run build
cd ..

# 7. Перезапуск PM2
pm2 restart all

# 8. Проверка
pm2 status
pm2 logs --lines 20
curl https://boss-ai.online/api/health
```

## 🚨 Откат при проблемах

```bash
# Если что-то пошло не так
cd /var/www/boss-ai

# Найти последний бэкап
ls -lht /var/backups/boss-ai/

# Откат из бэкапа
sudo ./deploy/rollback.sh --backup-file /var/backups/boss-ai/boss-ai-backup_YYYYMMDD_HHMMSS.tar.gz

# Проверка после отката
pm2 status
sudo systemctl status nginx
curl -I https://boss-ai.online
```

## 💡 Полезные команды SSH

### Работа с screen/tmux

```bash
# Screen
screen -S boss-ai           # Создать сессию
# Ctrl+A, D                 # Отключиться
screen -ls                  # Список сессий
screen -r boss-ai           # Подключиться обратно
screen -X -S boss-ai quit   # Убить сессию

# Tmux
tmux new -s boss-ai         # Создать сессию
# Ctrl+B, D                 # Отключиться
tmux ls                     # Список сессий
tmux attach -t boss-ai      # Подключиться обратно
tmux kill-session -t boss-ai # Убить сессию
```

### Передача файлов

```bash
# Загрузка на сервер
scp local-file.txt user@boss-ai.online:/var/www/boss-ai/

# Скачивание с сервера
scp user@boss-ai.online:/var/www/boss-ai/file.txt ./

# Загрузка директории
scp -r local-dir user@boss-ai.online:/var/www/boss-ai/
```

### Мониторинг ресурсов

```bash
# CPU и память
top
htop

# Дисковое пространство
df -h
du -sh /var/www/boss-ai/*

# Память
free -h

# Процессы Node.js
ps aux | grep node

# Сетевые соединения
netstat -tulpn
ss -tulpn

# Открытые файлы
lsof -i :3000
lsof -i :4200
```

## 🔧 Устранение неполадок

### Приложение не запускается

```bash
# Проверка логов
pm2 logs --err

# Проверка .env файлов
cat backend/main/.env
cat backend/ozon-manager/.env
cat frontend/.env

# Проверка портов
netstat -tlnp | grep -E ":(3000|4200)"

# Перезапуск
pm2 restart all
```

### 502 Bad Gateway

```bash
# Проверка PM2
pm2 status

# Проверка что приложения запущены
curl http://localhost:3000/api/health
curl http://localhost:4200/health

# Проверка Nginx конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL не работает

```bash
# Проверка сертификата
sudo certbot certificates

# Обновление сертификата
sudo certbot renew --force-renewal

# Проверка конфигурации веб-сервера
sudo nginx -t
sudo apache2ctl configtest

# Проверка портов
netstat -tlnp | grep :443
```

### Telegram авторизация не работает

```bash
# Проверка домена в BotFather
# Должен быть boss-ai.online (без https://)

# Проверка переменных
cat backend/main/.env | grep TELEGRAM
cat frontend/.env | grep TELEGRAM

# Проверка в браузере
# F12 → Console → Проверить ошибки

# Перезапуск backend
pm2 restart boss-ai-api-gateway
```

## 📚 Дополнительные ресурсы

- [Документация Nginx](https://nginx.org/en/docs/)
- [Документация Apache](https://httpd.apache.org/docs/)
- [Документация PM2](https://pm2.keymetrics.io/docs/)
- [Документация Certbot](https://certbot.eff.org/docs/)
- [Документация Node.js](https://nodejs.org/docs/)

## ✅ Чеклист финальной проверки

- [ ] SSH подключение работает
- [ ] Проект загружен на сервер
- [ ] Исследование сервера выполнено
- [ ] Бэкап создан
- [ ] SSL сертификат установлен
- [ ] Конфигурации сгенерированы
- [ ] Зависимости установлены
- [ ] .env файлы настроены
- [ ] Frontend собран
- [ ] Веб-сервер настроен
- [ ] PM2 запущен и настроен автозапуск
- [ ] API Gateway отвечает (http://localhost:3000/api/health)
- [ ] Ozon Manager отвечает (http://localhost:4200/health)
- [ ] Frontend доступен (https://boss-ai.online)
- [ ] SSL работает
- [ ] Telegram авторизация работает
- [ ] Мониторинг настроен

---

**Boss AI Platform** - Готовы к production! 🚀
