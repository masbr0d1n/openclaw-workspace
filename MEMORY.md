# MEMORY.md - Long-term Memory

## Development Automation

### FFmpeg Thumbnail Generation (CRITICAL)

**Issue:** `FFmpeg exit code 234` - Invalid frame size error when generating thumbnails

**Error Message:**
```
[vost#0:0/mjpeg @ 0x5569d95f82c0] Invalid frame size: 320x-1.
Error opening output files: Invalid argument
```

**Root Cause:** 
The `-s 320x-1` parameter not parsing `-1` as "auto height" correctly in some FFmpeg versions/builds.

**Solution:**
Use video filter (`-vf`) with scale filter instead of size parameter (`-s`):

```python
# ❌ WRONG - Causes exit code 234
cmd = ["ffmpeg", "-i", video_path, "-ss", "1", "-vframes", "1",
       "-s", "320x-1", output_path, "-y"]

# ✅ CORRECT - Reliable
cmd = ["ffmpeg", "-i", video_path, "-ss", "1", "-vframes", "1",
       "-vf", "scale=320:-1", output_path, "-y"]
```

**Implementation:** `/home/sysop/.openclaw/workspace/apistreamhub-fastapi/app/services/ffmpeg_service.py`

**Key Points:**
- `-vf "scale=320:-1"` → Width 320px, height auto-calculated maintaining aspect ratio
- File output instead of pipe (more reliable for binary data)
- Base64 encoding for database storage
- Return None on failure (graceful degradation)

**Verification:**
```bash
# Test thumbnail generation
bash /home/sysop/.openclaw/workspace/test-ffmpeg-v2.sh

# Puppeteer test
node /home/sysop/.openclaw/workspace/streamhub-nextjs/tests/puppeteer/test-thumbnail-display.js
```

**Frontend Display:**
- Thumbnails stored as base64 in `thumbnail_data` column
- Fallback: Blue gradient placeholder "VID" for videos without thumbnails
- Fallback: Green gradient placeholder "IMG" for images without thumbnails
- File: `/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx`

**When This Breaks:**
- After FFmpeg upgrade/downgrade
- Different FFmpeg build configurations
- Container image changes

**How to Fix:**
1. Check backend logs: `docker logs apistreamhub-api --tail 50 | grep -i thumbnail`
2. Test FFmpeg command manually in container
3. Verify scale filter syntax: `ffmpeg -i input.mp4 -vf "scale=320:-1" output.jpg`
4. Update `app/services/ffmpeg_service.py` if needed

**Test Results (2026-03-01):**
- ✅ Thumbnail generation working
- ✅ Puppeteer test: 2 videos with thumbnails
- ✅ Frontend: Thumbnails displaying correctly
- ✅ Fallback placeholders working

**Documentation:** `/home/sysop/.openclaw/workspace/VIDEO_UPLOAD_THUMBNAIL_SUCCESS.md`

**CRITICAL:** Always test thumbnail generation after any FFmpeg or container changes!

---

### Database Permission Fix (CRITICAL)

**Issue:** `permission denied for table <table_name>` errors occur frequently after database changes.

**Root Cause:** Tables/sequences owned by `postgres` user instead of `apistreamhub`.

**Check Script:**
```bash
bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh
```

**Fix Script:**
```bash
bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
```

**When to Run:**
- After database initialization
- After migrations
- After database restore
- After creating new tables
- When permission errors appear

**Verification:**
```bash
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public';
"
# All should show: tableowner = apistreamhub
```

**Documentation:** `/home/sysop/.openclaw/workspace/DATABASE_PERMISSION_FIX.md`

**CRITICAL:** Always check permissions after ANY database work!

---

### Git Workflow Automation

**Auto-Commit & Push System (Active):**

Setup: 2026-03-01

**1. Pre-Commit Hook (Database Backup)**
- Script: `.git/hooks/pre-commit`
- Triggers: Every `git commit`
- Action: Automatically backs up PostgreSQL database
- Location: `backups/database/`
- Retention: Last 10 backups per project
- Format: `apistreamhub_<branch>_<timestamp>.sql.gz`

