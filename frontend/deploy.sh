#!/bin/bash

# Скрипт автоматизации деплоя BARSUKOV OS
# Использование: ./deploy.sh [--production] [--analyze]

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌${NC} $1"
}

# Параметры
PRODUCTION=false
ANALYZE=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --production)
            PRODUCTION=true
            shift
            ;;
        --analyze)
            ANALYZE=true
            shift
            ;;
        -h|--help)
            echo "Использование: $0 [--production] [--analyze]"
            echo "  --production  Сборка для production"
            echo "  --analyze     Анализ размера bundle"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

log "🚀 Начинаем процесс деплоя BARSUKOV OS"

# Проверка наличия Node.js и npm
if ! command -v node &> /dev/null; then
    error "Node.js не найден. Установите Node.js для продолжения."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm не найден. Установите npm для продолжения."
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    warning "Рекомендуется Node.js версии 16 или выше. Текущая версия: $(node -v)"
fi

log "📦 Проверяем зависимости..."

# Проверка package.json
if [ ! -f "package.json" ]; then
    error "package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Установка зависимостей
log "📥 Устанавливаем зависимости..."
npm ci --silent

# Очистка предыдущей сборки
log "🧹 Очищаем предыдущую сборку..."
rm -rf dist/
rm -rf deploy-archive.tar.gz

# Проверка TypeScript
log "🔍 Проверяем TypeScript..."
npm run type-check

# Линтинг
log "🔧 Запускаем линтер..."
npm run lint

# Сборка
if [ "$PRODUCTION" = true ]; then
    log "🏗️ Создаем production сборку..."
    npm run build:prod
else
    log "🏗️ Создаем сборку..."
    npm run build
fi

# Проверка результата сборки
if [ ! -d "dist" ]; then
    error "Папка dist не создана. Проверьте ошибки сборки."
    exit 1
fi

# Анализ размера bundle
if [ "$ANALYZE" = true ]; then
    log "📊 Анализируем размер bundle..."
    npm run analyze
fi

# Проверка размера файлов
log "📏 Проверяем размеры файлов..."

# Размер основных файлов
JS_SIZE=$(find dist/assets -name "*.js" -exec du -ch {} + | tail -1 | cut -f1)
CSS_SIZE=$(find dist/assets -name "*.css" -exec du -ch {} + | tail -1 | cut -f1)
TOTAL_SIZE=$(du -sh dist | cut -f1)

log "📊 Размеры файлов:"
log "   JavaScript: $JS_SIZE"
log "   CSS: $CSS_SIZE"
log "   Общий размер: $TOTAL_SIZE"

# Предупреждение о больших файлах
JS_SIZE_BYTES=$(find dist/assets -name "*.js" -exec du -cb {} + | tail -1 | cut -f1)
if [ "$JS_SIZE_BYTES" -gt 524288 ]; then  # 512KB
    warning "JavaScript bundle превышает 512KB. Рекомендуется оптимизация."
fi

# Создание архива для переноса
log "📦 Создаем архив для переноса..."
tar -czf deploy-archive.tar.gz -C dist .

ARCHIVE_SIZE=$(du -sh deploy-archive.tar.gz | cut -f1)
log "📦 Размер архива: $ARCHIVE_SIZE"

# Создание файла с информацией о сборке
cat > dist/build-info.txt << EOF
BARSUKOV OS - Информация о сборке
=====================================
Дата сборки: $(date)
Версия Node.js: $(node -v)
Версия npm: $(npm -v)
Git commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Git branch: $(git branch --show-current 2>/dev/null || echo "N/A")
Размер JavaScript: $JS_SIZE
Размер CSS: $CSS_SIZE
Общий размер: $TOTAL_SIZE
Размер архива: $ARCHIVE_SIZE
EOF

# Копирование конфигурационных файлов в dist
log "📋 Копируем конфигурационные файлы..."
cp deploy/nginx.conf dist/ 2>/dev/null || warning "nginx.conf не найден"
cp deploy/.htaccess dist/ 2>/dev/null || warning ".htaccess не найден"

# Создание инструкций для деплоя
cat > dist/DEPLOY_INSTRUCTIONS.txt << EOF
ИНСТРУКЦИИ ПО ДЕПЛОЮ BARSUKOV OS
================================

1. ПОДКЛЮЧЕНИЕ К СЕРВЕРУ:
   ssh admin@217.12.38.90
   Пароль: !UzA*9YS

2. ПОДГОТОВКА ДИРЕКТОРИИ:
   mkdir -p /home/admin/web/ballu-splitsistema.ru/public_html
   chown -R admin:admin /home/admin/web/ballu-splitsistema.ru
   chmod -R 755 /home/admin/web/ballu-splitsistema.ru/public_html

3. ПЕРЕНОС ФАЙЛОВ:
   Вариант A (SCP):
   scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/

   Вариант B (FileZilla/WinSCP):
   Host: 217.12.38.90
   Protocol: SFTP
   User: admin
   Password: !UzA*9YS
   Remote path: /home/admin/web/ballu-splitsistema.ru/public_html/

4. НАСТРОЙКА ВЕБ-СЕРВЕРА:
   - Скопируйте nginx.conf в конфигурацию Nginx (если используется)
   - Или скопируйте .htaccess в корень сайта (если Apache)
   - Перезапустите веб-сервер

5. ПРОВЕРКА:
   Откройте http://ballu-splitsistema.ru
   Проверьте загрузку приложения и routing

6. SSL (опционально):
   v-add-letsencrypt-domain admin ballu-splitsistema.ru

Файлы готовы к переносу в папке dist/
EOF

success "✅ Сборка завершена успешно!"
success "📁 Файлы готовы в папке: dist/"
success "📦 Архив создан: deploy-archive.tar.gz"
success "📋 Инструкции сохранены в: dist/DEPLOY_INSTRUCTIONS.txt"

log "🎯 Следующие шаги:"
log "   1. Проверьте содержимое папки dist/"
log "   2. Перенесите файлы на сервер"
log "   3. Настройте веб-сервер"
log "   4. Проверьте работу сайта"

if [ "$PRODUCTION" = true ]; then
    log "🔒 Production сборка готова к деплою!"
else
    warning "⚠️ Это не production сборка. Используйте --production для продакшена."
fi

log "✨ Готово! Удачного деплоя!"
