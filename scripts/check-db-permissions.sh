#!/bin/bash

# Check Database Permissions
# Run this to verify all database objects have correct ownership

set -e

DB_CONTAINER="${1:-apistreamhub-db}"
DB_NAME="${2:-apistreamhub}"
DB_OWNER="${3:-apistreamhub}"

echo "=== Database Permission Check ==="
echo "Container: $DB_CONTAINER"
echo "Database: $DB_NAME"
echo "Expected Owner: $DB_OWNER"
echo ""

# Check tables
echo "1. Checking table ownership..."
TABLE_ISSUES=$(docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND tableowner != '$DB_OWNER';
" | tr -d ' ')

if [ "$TABLE_ISSUES" -eq 0 ]; then
    echo "   ✅ All tables owned by $DB_OWNER"
else
    echo "   ❌ $TABLE_ISSUES tables NOT owned by $DB_OWNER"
    echo ""
    echo "   Problem tables:"
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -c "
    SELECT tablename, tableowner 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tableowner != '$DB_OWNER'
    ORDER BY tablename;"
fi

echo ""

# Check sequences
echo "2. Checking sequence ownership..."
SEQ_ISSUES=$(docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM pg_sequences 
WHERE schemaname = 'public' AND sequenceowner != '$DB_OWNER';
" | tr -d ' ')

if [ "$SEQ_ISSUES" -eq 0 ]; then
    echo "   ✅ All sequences owned by $DB_OWNER"
else
    echo "   ❌ $SEQ_ISSUES sequences NOT owned by $DB_OWNER"
    echo ""
    echo "   Problem sequences:"
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -c "
    SELECT sequencename, sequenceowner 
    FROM pg_sequences 
    WHERE schemaname = 'public' AND sequenceowner != '$DB_OWNER'
    ORDER BY sequencename;"
fi

echo ""

# Overall status
if [ "$TABLE_ISSUES" -eq 0 ] && [ "$SEQ_ISSUES" -eq 0 ]; then
    echo "=== ✅ ALL PERMISSIONS CORRECT ==="
    echo "No action needed."
    exit 0
else
    echo "=== ❌ PERMISSION ISSUES FOUND ==="
    echo ""
    echo "Run: bash scripts/fix-db-permissions.sh"
    echo ""
    echo "Or manually:"
    echo "  docker exec $DB_CONTAINER psql -U postgres -d $DB_NAME -c 'ALTER TABLE <table_name> OWNER TO $DB_OWNER;'"
    exit 1
fi