**2. Post-Commit Hook (Auto-Push)**
- Script: `.git/hooks/post-commit`
- Triggers: After every `git commit`
- Action: Automatically pushes to Forgejo
- Remote: `forgejo` (http://localhost:3333 or git@localhost:2222)
- Branch: Current branch

**3. Auto-Commit Script**
- Location: `/home/sysop/.openclaw/workspace/scripts/auto-commit-push.sh`
- Usage: `./scripts/auto-commit-push.sh` or `./scripts/auto-commit-push.sh "commit message"`
- Action: Adds all changes, commits, and pushes

**4. Setup Scripts**
- Pre-commit backup: `./scripts/setup-pre-commit-hook.sh`
- Auto-push: `./scripts/setup-auto-push.sh`

**Workflow:**
```bash
# After completing any task:
git add .
git commit -m "feat: description"
# → Database backup runs (pre-commit)
# → Changes committed
# → Auto-push to Forgejo (post-commit)
# → Done!
```

**Skip Hooks (if needed):**
```bash
git commit --no-verify -m "quick commit without backup/push"
```

**Projects with Auto-Commit & Push:**
- apistreamhub-fastapi (backend)
- streamhub-nextjs (frontend)

**Automation Benefits:**
- ✅ No manual database backups needed
- ✅ No manual git push needed
- ✅ Automatic sync to Forgejo
- ✅ Complete history preservation
- ✅ Disaster recovery ready

---

## Memory System Configuration

**Current Setup:** Memory integration via **qmd @openklaubot**
- Status: Active (as of 2026-02-14)
- Provider: qmd
- Bot: @openklaubot
- Integration: OpenClaw workspace + qmd backend for memory storage/retrieval

**How It Works:**
- Uses memory_search tool for semantic search across workspace
- Uses memory_get tool for targeted snippet retrieval
- Searches both MEMORY.md (this file) and memory/YYYY-MM-DD.md (daily logs)
- qmd @openklaubot provides backend memory storage

**Usage Guidelines:**
- Before answering questions about prior work: run memory_search
- For detailed context: use memory_get after search to pull specific lines
- Keep MEMORY.md for curated, long-term information
- Keep daily memory files (memory/YYYY-MM-DD.md) for raw logs

## User Information

**Name:** Hany Andriyanto
**Timezone:** Asia/Jakarta (GMT+7)
**Location:** Bojonggede, Bogor & Pancoran, Jakarta Selatan

## System Setup

### Automation Scripts

**Weather Update:**
- Script: /home/sysop/.openclaw/workspace/weather-cron.sh
- Cron: Every 3 hours (0 */3 * * *)
- Telegram: Topic 23 (Lingkungan Hidup)
- Locations: Bojonggede, Bogor & Pancoran, Jakarta Selatan

**Twitter/X Scraper:**
- Script: /home/sysop/.openclaw/workspace/twitter-scraper.js
- Wrapper: /home/sysop/.openclaw/workspace/twitter-scraper.sh
- Cron: Every 30 minutes (*/30 * * * *)
- Analysis: Rule-based (not LLM-based)
- Telegram: Topic 607 (social media)

**Battery Health Check:**
- Script: /home/sysop/.openclaw/workspace/battery-check.sh
- Cron: Daily at 19:00 (0 19 * * *)
- Checks: Capacity, cycles, temperature, voltage
- Telegram: Topic 8 (tech/battery)

**Video Monitor (TikTok/YouTube):**
- Script: /home/sysop/.openclaw/workspace/video-monitor.sh
- Cron: Every 30 minutes (*/30 * * * *)
- Telegram: Topic 607 (social media)
- Uses: yt-dlp for video checking

### System Dashboard

**Location:** /home/sysop/.openclaw/workspace/dashboard/
**Server:** node server.js (port 3000)
**Status:** Running (auto-start)

**Features:**
- System Stats: CPU, RAM, Storage, Battery, Network, Top 10 Apps
- Music Controls: Play/Pause/Next/Previous for Musikcube
- Update Rate: Every 2 seconds
- Tech Stack: Node.js, vanilla JavaScript

**Music Controller:**
- Player: musikcube (MPRIS/DBus)
- Status: Detected and working
- API: /api/music/status and /api/music/control
- Controls: Play, Pause, Next, Previous (via DBus)

### Telegram Configuration

**Chat ID:** -1003883313656 (Futatalk)
**Topics:**
- 1: Main chat
- 8: Tech/Battery
- 23: Lingkungan Hidup (Weather)
- 607: Social media (Twitter/Video monitoring)

### Cron Jobs (IDs)

- Weather: c9564e62-0403-43eb-a84b-6329002bcd5e
- Twitter: f033c47e-XXXX-XXXX-XXXX-XXXXXXXXXXXX
- Battery: e392e7cf-XXXX-XXXX-XXXX-XXXXXXXXXXXX
- Video: 918905d2-XXXX-XXXX-XXXX-XXXXXXXXXXXX

## Important Notes

**Preferences:**
- Prefers rule-based analysis over LLM for Twitter (faster, more stable)
- Notifications organized into specialized topics
- Simple but good UI/UX for dashboard

**System Details:**
- OS: Arch Linux
- Host: archlinux
- Node version: v24.13.0
- Model: zai/glm-4.7

**Music Downloads:**
- Directory: /home/sysop/ssd/Music/
- Format: MP3 with embedded thumbnail and metadata
- Command: yt-dlp -x --audio-format mp3 --embed-thumbnail --add-metadata -o "/home/sysop/ssd/Music/%(artist)s/%(album)s/%(title)s.%(ext)s" [URL]
- Last location change: 2026-02-22 (moved from /mnt/data/music/ to /home/sysop/ssd/Music/)

**Video Downloads:**
- Directory: /home/sysop/ssd/videos/
- Manual downloads: /home/sysop/ssd/videos/manual/
- Movies: /home/sysop/ssd/Movies/

**Power & Storage Monitoring:**

### Battery Alerts (power-watchdog.sh)
- Target: Telegram topic 8 (Power/Baterai)
- Alerts: AC power changes, Low battery (< 50%), Critical battery (< 20%)
- Check interval: Every 30 seconds
- Status: Always running in background

### Disk Usage Alerts (disk-monitor.sh)
- Service: disk-monitor.service (systemd user service)
- Target: Discord channel #system-health (1477427478162309381)
- Alerts: Disk usage ≥ 95% (Root, Home, or SSD partitions)
- Cooldown: 1 hour between alerts
- Monitored: Root (/), Home (/home), SSD (/home/sysop/ssd)
- Check interval: Every 5 minutes
- Status: Active (auto-start on login)
- Setup: 2026-03-01

**Torrent Downloads (Transmission):**
- Client: transmission-daemon
- Config dir: /home/sysop/.config/transmission-daemon
- Folder structure:
  - /home/sysop/ssd/torrents/complete/ - Download selesai
  - /home/sysop/ssd/torrents/incomplete/ - Sedang download
  - /home/sysop/ssd/torrents/watch/ - Folder monitoring
  - /home/sysop/ssd/Movies/ - File film yang sudah dipindah
- Commands:
  - Cek progress: transmission-remote -l
  - Tambah torrent: transmission-remote --add "magnet:?xt=..."
  - Stop: transmission-remote -t <ID> -S
  - Remove: transmission-remote -t <ID> -r
- First download: "The Secret World of Arrietty" (2010) - 830.7 MB
- Setup date: 2026-02-22

## Project History

**Completed (as of 2026-02-24):**
- ✅ Weather cron job (3h, fixed timeout 15s + retry)
- ✅ Twitter scraper (Puppeteer, rule-based analysis)
- ✅ Battery health check (daily 19:00)
- ✅ Video monitor (yt-dlp, TikTok/YouTube)
- ✅ System dashboard (Node.js, vanilla JS, real-time updates)
- ✅ Musikcube music controller (DBus/MPRIS integration)
- ✅ Torrent download setup (Transmission daemon)
- ✅ Download migration to SSD (/home/sysop/data/ → /home/sysop/ssd/)
- ✅ **FastAPI + PostgreSQL PoC (apistreamhub-fastapi)** - Complete migration from Flask to FastAPI
  - 20 API endpoints (Auth, Channels, Videos)
  - JWT authentication with bcrypt
  - PostgreSQL async database (SQLAlchemy 2.0)
  - 90% test coverage (32 tests)
  - Docker deployment ready
  - GitHub repository: https://github.com/masbr0d1n/apistreamhub-fastapi
  - Status: Production Ready 🚀

**Key Decisions:**
- Timeout increase: wttr.in API needed >8s, increased to 15s with retry
- Topic routing: Organized notifications into specialized topics
- Analysis method: Rule-based (keyword detection) for Twitter context analysis
- Dashboard stack: Vanilla JS + Node.js for simplicity
- Music control: Native Musikcube player with DBus integration (no playerctl/mpc needed)
- Download location: Migrated to /home/sysop/ssd/ for better storage management
- Torrent client: Transmission daemon for background torrent downloads

**FastAPI + PostgreSQL Migration Decisions (2026-02-24):**
- **Framework**: FastAPI chosen over Flask for native async/await support (3x faster target)
- **Database**: PostgreSQL chosen over MongoDB for relational capabilities and modern async support (asyncpg)
- **ORM**: SQLAlchemy 2.0 async with expire_on_commit=False for test compatibility
- **Authentication**: JWT with direct bcrypt (not passlib) to avoid 72-byte password limit bug
- **Testing**: In-memory SQLite for fast test execution, achieved 90% coverage
- **Deployment**: Docker multi-stage build (726MB image) with docker-compose for PostgreSQL
- **Validation**: Pydantic v2 throughout with email-validator for EmailStr fields

## Workflow

**Before answering questions about:**
- Prior work → Run memory_search, then memory_get
- Decisions → Check MEMORY.md and relevant daily files
- Dates/people → Search memory files first
- Todos/Preferences → Check MEMORY.md and daily logs

**Memory Maintenance:**
- Daily: Create/update memory/YYYY-MM-DD.md with raw logs
- Long-term: Update MEMORY.md with distilled wisdom
- Review: Periodically (every few days) during heartbeats
- Cleanup: Remove outdated info from MEMORY.md

**Project Files:**
- Workspace: /home/sysop/.openclaw/workspace/
- Daily logs: memory/YYYY-MM-DD.md
- Long-term: MEMORY.md (this file)
- Skills: ~/.npm-global/lib/node_modules/openclaw/skills/

## GitHub Repositories
- **apistreamhub-fastapi**: https://github.com/masbr0d1n/apistreamhub-fastapi
  - FastAPI + PostgreSQL PoC for StreamHub API
  - Status: Production Ready
  - Coverage: 90% (32 tests)
  - Endpoints: 20 (Auth, Channels, Videos)
  - Tech Stack: FastAPI, PostgreSQL 16, SQLAlchemy 2.0 async, Pydantic v2, Docker
  - Created: 2026-02-24
  - Duration: ~4 hours
