# HEARTBEAT.md

## Weather Update Cron Job

**Cron Job ID:** c9564e62-0403-43eb-a84b-6329002bcd5e
**Schedule:** Every 3 hours (0 */3 * * *) at 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 (Asia/Jakarta)
**Type:** Fully automated (isolated session with agentTurn)
**Last format update:** 2026-02-12

**This cron job:**
1. Runs automatically every 3 hours
2. Executes the weather-detailed.sh script in an isolated sub-agent session
3. Sends results directly to Telegram topic 23 (Lingkungan Hidup)
4. NO manual intervention needed

**Locations monitored:**
- Bojonggede, Bogor (latitude: -6.5952, longitude: 106.7875)
- Pancoran, Jakarta Selatan (latitude: -6.2581, longitude: 106.8427)

**Weather details included:**
- Current temperature, humidity, weather condition, wind speed/direction
- 3-hour hourly forecast with temperature, condition, and rain probability

**Script location:** /home/sysop/.openclaw/workspace/weather-detailed.sh

**Telegram delivery:**
- Chat ID: -1003883313656
- Topic ID: 23 (Lingkungan Hidup)
- Uses `threadId` parameter to send directly to topic (not as reply)

**Reliability features (updated 2026-02-11):**
- ✅ Retry mechanism: attempts up to 3 times if API fails
- ✅ Extended timeout: 15 seconds per request (was 10)
- ✅ Data validation: exits with error if no valid data received
- ✅ Empty data skip: skips hourly entries with missing values
- ✅ Error handling: script exits with code 1 if fetch fails completely
- ✅ Improved parsing: extracts data from "current" object to avoid unit field confusion
- ✅ Wind direction safety: validates numeric input before comparison to avoid "unary operator" errors
- ✅ Better error messages: shows "Data tidak tersedia" when parsing fails

**Format (updated 2026-02-11):**
- Clean, compact layout
- Current data on single line with emojis
- Simple bullet point forecasts
- Less text clutter, easier to read
