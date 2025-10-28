#!/bin/bash

# 🚀 Мастер-скрипт полного развертывания Boss AI Platform
# Режимы: interactive, auto, dry-run
# Полная автоматизация от исследования до запуска

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Параметры по умолчанию
MODE="interactive"
DOMAIN=""
EMAIL=""
APP_PATH="/var/www/boss-ai"
SKIP_SSL=false
SKIP_INVESTIGATION=false
DRY_RUN=false
VERBOSE=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode|-m)
            MODE="$2"
            shift 2
            ;;
        --domain|-d)
            DOMAIN="$2"
            shift 2
            ;;
        --email|-e)
            EMAIL="$2"
            shift 2
            ;;
        --path|-p)
            APP_PATH="$2"
            shift 2
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        --skip-investigation)
            SKIP_INVESTIGATION=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --mode, -m MODE         Режим работы (interactive|auto|dry-run)"
            echo "  --domain, -d DOMAIN     Домен для приложения"
            echo "  --email, -e EMAIL       Email для SSL сертификата"
            echo "  --path, -p PATH         Путь для установки приложения"
            echo "  --skip-ssl              Пропустить установку SSL"
            echo "  --skip-investigation    Пропустить исследование сервера"
            echo "  --dry-run               Показать что будет сделано без выполнения"
            echo "  --verbose, -v           Подробный вывод"
            echo "  --help, -h              Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Функция для интерактивного ввода
ask_question() {
    local question="$1"
    local default="$2"
    local answer

    if [ "$MODE" = "interactive" ]; then
        if [ -n "$default" ]; then
            read -p "$question [$default]: " answer
            echo "${answer:-$default}"
        else
            read -p "$question: " answer
            echo "$answer"
        fi
    else
        echo "$default"
    fi
}

# Функция для подтверждения
confirm() {
    local question="$1"
    local default="$2"

    if [ "$MODE" = "interactive" ]; then
        if [ -n "$default" ]; then
            read -p "$question [y/N]: " answer
            case "${answer:-$default}" in
                [Yy]|[Yy][Ee][Ss]) return 0 ;;
                *) return 1 ;;
            esac
        else
            read -p "$question [y/N]: " answer
            case "$answer" in
                [Yy]|[Yy][Ee][Ss]) return 0 ;;
                *) return 1 ;;
            esac
        fi
    else
        return 0
    fi
}

# Функция для выполнения команды
run_command() {
    local cmd="$1"
    local description="$2"

    if [ -n "$description" ]; then
        log "$description"
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: $cmd"
        return 0
    fi

    if [ "$VERBOSE" = true ]; then
        eval "$cmd"
    else
        eval "$cmd" > /dev/null 2>&1
    fi
}

# Функция для исследования сервера
investigate_server() {
    log "🔍 Исследование сервера..."

    local script_dir="$(dirname "$0")"
    local investigate_script="$script_dir/investigate-server.sh"

    if [ ! -f "$investigate_script" ]; then
        error "Скрипт исследования не найден: $investigate_script"
        exit 1
    fi

    if [ "$MODE" = "interactive" ]; then
        run_command "bash $investigate_script --interactive" "Запуск исследования сервера"
    else
        run_command "bash $investigate_script" "Запуск исследования сервера"
    fi

    success "Исследование сервера завершено"
}

# Функция для установки SSL
setup_ssl() {
    if [ "$SKIP_SSL" = true ]; then
        log "Пропуск установки SSL"
        return 0
    fi

    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        warn "Домен или email не указаны, пропускаем SSL"
        return 0
    fi

    log "🔒 Установка SSL сертификата для $DOMAIN..."

    local script_dir="$(dirname "$0")"
    local ssl_script="$script_dir/setup-ssl.sh"

    if [ ! -f "$ssl_script" ]; then
        error "Скрипт SSL не найден: $ssl_script"
        exit 1
    fi

    local ssl_cmd="bash $ssl_script --domain $DOMAIN --email $EMAIL"

    if [ "$DRY_RUN" = true ]; then
        ssl_cmd="$ssl_cmd --dry-run"
    fi

    run_command "$ssl_cmd" "Установка SSL сертификата"

    success "SSL сертификат настроен"
}

# Функция для создания директорий
create_directories() {
    log "📁 Создание директорий..."

    run_command "mkdir -p $APP_PATH" "Создание директории приложения"
    run_command "mkdir -p $APP_PATH/data" "Создание директории данных"
    run_command "mkdir -p $APP_PATH/logs" "Создание директории логов"
    run_command "mkdir -p $APP_PATH/backups" "Создание директории бэкапов"

    success "Директории созданы"
}

