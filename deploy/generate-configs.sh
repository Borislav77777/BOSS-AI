#!/bin/bash

# 🔧 Скрипт генерации конфигураций на основе шаблонов
# Подстановка переменных из результатов исследования

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Параметры по умолчанию
WEB_SERVER=""
DOMAIN=""
APP_PATH="/var/www/boss-ai"
TEMPLATES_DIR=""
OUTPUT_DIR=""
DRY_RUN=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --web-server|-w)
            WEB_SERVER="$2"
            shift 2
            ;;
        --domain|-d)
            DOMAIN="$2"
            shift 2
            ;;
        --app-path|-p)
            APP_PATH="$2"
            shift 2
            ;;
        --templates|-t)
            TEMPLATES_DIR="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --web-server, -w SERVER  Веб-сервер (nginx|apache2)"
            echo "  --domain, -d DOMAIN      Домен для конфигурации"
            echo "  --app-path, -p PATH      Путь к приложению"
            echo "  --templates, -t DIR      Директория с шаблонами"
            echo "  --output, -o DIR         Директория для вывода"
            echo "  --dry-run                Показать что будет сделано"
            echo "  --help, -h               Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Установка путей по умолчанию
if [ -z "$TEMPLATES_DIR" ]; then
    TEMPLATES_DIR="$(dirname "$0")/templates"
fi

if [ -z "$OUTPUT_DIR" ]; then
    OUTPUT_DIR="/tmp/boss-ai-configs"
fi

# Функция для замены переменных в шаблоне
replace_variables() {
    local template="$1"
    local output="$2"

    log "Генерация конфигурации: $output"

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: cp $template $output"
        return 0
    fi

    # Копирование шаблона
    cp "$template" "$output"

    # Замена переменных
    sed -i "s|{{DOMAIN}}|$DOMAIN|g" "$output"
    sed -i "s|{{APP_PATH}}|$APP_PATH|g" "$output"
    sed -i "s|{{FRONTEND_PATH}}|$APP_PATH/frontend/dist|g" "$output"
    sed -i "s|{{API_PORT}}|3000|g" "$output"
    sed -i "s|{{OZON_PORT}}|4200|g" "$output"

    success "Конфигурация создана: $output"
}

# Функция для генерации Nginx конфигурации
generate_nginx_config() {
    log "Генерация Nginx конфигурации..."

    local nginx_dir="$OUTPUT_DIR/nginx"
    mkdir -p "$nginx_dir"

    # Поддомен конфигурация
    if [ -f "$TEMPLATES_DIR/nginx-subdomain.conf.template" ]; then
        replace_variables "$TEMPLATES_DIR/nginx-subdomain.conf.template" "$nginx_dir/app.$DOMAIN.conf"
    fi

    # Подпапка конфигурация
    if [ -f "$TEMPLATES_DIR/nginx-subfolder.conf.template" ]; then
        replace_variables "$TEMPLATES_DIR/nginx-subfolder.conf.template" "$nginx_dir/$DOMAIN-location-blocks.conf"
    fi

    success "Nginx конфигурации созданы в $nginx_dir"
}

# Функция для генерации Apache конфигурации
generate_apache_config() {
    log "Генерация Apache конфигурации..."

    local apache_dir="$OUTPUT_DIR/apache"
    mkdir -p "$apache_dir"

    # Поддомен конфигурация
    if [ -f "$TEMPLATES_DIR/apache-subdomain.conf.template" ]; then
        replace_variables "$TEMPLATES_DIR/apache-subdomain.conf.template" "$apache_dir/app.$DOMAIN.conf"
    fi

    # Подпапка .htaccess
    if [ -f "$TEMPLATES_DIR/apache-subfolder.htaccess.template" ]; then
        replace_variables "$TEMPLATES_DIR/apache-subfolder.htaccess.template" "$apache_dir/.htaccess"
    fi

    success "Apache конфигурации созданы в $apache_dir"
}

# Функция для генерации .env файлов
generate_env_files() {
    log "Генерация .env файлов..."

    local env_dir="$OUTPUT_DIR/env"
    mkdir -p "$env_dir"

    # Backend main .env
    if [ -f "$TEMPLATES_DIR/backend-main.env.template" ]; then
        replace_variables "$TEMPLATES_DIR/backend-main.env.template" "$env_dir/backend-main.env"
    else
        # Создание базового .env для backend/main
        cat > "$env_dir/backend-main.env" << EOF
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
OZON_MANAGER_URL=http://localhost:4200
AI_SERVICES_URL=http://localhost:5000
EOF
    fi

    # Frontend .env
    if [ -f "$TEMPLATES_DIR/frontend.env.template" ]; then
        replace_variables "$TEMPLATES_DIR/frontend.env.template" "$env_dir/frontend.env"
    else
        # Создание базового .env для frontend
        cat > "$env_dir/frontend.env" << EOF
VITE_API_BASE_URL=https://$DOMAIN/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_NODE_ENV=production
VITE_DOMAIN=$DOMAIN
EOF
    fi

    # Backend ozon-manager .env
    cat > "$env_dir/backend-ozon-manager.env" << EOF
NODE_ENV=production
PORT=4200
API_GATEWAY_URL=http://localhost:3000
OZON_CLIENT_ID=
OZON_API_KEY=
EOF

    success ".env файлы созданы в $env_dir"
}

