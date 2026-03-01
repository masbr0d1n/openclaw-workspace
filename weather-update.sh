#!/bin/bash
# Weather update script for Bojonggede and Pancoran

# Get compact weather for both locations
BOJONGGEDE=$(curl -s "wttr.in/Bojonggede?format=%l:+%c+%t+%w")
PANCORAN=$(curl -s "wttr.in/Pancoran?format=%l:+%c+%t+%w")

# Get today's forecast (simplified)
BOJONGGEDE_TODAY=$(curl -s "wttr.in/Bojonggede?1" 2>/dev/null | grep -E "Morning|Noon|Evening|Night" | head -4 | sed 's/^\s*//' | sed 's/\[.*m//g' | sed 's/[0-9;]*m//g' | head -c 300)
PANCORAN_TODAY=$(curl -s "wttr.in/Pancoran?1" 2>/dev/null | grep -E "Morning|Noon|Evening|Night" | head -4 | sed 's/^\s*//' | sed 's/\[.*m//g' | sed 's/[0-9;]*m//g' | head -c 300)

echo "🌤️ UPDATE PRAKIRAAN CUACA"
echo ""
echo "📍 BOJONGGEDE - BOGOR"
echo "$BOJONGGEDE"
echo ""
echo "📍 PANCORAN - JAKARTA SELATAN"
echo "$PANCORAN"
echo ""
echo "─"
echo "Prakiraan hari ini dan besok tersedia. Update berikutnya dalam 3 jam."
