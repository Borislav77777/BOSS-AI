# 🚀 Автоматическое развертывание Boss AI Platform

Полное руководство по использованию автоматизированных скриптов для развертывания Boss AI Platform на любом сервере.

## 📋 Обзор скриптов

### 🔍 `investigate-server.sh`
Автоматическое исследование конфигурации сервера.

**Возможности:**
- Определение типа хостинга (VPS, shared hosting, managed)
- Обнаружение веб-сервера (Nginx/Apache)
- Проверка SSL сертификатов
- Анализ занятых портов
- Определение firewall
- Проверка панели управления

**Использование:**
```bash
# Интерактивный режим
./deploy/investigate-server.sh --interactive

# Автоматический режим
./deploy/investigate-server.sh

# Подробный вывод
./deploy/investigate-server.sh --verbose
```

### 🔒 `setup-ssl.sh`
Автоматическая установка SSL сертификата.

**Возможности:**
- Установка Certbot
- Автоматический выбор метода (standalone/webroot/DNS)
- Настройка веб-сервера
- Настройка автообновления

**Использование:**
```bash
# Автоматический выбор метода
sudo ./deploy/setup-ssl.sh --domain boss-ai.online --email admin@boss-ai.online

# Webroot метод
sudo ./deploy/setup-ssl.sh --domain boss-ai.online --email admin@boss-ai.online --method webroot --webroot /var/www/html

# DNS challenge
sudo ./deploy/setup-ssl.sh --domain boss-ai.online --email admin@boss-ai.online --method dns --dns-provider cloudflare
```

### 🚀 `master-deploy.sh`
Мастер-скрипт полного развертывания.

**Возможности:**
- Полная автоматизация от исследования до запуска
- Интерактивный и автоматический режимы
- Dry-run для предпросмотра
- Настройка всех компонентов

**Использование:**
```bash
# Интерактивный режим
sudo ./deploy/master-deploy.sh --interactive

# Автоматический режим
sudo ./deploy/master-deploy.sh --auto --domain boss-ai.online --email admin@boss-ai.online

# Dry-run
sudo ./deploy/master-deploy.sh --dry-run --domain boss-ai.online --email admin@boss-ai.online
```

### 🔧 `generate-configs.sh`
Генерация конфигураций из шаблонов.

**Возможности:**
- Создание конфигураций Nginx/Apache
- Генерация .env файлов
- Создание PM2 конфигурации
- Инструкции по установке

**Использование:**
```bash
# Nginx поддомен
./deploy/generate-configs.sh --web-server nginx --domain boss-ai.online --app-path /var/www/boss-ai

# Apache подпапка
./deploy/generate-configs.sh --web-server apache2 --domain boss-ai.online --app-path /var/www/boss-ai
```

### 💾 `backup.sh`
Создание бэкапа системы.

**Возможности:**
- Бэкап SSL сертификатов
- Бэкап конфигураций веб-сервера
- Бэкап приложения
- Системная информация

**Использование:**
```bash
# Полный бэкап
sudo ./deploy/backup.sh --domain boss-ai.online

# Бэкап без SSL
sudo ./deploy/backup.sh --domain boss-ai.online --no-ssl

# Бэкап без сжатия
sudo ./deploy/backup.sh --domain boss-ai.online --no-compress
```

### 🔄 `rollback.sh`
Откат изменений из бэкапа.

**Возможности:**
- Восстановление SSL сертификатов
- Восстановление конфигураций
- Восстановление приложения
- Проверка работоспособности

**Использование:**
```bash
# Полное восстановление
sudo ./deploy/rollback.sh --backup-file /var/backups/boss-ai/boss-ai-backup_20241218_143022.tar.gz

# Восстановление без SSL
sudo ./deploy/rollback.sh --backup-file backup.tar.gz --no-ssl

# Dry-run
sudo ./deploy/rollback.sh --backup-file backup.tar.gz --dry-run
```

## 🎯 Сценарии использования

### 1. Полное развертывание на новом сервере

