#!/bin/bash

# PostgreSQL Backup Script for StreamHub API
# Database: apistreamhub
# Container: apistreamhub-db

set -e

BACKUP_DIR="/home/sysop/ssd/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="apistreamhub-db"
DB_NAME="apistreamhub"
DB_USER="postgres"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "=== PostgreSQL Backup: $DB_NAME ==="
echo "Date: $(date)"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# 1. Schema only backup (structure only)
echo "[1/3] Backup schema (structure only)..."
docker exec $CONTAINER_NAME pg_dump \
  -U $DB_USER \
  --schema-only \
  $DB_NAME > $BACKUP_DIR/${DB_NAME}_schema_${DATE}.sql

echo "✅ Schema saved: ${DB_NAME}_schema_${DATE}.sql"
echo ""

# 2. Data only backup
echo "[2/3] Backup data only..."
docker exec $CONTAINER_NAME pg_dump \
  -U $DB_USER \
  --data-only \
  $DB_NAME > $BACKUP_DIR/${DB_NAME}_data_${DATE}.sql

echo "✅ Data saved: ${DB_NAME}_data_${DATE}.sql"
echo ""

# 3. Full backup with compression
echo "[3/3] Backup full (structure + data) with compression..."
docker exec $CONTAINER_NAME pg_dump \
  -U $DB_USER \
  --clean \
  --if-exists \
  $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_full_${DATE}.sql.gz

echo "✅ Full backup saved: ${DB_NAME}_full_${DATE}.sql.gz"
echo ""

# 4. Custom format backup (recommended for production)
echo "[4/4] Backup custom format..."
docker exec $CONTAINER_NAME pg_dump \
  -U $DB_USER \
  -Fc \
  -f /tmp/backup.dump \
  $DB_NAME

docker cp $CONTAINER_NAME:/tmp/backup.dump $BACKUP_DIR/${DB_NAME}_custom_${DATE}.dump
docker exec $CONTAINER_NAME rm -f /tmp/backup.dump

echo "✅ Custom backup saved: ${DB_NAME}_custom_${DATE}.dump"
echo ""

# Cleanup: Remove backups older than 7 days
echo "Cleaning up old backups (older than 7 days)..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete

echo "✅ Cleanup complete"
echo ""

# List current backups
echo "=== Current Backups ==="
ls -lh $BACKUP_DIR | tail -10

echo ""
echo "=== Backup Complete ==="
echo "Total size: $(du -sh $BACKUP_DIR | cut -f1)"
