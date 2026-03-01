# Database Setup - Preventing Data Loss

## Problem

Users and roles keep getting deleted when recreating database containers. This happens because:
1. New database container starts with empty tables
2. No initialization script runs automatically
3. Manual user creation steps are forgotten

## Solution

Created automated database initialization script that ensures:
1. All tables are created
2. Admin user is created
3. Default channels are inserted
4. Role presets are created

## Script: `scripts/init-database.sh`

### Usage

```bash
# Initialize database (auto-runs after container creation)
./scripts/init-database.sh [container_name] [db_user] [db_name]

# Example:
./scripts/init-database.sh apistreamhub-db postgres apistreamhub
```

### What It Does

1. **Waits for database to be ready**
   - Checks pg_isready
   - Waits up to 30 seconds

2. **Creates all tables**
   - users
   - channels
   - videos
   - playlists
   - playlist_videos
   - role_presets

3. **Creates admin user** (if not exists)
   - Username: admin
   - Email: admin@streamhub.com
   - Password: admin123
   - Role: SUPERADMIN

4. **Creates default channels** (if none exist)
   - Entertainment
   - Sport
   - Kids
   - Knowledge
   - Gaming

5. **Creates role presets** (if none exist)
   - Superadmin
   - Admin
   - User
   - Viewer

6. **Shows summary**
   - List users
   - List channels
   - List roles

## Current Status

### Admin User

| Field | Value |
|-------|-------|
| Username | admin |
| Password | admin123 |
| Email | admin@streamhub.com |
| Role | SUPERADMIN |
| Full Name | Administrator |

### Channels

| ID | Name | Category |
|----|------|----------|
| 1 | Entertainment | entertainment |
| 2 | Sport | sport |
| 3 | Kids | kids |
| 4 | Knowledge | knowledge |
| 5 | Gaming | gaming |

### Role Presets

Currently empty - need to insert default roles

## Prevention Strategy

### 1. Use Docker Volume (Persistent Storage)

```bash
# Create volume for database
docker volume create apistreamhub-db-data

# Run database with volume
docker run -d --name apistreamhub-db \
  -v apistreamhub-db-data:/var/lib/postgresql/data \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=apistreamhub \
  -p 5434:5432 \
  postgres:16-alpine
```

### 2. Always Run Init Script

After creating database container:
```bash
./scripts/init-database.sh apistreamhub-db postgres apistreamhub
```

### 3. Regular Backups

```bash
# Backup users and roles
docker exec apistreamhub-db pg_dump -U postgres \
  -t users -t role_presets apistreamhub > backup_users_roles.sql

# Restore
docker exec -i apistreamhub-db psql -U postgres apistreamhub < backup_users_roles.sql
```

### 4. Use Docker Compose (Recommended)

Create `docker-compose.yml` with:
- Persistent volumes
- Init container
- Proper dependencies

## Quick Fix (Current)

Run init script:
```bash
./scripts/init-database.sh apistreamhub-db postgres apistreamhub
```

Then recreate admin via API:
```bash
curl -X POST http://192.168.8.117:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@streamhub.com",
    "password": "admin123",
    "full_name": "Administrator"
  }'
```

Upgrade role:
```bash
docker exec apistreamhub-db psql -U postgres -d apistreamhub << 'EOF'
UPDATE users SET role = 'SUPERADMIN', is_admin = true WHERE username = 'admin';
EOF
```

## Files

- Init script: `apistreamhub-fastapi/scripts/init-database.sh`
- This doc: `DATABASE_SETUP_PREVENTION.md`

## Remember

**Never recreate database container without:**
1. Backing up data first
2. Using persistent volume
3. Running init script
4. Verifying admin user exists
5. Testing login

---

**Auto-initialization prevents data loss!** ✅
