#!/bin/bash

# Disk Usage Monitor
# Mengirim alarm ke Discord jika penggunaan disk >= 95%
# Channel: #system-health (1477427478162309381)

DISK_THRESHOLD=95
CHECK_INTERVAL=300  # 5 menit
COOLDOWN_TIME=3600  # 1 jam cooldown antar notifikasi
LOG_FILE="/home/sysop/.openclaw/workspace/logs/disk-monitor.log"
DISCORD_CHANNEL="1477427478162309381"
STATE_FILE="/home/sysop/.openclaw/workspace/workspace/disk-monitor-state.json"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$STATE_FILE")"

# Buat state file jika belum ada
if [ ! -f "$STATE_FILE" ]; then
    echo "{\"lastAlert\": 0}" > "$STATE_FILE"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_disk() {
    # Ambil penggunaan disk root (/) dalam persen
    local disk_usage=$(df / | awk 'NR==2 {gsub(/%/,""); print $5}')
    
    # Ambil penggunaan disk home (/home) jika ada partisi terpisah
    local home_usage=$(df /home 2>/dev/null | awk 'NR==2 {gsub(/%/,""); print $5}')
    
    # Ambil penggunaan disk SSD (/home/sysop/ssd) jika ada
    local ssd_usage=$(df /home/sysop/ssd 2>/dev/null | awk 'NR==2 {gsub(/%/,""); print $5}')
    
    local current_time=$(date +%s)
    local last_alert=$(jq -r '.lastAlert // 0' "$STATE_FILE" 2>/dev/null || echo "0")
    local time_since_alert=$((current_time - last_alert))
    
    # Cek apakah cooldown sudah lewat
    if [ $time_since_alert -lt $COOLDOWN_TIME ]; then
        return 0
    fi
    
    # Flag untuk alert
    local should_alert=false
    local alert_message=""
    
    # Cek root partition
    if [ -n "$disk_usage" ] && [ "$disk_usage" -ge "$DISK_THRESHOLD" ]; then
        should_alert=true
        alert_message="🚀 **ALERT: Disk Root Hampir Penuh!**\n\n"
        alert_message+="📊 Penggunaan: **${disk_usage}%**\n"
        alert_message+="⚠️ Threshold: ${DISK_THRESHOLD}%\n\n"
        
        # Tampilkan detail space
        local total=$(df -h / | awk 'NR==2 {print $2}')
        local used=$(df -h / | awk 'NR==2 {print $3}')
        local avail=$(df -h / | awk 'NR==2 {print $4}')
        alert_message+="💾 Total: ${total} | Terpakai: ${used} | Tersedia: ${avail}\n\n"
        
        # Tambahkan top 5 direktori terbesar
        alert_message+="📁 **5 Direktori Terbesar di Root:**\n"
        alert_message+="\`\`\`\n"
        alert_message+=$(du -sh /* 2>/dev/null | sort -rh | head -5)
        alert_message+="\n\`\`\`"
    fi
    
    # Cek home partition
    if [ -n "$home_usage" ] && [ "$home_usage" -ge "$DISK_THRESHOLD" ]; then
        should_alert=true
        alert_message="🏠 **ALERT: Disk Home Hampir Penuh!**\n\n"
        alert_message+="📊 Penggunaan: **${home_usage}%**\n"
        alert_message+="⚠️ Threshold: ${DISK_THRESHOLD}%\n\n"
        
        local total=$(df -h /home | awk 'NR==2 {print $2}')
        local used=$(df -h /home | awk 'NR==2 {print $3}')
        local avail=$(df -h /home | awk 'NR==2 {print $4}')
        alert_message+="💾 Total: ${total} | Terpakai: ${used} | Tersedia: ${avail}\n\n"
        
        alert_message+="📁 **5 Direktori Terbesar di Home:**\n"
        alert_message+="\`\`\`\n"
        alert_message+=$(du -sh /home/* 2>/dev/null | sort -rh | head -5)
        alert_message+="\n\`\`\`"
    fi
    
    # Cek SSD partition
    if [ -n "$ssd_usage" ] && [ "$ssd_usage" -ge "$DISK_THRESHOLD" ]; then
        should_alert=true
        alert_message="💎 **ALERT: Disk SSD Hampir Penuh!**\n\n"
        alert_message+="📊 Penggunaan: **${ssd_usage}%**\n"
        alert_message+="⚠️ Threshold: ${DISK_THRESHOLD}%\n\n"
        
        local total=$(df -h /home/sysop/ssd | awk 'NR==2 {print $2}')
        local used=$(df -h /home/sysop/ssd | awk 'NR==2 {print $3}')
        local avail=$(df -h /home/sysop/ssd | awk 'NR==2 {print $4}')
        alert_message+="💾 Total: ${total} | Terpakai: ${used} | Tersedia: ${avail}\n\n"
        
        alert_message+="📁 **5 Direktori Terbesar di SSD:**\n"
        alert_message+="\`\`\`\n"
        alert_message+=$(du -sh /home/sysop/ssd/* 2>/dev/null | sort -rh | head -5)
        alert_message+="\n\`\`\`"
    fi
    
    # Kirim alert jika perlu
    if [ "$should_alert" = true ]; then
        log "Disk usage threshold reached! Sending alert..."
        
        # Update last alert time
        echo "{\"lastAlert\": $current_time}" > "$STATE_FILE"
        
        # Kirim ke Discord via OpenClaw message tool
        /home/sysop/.npm-global/bin/openclaw message \
            --channel discord \
            --target "$DISCORD_CHANNEL" \
            --message "$alert_message"
        
        log "Alert sent successfully"
    fi
}

# Main loop
log "Starting disk monitor daemon (threshold: ${DISK_THRESHOLD}%, interval: ${CHECK_INTERVAL}s)"

while true; do
    check_disk
    sleep $CHECK_INTERVAL
done
