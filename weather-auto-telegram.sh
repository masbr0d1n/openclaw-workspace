#!/bin/bash
# Fully automated weather update - sends directly to Telegram topic 23

# Telegram info
CHAT_ID="-1003883313656"
TOPIC_ID="23"

# Wind direction decoder
wind_dir() {
    local deg=$1
    local d=${deg%.*}
    if [ $d -ge 338 ] || [ $d -le 22 ]; then
        echo "Utara"
    elif [ $d -ge 23 ] && [ $d -le 67 ]; then
        echo "Timur Laut"
    elif [ $d -ge 68 ] && [ $d -le 112 ]; then
        echo "Timur"
    elif [ $d -ge 113 ] && [ $d -le 157 ]; then
        echo "Tenggara"
    elif [ $d -ge 158 ] && [ $d -le 202 ]; then
        echo "Selatan"
    elif [ $d -ge 203 ] && [ $d -le 247 ]; then
        echo "Barat Daya"
    elif [ $d -ge 248 ] && [ $d -le 292 ]; then
        echo "Barat"
    else
        echo "Barat Laut"
    fi
}

weather_desc() {
    case $1 in
        0) echo "Cerah" ;;
        1) echo "Cerah Berawan" ;;
        2) echo "Berawan Sebagian" ;;
        3) echo "Mendung" ;;
        45|48) echo "Kabut" ;;
        51|53|55) echo "Gerimis" ;;
        61|63|65) echo "Hujan" ;;
        80|81|82) echo "Hujan Badai" ;;
        *) echo "Kode $1" ;;
    esac
}

DATE=$(date +"%A, %d %b %Y" | sed 's/Monday/Senin/;s/Tuesday/Selasa/;s/Wednesday/Rabu/;s/Thursday/Kamis/;s/Friday/Jumat/;s/Saturday/Sabtu/;s/Sunday/Minggu/')

# Build message
MESSAGE="🌤️ PRAKIRAAN CUACA DETAIL - 3 JAM KE DEPAN
📅 $DATE | ⏰ $(date +%H:%M) WIB

"

# Fetch Bojonggede data
BOJONG_DATA=$(timeout 10 curl -s "https://api.open-meteo.com/v1/forecast?latitude=-6.5952&longitude=106.7875&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m&forecast_hours=3&timezone=Asia/Jakarta" 2>/dev/null)

# Parse current data
CURR_TEMP=$(echo "$BOJONG_DATA" | grep -o '"temperature_2m":[0-9.]*' | head -1 | cut -d: -f2)
CURR_RH=$(echo "$BOJONG_DATA" | grep -o '"relative_humidity_2m":[0-9]*' | head -1 | cut -d: -f2)
CURR_WCODE=$(echo "$BOJONG_DATA" | grep -o '"weather_code":[0-9]*,' | head -1 | grep -o '[0-9]*')
CURR_WIND=$(echo "$BOJONG_DATA" | grep -o '"wind_speed_10m":[0-9.]*' | head -1 | cut -d: -f2)
CURR_WDIR=$(echo "$BOJONG_DATA" | grep -o '"wind_direction_10m":[0-9]*' | head -1 | cut -d: -f2)

WDESC=$(weather_desc $CURR_WCODE)
WDIR_TEXT=$(wind_dir $CURR_WDIR)

MESSAGE+="📍 **BOJONGGEDE - BOGOR**
─────────────────────────────
🌡️ Suhu: $CURR_TEMP°C
💨 Kelembaban: $CURR_RH%
☁️ Kondisi: $WDESC
🌬️ Angin: $CURR_WIND km/h arah $WDIR_TEXT

Prakiraan 3 jam ke depan:
"

