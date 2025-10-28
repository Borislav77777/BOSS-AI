#!/bin/bash

# 🚀 Boss AI Platform - Quick Start для разработчика
# Автоматическая установка и запуск платформы

set -e  # Остановить при ошибке

echo "🚀 Boss AI Platform - Quick Start для разработчика"
echo "=================================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Проверка системных требований
check_requirements() {
    log "Проверка системных требований..."

    # Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен. Установите Node.js 18+ с https://nodejs.org"
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Требуется Node.js 18+. Текущая версия: $(node -v)"
    fi
    success "Node.js $(node -v) ✓"

    # npm
    if ! command -v npm &> /dev/null; then
        error "npm не установлен"
    fi
    success "npm $(npm -v) ✓"

    # SQLite
    if ! command -v sqlite3 &> /dev/null; then
        warning "SQLite не найден. Установите: sudo apt-get install sqlite3"
    else
        success "SQLite $(sqlite3 --version | cut -d' ' -f1) ✓"
    fi

    # PM2 (опционально)
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 не установлен. Установите: npm install -g pm2"
    else
        success "PM2 $(pm2 -v) ✓"
    fi
}

# Установка зависимостей
install_dependencies() {
    log "Установка зависимостей..."

    # Backend (API Gateway)
    log "Установка зависимостей для API Gateway..."
    cd backend/main
    if [ ! -d "node_modules" ]; then
        npm install
        success "API Gateway зависимости установлены"
    else
        success "API Gateway зависимости уже установлены"
    fi
    cd ../..

    # Backend (Ozon Manager)
    log "Установка зависимостей для Ozon Manager..."
    cd backend/ozon-manager
    if [ ! -d "node_modules" ]; then
        npm install
        success "Ozon Manager зависимости установлены"
    else
        success "Ozon Manager зависимости уже установлены"
    fi
    cd ../..

    # Frontend
    log "Установка зависимостей для Frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
        success "Frontend зависимости установлены"
    else
        success "Frontend зависимости уже установлены"
    fi
    cd ..
}

# Проверка конфигурации
check_config() {
    log "Проверка конфигурации..."

    # Проверка .env файлов
    if [ ! -f "backend/main/.env" ]; then
        error "Файл backend/main/.env не найден"
    fi
    success "API Gateway .env найден"

    if [ ! -f "backend/ozon-manager/.env" ]; then
        error "Файл backend/ozon-manager/.env не найден"
    fi
    success "Ozon Manager .env найден"

    if [ ! -f "frontend/.env" ]; then
        error "Файл frontend/.env не найден"
    fi
    success "Frontend .env найден"

    # Проверка базы данных
    if [ ! -f "backend/ozon-manager/data/ozon_manager.db" ]; then
        warning "База данных не найдена. Создаю..."
        mkdir -p backend/ozon-manager/data
        touch backend/ozon-manager/data/ozon_manager.db
        success "База данных создана"
    else
        success "База данных найдена"
    fi
}

# Компиляция TypeScript
build_typescript() {
    log "Компиляция TypeScript..."

    # API Gateway
    log "Компиляция API Gateway..."
    cd backend/main
    if [ -f "tsconfig.json" ]; then
        npm run build
        success "API Gateway скомпилирован"
    else
        warning "tsconfig.json не найден в API Gateway"
    fi
    cd ../..

    # Ozon Manager
    log "Компиляция Ozon Manager..."
    cd backend/ozon-manager
    if [ -f "tsconfig.json" ]; then
        npm run build
        success "Ozon Manager скомпилирован"
    else
        warning "tsconfig.json не найден в Ozon Manager"
    fi
    cd ../..

    # Frontend
    log "Компиляция Frontend..."
    cd frontend
    if [ -f "vite.config.ts" ]; then
        npm run build
        success "Frontend скомпилирован"
    else
        warning "vite.config.ts не найден в Frontend"
    fi
    cd ..
}

# Проверка портов
check_ports() {
    log "Проверка доступности портов..."

    # Проверка порта 3000
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "Порт 3000 уже занят. Остановите процесс или измените порт"
        lsof -Pi :3000 -sTCP:LISTEN
    else
        success "Порт 3000 свободен"
    fi

    # Проверка порта 4200
    if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "Порт 4200 уже занят. Остановите процесс или измените порт"
        lsof -Pi :4200 -sTCP:LISTEN
    else
        success "Порт 4200 свободен"
    fi
}

