#!/bin/bash
# Power Report Generator - Generate monthly power consumption reports
# Usage: ./power-report.sh [YYYY-MM]

LOG_DIR="/home/sysop/.openclaw/workspace/logs/power"
REPORT_DIR="/home/sysop/.openclaw/workspace/reports"
MONTH="${1:-$(date +%Y-%m)}"

LOG_FILE="$LOG_DIR/power-$MONTH.csv"
REPORT_FILE="$REPORT_DIR/power-report-$MONTH.md"

mkdir -p "$REPORT_DIR"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "❌ No data found for $MONTH"
    exit 1
fi

echo "📊 Generating power report for $MONTH..."

# Calculate statistics from CSV (skip header)
DATA=$(tail -n +2 "$LOG_FILE")

# Count entries
TOTAL_ENTRIES=$(echo "$DATA" | wc -l)

# Calculate averages
AVG_CAPACITY=$(echo "$DATA" | awk -F',' '{sum+=$4; count++} END {if(count>0) printf "%.1f", sum/count; else print "0"}')
AVG_VOLTAGE=$(echo "$DATA" | awk -F',' '{sum+=$5; count++} END {if(count>0) printf "%.2f", sum/count; else print "0"}')
AVG_POWER=$(echo "$DATA" | awk -F',' '{sum+=$7; count++} END {if(count>0) printf "%.2f", sum/count; else print "0"}')

# Get min/max capacity
MIN_CAPACITY=$(echo "$DATA" | awk -F',' 'NR==1 || $4<min {min=$4} END {print min}')
MAX_CAPACITY=$(echo "$DATA" | awk -F',' 'NR==1 || $4>max {max=$4} END {print max}')

# Count AC vs Battery time
AC_ENTRIES=$(echo "$DATA" | awk -F',' '$2==1' | wc -l)
BATTERY_ENTRIES=$(echo "$DATA" | awk -F',' '$2==0' | wc -l)
AC_PCT=$(echo "scale=1; $AC_ENTRIES * 100 / $TOTAL_ENTRIES" | bc 2>/dev/null || echo "0")
BATTERY_PCT=$(echo "scale=1; $BATTERY_ENTRIES * 100 / $TOTAL_ENTRIES" | bc 2>/dev/null || echo "0")

# Estimate energy consumption (kWh)
# Average power (W) × hours in month / 1000
HOURS_IN_MONTH=$(date -d "$MONTH-01" +%d | wc -l)  # Days in month
if [ "$HOURS_IN_MONTH" = "0" ]; then
    HOURS_IN_MONTH=30
fi
EST_KWH=$(echo "scale=2; ($AVG_POWER * 24 * $HOURS_IN_MONTH) / 1000" | bc 2>/dev/null || echo "0")

# Calculate cost (PLN 1300VA: Rp 1.352/kWh)
EST_COST=$(echo "scale=0; $EST_KWH * 1352" | bc 2>/dev/null || echo "0")

# Generate report
cat > "$REPORT_FILE" << EOF
# ⚡ Power Consumption Report

**Period:** $MONTH  
**Generated:** $(date +%Y-%m-%d_%H:%M:%S)

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Readings** | $TOTAL_ENTRIES |
| **Avg Battery Capacity** | $AVG_CAPACITY% |
| **Avg Voltage** | ${AVG_VOLTAGE}V |
| **Avg Power Consumption** | ${AVG_POWER}W |
| **Min Capacity** | ${MIN_CAPACITY}% |
| **Max Capacity** | ${MAX_CAPACITY}% |

---

## 🔌 Power Source

| Source | Time | Percentage |
|--------|------|------------|
| **AC (Plugged)** | $AC_ENTRIES samples | ${AC_PCT}% |
| **Battery** | $BATTERY_ENTRIES samples | ${BATTERY_PCT}% |

---

## 💰 Cost Estimation

| Item | Value |
|------|-------|
| **Estimated Consumption** | ${EST_KWH} kWh |
| **Tariff (PLN 1300VA)** | Rp 1.352/kWh |
| **Estimated Cost** | **Rp ${EST_COST}** |

---

## 📈 Daily Breakdown

EOF

# Add daily breakdown
echo "$DATA" | awk -F',' '{
    date = substr($1, 1, 10)
    power[date] += $7
    count[date]++
}
END {
    print "| Date | Avg Power (W) | Readings |"
    print "|------|---------------|----------|"
    for (d in power) {
        avg = power[d] / count[d]
        printf "| %s | %.2f | %d |\n", d, avg, count[d]
    }
}' | sort >> "$REPORT_FILE"

# Add notes
cat >> "$REPORT_FILE" << EOF

---

## 📝 Notes

- Data collected every minute from \`/sys/class/power_supply/\`
- Power calculation: P = V × I (Voltage × Current)
- Cost based on PLN tariff R-1/1300VA: Rp 1.352/kWh
- Actual consumption may vary due to measurement limitations

---

## 🔧 Commands

\`\`\`bash
# View raw data
cat $LOG_FILE

# View this report
cat $REPORT_FILE

# Generate report for specific month
./power-report.sh 2026-03
\`\`\`

EOF

echo "✅ Report generated: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