# Parse hourly arrays
TEMPS=$(echo "$BOJONG_DATA" | grep -o '"temperature_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
RHS=$(echo "$BOJONG_DATA" | grep -o '"relative_humidity_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
WCODES=$(echo "$BOJONG_DATA" | grep -o '"weather_code":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
WINDS=$(echo "$BOJONG_DATA" | grep -o '"wind_speed_10m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
WDIRS=$(echo "$BOJONG_DATA" | grep -o '"wind_direction_10m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
RAINS=$(echo "$BOJONG_DATA" | grep -o '"precipitation_probability":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
TIMES=$(echo "$BOJONG_DATA" | grep -o '"time":\[.*\]' | grep -o 'T[0-9][0-9]:[0-9][0-9]' | tr 'T' ' ' | head -3)

i=1
while read -r TIME; do
    TEMP=$(echo "$TEMPS" | sed -n "${i}p")
    RH=$(echo "$RHS" | sed -n "${i}p")
    WCODE=$(echo "$WCODES" | sed -n "${i}p")
    WIND=$(echo "$WINDS" | sed -n "${i}p")
    WDIR=$(echo "$WDIRS" | sed -n "${i}p")
    RAIN=$(echo "$RAINS" | sed -n "${i}p")

    WD=$(weather_desc $WCODE)
    WDT=$(wind_dir $WDIR)

    MESSAGE+="• $TIME WIB: $TEMP°C | $WD | Kelembaban $RH% | Angin $WIND km/h $WDT | Peluang hujan $RAIN%\n"
    i=$((i+1))
done <<< "$TIMES"

MESSAGE+="\n"

# Fetch Pancoran data
PANCORAN_DATA=$(timeout 10 curl -s "https://api.open-meteo.com/v1/forecast?latitude=-6.2581&longitude=106.8427&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m&forecast_hours=3&timezone=Asia/Jakarta" 2>/dev/null)

CURR_TEMP=$(echo "$PANCORAN_DATA" | grep -o '"temperature_2m":[0-9.]*' | head -1 | cut -d: -f2)
CURR_RH=$(echo "$PANCORAN_DATA" | grep -o '"relative_humidity_2m":[0-9]*' | head -1 | cut -d: -f2)
CURR_WCODE=$(echo "$PANCORAN_DATA" | grep -o '"weather_code":[0-9]*,' | head -1 | grep -o '[0-9]*')
CURR_WIND=$(echo "$PANCORAN_DATA" | grep -o '"wind_speed_10m":[0-9.]*' | head -1 | cut -d: -f2)
CURR_WDIR=$(echo "$PANCORAN_DATA" | grep -o '"wind_direction_10m":[0-9]*' | head -1 | cut -d: -f2)

WDESC=$(weather_desc $CURR_WCODE)
WDIR_TEXT=$(wind_dir $CURR_WDIR)

MESSAGE+="📍 **PANCORAN - JAKARTA SELATAN**
─────────────────────────────
🌡️ Suhu: $CURR_TEMP°C
💨 Kelembaban: $CURR_RH%
☁️ Kondisi: $WDESC
🌬️ Angin: $CURR_WIND km/h arah $WDIR_TEXT

Prakiraan 3 jam ke depan:
"

TEMPS=$(echo "$PANCORAN_DATA" | grep -o '"temperature_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
RHS=$(echo "$PANCORAN_DATA" | grep -o '"relative_humidity_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
WCODES=$(echo "$PANCORAN_DATA" | grep -o '"weather_code":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
WINDS=$(echo "$PANCORAN_DATA" | grep -o '"wind_speed_10m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
WDIRS=$(echo "$PANCORAN_DATA" | grep -o '"wind_direction_10m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
RAINS=$(echo "$PANCORAN_DATA" | grep -o '"precipitation_probability":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
TIMES=$(echo "$PANCORAN_DATA" | grep -o '"time":\[.*\]' | grep -o 'T[0-9][0-9]:[0-9][0-9]' | tr 'T' ' ' | head -3)

i=1
while read -r TIME; do
    TEMP=$(echo "$TEMPS" | sed -n "${i}p")
    RH=$(echo "$RHS" | sed -n "${i}p")
    WCODE=$(echo "$WCODES" | sed -n "${i}p")
    WIND=$(echo "$WINDS" | sed -n "${i}p")
    WDIR=$(echo "$WDIRS" | sed -n "${i}p")
    RAIN=$(echo "$RAINS" | sed -n "${i}p")

    WD=$(weather_desc $WCODE)
    WDT=$(wind_dir $WDIR)

    MESSAGE+="• $TIME WIB: $TEMP°C | $WD | Kelembaban $RH% | Angin $WIND km/h $WDT | Peluang hujan $RAIN%\n"
    i=$((i+1))
done <<< "$TIMES"

MESSAGE+="\n⏰ Update berikutnya: 3 jam lagi"

# Send to Telegram topic 23
echo "$MESSAGE" | openclaw message send --channel telegram --to "$CHAT_ID" --topic "$TOPIC_ID" --message-file -

echo "Weather update sent to Telegram topic $TOPIC_ID at $(date)"
