# HEARTBEAT.md

Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.

---

## System Dashboard

**Location:** /home/sysop/.openclaw/workspace/dashboard/

**Server:** Node.js HTTP server on port 3000

**Files:**
- `server.js` - Backend API untuk system stats
- `index.html` - Frontend UI
- `style.css` - Modern CSS styling
- `script.js` - Real-time updates & fetch
- `start.sh` - Start/stop script

**Access:**
- Lokal: http://localhost:3000
- Network: http://<IP-addr>:3000

**Features:**
1. **CPU Usage** - Real-time dengan color coding
2. **RAM Usage** - Used/total MB + percentage bar
3. **Storage** - Used/total GB + percentage
4. **Temperature** - CPU core temp dengan warn level
5. **Battery** - Status, health, cycles, temp, voltage
6. **Network** - WiFi/Ethernet type + traffic (RX/TX)
7. **Top 10 Apps** - Sort by RAM usage
8. **Date/Time** - Asia/Jakarta timezone

**Update frequency:**
- API fetch: Every 2 seconds
- Auto-refresh: Every 5 minutes

**Start command:**
```bash
bash /home/sysop/.openclaw/workspace/dashboard/start.sh
```

**Dependencies:**
- Node.js (npm install -g nodejs)
- System tools: free, top, df, upower, sensors

**Optional enhancements:**
- Add authentication
- Historical data charts
- Process manager
- Custom themes

---

## Other Cron Jobs & Automation

(See below sections for other tasks)

