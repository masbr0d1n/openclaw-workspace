#!/bin/bash
# Weekly cleanup - remove old backups and compress logs
# Runs every Sunday at 3 AM

BACKUP_ROOT="/home/sysop/ssd/backups/openclaw"
WORKSPACE="/home/sysop/.openclaw/workspace"

echo "🧹 Weekly cleanup started: $(date)"

# Keep last 7 daily backups, delete older
ls -t "$BACKUP_ROOT"/workspace_*.tar.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_ROOT"/memory_*.db 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true

# Clean old log files (keep last 30 days)
find "$WORKSPACE/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true

# Compress backup databases older than 7 days
find "$BACKUP_ROOT" -name "memory_*.db" -mtime +7 -exec gzip {} \; 2>/dev/null || true

echo "✅ Weekly cleanup completed: $(date)"
echo "📊 Backup stats:"
echo "Workspace backups: $(ls -1 "$BACKUP_ROOT"/workspace_*.tar.gz 2>/dev/null | wc -l)"
echo "Memory backups: $(ls -1 "$BACKUP_ROOT"/memory_*.db* 2>/dev/null | wc -l)"
