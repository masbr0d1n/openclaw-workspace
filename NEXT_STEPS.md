# ✅ Step 2 Complete: Backend Streaming Control

## 🎯 What Was Just Added

### Backend (FastAPI)
```
✅ app/api/v1/streaming.py         - 3 new endpoints (on-air/off-air/status)
✅ app/services/streaming_service.py - Business logic
✅ app/schemas/streaming.py         - Response validation
✅ tests/test_streaming.py          - 6 test cases
✅ migrations/add_streaming_fields.sql - Database migration
✅ test-streaming.sh                - Quick test script
```

### Frontend Updates
```
✅ src/services/channel.service.js - Updated to use new endpoints
```

---

## 🚀 Next Actions: Do This Now!

### **Step 1: Apply Database Migration** ⏰ 2 minutes

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Apply migration to database
docker-compose exec -T postgres psql -U postgres -d apistreamhub <<EOF
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS is_on_air BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS started_streaming_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS stopped_streaming_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_channels_is_on_air ON channels(is_on_air);
EOF

# Verify migration
docker-compose exec postgres psql -U postgres -d apistreamhub -c "\d channels"
```

### **Step 2: Restart FastAPI Backend** ⏰ 1 minute

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Wait for it to start (5-10 seconds)
sleep 10

# Check logs
docker-compose logs api | tail -20
```

### **Step 3: Test Streaming Endpoints** ⏰ 2 minutes

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Run automated test script
./test-streaming.sh
```

Expected output:
```
================================
🧪 Streaming API Test Script
================================

1. Logging in... ✅ PASS
2. Creating test channel... ✅ PASS
3. Getting initial status... ✅ PASS
4. Turning on channel... ✅ PASS
5. Verifying status... ✅ PASS
6. Turning off channel... ✅ PASS
7. Verifying channel turned off... ✅ PASS

================================
📊 Test Results
================================
All tests passed! ✅
```

### **Step 4: Update Frontend Channel Table** ⏰ 5 minutes

Now update the channel table component to use the new endpoints:

```bash
cd /home/sysop/.openclaw/workspace/streamhub-dashboard

# Open the channel table component
nano src/components/manage/channels/table.js
```

Find and replace the `playVideo` and `stopPlayingVideo` functions:

```javascript
// OLD CODE (Flask backend)
const playVideo = (channel) => {
  axios
    .get(`${serverConfigs.serverUrl}/scripts/on_air/${channel}`)
    .then((response) => {
      message.success('Success play video');
    })
    .finally(() => refetch());
};

// NEW CODE (FastAPI backend)
const playVideo = async (channel) => {
  try {
    // Check feature flag
    const useFastAPI = process.env.REACT_APP_USE_FASTAPI === 'true';
    
    if (useFastAPI) {
      // Use FastAPI service
      await channelService.turnOnAir(channel.id);
    } else {
      // Use old Flask backend
      await axios.get(`${serverConfigs.serverUrl}/scripts/on_air/${channel}`);
    }
    
    message.success('Channel is now on-air');
    refetch();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error turning on channel';
    message.error(errorMsg);
  }
};

const stopPlayingVideo = async (channel) => {
  try {
    const useFastAPI = process.env.REACT_APP_USE_FASTAPI === 'true';
    
    if (useFastAPI) {
      await channelService.turnOffAir(channel.id);
    } else {
      await axios.get(`${serverConfigs.serverUrl}/scripts/off_air/${channel}`);
    }
    
    message.success('Channel is now off-air');
    refetch();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error turning off channel';
    message.error(errorMsg);
  }
};
```

---

## ✅ Verification Checklist

After completing the steps above:

- [ ] Database migration applied (check with `\d channels`)
- [ ] FastAPI backend restarted successfully
- [ ] `test-streaming.sh` passed all tests
- [ ] Frontend channel table component updated
- [ ] Swagger UI shows streaming endpoints: http://localhost:8000/docs

---

## 🎯 What's Next After This?

### **Phase 2B: Test Auth Migration** (Next)

After streaming control works, test the new authentication:

1. **Update App.js to use new auth hook**
2. **Test login with FastAPI backend**
3. **Test token refresh on 401**
4. **Enable feature flag: `REACT_APP_ENABLE_NEW_LOGIN=true`**

### **Phase 3: Component Migration** (Week 2-3)

Migrate these components one by one:
1. Channel management (list, create, edit, delete)
2. Video management (list, create, edit, delete)
3. User management
4. Playlist management (need backend endpoints first)

---

## 📞 Quick Reference

| Task | Command/File |
|------|--------------|
| Apply migration | `docker-compose exec postgres psql -U postgres -d apistreamhub -f migrations/add_streaming_fields.sql` |
| Restart backend | `docker-compose restart api` |
| Run tests | `./test-streaming.sh` |
| API docs | http://localhost:8000/docs |
| Frontend start | `npm run dev-linux` |
| Toggle FastAPI | Edit `.env.development`: `REACT_APP_USE_FASTAPI=true` |

---

## ⚠️ Common Issues

### Issue: Migration fails with "column already exists"
**Fix:** Column already exists, skip migration:
```bash
docker-compose exec postgres psql -U postgres -d apistreamhub -c "\d channels"
```

### Issue: Test script fails at login
**Fix:** Create test user first:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass"}'
```

### Issue: Frontend can't connect to FastAPI
**Fix:** Check CORS settings in FastAPI:
```python
# app/main.py - CORS should include frontend URL
allow_origins=["http://localhost:3000", "http://localhost:9000"]
```

---

## 🎉 Summary

**What you just got:**
- ✅ 3 new streaming control endpoints
- ✅ Database schema updated
- ✅ Frontend service updated
- ✅ Test suite (6 test cases)
- ✅ Migration scripts and documentation

**Time to complete:** ~10 minutes

**Next step:** Apply migration and test! 🚀

---

**Need help?** Check these files:
- `MIGRATION_STEPS.md` - Detailed migration steps
- `README_STREAMING.md` - Streaming feature documentation
- `test-streaming.sh` - Automated test script
