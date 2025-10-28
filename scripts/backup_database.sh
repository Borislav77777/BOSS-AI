#!/bin/bash
#
# Скрипт автоматического резервного копирования БД Boss AI Platform
# Запускается через cron ежедневно в 3:00
#

set -e

# Конфигурация
DB_PATH="/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db"
BACKUP_DIR="/var/www/boss-ai/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_${DATE}.sqlite"
LOG_FILE="/var/www/boss-ai/logs/backup.log"

# Логирование
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Начало резервного копирования БД..."

# Проверка существования БД
if [ ! -f "$DB_PATH" ]; then
    log "❌ ОШИБКА: БД не найдена по пути $DB_PATH"
    exit 1
fi

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

# Создание резервной копии с помощью SQLite
if sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"; then
    log "✅ Резервная копия создана: $BACKUP_FILE"

    # Получение размера БД
    DB_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "📦 Размер резервной копии: $DB_SIZE"

    # Сжатие резервной копии
    if gzip "$BACKUP_FILE"; then
        log "✅ Резервная копия сжата: ${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        log "📦 Размер сжатой копии: $COMPRESSED_SIZE"
    else
        log "⚠️  Предупреждение: Не удалось сжать резервную копию"
    fi
else
    log "❌ ОШИБКА: Не удалось создать резервную копию"
    exit 1
fi

# Удаление старых бэкапов (старше 30 дней)
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "db_*.gz" -mtime +30 2>/dev/null | wc -l)
if [ "$OLD_BACKUPS" -gt 0 ]; then
    find "$BACKUP_DIR" -name "db_*.gz" -mtime +30 -delete
    log "🗑️  Удалено старых резервных копий: $OLD_BACKUPS"
fi

# Статистика
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "db_*.gz" 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "📊 Всего резервных копий: $TOTAL_BACKUPS"
log "📊 Общий размер: $TOTAL_SIZE"

log "✅ Резервное копирование завершено успешно!"
