#!/bin/bash
# Battery health check - runs every 24 hours

TELEGRAM_CHAT="-1003883313656"
TELEGRAM_TOPIC="8"  # Tech topic

# Get battery info using upower
BATTERY_INFO=$(upower -i /org/freedesktop/UPower/devices/battery_BAT0 2>/dev/null)

if [[ -z "$BATTERY_INFO" ]]; then
    # Fallback to acpi if upower fails
    PERCENTAGE=$(acpi -b | grep -o '[0-9]*%' | head -1)
    STATE=$(acpi -a | grep -o 'on-line\|off-line')
    MESSAGE="🔋 STATUS BATERAI
📊 Persentase: ${PERCENTAGE:-Unknown}
⚡ Power Source: ${STATE:-Unknown}
⚠️ Catatan: upower tidak tersedia, data dari acpi"
else
    # Parse upower output
    PERCENTAGE=$(echo "$BATTERY_INFO" | grep "percentage:" | awk '{print $2}')
    STATE=$(echo "$BATTERY_INFO" | grep "state:" | awk '{print $2}')
    CAPACITY=$(echo "$BATTERY_INFO" | grep "capacity:" | awk '{print $2}')
    ENERGY_FULL=$(echo "$BATTERY_INFO" | grep "energy-full:" | awk '{print $2}')
    ENERGY_DESIGN=$(echo "$BATTERY_INFO" | grep "energy-full-design:" | awk '{print $2}')
    CYCLES=$(echo "$BATTERY_INFO" | grep "charge-cycles:" | awk '{print $2}')
    TEMP=$(echo "$BATTERY_INFO" | grep "temperature:" | awk '{print $2}')
    VOLTAGE=$(echo "$BATTERY_INFO" | grep "voltage:" | awk '{print $2}')

    # Determine power source
    POWER_SOURCE=$(acpi -a | grep -o 'on-line\|off-line')
    if [[ "$POWER_SOURCE" == "on-line" ]]; then
        POWER_EMOJI="🔌"
        POWER_STATUS="Adaptor Charger"
    else
        POWER_EMOJI="🔋"
        POWER_STATUS="Baterai"
    fi

    # Build message
    MESSAGE="${POWER_EMOJI} STATUS BATERAI - $(date +'%H:%M WIB')

📊 Persentase: ${PERCENTAGE}
⚡ Power Source: ${POWER_STATUS}
🔌 State: ${STATE}

🏥 Kesehatan Baterai
Kapasitas: ${CAPACITY}
Energy Full: ${ENERGY_FULL} Wh
Energy Design: ${ENERGY_DESIGN} Wh
Charge Cycles: ${CYCLES}
Temperature: ${TEMP}

⚠️ Notifikasi rutin: Check baterai setiap 24 jam"
fi

# Send to Telegram
openclaw message send --channel telegram --target "$TELEGRAM_CHAT" --thread-id "$TELEGRAM_TOPIC" --message "$MESSAGE"

# Also output for logging
echo "$MESSAGE"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Battery check completed: ${PERCENTAGE}" >> /home/sysop/.openclaw/workspace/battery-check.log
