#!/bin/bash
# Setup Power Monitoring System
# Usage: ./setup-power-monitor.sh [install|uninstall|test]

SCRIPT_DIR="/home/sysop/.openclaw/workspace/scripts"
SYSTEMD_DIR="/etc/systemd/system"

case "${1:-test}" in
  install)
    echo "🔧 Installing Power Monitor..."
    
    # Make scripts executable
    chmod +x "$SCRIPT_DIR/power-monitor.sh"
    chmod +x "$SCRIPT_DIR/power-report.sh"
    
    # Create log directory
    mkdir -p /home/sysop/.openclaw/workspace/logs/power
    mkdir -p /home/sysop/.openclaw/workspace/reports
    
    # Install systemd service (requires sudo)
    if sudo -n true 2>/dev/null; then
      echo "📋 Installing systemd service..."
      sudo cp "$SCRIPT_DIR/power-monitor.service" "$SYSTEMD_DIR/"
      sudo cp "$SCRIPT_DIR/power-monitor.timer" "$SYSTEMD_DIR/"
      sudo systemctl daemon-reload
      sudo systemctl enable power-monitor.timer
      sudo systemctl start power-monitor.timer
      echo "✅ Systemd service installed and started"
    else
      echo "⚠️  Cannot install systemd service (no sudo)"
      echo "   Using cron instead..."
      
      # Add to crontab
      CRON_JOB="* * * * * $SCRIPT_DIR/power-monitor.sh >> /home/sysop/.openclaw/workspace/logs/power/cron.log 2>&1"
      if ! crontab -l 2>/dev/null | grep -q "power-monitor.sh"; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✅ Cron job added"
      else
        echo "ℹ️  Cron job already exists"
      fi
    fi
    
    # Test run
    echo ""
    echo "🧪 Running initial test..."
    bash "$SCRIPT_DIR/power-monitor.sh"
    
    echo ""
    echo "✅ Power Monitor setup complete!"
    echo ""
    echo "📊 View logs:  ls -lh /home/sysop/.openclaw/workspace/logs/power/"
    echo "📈 Generate report: bash $SCRIPT_DIR/power-report.sh"
    echo "🔧 Uninstall: bash $0 uninstall"
    ;;
    
  uninstall)
    echo "🗑️  Uninstalling Power Monitor..."
    
    # Remove systemd service
    if sudo -n true 2>/dev/null; then
      sudo systemctl stop power-monitor.timer 2>/dev/null
      sudo systemctl disable power-monitor.timer 2>/dev/null
      sudo rm -f "$SYSTEMD_DIR/power-monitor.service"
      sudo rm -f "$SYSTEMD_DIR/power-monitor.timer"
      sudo systemctl daemon-reload
      echo "✅ Systemd service removed"
    fi
    
    # Remove cron job
    crontab -l 2>/dev/null | grep -v "power-monitor.sh" | crontab -
    echo "✅ Cron job removed"
    
    echo ""
    echo "ℹ️  Logs and reports kept in:"
    echo "   /home/sysop/.openclaw/workspace/logs/power/"
    echo "   /home/sysop/.openclaw/workspace/reports/"
    echo ""
    echo "   Delete manually if needed: rm -rf /home/sysop/.openclaw/workspace/logs/power"
    ;;
    
  test|*)
    echo "🧪 Testing Power Monitor..."
    echo ""
    
    # Test data collection
    echo "📊 Collecting power data..."
    bash "$SCRIPT_DIR/power-monitor.sh"
    
    echo ""
    echo "📁 Log file:"
    ls -lh /home/sysop/.openclaw/workspace/logs/power/*.csv 2>/dev/null || echo "   No logs yet"
    
    echo ""
    echo "📈 Last 5 readings:"
    tail -5 /home/sysop/.openclaw/workspace/logs/power/*.csv 2>/dev/null || echo "   No data yet"
    
    echo ""
    echo "✅ Test complete!"
    echo ""
    echo "To install permanently:"
    echo "  bash $0 install"
    echo ""
    echo "To generate report:"
    echo "  bash $SCRIPT_DIR/power-report.sh"
    ;;
esac
