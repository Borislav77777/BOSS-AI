#!/bin/bash

# Скрипт установки и настройки Image Processing Service
# Автор: BOSS AI Development Team
# Версия: 1.0.0

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
PROJECT_ROOT="/var/www/boss-ai"
SERVICE_DIR="$PROJECT_ROOT/backend/services/image-processing"
SERVICE_NAME="image-processing"
SERVICE_PORT="3005"
SERVICE_USER="www-data"

# Функция логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Функция проверки прав root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Этот скрипт должен запускаться с правами root"
        log "Используйте: sudo $0"
        exit 1
    fi
}

# Функция проверки зависимостей
check_dependencies() {
    log "Проверка системных зависимостей..."

    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js не установлен"
        log "Установите Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi

    # Проверка npm
    if ! command -v npm &> /dev/null; then
        log_error "npm не установлен"
        exit 1
    fi

    # Проверка Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 не установлен"
        log "Установите Python 3: sudo apt-get install python3 python3-pip"
        exit 1
    fi

    # Проверка pip
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 не установлен"
        log "Установите pip3: sudo apt-get install python3-pip"
        exit 1
    fi

    log_success "Все системные зависимости проверены"
}

# Функция установки Node.js зависимостей
install_node_dependencies() {
    log "Установка Node.js зависимостей..."

    cd "$SERVICE_DIR"

    if [ ! -f "package.json" ]; then
        log_error "package.json не найден в $SERVICE_DIR"
        exit 1
    fi

    npm install --production

    log_success "Node.js зависимости установлены"
}

# Функция установки Python зависимостей
install_python_dependencies() {
    log "Установка Python зависимостей..."

    cd "$SERVICE_DIR"

    if [ ! -f "requirements.txt" ]; then
        log_error "requirements.txt не найден в $SERVICE_DIR"
        exit 1
    fi

    # Создаем виртуальное окружение
    python3 -m venv venv
    source venv/bin/activate

    # Обновляем pip
    pip install --upgrade pip

    # Устанавливаем зависимости
    pip install -r requirements.txt

    log_success "Python зависимости установлены"
}

# Функция создания systemd service
create_systemd_service() {
    log "Создание systemd service..."

    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=BOSS AI Image Processing Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$SERVICE_DIR
Environment=NODE_ENV=production
Environment=PORT=$SERVICE_PORT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

    # Перезагружаем systemd
    systemctl daemon-reload

    log_success "Systemd service создан"
}

# Функция настройки прав доступа
setup_permissions() {
    log "Настройка прав доступа..."

    # Устанавливаем владельца
    chown -R $SERVICE_USER:$SERVICE_USER "$SERVICE_DIR"

    # Устанавливаем права на выполнение
    chmod +x "$SERVICE_DIR/server.js"
    chmod +x "$SERVICE_DIR/rembg_process.py"

    # Создаем директории для загрузок
    mkdir -p "$SERVICE_DIR/uploads"
    mkdir -p "$SERVICE_DIR/public/processed"

    # Устанавливаем права на директории
    chown -R $SERVICE_USER:$SERVICE_USER "$SERVICE_DIR/uploads"
    chown -R $SERVICE_USER:$SERVICE_USER "$SERVICE_DIR/public"

    log_success "Права доступа настроены"
}

# Функция настройки Nginx
setup_nginx() {
    log "Настройка Nginx proxy..."

    # Создаем конфигурацию для микросервиса
    cat > "/etc/nginx/sites-available/image-processing" << EOF
server {
    listen 80;
    server_name localhost;

    location /api/ {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /processed/ {
        alias $SERVICE_DIR/public/processed/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Включаем конфигурацию
    ln -sf "/etc/nginx/sites-available/image-processing" "/etc/nginx/sites-enabled/"

    # Проверяем конфигурацию Nginx
    nginx -t

    log_success "Nginx настроен"
}

# Функция запуска сервиса
start_service() {
    log "Запуск сервиса..."

    # Включаем автозапуск
    systemctl enable "$SERVICE_NAME"

    # Запускаем сервис
    systemctl start "$SERVICE_NAME"

    # Ждем запуска
    sleep 5

    # Проверяем статус
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "Сервис запущен успешно"
    else
        log_error "Ошибка запуска сервиса"
        systemctl status "$SERVICE_NAME"
        exit 1
    fi
}

# Функция тестирования сервиса
test_service() {
    log "Тестирование сервиса..."

    # Ждем полного запуска
    sleep 10

    # Проверяем статус API
    local response=$(curl -s "http://localhost:$SERVICE_PORT/api/status" || echo "ERROR")

    if echo "$response" | grep -q '"success":true'; then
        log_success "API сервиса работает корректно"
    else
        log_error "API сервиса не отвечает"
        log "Ответ: $response"
        exit 1
    fi
}

# Функция отображения информации
show_info() {
    echo ""
    echo "🎉 Image Processing Service успешно установлен!"
    echo "=============================================="
    echo ""
    echo "Информация о сервисе:"
    echo "  Название: $SERVICE_NAME"
    echo "  Порт: $SERVICE_PORT"
    echo "  Директория: $SERVICE_DIR"
    echo "  Пользователь: $SERVICE_USER"
    echo ""
    echo "API Endpoints:"
    echo "  GET  http://localhost:$SERVICE_PORT/api/status"
    echo "  POST http://localhost:$SERVICE_PORT/api/remove-bg"
    echo "  GET  http://localhost:$SERVICE_PORT/api/images"
    echo ""
    echo "Управление сервисом:"
    echo "  Статус:    systemctl status $SERVICE_NAME"
    echo "  Запуск:    systemctl start $SERVICE_NAME"
    echo "  Остановка: systemctl stop $SERVICE_NAME"
    echo "  Перезапуск: systemctl restart $SERVICE_NAME"
    echo "  Логи:      journalctl -u $SERVICE_NAME -f"
    echo ""
    echo "Следующие шаги:"
    echo "1. Перезагрузите Nginx: systemctl reload nginx"
    echo "2. Запустите обработку иконок: ./scripts/process-icons.sh"
    echo "3. Проверьте результат в браузере"
    echo ""
}

# Функция очистки при ошибке
cleanup_on_error() {
    log_error "Произошла ошибка, выполняется очистка..."

    # Останавливаем сервис если запущен
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl stop "$SERVICE_NAME"
    fi

    # Удаляем service файл
    if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
        rm -f "/etc/systemd/system/$SERVICE_NAME.service"
        systemctl daemon-reload
    fi

    log "Очистка завершена"
}

# Основная функция
main() {
    echo "🚀 BOSS AI v2.0 - Установка Image Processing Service"
    echo "=================================================="

    # Устанавливаем обработчик ошибок
    trap cleanup_on_error ERR

    # Проверка прав root
    check_root

    # Проверка зависимостей
    check_dependencies

    # Установка Node.js зависимостей
    install_node_dependencies

    # Установка Python зависимостей
    install_python_dependencies

    # Создание systemd service
    create_systemd_service

    # Настройка прав доступа
    setup_permissions

    # Настройка Nginx
    setup_nginx

    # Запуск сервиса
    start_service

    # Тестирование сервиса
    test_service

    # Отображение информации
    show_info

    log_success "Установка завершена успешно! 🎉"
}

# Запуск скрипта
main "$@"
