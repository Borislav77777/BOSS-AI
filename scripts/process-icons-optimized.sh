#!/bin/bash

# Скрипт оптимизированной обработки иконок BOSS AI v2.0
# Автор: BOSS AI Development Team
# Версия: 2.0.0

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
PROJECT_ROOT="/var/www/boss-ai"
ICONS_SOURCE_DIR="$PROJECT_ROOT"
ICONS_OUTPUT_DIR="$PROJECT_ROOT/frontend/public/images"
IMAGE_SERVICE_URL="http://localhost:3005"
BACKUP_DIR="$PROJECT_ROOT/icons-backup"

# Список иконок для обработки
LEVEL1_ICONS=("ur.png" "tg.png" "ra.png" "ozon.png" "katya.png" "dev.png" "fz.png")
LEVEL2_ICONS=("3d.png" "app.png" "CALC.png" "lend.png")
MAIN_ICON="BOSS_AI_AVA.jpg"
ALL_ICONS=("${LEVEL1_ICONS[@]}" "${LEVEL2_ICONS[@]}" "$MAIN_ICON")

# Размеры для оптимизации
LEVEL1_SIZE="512x512"
LEVEL2_SIZE="256x256"

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

# Функция проверки зависимостей
check_dependencies() {
    log "Проверка зависимостей..."

    # Проверка ImageMagick
    if ! command -v convert &> /dev/null; then
        log_error "ImageMagick не установлен"
        log "Установите: sudo apt-get install imagemagick"
        exit 1
    fi

    # Проверка curl
    if ! command -v curl &> /dev/null; then
        log_error "curl не установлен"
        exit 1
    fi

    # Проверка Image Processing Service
    if ! curl -s "$IMAGE_SERVICE_URL/api/status" > /dev/null; then
        log_error "Image Processing Service не запущен на $IMAGE_SERVICE_URL"
        log "Запустите сервис: cd $PROJECT_ROOT/backend/services/image-processing && npm start"
        exit 1
    fi

    log_success "Все зависимости проверены"
}

# Функция создания директорий
create_directories() {
    log "Создание необходимых директорий..."

    mkdir -p "$ICONS_OUTPUT_DIR"
    mkdir -p "$BACKUP_DIR"

    log_success "Директории созданы"
}

# Функция создания резервных копий
create_backups() {
    log "Создание резервных копий оригинальных иконок..."

    for icon in "${ALL_ICONS[@]}"; do
        if [ -f "$ICONS_SOURCE_DIR/$icon" ]; then
            cp "$ICONS_SOURCE_DIR/$icon" "$BACKUP_DIR/"
            log_success "Резервная копия $icon создана"
        else
            log_warning "Файл $icon не найден, пропускаем"
        fi
    done
}

# Функция обработки иконки через микросервис
process_icon_with_service() {
    local icon_file="$1"
    local input_path="$ICONS_SOURCE_DIR/$icon_file"
    local temp_output="$ICONS_OUTPUT_DIR/temp_$icon_file"

    # Отправка на микросервис
    local response=$(curl -s -X POST \
        -F "image=@$input_path" \
        "$IMAGE_SERVICE_URL/api/remove-bg")

    # Проверка ответа
    if echo "$response" | grep -q '"success":true'; then
        local image_url=$(echo "$response" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)
        local processed_url="$IMAGE_SERVICE_URL$image_url"

        # Скачивание обработанного файла
        curl -s -o "$temp_output" "$processed_url"

        if [ -f "$temp_output" ]; then
            echo "$temp_output"
        else
            return 1
        fi
    else
        return 1
    fi
}

# Функция оптимизации размера иконки
optimize_icon_size() {
    local icon_file="$1"
    local input_path="$2"
    local target_size="$3"
    local output_path="$ICONS_OUTPUT_DIR/$icon_file"

    log "Оптимизация размера $icon_file до $target_size..."

    # Изменение размера и оптимизация через ImageMagick
    convert "$input_path" \
        -resize "${target_size}!" \
        -strip \
        -quality 95 \
        -define png:compression-level=9 \
        -define png:compression-strategy=1 \
        "$output_path"

    if [ -f "$output_path" ]; then
        local original_size=$(stat -c%s "$input_path")
        local optimized_size=$(stat -c%s "$output_path")
        local reduction=$(( (original_size - optimized_size) * 100 / original_size ))

        log_success "$icon_file оптимизирован: ${original_size} → ${optimized_size} байт (-${reduction}%)"
    else
        log_error "Ошибка оптимизации $icon_file"
        return 1
    fi
}

# Функция обработки главной иконки (без изменения размера)
process_main_icon() {
    local icon_file="$1"
    local input_path="$ICONS_SOURCE_DIR/$icon_file"
    local output_path="$ICONS_OUTPUT_DIR/$icon_file"

    log "Обработка главной иконки $icon_file..."

    # Просто копируем с небольшой оптимизацией
    convert "$input_path" \
        -strip \
        -quality 90 \
        "$output_path"

    if [ -f "$output_path" ]; then
        log_success "$icon_file скопирован в $output_path"
    else
        log_error "Ошибка копирования $icon_file"
        return 1
    fi
}

# Функция обработки иконки уровня 1
process_level1_icon() {
    local icon_file="$1"
    local input_path="$ICONS_SOURCE_DIR/$icon_file"

    log "Обработка иконки уровня 1: $icon_file"

    # Обработка через микросервис
    log "Обработка $icon_file через микросервис..."
    local temp_processed
    temp_processed=$(process_icon_with_service "$icon_file")
    if [ $? -ne 0 ]; then
        log_warning "Микросервис не смог обработать $icon_file, используем оригинал"
        temp_processed="$input_path"
    else
        log_success "$icon_file обработан микросервисом"
    fi

    # Оптимизация размера
    optimize_icon_size "$icon_file" "$temp_processed" "$LEVEL1_SIZE"

    # Удаляем временный файл
    if [ "$temp_processed" != "$input_path" ] && [ -f "$temp_processed" ]; then
        rm -f "$temp_processed"
    fi
}

