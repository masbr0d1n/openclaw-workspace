#!/bin/bash
# Detailed weather forecast - improved format

# Wind direction decoder with safety check
wind_dir() {
    local deg="$1"

    # Check if empty or non-numeric
    if [ -z "$deg" ] || ! [[ "$deg" =~ ^[0-9]+$ ]]; then
        echo "-"
        return
    fi

    local d=${deg%.*}  # Remove decimal

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

# Weather code decoder with emoji
weather_desc() {
    case $1 in
        0) echo "Cerah ☀️" ;;
        1) echo "Cerah Berawan 🌤️" ;;
        2) echo "Berawan ⛅" ;;
        3) echo "Mendung ☁️" ;;
        45|48) echo "Kabut 🌫️" ;;
        51|53|55) echo "Gerimis 🌧️" ;;
        61|63|65) echo "Hujan 🌧️" ;;
        80|81|82) echo "Hujan Badai ⛈️" ;;
        95|96|99) echo "Badai Petir ⛈️" ;;
        *) echo "Kode $1" ;;
    esac
}

# Fetch with retry mechanism
fetch_with_retry() {
    local url="$1"
    local max_retries=3
    local retry_count=0
    local timeout_sec=15

    while [ $retry_count -lt $max_retries ]; do
        DATA=$(timeout $timeout_sec curl -s "$url" 2>/dev/null)

        # Validate response
        if echo "$DATA" | grep -q '"latitude"' && echo "$DATA" | grep -q '"current"'; then
            echo "$DATA"
            return 0
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            sleep 2
        fi
    done

    return 1
}

DATE=$(date +"%A, %d %b %Y" | sed 's/Monday/Senin/;s/Tuesday/Selasa/;s/Wednesday/Rabu/;s/Thursday/Kamis/;s/Friday/Jumat/;s/Saturday/Sabtu/;s/Sunday/Minggu/')
CURRENT_TIME=$(date +%H:%M)

echo "🌤️ CUACA - $DATE | $CURRENT_TIME WIB"
echo ""

# Bojonggede data
BOJONG_DATA=$(fetch_with_retry "https://api.open-meteo.com/v1/forecast?latitude=-6.5952&longitude=106.7875&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m&forecast_hours=3&timezone=Asia/Jakarta")