# Запуск в development режиме
start_development() {
    log "Запуск в development режиме..."

    echo ""
    echo "🚀 Запускаю сервисы..."
    echo "Для остановки нажмите Ctrl+C"
    echo ""

    # Создать папку для логов
    mkdir -p logs

    # Запуск API Gateway
    log "Запуск API Gateway на порту 3000..."
    cd backend/main
    npm run dev > ../../logs/api-gateway.log 2>&1 &
    API_GATEWAY_PID=$!
    cd ../..

    # Небольшая пауза
    sleep 2

    # Запуск Ozon Manager
    log "Запуск Ozon Manager на порту 4200..."
    cd backend/ozon-manager
    npm run dev > ../../logs/ozon-manager.log 2>&1 &
    OZON_MANAGER_PID=$!
    cd ../..

    # Небольшая пауза
    sleep 2

    # Запуск Frontend
    log "Запуск Frontend на порту 3000 (Vite dev server)..."
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..

    # Функция для остановки всех процессов
    cleanup() {
        echo ""
        log "Остановка всех сервисов..."
        kill $API_GATEWAY_PID $OZON_MANAGER_PID $FRONTEND_PID 2>/dev/null || true
        success "Все сервисы остановлены"
        exit 0
    }

    # Перехват Ctrl+C
    trap cleanup SIGINT SIGTERM

    # Ждем немного для запуска
    sleep 5

    # Проверка статуса
    check_services_status

    echo ""
    success "Все сервисы запущены!"
    echo ""
    echo "🌐 Доступные URL:"
    echo "   Frontend:     http://localhost:3000"
    echo "   API Gateway:  http://localhost:3000/api/health"
    echo "   Ozon Manager: http://localhost:4200/health"
    echo ""
    echo "📋 Логи:"
    echo "   API Gateway:  tail -f logs/api-gateway.log"
    echo "   Ozon Manager: tail -f logs/ozon-manager.log"
    echo "   Frontend:     tail -f logs/frontend.log"
    echo ""
    echo "🛑 Для остановки нажмите Ctrl+C"
    echo ""

    # Ждем завершения
    wait
}

# Проверка статуса сервисов
check_services_status() {
    log "Проверка статуса сервисов..."

    # Проверка API Gateway
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        success "API Gateway работает"
    else
        warning "API Gateway не отвечает"
    fi

    # Проверка Ozon Manager
    if curl -s http://localhost:4200/health > /dev/null 2>&1; then
        success "Ozon Manager работает"
    else
        warning "Ozon Manager не отвечает"
    fi

    # Проверка Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend работает"
    else
        warning "Frontend не отвечает"
    fi
}

# Запуск в production режиме (PM2)
start_production() {
    log "Запуск в production режиме через PM2..."

    if ! command -v pm2 &> /dev/null; then
        error "PM2 не установлен. Установите: npm install -g pm2"
    fi

    # Остановить существующие процессы
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true

    # Запуск через PM2
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
        success "Сервисы запущены через PM2"

        echo ""
        echo "📊 Статус сервисов:"
        pm2 status

        echo ""
        echo "📋 Логи:"
        echo "   pm2 logs --lines 50"
        echo "   pm2 logs boss-ai-api-gateway"
        echo "   pm2 logs boss-ai-ozon-manager"
        echo ""
    else
        error "Файл ecosystem.config.js не найден"
    fi
}

# Показать помощь
show_help() {
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  dev, development  - Запуск в development режиме (по умолчанию)"
    echo "  prod, production   - Запуск в production режиме через PM2"
    echo "  check             - Только проверка системы"
    echo "  build            - Только компиляция"
    echo "  help, -h, --help  - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0                # Запуск в development режиме"
    echo "  $0 dev            # Запуск в development режиме"
    echo "  $0 prod           # Запуск в production режиме"
    echo "  $0 check          # Только проверка"
    echo "  $0 build          # Только компиляция"
}

# Основная логика
main() {
    case "${1:-dev}" in
        "dev"|"development")
            check_requirements
            install_dependencies
            check_config
            build_typescript
            check_ports
            start_development
            ;;
        "prod"|"production")
            check_requirements
            install_dependencies
            check_config
            build_typescript
            start_production
            ;;
        "check")
            check_requirements
            check_config
            check_ports
            success "Проверка завершена"
            ;;
        "build")
            check_requirements
            install_dependencies
            build_typescript
            success "Компиляция завершена"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Неизвестная опция: $1. Используйте '$0 help' для справки"
            ;;
    esac
}

# Запуск
main "$@"
