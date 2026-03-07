#!/bin/bash

# StreamHub Repository Backup Script
# Uses rsync to backup repositories to /home/sysop/ssd/repobak

set -e

# Configuration
BACKUP_DIR="/home/sysop/ssd/repobak"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
WORKSPACE="/home/sysop/.openclaw/workspace"

# Repositories to backup
declare -a REPOS=(
    "streamhub-videotron"
    "streamhub-tvhub"
    "apistreamhub-fastapi"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
echo -e "${YELLOW}Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup each repository
for repo in "${REPOS[@]}"; do
    echo -e "${YELLOW}Backing up $repo...${NC}"
    
    SOURCE="$WORKSPACE/$repo"
    DEST="$BACKUP_DIR/$repo"
    
    if [ -d "$SOURCE" ]; then
        # Use rsync with archive mode, compression, and progress
        # Exclude node_modules, .next, and other large/generated directories
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            --exclude '*.log' \
            --exclude 'dist' \
            --exclude 'build' \
            "$SOURCE/" "$DEST/"
        
        echo -e "${GREEN}✓ $repo backed up successfully${NC}"
    else
        echo -e "${RED}✗ $repo not found at $SOURCE${NC}"
    fi
done

# Create a timestamped backup log
LOG_FILE="$BACKUP_DIR/backup_$TIMESTAMP.log"
echo "Backup completed at $(date)" > "$LOG_FILE"
echo "Repositories backed up:" >> "$LOG_FILE"
for repo in "${REPOS[@]}"; do
    echo "  - $repo" >> "$LOG_FILE"
done

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}Backup location: $BACKUP_DIR${NC}"
echo -e "${GREEN}Log file: $LOG_FILE${NC}"
echo -e "${GREEN}==================================${NC}"
