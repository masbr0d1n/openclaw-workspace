# ⚡ Power Monitoring System

**Created:** 2026-03-04  
**Status:** ✅ Active

## Overview

Sistem monitoring konsumsi listrik laptop dengan logging otomatis dan report bulanan.

## Features

✅ **Auto-logging** - Catat data power setiap menit  
✅ **CSV format** - Mudah dianalisis dengan spreadsheet  
✅ **Monthly reports** - Generate report otomatis dengan estimasi biaya  
✅ **Low battery alerts** - Notifikasi kalau baterai rendah  
✅ **Lightweight** - Minimal resource usage  

## Installation

### Quick Install
```bash
bash /home/sysop/.openclaw/workspace/scripts/setup-power-monitor.sh install
```

### Manual Install

**1. Make scripts executable:**
```bash
chmod +x /home/sysop/.openclaw/workspace/scripts/power-*.sh
```

**2. Add cron job (run every minute):**
```bash
crontab -e
# Add this line:
* * * * * /home/sysop/.openclaw/workspace/scripts/power-monitor.sh >> /home/sysop/.openclaw/workspace/logs/power/cron.log 2>&1
```

**3. Test:**
```bash
bash /home/sysop/.openclaw/workspace/scripts/power-monitor.sh
```

## Usage

### View Current Data
```bash
# Latest reading
tail /home/sysop/.openclaw/workspace/logs/power/power-$(date +%Y-%m).csv

# All readings this month
cat /home/sysop/.openclaw/workspace/logs/power/power-$(date +%Y-%m).csv
```

### Generate Monthly Report
```bash
# Current month
bash /home/sysop/.openclaw/workspace/scripts/power-report.sh

# Specific month
bash /home/sysop/.openclaw/workspace/scripts/power-report.sh 2026-03
```

### View Reports
```bash
ls -lh /home/sysop/.openclaw/workspace/reports/
cat /home/sysop/.openclaw/workspace/reports/power-report-2026-03.md
```

## Data Collected

| Field | Description |
|-------|-------------|
| `timestamp` | Date & time of reading |
| `ac_status` | 1=Plugged in, 0=On battery |
| `battery_status` | Charging/Discharging/Full |
| `capacity_pct` | Battery percentage (0-100) |
| `voltage_v` | Battery voltage (Volts) |
| `current_ma` | Current (milliamps) |
| `power_w` | Power consumption (Watts) |
| `energy_wh` | Remaining energy (Watt-hours) |

## File Structure

```
/home/sysop/.openclaw/workspace/
├── scripts/
│   ├── power-monitor.sh          # Main monitoring script
│   ├── power-report.sh           # Report generator
│   └── setup-power-monitor.sh    # Setup utility
├── logs/
│   └── power/
│       ├── power-2026-03.csv     # Monthly log data
│       └── cron.log              # Cron execution log
└── reports/
    └── power-report-2026-03.md   # Monthly report
```

## Cron Schedule

```cron
* * * * *  # Every minute
```

**Resource usage:**
- CPU: < 1% per minute
- Memory: ~5MB
- Disk: ~1KB per reading (~43MB/month)

## Alerts

Low battery alerts logged to:
```
/home/sysop/.openclaw/workspace/logs/power/alerts.log
```

**Thresholds:**
- ⚠️ Warning: < 20%
- 🔴 Critical: < 10%

## Cost Calculation

Based on PLN tariff R-1/1300VA (2026):
- **Rate:** Rp 1.352/kWh
- **Formula:** `kWh × 1352 = Cost (IDR)`

## Uninstall

```bash
bash /home/sysop/.openclaw/workspace/scripts/setup-power-monitor.sh uninstall
```

## Troubleshooting

**No data in logs:**
```bash
# Check cron
crontab -l | grep power-monitor

# Check cron log
tail /home/sysop/.openclaw/workspace/logs/power/cron.log

# Test manually
bash /home/sysop/.openclaw/workspace/scripts/power-monitor.sh
```

**Permission denied:**
```bash
chmod +x /home/sysop/.openclaw/workspace/scripts/power-*.sh
```

**bc command not found:**
```bash
sudo pacman -S gawk  # Uses awk instead
```

## Example Report Output

```markdown
# ⚡ Power Consumption Report

**Period:** 2026-03  
**Generated:** 2026-03-04

## Summary

| Metric | Value |
|--------|-------|
| Total Readings | 43200 |
| Avg Battery Capacity | 85.3% |
| Avg Power Consumption | 25.4W |

## Cost Estimation

| Item | Value |
|------|-------|
| Estimated Consumption | 18.3 kWh |
| Estimated Cost | Rp 24,742 |
```

## Next Steps

- [ ] Add graph visualization (gnuplot/python)
- [ ] Telegram/Discord notifications
- [ ] Web dashboard
- [ ] Export to Google Sheets
- [ ] Compare month-over-month

## Related

- Battery monitoring: `scripts/power-watchdog.sh` (AC power alerts)
- System monitoring: Dashboard at `dashboard/`
