# Ozon Manager - Инструкции по деплою

Полное руководство по развертыванию Ozon Manager на VPS сервере.

## 🚀 Быстрый деплой

### 1. Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PM2 для управления процессами
sudo npm install -g pm2

# Устанавливаем nginx
sudo apt install nginx -y

# Устанавливаем certbot для SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Настройка проекта

```bash
# Клонируем проект
git clone <your-repo-url> /var/www/ozon-manager
cd /var/www/ozon-manager/Ozo_Api/backend

# Устанавливаем зависимости
npm install

# Создаем .env файл
cp env.example .env
nano .env
```

### 3. Конфигурация .env

```env
PORT=3001
NODE_ENV=production
DB_PATH=/var/www/ozon-manager/data/ozon_manager.db
LOG_LEVEL=info
LOG_FILE=/var/www/ozon-manager/logs/ozon_manager.log
CORS_ORIGIN=https://yourdomain.com
OZON_API_BASE_URL=https://api-seller.ozon.ru
OZON_API_TIMEOUT=30000
OZON_API_RATE_LIMIT=50
SCHEDULER_ENABLED=true
SCHEDULER_TIMEZONE=Europe/Moscow
API_TOKEN=your-secure-token-here
```

### 4. Создание необходимых папок

```bash
sudo mkdir -p /var/www/ozon-manager/data
sudo mkdir -p /var/www/ozon-manager/logs
sudo chown -R $USER:$USER /var/www/ozon-manager
```

### 5. Сборка и запуск

```bash
# Собираем проект
npm run build

# Создаем PM2 конфигурацию
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ozon-manager-api',
    script: 'dist/index.js',
    cwd: '/var/www/ozon-manager/Ozo_Api/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/www/ozon-manager/logs/pm2.log',
    out_file: '/var/www/ozon-manager/logs/pm2-out.log',
    error_file: '/var/www/ozon-manager/logs/pm2-error.log',
    time: true
  }]
};
EOF

# Запускаем через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Настройка Nginx

```bash
# Создаем конфигурацию Nginx
sudo nano /etc/nginx/sites-available/ozon-manager
```

Содержимое файла:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/ozon-manager/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Активируем сайт
sudo ln -s /etc/nginx/sites-available/ozon-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Настройка SSL

```bash
# Получаем SSL сертификат
sudo certbot --nginx -d yourdomain.com

# Проверяем автообновление
sudo certbot renew --dry-run
```

### 8. Настройка файрвола

```bash
# Настраиваем UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🔧 Продвинутая настройка

### Мониторинг

```bash
# Устанавливаем мониторинг
sudo npm install -g pm2-logrotate

# Настраиваем ротацию логов
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Автоматические бэкапы

```bash
# Создаем скрипт бэкапа
cat > /var/www/ozon-manager/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ozon-manager"
mkdir -p $BACKUP_DIR

# Бэкап базы данных
cp /var/www/ozon-manager/data/ozon_manager.db $BACKUP_DIR/ozon_manager_$DATE.db

# Бэкап конфигурации
cp /var/www/ozon-manager/Ozo_Api/backend/.env $BACKUP_DIR/env_$DATE

# Очистка старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "env_*" -mtime +30 -delete
EOF

chmod +x /var/www/ozon-manager/backup.sh

# Добавляем в crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/ozon-manager/backup.sh") | crontab -
```

### Обновление системы

```bash
# Создаем скрипт обновления
cat > /var/www/ozon-manager/update.sh << 'EOF'
#!/bin/bash
cd /var/www/ozon-manager

# Останавливаем сервис
pm2 stop ozon-manager-api

# Обновляем код
git pull origin main

# Устанавливаем зависимости
cd Ozo_Api/backend
npm install

# Собираем проект
npm run build

# Запускаем сервис
pm2 start ozon-manager-api

# Проверяем статус
pm2 status
EOF

chmod +x /var/www/ozon-manager/update.sh
```

## 🐳 Docker деплой

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  ozon-manager-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ozon-manager-api
    restart: unless-stopped
```

### Запуск Docker

```bash
docker-compose up -d
```

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Логи приложения
pm2 logs ozon-manager-api

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи системы
sudo journalctl -u nginx -f
```

### Мониторинг ресурсов

```bash
# Статус PM2
pm2 status
pm2 monit

# Использование ресурсов
htop
df -h
free -h
```

## 🔒 Безопасность

### Настройка безопасности

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Настраиваем fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Настраиваем автоматические обновления
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Резервное копирование

```bash
# Создаем полный бэкап
tar -czf ozon-manager-backup-$(date +%Y%m%d).tar.gz \
  /var/www/ozon-manager \
  /etc/nginx/sites-available/ozon-manager \
  /etc/nginx/sites-enabled/ozon-manager
```

## 🚨 Устранение неполадок

### Проверка статуса

```bash
# Статус сервисов
pm2 status
sudo systemctl status nginx

# Проверка портов
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
```

### Перезапуск сервисов

```bash
# Перезапуск API
pm2 restart ozon-manager-api

# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск всех сервисов
pm2 restart all
```

### Проверка логов

```bash
# Логи ошибок
pm2 logs ozon-manager-api --err

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте статус всех сервисов
2. Просмотрите логи на наличие ошибок
3. Убедитесь что все порты открыты
4. Проверьте конфигурацию Nginx
5. Убедитесь что SSL сертификат действителен

## 🔄 Обновления

### Автоматическое обновление

```bash
# Создаем задачу в crontab
(crontab -l 2>/dev/null; echo "0 3 * * 0 /var/www/ozon-manager/update.sh") | crontab -
```

### Ручное обновление

```bash
cd /var/www/ozon-manager
./update.sh
```

## 📈 Масштабирование

### Горизонтальное масштабирование

```bash
# Запуск нескольких инстансов
pm2 start ecosystem.config.js --instances 4
```

### Настройка балансировщика

```nginx
upstream ozon_manager {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location /api/ {
        proxy_pass http://ozon_manager;
    }
}
```
