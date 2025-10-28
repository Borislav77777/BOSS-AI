#!/bin/bash

# 💾 Скрипт бэкапа конфигураций и сертификатов
# Сохранение состояния системы

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
BACKUP_DIR="/var/backups/boss-ai"
DOMAIN=""
INCLUDE_SSL=true
INCLUDE_APP=true
INCLUDE_CONFIGS=true
COMPRESS=true
DRY_RUN=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-dir|-b)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --domain|-d)
            DOMAIN="$2"
            shift 2
            ;;
        --no-ssl)
            INCLUDE_SSL=false
            shift
            ;;
        --no-app)
            INCLUDE_APP=false
            shift
            ;;
        --no-configs)
            INCLUDE_CONFIGS=false
            shift
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --backup-dir, -b DIR    Директория для бэкапа"
            echo "  --domain, -d DOMAIN     Домен для SSL сертификатов"
            echo "  --no-ssl                Не включать SSL сертификаты"
            echo "  --no-app                Не включать файлы приложения"
            echo "  --no-configs            Не включать конфигурации"
            echo "  --no-compress           Не сжимать бэкап"
            echo "  --dry-run               Показать что будет сделано"
            echo "  --help, -h              Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Функция для создания директории
create_directory() {
    local dir="$1"
    local description="$2"

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: mkdir -p $dir"
        return 0
    fi

    mkdir -p "$dir"
    log "$description: $dir"
}

# Функция для копирования файлов
copy_files() {
    local source="$1"
    local destination="$2"
    local description="$3"

    if [ ! -e "$source" ]; then
        warn "$description не найден: $source"
        return 1
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: cp -r $source $destination"
        return 0
    fi

    cp -r "$source" "$destination"
    log "$description скопирован: $source -> $destination"
}

# Функция для создания архива
create_archive() {
    local source_dir="$1"
    local archive_name="$2"

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: tar -czf $archive_name -C $source_dir ."
        return 0
    fi

    if [ "$COMPRESS" = true ]; then
        tar -czf "$archive_name" -C "$source_dir" .
        log "Архив создан: $archive_name"
    else
        cp -r "$source_dir" "$archive_name"
        log "Директория скопирована: $archive_name"
    fi
}

