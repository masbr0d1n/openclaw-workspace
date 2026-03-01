#!/bin/bash
# Start System Dashboard

DASHBOARD_DIR="/home/sysop/.openclaw/workspace/dashboard"
LOG_FILE="$DASHBOARD_DIR/startup.log"

cd "$DASHBOARD_DIR" || exit 1

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js tidak ditemukan. Install dulu: sudo pacman -S nodejs npm"
    exit 1
fi

# Check if port is already in use
if lsof -Pi :3000 -s -t &> /dev/null; then
    echo "[WARNING] Port 3000 sudah digunakan. Kill proses lama dulu: kill \$(lsof -ti :3000)"
    exit 1
fi

# Start server
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting dashboard server..." | tee -a "$LOG_FILE"
nohup node server.js > server.log 2>&1 &

# Wait for server to start
sleep 2

# Check if server started
if curl -s http://localhost:3000/api/stats &> /dev/null; then
    echo "[SUCCESS] Dashboard berjalan!"
    echo ""
    echo "=========================================="
    echo "     🖥️ SYSTEM DASHBOARD"
    echo "=========================================="
    echo ""
    echo "Lokal:    http://localhost:3000"
    echo "Network:  http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "Tekan Ctrl+C untuk stop"
    echo "=========================================="
    echo ""
    echo "Log file: $DASHBOARD_DIR/server.log"
else
    echo "[ERROR] Gagal start dashboard. Cek log: $DASHBOARD_DIR/server.log"
    exit 1
fi
