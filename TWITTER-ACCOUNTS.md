# Twitter Scraper - Accounts Being Tracked

## Current Active Accounts (11 total)

### Original 4 Accounts
1. @hanifproduktif
2. @DilumSanjaya
3. @levifikri
4. @RayFernando1337

### New Accounts (Added 2026-02-11)
5. @AISecHub
6. @bardanslm
7. @KimiProduct
8. @syfaeth

## Cron Job Details
- **Job ID:** f033c47e-62b4-40ca-a3e2-17ed670ad488
- **Schedule:** Every 30 minutes (*/30 * * * *)
- **Timezone:** Asia/Jakarta
- **Status:** Active

## Performance Metrics
- **Average runtime:** ~40 seconds for all accounts
- **Success rate:** 100% (11/11 accounts fetching successfully)
- **Notification:** Only sends for NEW tweets (anti-duplicate)
- **Destination:** Telegram topic 362 (Twitter/X Updates)

## How to Add/Remove Accounts

Edit `/home/sysop/.openclaw/workspace/twitter-scraper.js`:
```javascript
const ACCOUNTS = [
  'account1', 'account2', 'account3'
];
```

Then manually run to test:
```bash
/home/sysop/.openclaw/workspace/twitter-scraper-local.sh
```

State file: `/home/sysop/.openclaw/workspace/twitter-scraper-state.json`
Log file: `/home/sysop/.openclaw/workspace/twitter-scraper.log`
