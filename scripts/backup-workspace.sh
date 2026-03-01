#!/bin/bash
# Backup OpenClaw workspace ke multiple locations
# Usage: Jalankan setelah commit atau via cron

BACKUP_ROOT="/home/sysop/ssd/backups/openclaw"
WORKSPACE="/home/sysop/.openclaw/workspace"
DATE=$(date '+%Y%m%d_%H%M%S')

# Buat backup directory
mkdir -p "$BACKUP_ROOT"

# 1. Tarball snapshot (faster than git bundle for large repos)
# --exclude untuk skip file besar / temporary
tar -czf "$BACKUP_ROOT/workspace_$DATE.tar.gz" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.pi' \
  --exclude='*.log' \
  --exclude='streamhub-nextjs/test-screenshots' \
  --exclude='streamhub-nextjs/ux-review-screenshots' \
  -C "$WORKSPACE" .

# 2. Backup ke PostgreSQL (kalau ada DB yang terkait)
if command -v pg_dump &> /dev/null; then
    # Backup database yang terkait dengan workspace
    # (optional, sesuaikan dengan setup kamu)
    echo "PostgreSQL backup available but not configured"
fi

# 3. Cleanup: Hapus backup lama (keep last 10)
ls -t "$BACKUP_ROOT"/workspace_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

# 5. Sync ke cloud storage (optional)
# Rclone ke Google Drive / Dropbox / S3
if command -v rclone &> /dev/null; then
    rclone sync "$BACKUP_ROOT" remote:openclaw-backups --progress
fi

echo "✅ Backup completed: $DATE"
echo "📦 Tarball: $BACKUP_ROOT/workspace_$DATE.tar.gz"
du -h "$BACKUP_ROOT/workspace_$DATE.tar.gz"
