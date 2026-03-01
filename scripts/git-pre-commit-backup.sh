#!/bin/bash

# Git Pre-Commit Hook for PostgreSQL Backup
# Backup database sebelum setiap commit

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Git Pre-Commit: Database Backup ===${NC}"
echo ""

# Backup configuration
BACKUP_DIR="$(git rev-parse --show-toplevel)/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="apistreamhub-db"
DB_NAME="apistreamhub"
DB_USER="postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get branch name
BRANCH_NAME=$(git branch --show-current)
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "initial commit")

echo "Branch: $BRANCH_NAME"
echo "Commit: $(echo $COMMIT_MSG | head -c 50)..."
echo "Time: $(date)"
echo ""

# Backup database
echo -e "${GREEN}[1/2] Backing up database...${NC}"

# Full backup with compression
docker exec $CONTAINER_NAME pg_dump \
  -U $DB_USER \
  --clean \
  --if-exists \
  $DB_NAME 2>/dev/null | \
  gzip > "$BACKUP_DIR/${DB_NAME}_${BRANCH_NAME}_${DATE}.sql.gz" || {
    echo -e "${RED}✗ Database backup failed!${NC}"
    echo "Continuing with commit..."
    exit 0
}

echo -e "${GREEN}✓ Backup created: ${DB_NAME}_${BRANCH_NAME}_${DATE}.sql.gz${NC}"

# Stage backup file if it's in git tracked directory
if git ls-files --error-unmatch backups/database/ > /dev/null 2>&1; then
    echo -e "${GREEN}[2/2] Staging backup file...${NC}"
    git add "$BACKUP_DIR/${DB_NAME}_${BRANCH_NAME}_${DATE}.sql.gz" 2>/dev/null || true
fi

# Cleanup: keep only last 10 backups
echo -e "${GREEN}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "*.sql.gz" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true

# Show current backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo ""
echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Total backups: $BACKUP_COUNT"
echo "Total size: $BACKUP_SIZE"
echo ""

exit 0
