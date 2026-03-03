# ⚡ Power Consumption Report

**Period:** 2026-03  
**Generated:** 2026-03-04_05:50:35

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Readings** | 2 |
| **Avg Battery Capacity** | 82.0% |
| **Avg Voltage** | 5.92V |
| **Avg Power Consumption** | 0.00W |
| **Min Capacity** | 82% |
| **Max Capacity** | 82% |

---

## 🔌 Power Source

| Source | Time | Percentage |
|--------|------|------------|
| **AC (Plugged)** | 2 samples | 0% |
| **Battery** | 0 samples | 0% |

---

## 💰 Cost Estimation

| Item | Value |
|------|-------|
| **Estimated Consumption** | 0 kWh |
| **Tariff (PLN 1300VA)** | Rp 1.352/kWh |
| **Estimated Cost** | **Rp 0** |

---

## 📈 Daily Breakdown

| 2026-03-04 | 0.00 | 2 |
| Date | Avg Power (W) | Readings |
|------|---------------|----------|

---

## 📝 Notes

- Data collected every minute from `/sys/class/power_supply/`
- Power calculation: P = V × I (Voltage × Current)
- Cost based on PLN tariff R-1/1300VA: Rp 1.352/kWh
- Actual consumption may vary due to measurement limitations

---

## 🔧 Commands

```bash
# View raw data
cat /home/sysop/.openclaw/workspace/logs/power/power-2026-03.csv

# View this report
cat /home/sysop/.openclaw/workspace/reports/power-report-2026-03.md

# Generate report for specific month
./power-report.sh 2026-03
```

