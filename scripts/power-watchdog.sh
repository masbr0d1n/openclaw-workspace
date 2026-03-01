#!/bin/bash
# Watchdog: Alert ketika adaptor mati dan laptop beralih ke baterai
#          + Notifikasi baterai rendah

AC_STATUS_FILE="/sys/class/power_supply/AC/online"
LOG_FILE="/home/sysop/.openclaw/workspace/logs/power-watchdog.log"
LAST_STATE_FILE="/tmp/power-state"
LAST_ALERT_FILE="/tmp/battery-alert"  # Track last battery alert time
ALERT_COOLDOWN=1800  # 30 minutes cooldown between battery alerts

mkdir -p "$(dirname "$LOG_FILE")"

# Get current AC state (1=plugged, 0=unplugged/battery)
get_ac_state() {
    if [ -f "$AC_STATUS_FILE" ]; then
        cat "$AC_STATUS_FILE"
    else
        # Fallback: check battery status
        if grep -q "Discharging" /sys/class/power_supply/BAT0/status 2>/dev/null; then
            echo "0"
        else
            echo "1"
        fi
    fi
}

# Get battery percentage
get_battery_pct() {
    cat /sys/class/power_supply/BAT0/capacity 2>/dev/null || echo "?"
}

# Get battery status (Charging/Discharging)
get_battery_status() {
    cat /sys/class/power_supply/BAT0/status 2>/dev/null || echo "Unknown"
}

# Check if enough time has passed since last alert
can_send_alert() {
    local now=$(date +%s)
    local last_alert=$(cat "$LAST_ALERT_FILE" 2>/dev/null || echo "0")
    local elapsed=$((now - last_alert))
    [ $elapsed -ge $ALERT_COOLDOWN ]
}

# Save alert timestamp
save_alert_timestamp() {
    date +%s > "$LAST_ALERT_FILE"
}

# Log function
log_msg() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Main monitoring loop
log_msg "Power watchdog started"

while true; do
    CURRENT_STATE=$(get_ac_state)
    LAST_STATE=$(cat "$LAST_STATE_FILE" 2>/dev/null || echo "1")

    # State changed?
    if [ "$CURRENT_STATE" != "$LAST_STATE" ]; then
        BATTERY_PCT=$(get_battery_pct)

        if [ "$CURRENT_STATE" = "0" ]; then
            # AC disconnected - on battery now!
            MSG="⚠️ POWER ALERT: Adaptor mati! Laptop sekarang pakai baterai ($BATTERY_PCT%)"
            echo "$MSG"
            log_msg "$MSG"
            
            # Send notification via OpenClaw (if available)
            if command -v openclaw &> /dev/null; then
                openclaw message send --channel telegram --target "-1003883313656" --thread-id "8" --message "$MSG" 2>/dev/null || true
            fi

        elif [ "$CURRENT_STATE" = "1" ]; then
            # AC reconnected
            MSG="✅ Power restored: Adaptor aktif kembali (baterai $(get_battery_pct)%)"
            echo "$MSG"
            log_msg "$MSG"
            
            # Send notification via OpenClaw (if available)
            if command -v openclaw &> /dev/null; then
                openclaw message send --channel telegram --target "-1003883313656" --thread-id "8" --message "$MSG" 2>/dev/null || true
            fi
        fi

            # Save current state
        echo "$CURRENT_STATE" > "$LAST_STATE_FILE"
    fi

    # Check battery level if on battery power
    BATTERY_PCT=$(get_battery_pct)
    BATTERY_STATUS=$(get_battery_status)
    
    if [ "$BATTERY_STATUS" = "Discharging" ] && [ "$BATTERY_PCT" != "?" ]; then
        # Critical battery (< 20%)
        if [ "$BATTERY_PCT" -lt 20 ] && can_send_alert; then
            MSG="🔴 CRITICAL: Baterai sangat rendah! ($BATTERY_PCT%) - Segera colokkan adaptor!"
            echo "$MSG"
            log_msg "$MSG"
            
            if command -v openclaw &> /dev/null; then
                openclaw message send --channel telegram --target "-1003883313656" --thread-id "8" --message "$MSG" 2>/dev/null || true
            fi
            save_alert_timestamp
            
        # Low battery (< 50%)
        elif [ "$BATTERY_PCT" -lt 50 ] && can_send_alert; then
            MSG="🟡 LOW BATTERY: Baterai di bawah 50% ($BATTERY_PCT%) - Pertimbangkan untuk mengisi daya"
            echo "$MSG"
            log_msg "$MSG"
            
            if command -v openclaw &> /dev/null; then
                openclaw message send --channel telegram --target "-1003883313656" --thread-id "8" --message "$MSG" 2>/dev/null || true
            fi
            save_alert_timestamp
        fi
    fi

    sleep 30  # Check every 30 seconds
done
