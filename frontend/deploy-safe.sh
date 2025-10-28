#!/bin/bash

# 🚀 Безопасный автоматизированный деплой BARSUKOV OS
# Создает backup, очищает старые файлы, загружает новые, проверяет работу

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация сервера
SERVER_IP="217.12.38.90"
SERVER_USER="admin"
SERVER_PASS="!UzA*9YS"
SERVER_PATH="/home/admin/web/ballu-splitsistema.ru"
DOMAIN="ballu-splitsistema.ru"

# Функции для вывода
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

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    error "package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

log "🚀 Начинаем безопасный деплой BARSUKOV OS"
log "📍 Сервер: $SERVER_IP"
log "🌐 Домен: $DOMAIN"

# Шаг 1: Локальная сборка
log "📦 Шаг 1: Создание production сборки..."
npm run build:prod

if [ ! -d "dist" ]; then
    error "Папка dist не создана. Проверьте ошибки сборки."
    exit 1
fi

success "Production сборка создана"

# Шаг 2: Создание архива
log "📦 Шаг 2: Создание архива..."
tar -czf deploy-archive.tar.gz -C dist .
ARCHIVE_SIZE=$(du -sh deploy-archive.tar.gz | cut -f1)
success "Архив создан (размер: $ARCHIVE_SIZE)"

# Шаг 3: Загрузка архива на сервер
log "📤 Шаг 3: Загрузка архива на сервер..."
scp deploy-archive.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_PATH/

if [ $? -eq 0 ]; then
    success "Архив загружен на сервер"
else
    error "Ошибка загрузки архива"
    exit 1
fi

# Шаг 4: Выполнение команд на сервере
log "🔧 Шаг 4: Создание backup и установка новых файлов..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

# Цвета для SSH сессии
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅${NC} $1"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ❌${NC} $1"; }

SERVER_PATH="/home/admin/web/ballu-splitsistema.ru"
BACKUP_DIR="${SERVER_PATH}/backups"
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"

cd $SERVER_PATH

# Создать папку для backup если её нет
mkdir -p $BACKUP_DIR

# Создать backup текущей версии
if [ -d "public_html" ] && [ "$(ls -A public_html)" ]; then
    log "Создание backup текущей версии..."
    tar -czf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz public_html/
    success "Backup создан: ${BACKUP_NAME}.tar.gz"
else
    log "Backup не требуется (папка пустая или не существует)"
fi

# Очистить старые файлы (кроме .htaccess если есть)
log "Очистка старых файлов..."
if [ -f "public_html/.htaccess" ]; then
    cp public_html/.htaccess /tmp/.htaccess.backup
fi

rm -rf public_html/*

if [ -f "/tmp/.htaccess.backup" ]; then
    cp /tmp/.htaccess.backup public_html/.htaccess
    rm /tmp/.htaccess.backup
fi

success "Старые файлы удалены"

# Распаковать новые файлы
log "Установка новых файлов..."
tar -xzf deploy-archive.tar.gz -C public_html/

# Установить правильные права
chown -R admin:admin public_html/
find public_html/ -type d -exec chmod 755 {} \;
find public_html/ -type f -exec chmod 644 {} \;

success "Новые файлы установлены"

# Удалить архив
rm -f deploy-archive.tar.gz

# Оставить только 5 последних backup'ов
log "Очистка старых backup'ов..."
cd $BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +6 | xargs -r rm --
BACKUP_COUNT=$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
success "Оставлено backup'ов: $BACKUP_COUNT"

ENDSSH

if [ $? -eq 0 ]; then
    success "Файлы успешно установлены на сервере"
else
    error "Ошибка при установке файлов"
    exit 1
fi

# Шаг 5: Проверка работы сайта
log "🔍 Шаг 5: Проверка работы сайта..."
sleep 2  # Даем серверу время обработать изменения

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)

if [ "$HTTP_CODE" = "200" ]; then
    success "✅ Сайт работает! (HTTP $HTTP_CODE)"
else
    error "⚠️ Сайт вернул код $HTTP_CODE"
    warning "Возможно требуется ручная проверка"

    read -p "Откатить изменения? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "🔄 Откат изменений..."
        ssh $SERVER_USER@$SERVER_IP << 'ENDROLLBACK'
            SERVER_PATH="/home/admin/web/ballu-splitsistema.ru"
            BACKUP_DIR="${SERVER_PATH}/backups"
            LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_*.tar.gz | head -1)

            if [ -f "$LATEST_BACKUP" ]; then
                echo "Восстановление из backup: $(basename $LATEST_BACKUP)"
                rm -rf ${SERVER_PATH}/public_html/*
                tar -xzf $LATEST_BACKUP -C ${SERVER_PATH}/
                echo "✅ Backup восстановлен"
            else
                echo "❌ Backup не найден!"
            fi
ENDROLLBACK
        warning "Изменения откачены. Проверьте логи."
        exit 1
    fi
fi

# Шаг 6: Очистка локального архива
log "🧹 Шаг 6: Очистка временных файлов..."
rm -f deploy-archive.tar.gz
success "Временные файлы удалены"

# Финальный отчет
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Информация:"
echo "   🌐 URL: http://$DOMAIN"
echo "   📦 Размер архива: $ARCHIVE_SIZE"
echo "   ⏰ Время: $(date +'%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔗 Проверьте сайт: http://$DOMAIN"
echo ""
echo "💾 Backup сохранен на сервере:"
echo "   Путь: $SERVER_PATH/backups/"
echo "   Автоматически хранятся 5 последних backup'ов"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
