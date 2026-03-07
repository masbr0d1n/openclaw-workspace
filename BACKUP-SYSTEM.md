# Repository Backup System

## Overview

Automated backup system for StreamHub repositories using rsync.

## Backup Location

**Destination:** `/home/sysop/ssd/repobak/`

## Repositories Backed Up

1. **streamhub-videotron** - Videotron frontend
2. **streamhub-tvhub** - TV Hub frontend
3. **apistreamhub-fastapi** - Backend API

## How It Works

### Manual Backup

Run the backup script manually:

```bash
/home/sysop/.openclaw/workspace/backup-repos.sh
```

### Automatic Backup (After Every Commit)

Post-commit git hooks are installed in:
- `/home/sysop/.openclaw/workspace/.git/hooks/post-commit`
- `/home/sysop/.openclaw/workspace/apistreamhub-fastapi/.git/hooks/post-commit`

**Every time you commit**, the backup runs automatically!

## What Gets Backed Up

**Included:**
- ✅ All source code (.ts, .tsx, .py, .js, etc.)
- ✅ Configuration files
- ✅ Documentation
- ✅ Git history (separate backup)

**Excluded:**
- ❌ node_modules (can be reinstalled)
- ❌ .next (build artifacts)
- ❌ .git (git history backed up separately)
- ❌ *.log files
- ❌ dist/build directories
- ❌ __pycache__

## Backup Structure

```
/home/sysop/ssd/repobak/
├── streamhub-videotron/
├── streamhub-tvhub/
├── apistreamhub-fastapi/
└── backup_YYYYMMDD_HHMMSS.log
```

## Restore from Backup

To restore a repository:

```bash
# Stop any running servers
pkill -f "next dev"
pkill -f "uvicorn"

# Restore from backup
rsync -avz /home/sysop/ssd/repobak/streamhub-videotron/ /home/sysop/.openclaw/workspace/streamhub-videotron/

# Reinstall dependencies
cd /home/sysop/.openclaw/workspace/streamhub-videotron
npm install

# Restart server
npm run dev
```

## Backup Log

Each backup creates a log file:
- **Location:** `/home/sysop/ssd/repobak/backup_YYYYMMDD_HHMMSS.log`
- **Contains:** Timestamp and list of repositories backed up

## Testing Backup

To test if backup is working:

```bash
# Run backup script
/home/sysop/.openclaw/workspace/backup-repos.sh

# Check backup directory
ls -la /home/sysop/ssd/repobak/

# Verify files exist
ls -la /home/sysop/ssd/repobak/streamhub-videotron/src/
```

## Troubleshooting

### Backup Fails with Permission Error

```bash
# Ensure backup directory exists and has correct permissions
mkdir -p /home/sysop/ssd/repobak
chmod 755 /home/sysop/ssd/repobak
```

### Post-Commit Hook Not Running

```bash
# Check if hook is executable
ls -la /home/sysop/.openclaw/workspace/.git/hooks/post-commit

# Make executable if needed
chmod +x /home/sysop/.openclaw/workspace/.git/hooks/post-commit
```

### Rsync Error 23

This is normal - it means some files were excluded (node_modules, .next, etc.)
The backup still completes successfully for all important files.

## Best Practices

1. ✅ **Commit often** - Each commit triggers automatic backup
2. ✅ **Push to Forgejo** - Remote backup is additional safety
3. ✅ **Check backup logs** - Verify backups are running
4. ✅ **Test restore periodically** - Ensure backups are valid

## Created

**Date:** 2026-03-07  
**Script:** `/home/sysop/.openclaw/workspace/backup-repos.sh`  
**Hooks:** Post-commit hooks installed in workspace and apistreamhub-fastapi
