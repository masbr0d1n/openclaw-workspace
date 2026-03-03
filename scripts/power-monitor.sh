#!/bin/bash
# Power Monitor - Track laptop power consumption
# Logs power data every minute to CSV
# Generates monthly reports

LOG_DIR="/home/sysop/.openclaw/workspace/logs/power"
LOG_FILE="$LOG_DIR/power-$(date +%Y-%m).csv"
REPORT_DIR="/home/sysop/.openclaw/workspace/reports"

# Create directories
mkdir -p "$LOG_DIR" "$REPORT_DIR"

# Create CSV header if new file
if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,ac_status,battery_status,capacity_pct,voltage_v,current_ma,power_w,energy_wh" > "$LOG_FILE"
fi

# Get power supply data
get_power_data() {
    # AC status (1=plugged, 0=unplugged)
    AC_STATUS=$(cat /sys/class/power_supply/ADP1/online 2>/dev/null || echo "0")
    
    # Battery status
    BAT_STATUS=$(cat /sys/class/power_supply/BAT0/status 2>/dev/null || echo "Unknown")
    
    # Battery capacity percentage
    CAPACITY=$(cat /sys/class/power_supply/BAT0/capacity 2>/dev/null || echo "0")
    
    # Voltage (convert from microvolts to volts)
    VOLTAGE_UV=$(cat /sys/class/power_supply/BAT0/voltage_now 2>/dev/null || echo "11831000")
    VOLTAGE_V=$(awk "BEGIN {printf \"%.3f\", $VOLTAGE_UV / 1000000}")
    
    # Current (convert from microamps to milliamps)
    CURRENT_UA=$(cat /sys/class/power_supply/BAT0/current_now 2>/dev/null || echo "0")
    CURRENT_MA=$(awk "BEGIN {printf \"%.2f\", $CURRENT_UA / 1000}")
    
    # Calculate power (P = V × I)
    # Note: current_now is negative when discharging, positive when charging
    POWER_W=$(awk "BEGIN {p=($VOLTAGE_V * $CURRENT_MA) / 1000; if(p<0) p=-p; printf \"%.2f\", p}")
    
    # Energy remaining (Wh)
    CHARGE_NOW=$(cat /sys/class/power_supply/BAT0/charge_now 2>/dev/null || echo "5430000")
    ENERGY_WH=$(awk "BEGIN {printf \"%.2f\", ($VOLTAGE_V * $CHARGE_NOW) / 1000000}")
    
    # Output CSV line
    echo "$(date +%Y-%m-%d_%H:%M:%S),$AC_STATUS,$BAT_STATUS,$CAPACITY,$VOLTAGE_V,$CURRENT_MA,$POWER_W,$ENERGY_WH"
}

# Log data
LOG_ENTRY=$(get_power_data)
echo "$LOG_ENTRY" >> "$LOG_FILE"

# Parse for logging
IFS=',' read -r ts ac bat cap volt curr pwr energy <<< "$LOG_ENTRY"

# Log to console (optional)
echo "⚡ Power logged: AC=$ac | Bat=$bat% | Cap=$cap% | Power=${pwr}W | Energy=${energy}Wh"

# Alert if on battery and low
if [ "$ac" = "0" ] && [ "$cap" -lt 20 ]; then
    echo "⚠️  LOW BATTERY: $cap% - Running on battery!" >> "$LOG_DIR/alerts.log"
    # Send notification (if available)
    notify-send "Low Battery" "Battery at $cap% - Plug in charger!" 2>/dev/null || true
fi