# Функция обработки иконки уровня 2
process_level2_icon() {
    local icon_file="$1"
    local input_path="$ICONS_SOURCE_DIR/$icon_file"

    log "Обработка иконки уровня 2: $icon_file"

    # Обработка через микросервис
    log "Обработка $icon_file через микросервис..."
    local temp_processed
    temp_processed=$(process_icon_with_service "$icon_file")
    if [ $? -ne 0 ]; then
        log_warning "Микросервис не смог обработать $icon_file, используем оригинал"
        temp_processed="$input_path"
    else
        log_success "$icon_file обработан микросервисом"
    fi

    # Оптимизация размера
    optimize_icon_size "$icon_file" "$temp_processed" "$LEVEL2_SIZE"

    # Удаляем временный файл
    if [ "$temp_processed" != "$input_path" ] && [ -f "$temp_processed" ]; then
        rm -f "$temp_processed"
    fi
}

# Функция проверки результата
verify_result() {
    log "Проверка результата обработки..."

    local missing_files=()
    local total_size=0

    for icon in "${ALL_ICONS[@]}"; do
        if [ -f "$ICONS_OUTPUT_DIR/$icon" ]; then
            local size=$(stat -c%s "$ICONS_OUTPUT_DIR/$icon")
            total_size=$((total_size + size))
            log_success "$icon: $(numfmt --to=iec $size)"
        else
            missing_files+=("$icon")
        fi
    done

    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Отсутствуют обработанные файлы: ${missing_files[*]}"
        return 1
    fi

    log_success "Все иконки успешно обработаны"
    log "Общий размер: $(numfmt --to=iec $total_size)"
}

# Функция отображения статистики
show_statistics() {
    log "Статистика обработки:"

    echo "┌─────────────────────────────────────────────────────────┐"
    echo "│                ОБРАБОТКА ИКОНОК BOSS AI v2.0           │"
    echo "├─────────────────────────────────────────────────────────┤"
    echo "│ Уровень 1 (512x512px):                                │"
    for icon in "${LEVEL1_ICONS[@]}"; do
        if [ -f "$ICONS_OUTPUT_DIR/$icon" ]; then
            local size=$(stat -c%s "$ICONS_OUTPUT_DIR/$icon")
            echo "│   ✅ $icon ($(numfmt --to=iec $size))                                    │"
        else
            echo "│   ❌ $icon (ОТСУТСТВУЕТ)                              │"
        fi
    done
    echo "├─────────────────────────────────────────────────────────┤"
    echo "│ Уровень 2 (256x256px):                                │"
    for icon in "${LEVEL2_ICONS[@]}"; do
        if [ -f "$ICONS_OUTPUT_DIR/$icon" ]; then
            local size=$(stat -c%s "$ICONS_OUTPUT_DIR/$icon")
            echo "│   ✅ $icon ($(numfmt --to=iec $size))                                    │"
        else
            echo "│   ❌ $icon (ОТСУТСТВУЕТ)                              │"
        fi
    done
    echo "├─────────────────────────────────────────────────────────┤"
    echo "│ Главная иконка:                                        │"
    if [ -f "$ICONS_OUTPUT_DIR/$MAIN_ICON" ]; then
        local size=$(stat -c%s "$ICONS_OUTPUT_DIR/$MAIN_ICON")
        echo "│   ✅ $MAIN_ICON ($(numfmt --to=iec $size))                                    │"
    else
        echo "│   ❌ $MAIN_ICON (ОТСУТСТВУЕТ)                              │"
    fi
    echo "└─────────────────────────────────────────────────────────┘"
}

# Основная функция
main() {
    echo "🚀 BOSS AI v2.0 - Оптимизированная обработка иконок"
    echo "=================================================="

    # Проверка зависимостей
    check_dependencies

    # Создание директорий
    create_directories

    # Создание резервных копий
    create_backups

    # Обработка иконок уровня 1
    log "Обработка иконок уровня 1 (512x512px)..."
    for icon in "${LEVEL1_ICONS[@]}"; do
        if [ -f "$ICONS_SOURCE_DIR/$icon" ]; then
            process_level1_icon "$icon"
        else
            log_warning "Файл $icon не найден, пропускаем"
        fi
    done

    # Обработка иконок уровня 2
    log "Обработка иконок уровня 2 (256x256px)..."
    for icon in "${LEVEL2_ICONS[@]}"; do
        if [ -f "$ICONS_SOURCE_DIR/$icon" ]; then
            process_level2_icon "$icon"
        else
            log_warning "Файл $icon не найден, пропускаем"
        fi
    done

    # Обработка главной иконки
    if [ -f "$ICONS_SOURCE_DIR/$MAIN_ICON" ]; then
        process_main_icon "$MAIN_ICON"
    else
        log_warning "Главная иконка $MAIN_ICON не найдена"
    fi

    # Проверка результата
    verify_result

    # Отображение статистики
    show_statistics

    echo ""
    log_success "Обработка иконок завершена успешно! 🎉"
    echo ""
    echo "Следующие шаги:"
    echo "1. Обновить пути в agentsData.ts: / → /images/"
    echo "2. Собрать frontend: cd $PROJECT_ROOT/frontend && npm run build"
    echo "3. Обновить production: cp -r dist/* /var/www/boss-ai/frontend/dist/"
    echo "4. Перезагрузить Nginx: systemctl reload nginx"
    echo "5. Проверить результат: https://boss-ai.online"
}

# Запуск скрипта
main "$@"
