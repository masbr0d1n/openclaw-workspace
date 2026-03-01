# Daily Memory - 2026-03-01 - Users and Roles Data Loss Issue

## Problem (Recurring)

Users and Roles keep getting deleted when recreating database container.

This happened multiple times:
1. First deployment - users created manually
2. Container recreated - users lost
3. Created admin via API - role was USER (not SUPERADMIN)
4. Role presets table empty

## Root Causes

1. **No automated initialization** - Manual setup required
2. **No persistent volume** - Data lost on container recreation
3. **Init script bugs** - Wrong column names, missing created_at
4. **Forgotten steps** - Easy to miss manual setup

## Solution Implemented

### 1. Fixed Init Script

**File:** `apistreamhub-fastapi/scripts/init-database.sh`

**Issues Fixed:**
- Role presets: Changed `permissions` to `page_access`
- Added `is_system` column
- Added `created_at = NOW()` to all inserts
- Added ON CONFLICT handling

**Corrected Script:**
```bash
INSERT INTO role_presets (name, description, page_access, is_system, is_active, created_at)
VALUES
('Superadmin', 'Full system access', '{"all": true}', true, true, NOW()),
('Admin', 'Administrative access', '{"dashboard": true, "content": true, "channels": true, "users": true}', true, true, NOW()),
('Manager', 'Content manager access', '{"dashboard": true, "content": true, "channels": true}', true, true, NOW()),
('Viewer', 'View only access', '{"dashboard": true}', true, true, NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  page_access = EXCLUDED.page_access,
  is_active = EXCLUDED.is_active;
```

### 2. Current Database Status

**Users:**
- 1 user: admin (SUPERADMIN)

**Role Presets:**
- Superadmin (Full access)
- Admin (Administrative)
- Manager (Content management)
- Viewer (View only)

**Channels:**
- Entertainment, Sport, Kids, Knowledge, Gaming

### 3. Prevention Strategy

**For Future Database Creation:**

1. **Use persistent volume:**
```bash
docker volume create apistreamhub-db-data
docker run -d --name apistreamhub-db \
  -v apistreamhub-db-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

2. **Run init script:**
```bash
./scripts/init-database.sh apistreamhub-db postgres apistreamhub
```

3. **Verify data:**
```bash
# Users
docker exec apistreamhub-db psql -U postgres -d apistreamhub \
  -c "SELECT username, role FROM users;"

# Roles
docker exec apistreamhub-db psql -U postgres -d apistreamhub \
  -c "SELECT name FROM role_presets;"

# Channels
docker exec apistreamhub-db psql -U postgres -d apistreamhub \
  -c "SELECT name FROM channels;"
```

4. **Test login:**
```bash
curl -X POST http://192.168.8.117:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Init Script Features

### What It Does

1. Waits for database to be ready
2. Creates all tables (6 tables)
3. Creates admin user (if not exists)
4. Creates channels (5 channels)
5. Creates role presets (4 roles)
6. Shows summary

### Usage

```bash
./scripts/init-database.sh [container] [user] [database]

# Example:
./scripts/init-database.sh apistreamhub-db postgres apistreamhub
```

## Default Credentials

**URL:** http://192.168.8.117:3000/login
**Username:** admin
**Password:** admin123
**Role:** SUPERADMIN

## Files

- Init script: `apistreamhub-fastapi/scripts/init-database.sh`
- Prevention guide: `DATABASE_SETUP_PREVENTION.md`
- Fix summary: `USERS_ROLES_FIX_COMPLETE.md`

## Lessons Learned

1. **Automate everything** - Manual steps get forgotten
2. **Use persistent volumes** - Prevents data loss
3. **Test init scripts** - Column names matter
4. **Verify after setup** - Don't assume it worked
5. **Document the process** - Future reference

## Next Time

When recreating database:
1. Backup current data
2. Use persistent volume
3. Run init script
4. Verify all data
5. Test login

**Auto-initialization prevents data loss!** ✅
