# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Music Downloads

### YouTube Music Downloads
- **Music directory:** `/home/sysop/ssd/Music/`
- **Download format:** MP3 with embedded thumbnail and metadata
- **Command template:** `yt-dlp -x --audio-format mp3 --embed-thumbnail --add-metadata -o "/home/sysop/ssd/Music/%(artist)s/%(album)s/%(title)s.%(ext)s" [URL]`
- **Current collection:** 171 songs across multiple artists (Tatsuro Yamashita, Dewa 19, KLa Project, Padi, Ocarina, YOASOBI, Sheila On 7, Yu Kosuge & Ludwig van Beethoven, LJones, Emapea)
- **Folder structure:** Organized by Artist/Album hierarchy
- **Last updated:** 2026-02-22 (moved from /mnt/data/music/ to /home/sysop/ssd/Music/)

## Video Downloads

### Direct Video Downloads
- **Video directory:** `/home/sysop/ssd/videos/`
- **Manual downloads:** `/home/sysop/ssd/videos/manual/`
- **Movies directory:** `/home/sysop/ssd/Movies/`

**X/Twitter Video Downloads:**
- **Tool:** yt-dlp (supports X/Twitter natively)
- **Command:** `yt-dlp -o "/home/sysop/ssd/videos/manual/%(title)s.%(ext)s" "<twitter_url>"`
- **Supported:** X.com, Twitter.com video links
- **Output:** MP4 format with original title
- **First test:** 2026-02-23 - Downloaded "Seedance 2.0" video (24 MB)

### Torrent Downloads
- **Client:** Transmission daemon
- **Config:** `/home/sysop/.config/transmission-daemon/`
- **Completed:** `/home/sysop/ssd/torrents/complete/`
- **Incomplete:** `/home/sysop/ssd/torrents/incomplete/`
- **Watch folder:** `/home/sysop/ssd/torrents/watch/`
- **Commands:**
  - List: `transmission-remote -l`
  - Add: `transmission-remote --add "magnet:?xt=..."`
  - Stop: `transmission-remote -t <ID> -S`
  - Remove: `transmission-remote -t <ID> -r`
- **Setup:** 2026-02-22

## Power Monitoring

### Battery Alerts
- **Script:** `/home/sysop/.openclaw/workspace/scripts/power-watchdog.sh`
- **Target:** Telegram group "Futatalk" (-1003883313656), topic 8 (Power/Baterai)
- **Alerts:**
  - ⚠️ Adaptor mati/hidup (AC power changes)
  - 🟡 Low battery (< 50%) - Cooldown: 30 minutes
  - 🔴 Critical battery (< 20%) - Cooldown: 30 minutes
- **Check interval:** Every 30 seconds
- **Status:** Always running in background
- **Log:** `/home/sysop/.openclaw/workspace/logs/power-watchdog.log`

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
