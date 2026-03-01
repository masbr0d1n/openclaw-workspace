# Cron Jobs Setup - OpenClaw Automated Backups

**Created:** 2026-03-01
**Status:** ✅ Active

## Overview

Automated cron jobs untuk memory persistence dan backup.

## Installed Cron Jobs

### 1. Hourly Memory Sync
```cron
0 * * * * /home/sysop/.openclaw/workspace/scripts/cron-hourly-sync.sh
```
- **Frequency:** Setiap jam (menit ke-0)
- **Function:** Sync semua MEMORY.md → SQLite database
- **Log:** `/home/sysop/.openclaw/workspace/logs/cron-hourly.log`
- **Example runs:** 08:00, 09:00, 10:00, dst...

### 2. Daily Full Backup
```cron
0 2 * * * /home/sysop/.openclaw/workspace/scripts/cron-daily-backup.sh
```
- **Frequency:** Setiap hari jam 02:00 (dini hari)
- **Function:** Backup workspace + database ke SSD
- **Log:** `/home/sysop/.openclaw/workspace/logs/cron-daily.log`
- **Includes:** Workspace tarball + database backup

### 3. Weekly Cleanup
```cron
0 3 * * 0 /home/sysop/.openclaw/workspace/scripts/cron-weekly-cleanup.sh
```
- **Frequency:** Setiap Minggu jam 03:00
- **Function:** Hapus backup lama, kompresi database
- **Log:** `/home/sysop/.openclaw/workspace/logs/cron-weekly.log`
- **Retention:** 7 daily backups

## Scripts

| Script | Purpose |
|--------|---------|
| `cron-hourly-sync.sh` | Sync MEMORY.md → SQLite |
| `cron-daily-backup.sh` | Full backup (workspace + DB) |
| `cron-weekly-cleanup.sh` | Cleanup old backups |

## Logs

Semua cron job logs disimpan di:
```
/home/sysop/.openclaw/workspace/logs/
├── cron-hourly.log    # Hourly sync logs
├── cron-daily.log     # Daily backup logs
└── cron-weekly.log    # Weekly cleanup logs
```

## Testing

Test cron jobs manually:
```bash
# Test hourly sync
bash /home/sysop/.openclaw/workspace/scripts/cron-hourly-sync.sh

# Test daily backup
bash /home/sysop/.openclaw/workspace/scripts/cron-daily-backup.sh

# Test weekly cleanup
bash /home/sysop/.openclaw/workspace/scripts/cron-weekly-cleanup.sh
```

View logs:
```bash
# Hourly sync logs
tail -f /home/sysop/.openclaw/workspace/logs/cron-hourly.log

# Daily backup logs
tail -f /home/sysop/.openclaw/workspace/logs/cron-daily.log

# Weekly cleanup logs
tail -f /home/sysop/.openclaw/workspace/logs/cron-weekly.log
```

## Monitoring

Cek status cron jobs:
```bash
# List all cron jobs
crontab -l

# Check if cron daemon is running
systemctl status cronie

# View cron logs
journalctl -u cronie -n 50
```

## Backup Locations

All backups stored at:
```
/home/sysop/ssd/backups/openclaw/
├── workspace_YYYYMMDD_HHMMSS.tar.gz    # Workspace backups
├── memory_YYYYMMDD_HHMMSS.db            # Memory database backups
└── memory_YYYYMMDD_HHMMSS.db.gz         # Compressed old backups
```

## Schedule Summary

| Schedule | Task | Coverage |
|----------|------|----------|
| **Every hour** | Memory sync | MEMORY.md → SQLite |
| **Daily 02:00** | Full backup | Workspace + DB → SSD |
| **Weekly 03:00** | Cleanup | Keep 7 daily backups |
| **On commit** | Git push | GitHub (via commit-workspace.sh) |

## Recovery Point Objectives (RPO)

- **Maximum data loss:** 1 hour (hourly sync)
- **Backup retention:** 7 days (daily backups)
- **Offsite backup:** Real-time (Git push to GitHub)

## Complete Backup Strategy

```
Every Task (manual):
  commit-workspace.sh → Git push (GitHub)

Every Hour (automatic):
  cron-hourly-sync.sh → SQLite sync

Every Day 02:00 (automatic):
  cron-daily-backup.sh → SSD backup

Every Week (automatic):
  cron-weekly-cleanup.sh → Cleanup & compress
```

## Troubleshooting

**Cron job tidak jalan:**
```bash
# Check cron service
systemctl status cronie

# Enable if not running
sudo systemctl enable --now cronie

# Check logs
tail -f /home/sysop/.openclaw/workspace/logs/cron-*.log
```

**Script permission error:**
```bash
chmod +x /home/sysop/.openclaw/workspace/scripts/cron-*.sh
```

**Log directory missing:**
```bash
mkdir -p /home/sysop/.openclaw/workspace/logs
```

## Next Steps

Optional enhancements:
- [ ] Email notifications on backup failure
- [ ] Telegram notifications on backup success
- [ ] Monitor backup size growth
- [ ] Backup to remote server (rsync)
- [ ] Health check dashboard