# Функция для установки зависимостей
install_dependencies() {
    log "📦 Установка системных зависимостей..."

    # Node.js
    if ! command -v node &> /dev/null; then
        log "Установка Node.js..."
        if [ -f /etc/debian_version ]; then
            run_command "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" "Добавление NodeSource репозитория"
            run_command "apt-get install -y nodejs" "Установка Node.js"
        elif [ -f /etc/redhat-release ]; then
            run_command "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -" "Добавление NodeSource репозитория"
            run_command "yum install -y nodejs npm" "Установка Node.js"
        else
            warn "Автоматическая установка Node.js не поддерживается для этого дистрибутива"
        fi
    else
        success "Node.js уже установлен"
    fi

    # PM2
    if ! command -v pm2 &> /dev/null; then
        log "Установка PM2..."
        run_command "npm install -g pm2" "Установка PM2"
    else
        success "PM2 уже установлен"
    fi

    success "Зависимости установлены"
}

# Функция для копирования приложения
copy_application() {
    log "📋 Копирование приложения..."

    local current_dir="$(pwd)"
    local script_dir="$(dirname "$0")"
    local project_root="$(dirname "$script_dir")"

    if [ ! -d "$project_root" ]; then
        error "Корневая директория проекта не найдена: $project_root"
        exit 1
    fi

    run_command "cp -r $project_root/* $APP_PATH/" "Копирование файлов приложения"

    success "Приложение скопировано"
}

# Функция для установки зависимостей приложения
install_app_dependencies() {
    log "📦 Установка зависимостей приложения..."

    cd "$APP_PATH"

    # Backend main
    if [ -d "backend/main" ]; then
        log "Установка зависимостей backend/main..."
        cd backend/main
        run_command "npm install" "Установка зависимостей backend/main"
        cd "$APP_PATH"
    fi

    # Backend ozon-manager
    if [ -d "backend/ozon-manager" ]; then
        log "Установка зависимостей backend/ozon-manager..."
        cd backend/ozon-manager
        run_command "npm install" "Установка зависимостей backend/ozon-manager"
        cd "$APP_PATH"
    fi

    # Frontend
    if [ -d "frontend" ]; then
        log "Установка зависимостей frontend..."
        cd frontend
        run_command "npm install" "Установка зависимостей frontend"
        cd "$APP_PATH"
    fi

    success "Зависимости приложения установлены"
}

# Функция для сборки frontend
build_frontend() {
    log "🏗️ Сборка frontend..."

    cd "$APP_PATH/frontend"

    # Создание .env файла
    if [ ! -f ".env" ]; then
        log "Создание .env файла для frontend..."
        cat > .env << EOF
VITE_API_BASE_URL=https://$DOMAIN/api
VITE_TELEGRAM_BOT_USERNAME=OzonBossAi_bot
VITE_NODE_ENV=production
EOF
    fi

    run_command "npm run build" "Сборка frontend"

    cd "$APP_PATH"
    success "Frontend собран"
}

# Функция для настройки переменных окружения
setup_environment() {
    log "⚙️ Настройка переменных окружения..."

    # Backend main .env
    if [ -d "$APP_PATH/backend/main" ]; then
        log "Настройка .env для backend/main..."
        cat > "$APP_PATH/backend/main/.env" << EOF
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
EOF
    fi

    # Backend ozon-manager .env
    if [ -d "$APP_PATH/backend/ozon-manager" ]; then
        log "Настройка .env для backend/ozon-manager..."
        cat > "$APP_PATH/backend/ozon-manager/.env" << EOF
NODE_ENV=production
PORT=4200
API_GATEWAY_URL=http://localhost:3000
EOF
    fi

    success "Переменные окружения настроены"
}

# Функция для настройки PM2
setup_pm2() {
    log "🔄 Настройка PM2..."

    cd "$APP_PATH"

    # Копирование конфигурации PM2
    if [ -f "deploy/ecosystem.config.js" ]; then
        run_command "cp deploy/ecosystem.config.js ." "Копирование конфигурации PM2"
    fi

    # Создание директорий для логов
    run_command "mkdir -p logs/pm2" "Создание директории логов PM2"

    success "PM2 настроен"
}

