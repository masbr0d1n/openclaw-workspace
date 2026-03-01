#!/bin/bash

# Pre-Database Initialization Hook
# Run this before starting backend or running migrations

set -e

echo "=== Pre-Database Initialization Checklist ==="
echo ""

# Check if database is running
if ! docker ps | grep -q "apistreamhub-db"; then
    echo "❌ Database container not running!"
    echo "Start with: docker start apistreamhub-db"
    exit 1
fi

echo "✅ Database container running"
echo ""

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker exec apistreamhub-db pg_isready -U apistreamhub 2>/dev/null; do
    echo "   Database not ready, waiting..."
    sleep 2
done

echo "✅ Database ready"
echo ""

# Check permissions BEFORE starting backend
echo "Checking database permissions..."
if bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh > /dev/null 2>&1; then
    echo "✅ Permissions correct"
else
    echo "❌ Permission issues detected!"
    echo ""
    echo "Fixing permissions..."
    bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
    echo ""
    echo "✅ Permissions fixed"
fi

echo ""
echo "=== Database Ready ==="
echo "Backend can now be started safely."