```bash
# 1. Исследование сервера
./deploy/investigate-server.sh --interactive

# 2. Полное развертывание
sudo ./deploy/master-deploy.sh --interactive --domain boss-ai.online --email admin@boss-ai.online
```

### 2. Только SSL для существующего сайта

```bash
# Установка SSL
sudo ./deploy/setup-ssl.sh --domain boss-ai.online --email admin@boss-ai.online --method webroot --webroot /var/www/html
```

### 3. Генерация конфигураций для ручной установки

```bash
# Генерация конфигураций
./deploy/generate-configs.sh --web-server nginx --domain boss-ai.online --app-path /var/www/boss-ai

# Изучение инструкций
cat /tmp/boss-ai-configs/INSTALLATION_INSTRUCTIONS.md
```

### 4. Бэкап и восстановление

```bash
# Создание бэкапа
sudo ./deploy/backup.sh --domain boss-ai.online

# Восстановление из бэкапа
sudo ./deploy/rollback.sh --backup-file /var/backups/boss-ai/boss-ai-backup_*.tar.gz
```

## 📁 Структура шаблонов

```
deploy/templates/
├── nginx-subdomain.conf.template      # Nginx для поддомена
├── nginx-subfolder.conf.template      # Nginx для подпапки
├── apache-subdomain.conf.template     # Apache для поддомена
├── apache-subfolder.htaccess.template # Apache .htaccess
├── backend-main.env.template          # Backend .env
├── frontend.env.template              # Frontend .env
└── ecosystem.config.js.template      # PM2 конфигурация
```

## 🔧 Переменные шаблонов

Все шаблоны поддерживают следующие переменные:

- `{{DOMAIN}}` - Домен приложения
- `{{APP_PATH}}` - Путь к приложению
- `{{FRONTEND_PATH}}` - Путь к собранному frontend
- `{{API_PORT}}` - Порт API Gateway (3000)
- `{{OZON_PORT}}` - Порт Ozon Manager (4200)
- `{{JWT_SECRET}}` - Секретный ключ JWT

## 🚨 Устранение неполадок

### Проблема: Скрипт не запускается

**Решение:**
```bash
chmod +x deploy/*.sh
```

### Проблема: Ошибка прав доступа

**Решение:**
```bash
sudo ./deploy/setup-ssl.sh --domain boss-ai.online --email admin@boss-ai.online
```

### Проблема: SSL сертификат не устанавливается

**Возможные причины:**
- Порт 80/443 заблокирован
- Домен не указывает на сервер
- Firewall блокирует доступ

**Решение:**
```bash
# Проверка портов
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Проверка DNS
nslookup boss-ai.online

# Проверка firewall
sudo ufw status
```

### Проблема: Приложение не запускается

**Решение:**
```bash
# Проверка PM2
pm2 status
pm2 logs

# Проверка портов
netstat -tlnp | grep :3000
netstat -tlnp | grep :4200

# Перезапуск
pm2 restart all
```

## 📊 Мониторинг

### Проверка статуса

```bash
# PM2 процессы
pm2 status

# Веб-сервер
systemctl status nginx
systemctl status apache2

# Порты
netstat -tlnp | grep -E ":(80|443|3000|4200)"
```

### Логи

```bash
# PM2 логи
pm2 logs

# Nginx логи
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Apache логи
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log
```

### Производительность

```bash
# Использование ресурсов
pm2 monit

# Системные ресурсы
htop
df -h
free -h
```

## 🔄 Обновление

### Обновление приложения

```bash
# 1. Бэкап
sudo ./deploy/backup.sh --domain boss-ai.online

# 2. Обновление кода
cd /var/www/boss-ai
git pull origin main

# 3. Обновление зависимостей
npm run install:all

# 4. Пересборка frontend
cd frontend
npm run build

# 5. Перезапуск
pm2 restart all
```

### Обновление SSL сертификата

```bash
# Ручное обновление
sudo certbot renew

# Проверка автообновления
sudo crontab -l | grep certbot
```

## 📚 Дополнительные ресурсы

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Apache Documentation](https://httpd.apache.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Boss AI Platform** - Автоматизируем развертывание! 🚀
