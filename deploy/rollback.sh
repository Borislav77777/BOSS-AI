#!/bin/bash

# 🔄 Скрипт отката изменений
# Восстановление из бэкапа

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
BACKUP_FILE=""
RESTORE_SSL=true
RESTORE_CONFIGS=true
RESTORE_APP=true
DRY_RUN=false
FORCE=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-file|-f)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --no-ssl)
            RESTORE_SSL=false
            shift
            ;;
        --no-configs)
            RESTORE_CONFIGS=false
            shift
            ;;
        --no-app)
            RESTORE_APP=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --backup-file, -f FILE  Файл бэкапа для восстановления"
            echo "  --no-ssl                Не восстанавливать SSL"
            echo "  --no-configs           Не восстанавливать конфигурации"
            echo "  --no-app                Не восстанавливать приложение"
            echo "  --dry-run               Показать что будет сделано"
            echo "  --force                 Принудительное восстановление"
            echo "  --help, -h              Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Функция для извлечения архива
extract_archive() {
    local archive="$1"
    local extract_dir="$2"

    if [ ! -f "$archive" ]; then
        error "Файл бэкапа не найден: $archive"
        exit 1
    fi

    log "Извлечение архива: $archive"

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: tar -xzf $archive -C $extract_dir"
        return 0
    fi

    mkdir -p "$extract_dir"

    if [[ "$archive" == *.tar.gz ]]; then
        tar -xzf "$archive" -C "$extract_dir"
    elif [[ "$archive" == *.tar ]]; then
        tar -xf "$archive" -C "$extract_dir"
    else
        error "Неподдерживаемый формат архива: $archive"
        exit 1
    fi

    success "Архив извлечен в: $extract_dir"
}

