# Database Permission Fix - CRITICAL KNOWLEDGE

## Issue: Database Permission Denied

**Symptom:**
```
sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError: 
permission denied for table <table_name>
```

**Root Cause:**
Database tables/sequences owned by wrong user (typically `postgres` instead of `apistreamhub`).

**When This Happens:**
- After database initialization
- After running migrations
- After recreating database
- After restoring from backup

---

## Solution: Fix Ownership

### Quick Check
```bash
bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh
```

### Automatic Fix
```bash
bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
```

### Manual Fix
```sql
-- Fix specific table
ALTER TABLE users OWNER TO apistreamhub;

-- Fix all tables at once
DO $$ 
DECLARE 
    table_name text;
BEGIN 
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP 
        EXECUTE format('ALTER TABLE %I OWNER TO apistreamhub', table_name);
    END LOOP; 
END $$;
```

---

## Verification

### Check Table Ownership
```bash
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"
```

### Expected Output
```
    tablename    |  tableowner  
-----------------+--------------
 channels        | apistreamhub
 playlist_videos | apistreamhub
 playlists       | apistreamhub
 role_presets    | apistreamhub
 users           | apistreamhub
 videos          | apistreamhub
```

**All tables should be owned by `apistreamhub`!**

---

## Prevention

### After Database Initialization
Always run permission fix after:
- `docker-compose up -d db`
- Database restore from backup
- Running migrations
- Creating new tables

### Add to Deployment Checklist
- [ ] Start containers
- [ ] Run database init
- [ ] **Fix database permissions** ← CRITICAL
- [ ] Test login
- [ ] Test API endpoints

---

## Scripts Location

**Check:**
```
/home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh
```

**Fix:**
```
/home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
```

---

## Common Mistakes

### ❌ DON'T: Ignore permission errors
They won't go away, and they'll cause authentication failures.

### ❌ DON'T: Only fix some tables
If `users` is fixed but `videos` isn't, login will work but content API will fail.

### ✅ DO: Check all tables and sequences
Both tables AND sequences must have correct ownership.

### ✅ DO: Run check after database changes
Make it part of your workflow.

---

## Technical Details

### Why This Happens

PostgreSQL creates objects with the current user as owner. When you:
1. Connect as `postgres` user
2. Run migrations/init scripts
3. Tables are created owned by `postgres`
4. App connects as `apistreamhub` user
5. **Permission denied!**

### Correct Approach

Option 1: Create tables with correct owner
```bash
# Connect as apistreamhub, not postgres
docker exec apistreamhub-db psql -U apistreamhub -d apistreamhub
```

Option 2: Fix ownership after creation (RECOMMENDED)
```bash
bash scripts/fix-db-permissions.sh
```

---

## Checklist: After Any Database Work

- [ ] Database container started?
- [ ] Tables created?
- [ ] **Check permissions**
- [ ] **Fix permissions if needed**
- [ ] Verify with check script
- [ ] Test login (auth uses `users` table)
- [ ] Test content API (uses `videos` table)
- [ ] Test channel API (uses `channels` table)

---

**Remember: Database permission issues are RECURRING. Always check permissions after database changes!**
