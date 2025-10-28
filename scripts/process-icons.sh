#!/bin/bash

# Скрипт автоматической обработки иконок BOSS AI v2.0
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
ICONS_UPLOAD_DIR="$PROJECT_ROOT/icons-upload"
ICONS_PROCESSED_DIR="$PROJECT_ROOT/icons-upload/processed"
IMAGE_SERVICE_URL="http://localhost:3005"
FINAL_DESTINATION="$PROJECT_ROOT"

# Список иконок для обработки
LEVEL1_ICONS=("ur.png" "tg.png" "ra.png" "ozon.png" "katya.png" "dev.png" "fz.png")
LEVEL2_ICONS=("3d.png" "app.png" "CALC.png" "lend.png")
ALL_ICONS=("${LEVEL1_ICONS[@]}" "${LEVEL2_ICONS[@]}")

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

    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js не установлен"
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

    mkdir -p "$ICONS_UPLOAD_DIR"
    mkdir -p "$ICONS_PROCESSED_DIR"

    log_success "Директории созданы"
}

# Функция проверки исходных файлов
check_source_files() {
    log "Проверка исходных файлов..."

    local missing_files=()

    for icon in "${ALL_ICONS[@]}"; do
        if [ ! -f "$ICONS_UPLOAD_DIR/$icon" ]; then
            missing_files+=("$icon")
        fi
    done

    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Отсутствуют файлы: ${missing_files[*]}"
        log "Поместите все иконки в директорию: $ICONS_UPLOAD_DIR"
        exit 1
    fi

    log_success "Все исходные файлы найдены"
}

# Функция обработки иконки
process_icon() {
    local icon_file="$1"
    local input_path="$ICONS_UPLOAD_DIR/$icon_file"
    local output_path="$ICONS_PROCESSED_DIR/$icon_file"

    log "Обработка $icon_file..."

    # Отправка на микросервис
    local response=$(curl -s -X POST \
        -F "image=@$input_path" \
        "$IMAGE_SERVICE_URL/api/remove-bg")

    # Проверка ответа
    if echo "$response" | grep -q '"success":true'; then
        local image_url=$(echo "$response" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)
        local processed_url="$IMAGE_SERVICE_URL$image_url"

        # Скачивание обработанного файла
        curl -s -o "$output_path" "$processed_url"

        if [ -f "$output_path" ]; then
            log_success "$icon_file обработан успешно"
        else
            log_error "Ошибка при скачивании $icon_file"
            return 1
        fi
    else
        log_error "Ошибка обработки $icon_file: $response"
        return 1
    fi
}

# Функция оптимизации иконки
optimize_icon() {
    local icon_file="$1"
    local input_path="$ICONS_PROCESSED_DIR/$icon_file"
    local output_path="$ICONS_PROCESSED_DIR/optimized_$icon_file"

    log "Оптимизация $icon_file..."

    # Проверка размера файла
    local file_size=$(stat -c%s "$input_path")
    if [ "$file_size" -gt 100000 ]; then
        log_warning "$icon_file слишком большой ($file_size байт), оптимизация..."

        # Простая оптимизация через ImageMagick (если доступен)
        if command -v convert &> /dev/null; then
            convert "$input_path" -quality 90 -strip "$output_path"
            mv "$output_path" "$input_path"
            log_success "$icon_file оптимизирован"
        else
            log_warning "ImageMagick не установлен, пропускаем оптимизацию"
        fi
    else
        log_success "$icon_file уже оптимизирован"
    fi
}

# Функция копирования в финальную директорию
copy_to_final() {
    log "Копирование обработанных иконок в финальную директорию..."

    for icon in "${ALL_ICONS[@]}"; do
        local source="$ICONS_PROCESSED_DIR/$icon"
        local destination="$FINAL_DESTINATION/$icon"

        if [ -f "$source" ]; then
            cp "$source" "$destination"
            log_success "$icon скопирован в $destination"
        else
            log_error "Обработанный файл $icon не найден"
        fi
    done
}

# Функция проверки результата
verify_result() {
    log "Проверка результата..."

    local missing_files=()

    for icon in "${ALL_ICONS[@]}"; do
        if [ ! -f "$FINAL_DESTINATION/$icon" ]; then
            missing_files+=("$icon")
        fi
    done

    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Отсутствуют обработанные файлы: ${missing_files[*]}"
        return 1
    fi

    log_success "Все иконки успешно обработаны и размещены"
}

# Функция очистки временных файлов
cleanup() {
    log "Очистка временных файлов..."

    # Удаляем обработанные файлы (исходные оставляем)
    rm -rf "$ICONS_PROCESSED_DIR"

    log_success "Временные файлы очищены"
}

# Функция отображения статистики
show_statistics() {
    log "Статистика обработки:"

    echo "┌─────────────────────────────────────────────────────────┐"
    echo "│                    ОБРАБОТКА ИКОНОК                     │"
    echo "├─────────────────────────────────────────────────────────┤"
    echo "│ Уровень 1 (512x512px):                                │"
    for icon in "${LEVEL1_ICONS[@]}"; do
        if [ -f "$FINAL_DESTINATION/$icon" ]; then
            local size=$(stat -c%s "$FINAL_DESTINATION/$icon")
            echo "│   ✅ $icon ($size байт)                                    │"
        else
            echo "│   ❌ $icon (ОТСУТСТВУЕТ)                              │"
        fi
    done
    echo "├─────────────────────────────────────────────────────────┤"
    echo "│ Уровень 2 (256x256px):                                │"
    for icon in "${LEVEL2_ICONS[@]}"; do
        if [ -f "$FINAL_DESTINATION/$icon" ]; then
            local size=$(stat -c%s "$FINAL_DESTINATION/$icon")
            echo "│   ✅ $icon ($size байт)                                    │"
        else
            echo "│   ❌ $icon (ОТСУТСТВУЕТ)                              │"
        fi
    done
    echo "└─────────────────────────────────────────────────────────┘"
}

# Основная функция
main() {
    echo "🚀 BOSS AI v2.0 - Обработка иконок"
    echo "=================================="

    # Проверка зависимостей
    check_dependencies

    # Создание директорий
    create_directories

    # Проверка исходных файлов
    check_source_files

    # Обработка каждой иконки
    local processed_count=0
    local total_count=${#ALL_ICONS[@]}

    for icon in "${ALL_ICONS[@]}"; do
        if process_icon "$icon"; then
            optimize_icon "$icon"
            ((processed_count++))
        else
            log_error "Не удалось обработать $icon"
        fi
    done

    # Копирование в финальную директорию
    copy_to_final

    # Проверка результата
    verify_result

    # Отображение статистики
    show_statistics

    # Очистка
    cleanup

    echo ""
    if [ "$processed_count" -eq "$total_count" ]; then
        log_success "Все $total_count иконок успешно обработаны! 🎉"
        echo ""
        echo "Следующие шаги:"
        echo "1. Соберите frontend: cd $PROJECT_ROOT/frontend && npm run build"
        echo "2. Перезагрузите Nginx: systemctl reload nginx"
        echo "3. Проверьте результат в браузере: https://boss-ai.online"
    else
        log_error "Обработано только $processed_count из $total_count иконок"
        exit 1
    fi
}

# Запуск скрипта
main "$@"
