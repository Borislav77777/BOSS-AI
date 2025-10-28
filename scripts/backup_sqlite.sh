#!/bin/bash
set -euo pipefail

DB_PATH=${DB_PATH:-"/var/www/boss-ai/data/boss_ai.db"}
BACKUP_DIR=${BACKUP_DIR:-"/var/backups/boss-ai"}
RETENTION_DAYS=${RETENTION_DAYS:-14}

mkdir -p "$BACKUP_DIR"
ts=$(date +"%Y%m%d-%H%M%S")
dest="$BACKUP_DIR/boss_ai_${ts}.sqlite.gz"

if [ ! -f "$DB_PATH" ]; then
  echo "Database file not found: $DB_PATH" >&2
  exit 1
fi

echo "Creating SQLite backup: $dest"
gzip -c "$DB_PATH" > "$dest"

echo "Pruning backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -type f -name 'boss_ai_*.sqlite.gz' -mtime +$RETENTION_DAYS -delete

echo "Backup completed"