# Функция для бэкапа SSL сертификатов
backup_ssl() {
    if [ "$INCLUDE_SSL" = false ]; then
        return 0
    fi

    log "🔒 Бэкап SSL сертификатов..."

    local ssl_backup_dir="$BACKUP_DIR/ssl"
    create_directory "$ssl_backup_dir" "Директория для SSL бэкапа"

    # Let's Encrypt сертификаты
    if [ -d "/etc/letsencrypt" ]; then
        copy_files "/etc/letsencrypt" "$ssl_backup_dir/letsencrypt" "Let's Encrypt директория"
    fi

    # Конкретный домен
    if [ -n "$DOMAIN" ] && [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        copy_files "/etc/letsencrypt/live/$DOMAIN" "$ssl_backup_dir/$DOMAIN" "SSL сертификат для $DOMAIN"
    fi

    # Nginx SSL конфигурации
    if [ -d "/etc/nginx" ]; then
        find /etc/nginx -name "*.conf" -exec grep -l "ssl_certificate" {} \; 2>/dev/null | while read -r file; do
            local filename=$(basename "$file")
            copy_files "$file" "$ssl_backup_dir/nginx-$filename" "Nginx SSL конфигурация $filename"
        done
    fi

    # Apache SSL конфигурации
    if [ -d "/etc/apache2" ]; then
        find /etc/apache2 -name "*.conf" -exec grep -l "SSLCertificate" {} \; 2>/dev/null | while read -r file; do
            local filename=$(basename "$file")
            copy_files "$file" "$ssl_backup_dir/apache-$filename" "Apache SSL конфигурация $filename"
        done
    fi

    success "SSL сертификаты сохранены"
}

# Функция для бэкапа конфигураций веб-сервера
backup_web_server_configs() {
    if [ "$INCLUDE_CONFIGS" = false ]; then
        return 0
    fi

    log "🌐 Бэкап конфигураций веб-сервера..."

    local config_backup_dir="$BACKUP_DIR/configs"
    create_directory "$config_backup_dir" "Директория для конфигураций"

    # Nginx конфигурации
    if [ -d "/etc/nginx" ]; then
        copy_files "/etc/nginx" "$config_backup_dir/nginx" "Nginx конфигурации"
    fi

    # Apache конфигурации
    if [ -d "/etc/apache2" ]; then
        copy_files "/etc/apache2" "$config_backup_dir/apache2" "Apache конфигурации"
    fi

    # PM2 конфигурации
    if command -v pm2 &> /dev/null; then
        local pm2_backup_dir="$config_backup_dir/pm2"
        create_directory "$pm2_backup_dir" "Директория для PM2"

        if [ "$DRY_RUN" = false ]; then
            pm2 save > "$pm2_backup_dir/ecosystem.json" 2>/dev/null || warn "Не удалось сохранить PM2 конфигурацию"
        fi
    fi

    success "Конфигурации веб-сервера сохранены"
}

# Функция для бэкапа приложения
backup_application() {
    if [ "$INCLUDE_APP" = false ]; then
        return 0
    fi

    log "📱 Бэкап приложения..."

    local app_backup_dir="$BACKUP_DIR/application"
    create_directory "$app_backup_dir" "Директория для приложения"

    # Поиск приложения
    local app_paths=("/var/www/boss-ai" "/home/*/boss-ai" "/opt/boss-ai")
    local app_found=false

    for path in "${app_paths[@]}"; do
        if [ -d "$path" ]; then
            copy_files "$path" "$app_backup_dir/boss-ai" "Приложение Boss AI"
            app_found=true
            break
        fi
    done

    if [ "$app_found" = false ]; then
        warn "Приложение Boss AI не найдено"
    else
        success "Приложение сохранено"
    fi
}

# Функция для бэкапа системной информации
backup_system_info() {
    log "💻 Бэкап системной информации..."

    local info_backup_dir="$BACKUP_DIR/system"
    create_directory "$info_backup_dir" "Директория для системной информации"

    # Системная информация
    if [ "$DRY_RUN" = false ]; then
        {
            echo "=== Системная информация ==="
            echo "Дата: $(date)"
            echo "ОС: $(uname -a)"
            echo "Версия: $(cat /etc/os-release 2>/dev/null || echo 'Неизвестно')"
            echo ""
            echo "=== Установленные пакеты ==="
            if command -v dpkg &> /dev/null; then
                dpkg -l | grep -E "(nginx|apache2|node|pm2|certbot)"
            elif command -v rpm &> /dev/null; then
                rpm -qa | grep -E "(nginx|httpd|node|pm2|certbot)"
            fi
            echo ""
            echo "=== Запущенные сервисы ==="
            systemctl list-units --type=service --state=active | grep -E "(nginx|apache2|pm2)" || true
            echo ""
            echo "=== Занятые порты ==="
            netstat -tlnp 2>/dev/null | grep LISTEN || ss -tlnp 2>/dev/null | grep LISTEN || true
        } > "$info_backup_dir/system-info.txt"
    fi

    success "Системная информация сохранена"
}

# Функция для создания финального архива
create_final_archive() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local archive_name="boss-ai-backup_$timestamp"

    if [ "$COMPRESS" = true ]; then
        archive_name="$archive_name.tar.gz"
    else
        archive_name="$archive_name"
    fi

    log "📦 Создание финального архива..."

    create_archive "$BACKUP_DIR" "$archive_name"

    # Информация о бэкапе
    if [ "$DRY_RUN" = false ]; then
        cat > "$BACKUP_DIR/backup-info.txt" << EOF
Boss AI Platform Backup
=======================

Дата создания: $(date)
Домен: $DOMAIN
Включено SSL: $INCLUDE_SSL
Включено приложение: $INCLUDE_APP
Включены конфигурации: $INCLUDE_CONFIGS
Сжатие: $COMPRESS

Содержимое:
- ssl/ - SSL сертификаты и конфигурации
- configs/ - Конфигурации веб-сервера
- application/ - Файлы приложения
- system/ - Системная информация

Восстановление:
./deploy/rollback.sh --backup-file $archive_name
EOF
    fi

    success "Финальный архив создан: $archive_name"
    log "Размер архива: $(du -h "$archive_name" 2>/dev/null || echo 'Неизвестно')"
}

# Основная функция
main() {
    log "💾 Начинаем бэкап Boss AI Platform"

    log "Параметры бэкапа:"
    log "  Директория: $BACKUP_DIR"
    log "  Домен: $DOMAIN"
    log "  SSL: $INCLUDE_SSL"
    log "  Приложение: $INCLUDE_APP"
    log "  Конфигурации: $INCLUDE_CONFIGS"
    log "  Сжатие: $COMPRESS"
    log "  Dry run: $DRY_RUN"

    # Создание основной директории бэкапа
    create_directory "$BACKUP_DIR" "Основная директория бэкапа"

    # Выполнение бэкапов
    backup_ssl
    backup_web_server_configs
    backup_application
    backup_system_info

    # Создание финального архива
    create_final_archive

    success "🎉 Бэкап Boss AI Platform завершен!"

    log "Информация о бэкапе:"
    log "  Директория: $BACKUP_DIR"
    log "  Архив: $(ls -t $BACKUP_DIR/*.tar.gz 2>/dev/null | head -1 || echo 'Не создан')"
    log "  Восстановление: ./deploy/rollback.sh --backup-file <архив>"
}

# Запуск
main "$@"
