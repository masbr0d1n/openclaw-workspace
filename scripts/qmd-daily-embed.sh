#!/bin/bash
# QMD Daily Full Sync with Embeddings
# Runs daily at 03:00 (low traffic time)
# Slower operation (~10-30 minutes for embeddings)

LOG_FILE="/home/sysop/.openclaw/workspace/logs/qmd-embed-cron.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting QMD full sync with embeddings..." >> "$LOG_FILE"

# Run qmd update first
echo "[$TIMESTAMP] Step 1/2: Updating index..." >> "$LOG_FILE"
/home/sysop/.bun/bin/qmd update >> "$LOG_FILE" 2>&1
UPDATE_EXIT=$?

if [ $UPDATE_EXIT -ne 0 ]; then
    echo "[$TIMESTAMP] ✗ QMD update failed with exit code $UPDATE_EXIT" >> "$LOG_FILE"
    exit $UPDATE_EXIT
fi

echo "[$TIMESTAMP] ✓ QMD update completed" >> "$LOG_FILE"

# Run qmd embed
echo "[$TIMESTAMP] Step 2/2: Generating embeddings..." >> "$LOG_FILE"
/home/sysop/.bun/bin/qmd embed >> "$LOG_FILE" 2>&1
EMBED_EXIT=$?

if [ $EMBED_EXIT -eq 0 ]; then
    echo "[$TIMESTAMP] ✓ QMD embeddings completed successfully" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✗ QMD embeddings failed with exit code $EMBED_EXIT" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "[$TIMESTAMP] === Full sync completed ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit $EMBED_EXIT
