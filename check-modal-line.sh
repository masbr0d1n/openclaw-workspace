#!/bin/bash
# Increase View Details modal width

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== FINDING VIEW DETAILS MODAL ===" && \
grep -n "Content Details" "$FILE" && \
echo "" && \
echo "=== CHECK LINE NUMBERS ===" && \
sed -n '620,630p' "$FILE"