# Функция для восстановления SSL
restore_ssl() {
    if [ "$RESTORE_SSL" = false ]; then
        return 0
    fi

    log "🔒 Восстановление SSL сертификатов..."

    local backup_dir="$1"
    local ssl_backup_dir="$backup_dir/ssl"

    if [ ! -d "$ssl_backup_dir" ]; then
        warn "SSL бэкап не найден: $ssl_backup_dir"
        return 0
    fi

    # Остановка веб-серверов
    if pgrep nginx > /dev/null; then
        log "Остановка Nginx..."
        if [ "$DRY_RUN" = false ]; then
            systemctl stop nginx
        fi
    fi

    if pgrep apache2 > /dev/null; then
        log "Остановка Apache..."
        if [ "$DRY_RUN" = false ]; then
            systemctl stop apache2
        fi
    fi

    # Восстановление Let's Encrypt
    if [ -d "$ssl_backup_dir/letsencrypt" ]; then
        log "Восстановление Let's Encrypt..."
        if [ "$DRY_RUN" = false ]; then
            cp -r "$ssl_backup_dir/letsencrypt"/* /etc/letsencrypt/ 2>/dev/null || warn "Не удалось восстановить Let's Encrypt"
        fi
    fi

    # Восстановление SSL конфигураций
    if [ -d "$ssl_backup_dir" ]; then
        for ssl_config in "$ssl_backup_dir"/nginx-*.conf; do
            if [ -f "$ssl_config" ]; then
                local original_name=$(basename "$ssl_config" | sed 's/nginx-//')
                log "Восстановление Nginx SSL конфигурации: $original_name"
                if [ "$DRY_RUN" = false ]; then
                    cp "$ssl_config" "/etc/nginx/sites-available/$original_name" 2>/dev/null || warn "Не удалось восстановить $original_name"
                fi
            fi
        done

        for ssl_config in "$ssl_backup_dir"/apache-*.conf; do
            if [ -f "$ssl_config" ]; then
                local original_name=$(basename "$ssl_config" | sed 's/apache-//')
                log "Восстановление Apache SSL конфигурации: $original_name"
                if [ "$DRY_RUN" = false ]; then
                    cp "$ssl_config" "/etc/apache2/sites-available/$original_name" 2>/dev/null || warn "Не удалось восстановить $original_name"
                fi
            fi
        done
    fi

    # Запуск веб-серверов
    if pgrep nginx > /dev/null; then
        log "Запуск Nginx..."
        if [ "$DRY_RUN" = false ]; then
            systemctl start nginx
        fi
    fi

    if pgrep apache2 > /dev/null; then
        log "Запуск Apache..."
        if [ "$DRY_RUN" = false ]; then
            systemctl start apache2
        fi
    fi

    success "SSL сертификаты восстановлены"
}

# Функция для восстановления конфигураций
restore_configs() {
    if [ "$RESTORE_CONFIGS" = false ]; then
        return 0
    fi

    log "🌐 Восстановление конфигураций веб-сервера..."

    local backup_dir="$1"
    local config_backup_dir="$backup_dir/configs"

    if [ ! -d "$config_backup_dir" ]; then
        warn "Конфигурации не найдены: $config_backup_dir"
        return 0
    fi

    # Восстановление Nginx
    if [ -d "$config_backup_dir/nginx" ]; then
        log "Восстановление Nginx конфигураций..."
        if [ "$DRY_RUN" = false ]; then
            cp -r "$config_backup_dir/nginx"/* /etc/nginx/ 2>/dev/null || warn "Не удалось восстановить Nginx конфигурации"
        fi
    fi

    # Восстановление Apache
    if [ -d "$config_backup_dir/apache2" ]; then
        log "Восстановление Apache конфигураций..."
        if [ "$DRY_RUN" = false ]; then
            cp -r "$config_backup_dir/apache2"/* /etc/apache2/ 2>/dev/null || warn "Не удалось восстановить Apache конфигурации"
        fi
    fi

    # Восстановление PM2
    if [ -f "$config_backup_dir/pm2/ecosystem.json" ]; then
        log "Восстановление PM2 конфигурации..."
        if [ "$DRY_RUN" = false ]; then
            pm2 delete all 2>/dev/null || true
            pm2 start "$config_backup_dir/pm2/ecosystem.json" 2>/dev/null || warn "Не удалось восстановить PM2 конфигурацию"
        fi
    fi

    success "Конфигурации восстановлены"
}

# Функция для восстановления приложения
restore_application() {
    if [ "$RESTORE_APP" = false ]; then
        return 0
    fi

    log "📱 Восстановление приложения..."

    local backup_dir="$1"
    local app_backup_dir="$backup_dir/application"

    if [ ! -d "$app_backup_dir/boss-ai" ]; then
        warn "Приложение не найдено: $app_backup_dir/boss-ai"
        return 0
    fi

    # Остановка PM2
    if command -v pm2 &> /dev/null; then
        log "Остановка PM2 процессов..."
        if [ "$DRY_RUN" = false ]; then
            pm2 stop all 2>/dev/null || true
        fi
    fi

    # Восстановление приложения
    local app_paths=("/var/www/boss-ai" "/home/*/boss-ai" "/opt/boss-ai")
    local restored=false

    for path in "${app_paths[@]}"; do
        if [ -d "$path" ]; then
            log "Восстановление в: $path"
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$path"
                cp -r "$app_backup_dir/boss-ai" "$path"
            fi
            restored=true
            break
        fi
    done

    if [ "$restored" = false ]; then
        # Создание в стандартном месте
        local default_path="/var/www/boss-ai"
        log "Создание в стандартном месте: $default_path"
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$(dirname "$default_path")"
            cp -r "$app_backup_dir/boss-ai" "$default_path"
        fi
    fi

    # Перезапуск PM2
    if command -v pm2 &> /dev/null; then
        log "Перезапуск PM2..."
        if [ "$DRY_RUN" = false ]; then
            cd /var/www/boss-ai 2>/dev/null || cd /home/*/boss-ai 2>/dev/null || cd /opt/boss-ai 2>/dev/null || true
            pm2 start ecosystem.config.js 2>/dev/null || warn "Не удалось запустить PM2"
        fi
    fi

    success "Приложение восстановлено"
}

# Функция для проверки восстановления
verify_restoration() {
    log "✅ Проверка восстановления..."

    # Проверка веб-серверов
    if pgrep nginx > /dev/null; then
        success "Nginx запущен"
    else
        warn "Nginx не запущен"
    fi

    if pgrep apache2 > /dev/null; then
        success "Apache запущен"
    else
        warn "Apache не запущен"
    fi

    # Проверка PM2
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "online"; then
            success "PM2 процессы запущены"
        else
            warn "PM2 процессы не запущены"
        fi
    fi

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

    success "Проверка завершена"
}

# Основная функция
main() {
    log "🔄 Начинаем откат Boss AI Platform"

    # Проверка обязательных параметров
    if [ -z "$BACKUP_FILE" ]; then
        error "Файл бэкапа не указан. Используйте --backup-file"
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        error "Файл бэкапа не найден: $BACKUP_FILE"
        exit 1
    fi

    log "Параметры отката:"
    log "  Файл бэкапа: $BACKUP_FILE"
    log "  SSL: $RESTORE_SSL"
    log "  Конфигурации: $RESTORE_CONFIGS"
    log "  Приложение: $RESTORE_APP"
    log "  Dry run: $DRY_RUN"
    log "  Force: $FORCE"

    # Подтверждение
    if [ "$DRY_RUN" = false ] && [ "$FORCE" = false ]; then
        echo -n "Вы уверены, что хотите восстановить из бэкапа? [y/N]: "
        read -r answer
        case "$answer" in
            [Yy]|[Yy][Ee][Ss]) ;;
            *) log "Откат отменен"; exit 0 ;;
        esac
    fi

    # Создание временной директории
    local temp_dir="/tmp/boss-ai-restore-$(date +%s)"
    log "Временная директория: $temp_dir"

    # Извлечение архива
    extract_archive "$BACKUP_FILE" "$temp_dir"

    # Восстановление компонентов
    restore_ssl "$temp_dir"
    restore_configs "$temp_dir"
    restore_application "$temp_dir"

    # Очистка временной директории
    if [ "$DRY_RUN" = false ]; then
        rm -rf "$temp_dir"
    fi

    # Проверка восстановления
    verify_restoration

    success "🎉 Откат Boss AI Platform завершен!"

    log "Рекомендации:"
    log "1. Проверьте статус сервисов: systemctl status nginx apache2"
    log "2. Проверьте PM2: pm2 status"
    log "3. Проверьте логи: pm2 logs"
    log "4. Проверьте доступность сайта"
}

# Запуск
main "$@"