# Функция для генерации PM2 конфигурации
generate_pm2_config() {
    log "Генерация PM2 конфигурации..."

    if [ -f "$TEMPLATES_DIR/ecosystem.config.js.template" ]; then
        replace_variables "$TEMPLATES_DIR/ecosystem.config.js.template" "$OUTPUT_DIR/ecosystem.config.js"
    else
        # Создание базовой PM2 конфигурации
        cat > "$OUTPUT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [
    {
      name: 'boss-ai-api-gateway',
      script: './backend/main/src/index.js',
      cwd: '$APP_PATH',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        CORS_ORIGIN: 'https://$DOMAIN'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2/api-gateway-error.log',
      out_file: './logs/pm2/api-gateway-out.log',
      log_file: './logs/pm2/api-gateway.log'
    },
    {
      name: 'boss-ai-ozon-manager',
      script: './backend/ozon-manager/src/index.js',
      cwd: '$APP_PATH',
      env: {
        NODE_ENV: 'production',
        PORT: 4200,
        API_GATEWAY_URL: 'http://localhost:3000'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2/ozon-manager-error.log',
      out_file: './logs/pm2/ozon-manager-out.log',
      log_file: './logs/pm2/ozon-manager.log'
    }
  ]
};
EOF
    fi

    success "PM2 конфигурация создана: $OUTPUT_DIR/ecosystem.config.js"
}

# Функция для создания инструкций по установке
create_installation_instructions() {
    log "Создание инструкций по установке..."

    local instructions_file="$OUTPUT_DIR/INSTALLATION_INSTRUCTIONS.md"

    cat > "$instructions_file" << EOF
# Инструкции по установке конфигураций

## Домен: $DOMAIN
## Путь приложения: $APP_PATH

## 1. Установка .env файлов

\`\`\`bash
# Backend main
cp $OUTPUT_DIR/env/backend-main.env $APP_PATH/backend/main/.env

# Backend ozon-manager
cp $OUTPUT_DIR/env/backend-ozon-manager.env $APP_PATH/backend/ozon-manager/.env

# Frontend
cp $OUTPUT_DIR/env/frontend.env $APP_PATH/frontend/.env
\`\`\`

## 2. Установка PM2 конфигурации

\`\`\`bash
cp $OUTPUT_DIR/ecosystem.config.js $APP_PATH/
\`\`\`

## 3. Настройка веб-сервера

EOF

    if [ "$WEB_SERVER" = "nginx" ]; then
        cat >> "$instructions_file" << EOF
### Nginx

\`\`\`bash
# Поддомен (рекомендуется)
sudo cp $OUTPUT_DIR/nginx/app.$DOMAIN.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/app.$DOMAIN.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Подпапка
sudo nano /etc/nginx/sites-available/$DOMAIN
# Добавить содержимое из $OUTPUT_DIR/nginx/$DOMAIN-location-blocks.conf
sudo nginx -t
sudo systemctl reload nginx
\`\`\`
EOF
    elif [ "$WEB_SERVER" = "apache2" ]; then
        cat >> "$instructions_file" << EOF
### Apache

\`\`\`bash
# Поддомен (рекомендуется)
sudo cp $OUTPUT_DIR/apache/app.$DOMAIN.conf /etc/apache2/sites-available/
sudo a2ensite app.$DOMAIN
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
sudo systemctl reload apache2

# Подпапка
sudo cp $OUTPUT_DIR/apache/.htaccess /var/www/html/boss-ai/
sudo systemctl reload apache2
\`\`\`
EOF
    fi

    cat >> "$instructions_file" << EOF

## 4. Запуск приложения

\`\`\`bash
cd $APP_PATH
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

## 5. Проверка

\`\`\`bash
# Проверка PM2
pm2 status

# Проверка портов
netstat -tlnp | grep :3000
netstat -tlnp | grep :4200

# Проверка API
curl http://localhost:3000/api/health
\`\`\`

## 6. DNS настройка

Для поддомена добавьте A-запись:
\`app.$DOMAIN → $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')\`

EOF

    success "Инструкции созданы: $instructions_file"
}

# Основная функция
main() {
    log "🔧 Генерация конфигураций для Boss AI Platform"

    # Проверка обязательных параметров
    if [ -z "$WEB_SERVER" ]; then
        error "Веб-сервер не указан. Используйте --web-server"
        exit 1
    fi

    if [ -z "$DOMAIN" ]; then
        error "Домен не указан. Используйте --domain"
        exit 1
    fi

    log "Параметры генерации:"
    log "  Веб-сервер: $WEB_SERVER"
    log "  Домен: $DOMAIN"
    log "  Путь приложения: $APP_PATH"
    log "  Шаблоны: $TEMPLATES_DIR"
    log "  Вывод: $OUTPUT_DIR"
    log "  Dry run: $DRY_RUN"

    # Создание директории вывода
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$OUTPUT_DIR"
    fi

    # Генерация конфигураций
    generate_env_files
    generate_pm2_config

    if [ "$WEB_SERVER" = "nginx" ]; then
        generate_nginx_config
    elif [ "$WEB_SERVER" = "apache2" ]; then
        generate_apache_config
    fi

    create_installation_instructions

    success "🎉 Конфигурации сгенерированы в $OUTPUT_DIR"

    log "Следующие шаги:"
    log "1. Изучите инструкции: $OUTPUT_DIR/INSTALLATION_INSTRUCTIONS.md"
    log "2. Скопируйте конфигурации в соответствующие места"
    log "3. Перезапустите веб-сервер"
    log "4. Запустите приложение через PM2"
}

# Запуск
main "$@"