# Функция для запуска приложения
start_application() {
    log "🚀 Запуск приложения..."

    cd "$APP_PATH"

    # Остановка существующих процессов
    run_command "pm2 stop all" "Остановка существующих процессов" || true

    # Запуск приложения
    if [ -f "ecosystem.config.js" ]; then
        run_command "pm2 start ecosystem.config.js" "Запуск приложения через PM2"
    else
        # Ручной запуск
        run_command "pm2 start backend/main/src/index.js --name boss-ai-api-gateway" "Запуск API Gateway"
        run_command "pm2 start backend/ozon-manager/src/index.js --name boss-ai-ozon-manager" "Запуск Ozon Manager"
    fi

    # Сохранение конфигурации PM2
    run_command "pm2 save" "Сохранение конфигурации PM2"

    # Настройка автозапуска
    run_command "pm2 startup" "Настройка автозапуска PM2"

    success "Приложение запущено"
}

# Функция для настройки веб-сервера
configure_web_server() {
    log "🌐 Настройка веб-сервера..."

    # Определение веб-сервера
    local web_server=""
    if pgrep nginx > /dev/null; then
        web_server="nginx"
    elif pgrep apache2 > /dev/null; then
        web_server="apache2"
    fi

    if [ -z "$web_server" ]; then
        warn "Веб-сервер не обнаружен, пропускаем настройку"
        return 0
    fi

    log "Обнаружен веб-сервер: $web_server"

    # Генерация конфигурации
    local script_dir="$(dirname "$0")"
    local generate_script="$script_dir/generate-configs.sh"

    if [ -f "$generate_script" ]; then
        run_command "bash $generate_script --web-server $web_server --domain $DOMAIN --app-path $APP_PATH" "Генерация конфигурации веб-сервера"
    else
        warn "Скрипт генерации конфигурации не найден"
    fi

    success "Веб-сервер настроен"
}

# Функция для проверки работоспособности
verify_deployment() {
    log "✅ Проверка работоспособности..."

    # Проверка PM2
    run_command "pm2 status" "Проверка статуса PM2"

    # Проверка портов
    if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
        success "API Gateway запущен на порту 3000"
    else
        warn "API Gateway не запущен на порту 3000"
    fi

    if netstat -tlnp 2>/dev/null | grep -q ":4200"; then
        success "Ozon Manager запущен на порту 4200"
    else
        warn "Ozon Manager не запущен на порту 4200"
    fi

    # Проверка API
    if command -v curl &> /dev/null; then
        if curl -s "http://localhost:3000/api/health" > /dev/null; then
            success "API Gateway отвечает"
        else
            warn "API Gateway не отвечает"
        fi
    fi

    success "Проверка завершена"
}

# Основная функция
main() {
    log "🚀 Начинаем развертывание Boss AI Platform"

    # Получение параметров в интерактивном режиме
    if [ "$MODE" = "interactive" ]; then
        if [ -z "$DOMAIN" ]; then
            DOMAIN=$(ask_question "Введите домен для приложения" "boss-ai.online")
        fi

        if [ -z "$EMAIL" ] && [ "$SKIP_SSL" = false ]; then
            EMAIL=$(ask_question "Введите email для SSL сертификата" "admin@$DOMAIN")
        fi

        if [ "$APP_PATH" = "/var/www/boss-ai" ]; then
            APP_PATH=$(ask_question "Введите путь для установки" "/var/www/boss-ai")
        fi
    fi

    # Проверка обязательных параметров
    if [ -z "$DOMAIN" ]; then
        error "Домен не указан"
        exit 1
    fi

    log "Параметры развертывания:"
    log "  Домен: $DOMAIN"
    log "  Email: $EMAIL"
    log "  Путь: $APP_PATH"
    log "  Режим: $MODE"
    log "  Dry run: $DRY_RUN"

    # Подтверждение в интерактивном режиме
    if [ "$MODE" = "interactive" ]; then
        if ! confirm "Продолжить развертывание?" "y"; then
            log "Развертывание отменено"
            exit 0
        fi
    fi

    # Этапы развертывания
    if [ "$SKIP_INVESTIGATION" = false ]; then
        investigate_server
    fi

    create_directories
    install_dependencies
    copy_application
    install_app_dependencies
    build_frontend
    setup_environment
    setup_pm2
    start_application

    if [ "$SKIP_SSL" = false ]; then
        setup_ssl
    fi

    configure_web_server
    verify_deployment

    success "🎉 Развертывание Boss AI Platform завершено!"

    log "Информация о развертывании:"
    log "  Домен: $DOMAIN"
    log "  Путь: $APP_PATH"
    log "  PM2: pm2 status"
    log "  Логи: pm2 logs"
    log "  Перезапуск: pm2 restart all"
}

# Запуск
main "$@"
