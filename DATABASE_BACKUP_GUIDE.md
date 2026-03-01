# PostgreSQL Database Backup Guide

## 🗄️ Database Structure

**Current Database:** `apistreamhub`
**Host:** PostgreSQL container (via docker)
**User:** `postgres`
**Port:** 5432

## 📦 Backup Options

### 1. Backup Structure Only (Schema)
```bash
# Hanya struktur tabel, tanpa data
docker exec -i postgres-container pg_dump \
  -U postgres \
  --schema-only \
  apistreamhub > backup-schema-$(date +%Y%m%d).sql
```

### 2. Backup Data Only
```bash
# Hanya data, tanpa struktur tabel
docker exec -i postgres-container pg_dump \
  -U postgres \
  --data-only \
  apistreamhub > backup-data-$(date +%Y%m%d).sql
```

### 3. Backup Structure + Data (Full)
```bash
# Struktur dan data lengkap
docker exec -i postgres-container pg_dump \
  -U postgres \
  --clean \
  --if-exists \
  apistreamhub > backup-full-$(date +%Y%m%d).sql
```

### 4. Backup Compressed
```bash
# Backup dengan kompresi
docker exec -i postgres-container pg_dump \
  -U postgres \
  --clean \
  --if-exists \
  apistreamhub | gzip > backup-full-$(date +%Y%m%d).sql.gz
```

### 5. Backup Custom Format (Recommended)
```bash
# Format custom dengan kompresi otomatis
docker exec -i postgres-container pg_dump \
  -U postgres \
  -Fc \
  -f /tmp/backup.dump \
  apistreamhub

# Copy dari container
docker cp postgres-container:/tmp/backup.dump ./backup-$(date +%Y%m%d).dump
```

## 📥 Restore Options

### 1. Restore dari SQL File
```bash
# Restore structure + data
docker exec -i postgres-container psql \
  -U postgres \
  apistreamhub < backup-full-20240301.sql
```

### 2. Restore dari Compressed File
```bash
# Restore dari gzipped backup
gunzip -c backup-full-20240301.sql.gz | \
  docker exec -i postgres-container psql -U postgres apistreamhub
```

### 3. Restore dari Custom Format
```bash
# Copy ke container dulu
docker cp backup-20240301.dump postgres-container:/tmp/backup.dump

# Restore
docker exec -i postgres-container pg_restore \
  -U postgres \
  -d apistreamhub \
  /tmp/backup.dump
```

## 🔧 Automated Daily Backup

### Backup Script
```bash
#!/bin/bash
# File: /home/sysop/.openclaw/workspace/scripts/backup-db.sh

BACKUP_DIR="/home/sysop/ssd/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="postgres"  # Ganti dengan nama container postgres yang sebenarnya

mkdir -p $BACKUP_DIR

# Full backup dengan kompresi
docker exec $CONTAINER_NAME pg_dump \
  -U postgres \
  --clean \
  --if-exists \
  apistreamhub | gzip > $BACKUP_DIR/apistreamhub_$DATE.sql.gz

# Backup custom format (recommended)
docker exec $CONTAINER_NAME pg_dump \
  -U postgres \
  -Fc \
  -f /tmp/backup.dump \
  apistreamhub

docker cp $CONTAINER_NAME:/tmp/backup.dump $BACKUP_DIR/apistreamhub_$DATE.dump

# Cleanup: hapus backup lebih dari 7 hari
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete

echo "Backup completed: apistreamhub_$DATE"
```

### Setup Cron
```bash
# Edit crontab
crontab -e

# Tambahkan ini untuk backup setiap jam 02:00
0 2 * * * /home/sysop/.openclaw/workspace/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

## 📊 Database Tables

Untuk melihat struktur database:
```bash
# List semua tabel
docker exec -i postgres-container psql \
  -U postgres \
  apistreamhub \
  -c "\dt"

# Lihat struktur tabel tertentu
docker exec -i postgres-container psql \
  -U postgres \
  apistreamhub \
  -c "\d videos"

# Lihat struktur semua tabel
docker exec -i postgres-container psql \
  -U postgres \
  apistreamhub \
  -c "\d+"
```

## 🗂️ Backup ke Lokasi Lain

### Backup ke SSD
```bash
# Backup ke /home/sysop/ssd/backups/
BACKUP_DIR="/home/sysop/ssd/backups/postgresql"
mkdir -p $BACKUP_DIR

docker exec postgres-container pg_dump -U postgres apistreamhub | \
  gzip > $BACKUP_DIR/apistreamhub_$(date +%Y%m%d).sql.gz
```

### Backup ke Network/Cloud
```bash
# Setelah backup, sync ke remote storage
rsync -avz /home/sysop/ssd/backups/postgresql/ \
  user@remote-server:/path/to/backups/
```

## ⚠️ Tips

1. **Struktur Only** - Gunakan untuk version control schema
2. **Data Only** - Gunakan untuk transfer data antar environment
3. **Full Backup** - Gunakan untuk disaster recovery
4. **Custom Format** - Recommended untuk production (fleksibel restore)
5. **Compressed** - Hemat storage
6. **Schedule** - Setup automated daily backup

## 🎯 Quick Commands

```bash
# Cek nama container postgres
docker ps | grep postgres

# Backup full & compressed (NOW)
docker exec -i <POSTGRES_CONTAINER> pg_dump -U postgres apistreamhub | \
  gzip > ~/ssd/backups/apistreamhub_$(date +%Y%m%d_%H%M).sql.gz

# Restore (jika perlu)
gunzip -c ~/ssd/backups/apistreamhub_20240301_020000.sql.gz | \
  docker exec -i <POSTGRES_CONTAINER> psql -U postgres apistreamhub
```
