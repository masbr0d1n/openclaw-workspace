#!/bin/bash

# Database Permission Fix Script
# Run this after database initialization or migration to fix permissions

set -e

DB_CONTAINER="${1:-apistreamhub-db}"
DB_NAME="${2:-apistreamhub}"
DB_OWNER="${3:-apistreamhub}"

echo "=== Database Permission Fix Script ==="
echo "Container: $DB_CONTAINER"
echo "Database: $DB_NAME"
echo "Target Owner: $DB_OWNER"
echo ""

# Function to fix table ownership
fix_table_ownership() {
    echo "1. Fixing table ownership..."
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" << EOSQL
-- Fix all tables
DO $$ 
DECLARE 
    table_name text;
    count_fixes := 0;
BEGIN 
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tableowner != '$DB_OWNER'
    LOOP 
        EXECUTE format('ALTER TABLE %I OWNER TO $DB_OWNER', table_name);
        RAISE NOTICE 'Fixed table: %', table_name;
        count_fixes := count_fixes + 1;
    END LOOP;
    RAISE NOTICE 'Total tables fixed: %', count_fixes;
END $$;
EOSQL
}

# Function to fix sequence ownership
fix_sequence_ownership() {
    echo "2. Fixing sequence ownership..."
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" << EOSQL
-- Fix all sequences
DO $$ 
DECLARE 
    seq_name text;
    count_fixes := 0;
BEGIN 
    FOR seq_name IN 
        SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequenceowner != '$DB_OWNER'
    LOOP 
        EXECUTE format('ALTER SEQUENCE %I OWNER TO $DB_OWNER', seq_name);
        RAISE NOTICE 'Fixed sequence: %', seq_name;
        count_fixes := count_fixes + 1;
    END LOOP;
    RAISE NOTICE 'Total sequences fixed: %', count_fixes;
END $$;
EOSQL
}

# Function to verify ownership
verify_ownership() {
    echo "3. Verifying ownership..."
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -c "
SELECT 
    'TABLES' as object_type,
    COUNT(*) as total,
    SUM(CASE WHEN tableowner = '$DB_OWNER' THEN 1 ELSE 0 END) as correct_owner,
    SUM(CASE WHEN tableowner != '$DB_OWNER' THEN 1 ELSE 0 END) as needs_fix
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'SEQUENCES' as object_type,
    COUNT(*) as total,
    SUM(CASE WHEN sequenceowner = '$DB_OWNER' THEN 1 ELSE 0 END) as correct_owner,
    SUM(CASE WHEN sequenceowner != '$DB_OWNER' THEN 1 ELSE 0 END) as needs_fix
FROM pg_sequences 
WHERE schemaname = 'public';
"
}

# Function to grant privileges
grant_privileges() {
    echo "4. Granting privileges..."
    docker exec "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" << EOSQL
-- Grant all privileges on schema
GRANT ALL ON SCHEMA public TO $DB_OWNER;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO $DB_OWNER;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_OWNER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_OWNER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_OWNER;

-- Grant all on existing objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_OWNER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_OWNER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $DB_OWNER;

SELECT 'Privileges granted' as status;
EOSQL
}

# Main execution
main() {
    echo "Starting permission fix..."
    echo ""
    
    fix_table_ownership
    echo ""
    
    fix_sequence_ownership
    echo ""
    
    grant_privileges
    echo ""
    
    verify_ownership
    echo ""
    
    echo "=== Permission Fix Complete ==="
    echo ""
    echo "All tables and sequences should now be owned by: $DB_OWNER"
    echo ""
    echo "To verify manually:"
    echo "  docker exec $DB_CONTAINER psql -U postgres -d $DB_NAME -c 'SELECT tablename, tableowner FROM pg_tables WHERE schemaname = '\''public'\'';'"
}

# Run main function
main "$@"
