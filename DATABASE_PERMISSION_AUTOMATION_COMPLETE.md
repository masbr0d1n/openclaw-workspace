# ✅ DATABASE PERMISSION FIX - ADDED TO MEMORY

## Summary

**Problem:** Database permission errors (`permission denied for table X`) keep recurring.

**Solution:** Created automation scripts to check and fix permissions automatically.

---

## Scripts Created

### 1. **Check Permissions**
```bash
/home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh
```

**Usage:**
```bash
bash scripts/check-db-permissions.sh
```

**What it does:**
- Checks all tables ownership
- Checks all sequences ownership
- Returns exit code 0 if OK, 1 if fixes needed
- Lists problem objects if any

**Output:**
```
=== Database Permission Check ===
1. Checking table ownership...
   ✅ All tables owned by apistreamhub
2. Checking sequence ownership...
   ✅ All sequences owned by apistreamhub
=== ✅ ALL PERMISSIONS CORRECT ===
```

---

### 2. **Fix Permissions**
```bash
/home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
```

**Usage:**
```bash
bash scripts/fix-db-permissions.sh
```

**What it does:**
- Fixes all table ownership to `apistreamhub`
- Fixes all sequence ownership to `apistreamhub`
- Grants all necessary privileges
- Verifies the fixes

**Output:**
```
=== Database Permission Fix Script ===
1. Fixing table ownership...
NOTICE:  Fixed table: users
NOTICE:  Fixed table: channels
...
2. Fixing sequence ownership...
NOTICE:  Fixed sequence: users_id_seq
...
3. Granting privileges...
4. Verifying ownership...
=== Permission Fix Complete ===
```

---

### 3. **Pre-Database Check**
```bash
/home/sysop/.openclaw/workspace/scripts/pre-db-check.sh
```

**Usage:**
```bash
bash scripts/pre-db-check.sh
```

**What it does:**
- Checks if database container is running
- Waits for database to be ready
- Checks and fixes permissions
- Safe to run before starting backend

**When to use:**
- Before starting backend container
- Before running migrations
- After database restore
- In deployment scripts

---

### 4. **Deploy Backend**
```bash
/home/sysop/.openclaw/workspace/scripts/deploy-backend.sh
```

**Usage:**
```bash
bash scripts/deploy-backend.sh [image] [container_name]
```

**What it does:**
1. Checks and fixes database permissions
2. Stops and removes old container
3. Starts new container
4. Waits for backend to be healthy
5. Tests login API

**Example:**
```bash
bash scripts/deploy-backend.sh apistreamhub-api:ffmpeg-fixed apistreamhub-api
```

---

## Updated MEMORY.md

Added section:
```markdown
### Database Permission Fix (CRITICAL)

**Issue:** `permission denied for table <table_name>` errors occur frequently.

**Root Cause:** Tables/sequences owned by `postgres` user instead of `apistreamhub`.

**Check Script:**
bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh

**Fix Script:**
bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh

**When to Run:**
- After database initialization
- After migrations
- After database restore
- After creating new tables
- When permission errors appear

**CRITICAL:** Always check permissions after ANY database work!
```

---

## New Documentation

### DATABASE_PERMISSION_FIX.md

Complete documentation about:
- Why permission issues occur
- How to fix them
- Prevention strategies
- Common mistakes
- Technical details

Location:
```
/home/sysop/.openclaw/workspace/DATABASE_PERMISSION_FIX.md
```

---

## Workflow Integration

### Before Starting Backend
```bash
bash scripts/pre-db-check.sh
# → Checks and fixes permissions automatically
# → Safe to start backend
```

### After Database Changes
```bash
bash scripts/check-db-permissions.sh
# → If fails:
bash scripts/fix-db-permissions.sh
```

### Deploying Backend
```bash
bash scripts/deploy-backend.sh apistreamhub-api:new-image apistreamhub-api
# → Includes permission check automatically
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Check permissions | `bash scripts/check-db-permissions.sh` |
| Fix permissions | `bash scripts/fix-db-permissions.sh` |
| Pre-start check | `bash scripts/pre-db-check.sh` |
| Deploy backend | `bash scripts/deploy-backend.sh` |
| Manual check | `docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "SELECT tablename, tableowner FROM pg_tables WHERE schemaname='public';"` |

---

## Testing Current Status

```bash
bash scripts/check-db-permissions.sh
```

**Current Result:**
```
=== ✅ ALL PERMISSIONS CORRECT ===
No action needed.
```

---

## Prevention Checklist

### After Any Database Work:

- [ ] Database initialized?
- [ ] Tables created?
- [ ] **Run: `bash scripts/check-db-permissions.sh`**
- [ ] **If fails: `bash scripts/fix-db-permissions.sh`**
- [ ] Verify: `bash scripts/check-db-permissions.sh`
- [ ] Test login (uses `users` table)
- [ ] Test content API (uses `videos` table)

### Before Backend Deployment:

- [ ] **Run: `bash scripts/pre-db-check.sh`**
- [ ] Start backend
- [ ] Test health endpoint
- [ ] Test login
- [ ] Test API endpoints

---

## Key Points

1. ✅ **Scripts created** - 4 automation scripts ready
2. ✅ **MEMORY.md updated** - Added database permission section
3. ✅ **Documentation created** - DATABASE_PERMISSION_FIX.md
4. ✅ **Current status OK** - All permissions correct
5. ✅ **Automation ready** - Scripts will catch issues early

---

## Next Time Permission Issue Occurs:

Instead of manual SQL commands:
```bash
# Just run:
bash scripts/fix-db-permissions.sh

# Or for full deployment:
bash scripts/deploy-backend.sh apistreamhub-api:image-name apistreamhub-api
```

The scripts will:
- Detect all permission issues
- Fix all tables and sequences
- Grant necessary privileges
- Verify the fixes
- Report what was done

---

**✅ DATABASE PERMISSION FIX IS NOW AUTOMATED AND DOCUMENTED IN MEMORY!**

---

## File Locations

```
/home/sysop/.openclaw/workspace/
├── scripts/
│   ├── check-db-permissions.sh      # Check ownership
│   ├── fix-db-permissions.sh         # Fix ownership
│   ├── pre-db-check.sh               # Pre-start check
│   └── deploy-backend.sh             # Deploy with check
├── DATABASE_PERMISSION_FIX.md        # Full documentation
└── MEMORY.md                          # Updated with fix info
```

All scripts are executable and tested.
