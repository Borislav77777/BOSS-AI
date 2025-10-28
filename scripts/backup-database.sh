#!/bin/bash

# Boss AI Platform - Database Backup Script
# Автоматический backup SQLite баз данных с ротацией

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/www/boss-ai/backups"
LOG_FILE="/var/www/boss-ai/logs/backup.log"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Database paths
OZON_DB="/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db"
MAIN_DB="/var/www/boss-ai/backend/main/data/boss_ai.db"

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting database backup ==="

# Check if databases exist
if [ ! -f "$OZON_DB" ]; then
    log "WARNING: Ozon Manager database not found at $OZON_DB"
fi

if [ ! -f "$MAIN_DB" ]; then
    log "WARNING: Main database not found at $MAIN_DB"
fi

# Backup Ozon Manager database
if [ -f "$OZON_DB" ]; then
    log "Backing up Ozon Manager database..."
    cp "$OZON_DB" "$BACKUP_DIR/ozon_manager_$DATE.db"

    # Compress backup
    gzip "$BACKUP_DIR/ozon_manager_$DATE.db"
    log "Ozon Manager backup created: ozon_manager_$DATE.db.gz"

    # Verify backup integrity
    if sqlite3 "$OZON_DB" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "Ozon Manager database integrity check: OK"
    else
        log "ERROR: Ozon Manager database integrity check failed"
        exit 1
    fi
fi

# Backup Main database (if exists)
if [ -f "$MAIN_DB" ]; then
    log "Backing up Main database..."
    cp "$MAIN_DB" "$BACKUP_DIR/boss_ai_$DATE.db"

    # Compress backup
    gzip "$BACKUP_DIR/boss_ai_$DATE.db"
    log "Main database backup created: boss_ai_$DATE.db.gz"

    # Verify backup integrity
    if sqlite3 "$MAIN_DB" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "Main database integrity check: OK"
    else
        log "ERROR: Main database integrity check failed"
        exit 1
    fi
fi

# Cleanup old backups (keep only last 7 days)
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.db.gz" -type f -mtime +$RETENTION_DAYS -delete
log "Old backups cleaned up"

# Show backup status
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.db.gz" -type f | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "Backup completed successfully"
log "Total backups: $BACKUP_COUNT"
log "Backup directory size: $BACKUP_SIZE"
log "=== Backup finished ==="

exit 0
