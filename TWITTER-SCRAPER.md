# Twitter/X Scraper - Status & Setup

## Current Status: ⚠️ CONFIGURATION NEEDED

The scraper script is created but **cannot fetch tweets** because:
- Nitter instances (public Twitter frontends) are mostly down or protected
- Browser automation requires Chrome/Chromium to be installed
- Twitter API requires API keys

## What's Working ✅

- ✅ Script created: `/home/sysop/.openclaw/workspace/twitter-scraper.sh`
- ✅ Cron job active (every 30 minutes)
- ✅ State file for duplicate prevention
- ✅ Telegram notification system ready
- ✅ Logging system functional

## What's Missing ⚠️

**You need ONE of these solutions:**

### Option 1: Twitter API (RECOMMENDED - Most Reliable)

1. Get **free** Twitter API access:
   - Go to https://developer.twitter.com/
   - Create account → Get API keys (Bearer Token)
   - Free tier: 500,000 tweets/month (plenty for this use case!)

2. Configure the scraper:
   ```bash
   openclaw configure --section twitter
   # Enter your API credentials
   ```

3. I'll update the script to use official API

### Option 2: Install Browser for Automation

```bash
# Install Chromium (on Arch/Manjaro)
sudo pacman -S chromium

# Then restart OpenClaw gateway
openclaw gateway restart
```

Browser automation will work after this, but it's slower than API.

### Option 3: Use External RSS/API Services

- **RSS Hub** - self-hosted RSS converter
- **TweetPI** - third-party Twitter API
- **Nitter instances** - public alternatives (often unreliable)

## Tracked Accounts

- @hanifproduktif
- @DilumSanjaya
- @levifikri
- @RayFernando1337

## Cron Job Details

- **Job ID:** `f033c47e-62b4-40ca-a3e2-17ed670ad488`
- **Schedule:** Every 30 minutes (*/30 * * * *)
- **Timezone:** Asia/Jakarta
- **Status:** Running (but needs configuration)

## How the Script Works (Once Configured)

1. Runs every 30 minutes via cron
2. Fetches latest tweets from tracked accounts
3. Compares with `last_seen` in state file
4. If new tweet found → sends to Telegram topic 193
5. Updates state to prevent duplicates

## Manual Testing

Once configured, test manually:

```bash
/home/sysop/.openclaw/workspace/twitter-scraper.sh
```

Check logs:

```bash
tail -f /home/sysop/.openclaw/workspace/twitter-scraper.log
```

## Managing Cron Job

```bash
# Disable temporarily
openclaw cron update f033c47e-62b4-40ca-a3e2-17ed670ad488 --patch.enabled false

# Enable
openclaw cron update f033c47e-62b4-40ca-a3e2-17ed670ad488 --patch.enabled true

# Run manually now
openclaw cron run f033c47e-62b4-40ca-a3e2-17ed670ad488

# View job info
openclaw cron list
```

## Next Steps

1. **Choose a solution** (API recommended)
2. **Let me know** which one you prefer
3. **I'll update the script** to work with your chosen method

---

**Note:** The script structure is solid. Once we have a working data source, it will automatically monitor accounts and notify you of new tweets!