if [ $? -eq 0 ]; then
    # Extract current data more precisely - extract from the "current" object
    CURR_TEMP=$(echo "$BOJONG_DATA" | grep -o '"current":{[^}]*' | grep -o '"temperature_2m":[0-9.]*' | cut -d: -f2)
    CURR_RH=$(echo "$BOJONG_DATA" | grep -o '"current":{[^}]*' | grep -o '"relative_humidity_2m":[0-9]*' | cut -d: -f2)
    CURR_WCODE=$(echo "$BOJONG_DATA" | grep -o '"current":{[^}]*' | grep -o '"weather_code":[0-9]*' | grep -o '[0-9]*' | head -1)
    CURR_WIND=$(echo "$BOJONG_DATA" | grep -o '"current":{[^}]*' | grep -o '"wind_speed_10m":[0-9.]*' | cut -d: -f2)
    CURR_WDIR=$(echo "$BOJONG_DATA" | grep -o '"current":{[^}]*' | grep -o '"wind_direction_10m":[0-9]*' | grep -o '[0-9]*' | head -1)

    # Validate current data
    if [ -n "$CURR_TEMP" ] && [ "$CURR_TEMP" != "" ]; then
        WDESC=$(weather_desc $CURR_WCODE)
        WDIR_TEXT=$(wind_dir "$CURR_WDIR")

        echo "📍 Bojonggede"
        echo "──────────────────"
        echo "🌡️ $CURR_TEMP°C  💧 $CURR_RH%  🌬️ $CURR_WIND km/h ($WDIR_TEXT)"
        echo "☁️ $WDESC"
        echo ""

        # Parse hourly
        TEMPS=$(echo "$BOJONG_DATA" | grep -o '"temperature_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
        WCODES=$(echo "$BOJONG_DATA" | grep -o '"weather_code":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
        RAINS=$(echo "$BOJONG_DATA" | grep -o '"precipitation_probability":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
        TIMES=$(echo "$BOJONG_DATA" | grep -o '"time":\[.*\]' | grep -o 'T[0-9][0-9]:[0-9][0-9]' | tr 'T' ' ' | head -3)

        echo "Prakiraan:"
        i=1
        while read -r TIME; do
            TEMP=$(echo "$TEMPS" | sed -n "${i}p")
            WCODE=$(echo "$WCODES" | sed -n "${i}p")
            RAIN=$(echo "$RAINS" | sed -n "${i}p")

            if [ -z "$TEMP" ] || [ "$TEMP" = "" ]; then
                continue
            fi

            WD=$(weather_desc $WCODE)
            echo "• $TIME: $TEMP°C, $WD, hujan $RAIN%"
            i=$((i+1))
        done <<< "$TIMES"
    else
        echo "📍 Bojonggede"
        echo "──────────────────"
        echo "❌ Data tidak tersedia"
        echo ""
    fi
else
    echo "📍 Bojonggede"
    echo "──────────────────"
    echo "❌ Gagal mengambil data"
    echo ""
fi

# Pancoran data
PANCORAN_DATA=$(fetch_with_retry "https://api.open-meteo.com/v1/forecast?latitude=-6.2581&longitude=106.8427&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m&forecast_hours=3&timezone=Asia/Jakarta")

if [ $? -eq 0 ]; then
    # Extract current data more precisely - extract from the "current" object
    CURR_TEMP=$(echo "$PANCORAN_DATA" | grep -o '"current":{[^}]*' | grep -o '"temperature_2m":[0-9.]*' | cut -d: -f2)
    CURR_RH=$(echo "$PANCORAN_DATA" | grep -o '"current":{[^}]*' | grep -o '"relative_humidity_2m":[0-9]*' | cut -d: -f2)
    CURR_WCODE=$(echo "$PANCORAN_DATA" | grep -o '"current":{[^}]*' | grep -o '"weather_code":[0-9]*' | grep -o '[0-9]*' | head -1)
    CURR_WIND=$(echo "$PANCORAN_DATA" | grep -o '"current":{[^}]*' | grep -o '"wind_speed_10m":[0-9.]*' | cut -d: -f2)
    CURR_WDIR=$(echo "$PANCORAN_DATA" | grep -o '"current":{[^}]*' | grep -o '"wind_direction_10m":[0-9]*' | grep -o '[0-9]*' | head -1)

    # Validate current data
    if [ -n "$CURR_TEMP" ] && [ "$CURR_TEMP" != "" ]; then
        WDESC=$(weather_desc $CURR_WCODE)
        WDIR_TEXT=$(wind_dir "$CURR_WDIR")

        echo "📍 Pancoran"
        echo "──────────────────"
        echo "🌡️ $CURR_TEMP°C  💧 $CURR_RH%  🌬️ $CURR_WIND km/h ($WDIR_TEXT)"
        echo "☁️ $WDESC"
        echo ""

        # Parse hourly
        TEMPS=$(echo "$PANCORAN_DATA" | grep -o '"temperature_2m":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9.]*')
        WCODES=$(echo "$PANCORAN_DATA" | grep -o '"weather_code":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
        RAINS=$(echo "$PANCORAN_DATA" | grep -o '"precipitation_probability":\[.*\]' | grep -o '\[.*\]' | tr ',' '\n' | grep -o '[0-9]*')
        TIMES=$(echo "$PANCORAN_DATA" | grep -o '"time":\[.*\]' | grep -o 'T[0-9][0-9]:[0-9][0-9]' | tr 'T' ' ' | head -3)

        echo "Prakiraan:"
        i=1
        while read -r TIME; do
            TEMP=$(echo "$TEMPS" | sed -n "${i}p")
            WCODE=$(echo "$WCODES" | sed -n "${i}p")
            RAIN=$(echo "$RAINS" | sed -n "${i}p")

            if [ -z "$TEMP" ] || [ "$TEMP" = "" ]; then
                continue
            fi

            WD=$(weather_desc $WCODE)
            echo "• $TIME: $TEMP°C, $WD, hujan $RAIN%"
            i=$((i+1))
        done <<< "$TIMES"
    else
        echo "📍 Pancoran"
        echo "──────────────────"
        echo "❌ Data tidak tersedia"
    fi
else
    echo "📍 Pancoran"
    echo "──────────────────"
    echo "❌ Gagal mengambil data"
fi

echo ""
NEXT_HOUR=$(date -d '+3 hours' +%H:%M)
echo "⏰ Update: $NEXT_HOUR WIB"
