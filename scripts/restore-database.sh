#!/bin/bash

# Boss AI Platform - Database Restore Script
# Восстановление SQLite баз данных из backup

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/www/boss-ai/backups"
LOG_FILE="/var/www/boss-ai/logs/restore.log"

# Database paths
OZON_DB="/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db"
MAIN_DB="/var/www/boss-ai/backend/main/data/boss_ai.db"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -o, --ozon FILE     Restore Ozon Manager database from FILE"
    echo "  -m, --main FILE     Restore Main database from FILE"
    echo "  -l, --latest        Restore latest backups"
    echo "  -h, --help          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --latest                    # Restore latest backups"
    echo "  $0 --ozon ozon_manager_20240120_120000.db.gz"
    echo "  $0 --main boss_ai_20240120_120000.db.gz"
}

# Restore Ozon Manager database
restore_ozon() {
    local backup_file="$1"

    if [ ! -f "$backup_file" ]; then
        log "ERROR: Backup file not found: $backup_file"
        exit 1
    fi

    log "Restoring Ozon Manager database from: $backup_file"

    # Stop Ozon Manager service
    log "Stopping Ozon Manager service..."
    pm2 stop boss-ai-ozon-manager || true

    # Create backup of current database
    if [ -f "$OZON_DB" ]; then
        log "Creating backup of current database..."
        cp "$OZON_DB" "${OZON_DB}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Restore database
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$OZON_DB"
    else
        cp "$backup_file" "$OZON_DB"
    fi

    # Verify restored database
    if sqlite3 "$OZON_DB" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "Ozon Manager database restored successfully"
    else
        log "ERROR: Restored database integrity check failed"
        exit 1
    fi

    # Set proper permissions
    chown www-data:www-data "$OZON_DB" || true
    chmod 644 "$OZON_DB"

    # Start Ozon Manager service
    log "Starting Ozon Manager service..."
    pm2 start boss-ai-ozon-manager
}

# Restore Main database
restore_main() {
    local backup_file="$1"

    if [ ! -f "$backup_file" ]; then
        log "ERROR: Backup file not found: $backup_file"
        exit 1
    fi

    log "Restoring Main database from: $backup_file"

    # Stop API Gateway service
    log "Stopping API Gateway service..."
    pm2 stop boss-ai-api-gateway || true

    # Create backup of current database
    if [ -f "$MAIN_DB" ]; then
        log "Creating backup of current database..."
        cp "$MAIN_DB" "${MAIN_DB}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Restore database
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$MAIN_DB"
    else
        cp "$backup_file" "$MAIN_DB"
    fi

    # Verify restored database
    if sqlite3 "$MAIN_DB" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "Main database restored successfully"
    else
        log "ERROR: Restored database integrity check failed"
        exit 1
    fi

    # Set proper permissions
    chown www-data:www-data "$MAIN_DB" || true
    chmod 644 "$MAIN_DB"

    # Start API Gateway service
    log "Starting API Gateway service..."
    pm2 start boss-ai-api-gateway
}

# Restore latest backups
restore_latest() {
    log "Restoring latest backups..."

    # Find latest Ozon Manager backup
    local latest_ozon=$(find "$BACKUP_DIR" -name "ozon_manager_*.db.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$latest_ozon" ]; then
        restore_ozon "$latest_ozon"
    else
        log "WARNING: No Ozon Manager backup found"
    fi

    # Find latest Main database backup
    local latest_main=$(find "$BACKUP_DIR" -name "boss_ai_*.db.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$latest_main" ]; then
        restore_main "$latest_main"
    else
        log "WARNING: No Main database backup found"
    fi
}

# Main script
log "=== Starting database restore ==="

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--ozon)
            restore_ozon "$2"
            shift 2
            ;;
        -m|--main)
            restore_main "$2"
            shift 2
            ;;
        -l|--latest)
            restore_latest
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log "ERROR: Unknown option $1"
            show_usage
            exit 1
            ;;
    esac
done

log "=== Restore finished ==="
