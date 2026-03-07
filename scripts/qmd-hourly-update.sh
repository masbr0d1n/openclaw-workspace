#!/bin/bash
# QMD Hourly Update
# Runs every hour to index new/changed files
# Fast operation (~5-10 seconds)

LOG_FILE="/home/sysop/.openclaw/workspace/logs/qmd-cron.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting QMD update..." >> "$LOG_FILE"

# Run qmd update
/home/sysop/.bun/bin/qmd update >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$TIMESTAMP] ✓ QMD update completed successfully" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✗ QMD update failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
