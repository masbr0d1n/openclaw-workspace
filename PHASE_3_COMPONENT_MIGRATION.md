# Phase 3: Component Migration Guide

## Overview

Setelah frontend berjalan di Docker, saatnya migrate components untuk menggunakan FastAPI backend!

---

## 🎯 Phase 3 Goals

Migrate semua components satu per satu:
- ✅ Channel management components
- ✅ Video management components
- ✅ User management components
- ✅ Playlist/schedule components (when backend ready)

---

## 📋 Migration Strategy

### Pattern untuk Setiap Component:

1. **Identify API calls** di component
2. **Add feature flag check**
3. **Import new service**
4. **Conditional API calls** (Flask vs FastAPI)
5. **Handle different response formats**
6. **Test thoroughly**

---

## 🔧 Step-by-Step Migration

### Component 1: Channel Table

**File:** `src/components/manage/channels/table.js`

#### 1.1 Buka file
```bash
nano /home/sysop/.openclaw/workspace/streamhub-dashboard/src/components/manage/channels/table.js
```

#### 1.2 Tambahkan imports di bagian atas:
```javascript
import { useFeatureFlags } from '@/utils/feature-flags';
import { channelService } from '@/services';
```

#### 1.3 Tambahkan hook di component:
```javascript
function ManageChannelsTable({ ... }) {
  const { useFastAPI, useNewChannelService } = useFeatureFlags();
  
  // ... rest of component
```

#### 1.4 Update fetchChannels function:
```javascript
const fetchChannels = async () => {
  try {
    let response;
    
    if (useNewChannelService) {
      // NEW: FastAPI
      response = await channelService.getAll();
      setChannels(response.data.data); // FastAPI format
    } else {
      // OLD: Flask
      response = await axios.get(`${serverConfigs.serverUrl}/channels`);
      setChannels(response.data); // Flask format
    }
    
    message.success('Channels loaded successfully');
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error loading channels';
    message.error(errorMsg);
  }
};
```

#### 1.5 Update deleteChannel function:
```javascript
const deleteChannel = async (id) => {
  try {
    if (useNewChannelService) {
      await channelService.delete(id);
    } else {
      await axios.delete(`${serverConfigs.serverUrl}/channels/${id}`);
    }
    
    message.success('Channel deleted successfully');
    fetchChannels(); // Refresh list
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Delete failed';
    message.error(errorMsg);
  }
};
```

#### 1.6 Update onToggleOnAir function:
```javascript
const onToggleOnAir = async (checked, channel) => {
  try {
    if (useNewChannelService) {
      if (checked) {
        await channelService.turnOnAir(channel.id);
      } else {
        await channelService.turnOffAir(channel.id);
      }
    } else {
      if (checked) {
        await axios.get(`${serverConfigs.serverUrl}/scripts/on_air/${channel.name}`);
      } else {
        await axios.get(`${serverConfigs.serverUrl}/scripts/off_air/${channel.name}`);
      }
    }
    
    message.success(checked ? 'Channel is now on-air' : 'Channel is now off-air');
    refetch();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error toggling channel';
    message.error(errorMsg);
  }
};
```

---

### Component 2: Channel Forms

**Files:**
- `src/components/manage/channels/add_form.js`
- `src/components/manage/channels/edit_form.js`

#### Pattern yang sama:
```javascript
// Add imports
import { useFeatureFlags } from '@/utils/feature-flags';
import { channelService } from '@/services';

// Use hook
const { useNewChannelService } = useFeatureFlags();

// Conditional API calls
const onSubmit = async (values) => {
  if (useNewChannelService) {
    await channelService.create(values); // FastAPI
  } else {
    await axios.post(`${serverConfigs.serverUrl}/channels`, values); // Flask
  }
};
```

---

### Component 3: Video Components

**Files di** `src/components/videos/`:
- `youtube/table.js`
- `offline/table.js`
- `mam/table.js`

#### Pattern yang sama:
```javascript
import { useFeatureFlags } from '@/utils/feature-flags';
import { videoService } from '@/services';

const { useNewVideoService } = useFeatureFlags();

// Fetch videos
const fetchVideos = async () => {
  if (useNewVideoService) {
    const response = await videoService.getAll();
    setVideos(response.data.data);
  } else {
    const response = await axios.get(`${serverConfigs.serverUrl}/videos`);
    setVideos(response.data);
  }
};
```

---

### Component 4: User Management

**Files:** `src/components/manage/users/`

#### Pattern:
```javascript
import { useFeatureFlags } from '@/utils/feature-flags';
import { authService } from '@/services';

// Note: authService already handles both backends
// Just use: authService.login(), authService.register(), etc.
```

---

## ✅ Testing Checklist untuk Setiap Component

Setelah migrate component, test:

- [ ] List data loads correctly
- [ ] Create new item works
- [ ] Edit item works
- [ ] Delete item works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Network tab shows correct API calls
- [ ] Response format handled correctly

---

## 🎯 Enable Feature Flags

Setelah component di-migrate, enable feature flags:

```bash
# Edit .env.development atau docker-compose.yml
REACT_APP_USE_NEW_CHANNEL_SERVICE=true
REACT_APP_USE_NEW_VIDEO_SERVICE=true
```

Rebuild Docker container:
```bash
cd /home/sysop/.openclaw/workspace
docker-compose build frontend
docker-compose up -d frontend
```

---

## 📊 Progress Tracker

| Component | Status | Notes |
|-----------|--------|-------|
| Channel Table | ⏳ TODO | |
| Channel Add Form | ⏳ TODO | |
| Channel Edit Form | ⏳ TODO | |
| Video List | ⏳ TODO | |
| Video Create | ⏳ TODO | |
| Video Edit | ⏳ TODO | |
| Video Delete | ⏳ TODO | |
| User Management | ⏳ TODO | |

---

## 🔍 Debugging Tips

### Issue: "Cannot read property 'data' of undefined"

**Cause:** Response format berbeda antara Flask dan FastAPI

**Fix:**
```javascript
// FastAPI format: { status, statusCode, message, data }
// Flask format: { code, data } or direct array

const normalizeResponse = (response, useFastAPI) => {
  if (useFastAPI) {
    return response.data.data; // Extract from FastAPI wrapper
  } else {
    return response.data; // Flask returns data directly
  }
};
```

### Issue: Feature flag not working

**Check:**
```bash
# Verify env variables
docker-compose exec frontend env | grep REACT_APP

# Should see:
# REACT_APP_USE_FASTAPI=true
# REACT_APP_ENABLE_NEW_LOGIN=true
```

**Fix:** Rebuild container with new env vars

### Issue: Network calls to wrong backend

**Check:** DevTools Network tab
- FastAPI: `localhost:8001/api/v1/*`
- Flask: `api-streamhub.uzone.id/*`

**Fix:** Verify feature flags and rebuild

---

## 📝 Quick Reference

### Service Layer Usage

```javascript
// Auth
import { authService } from '@/services';
await authService.login(username, password);
await authService.getCurrentUser();

// Channels
import { channelService } from '@/services';
await channelService.getAll();
await channelService.create(data);
await channelService.update(id, data);
await channelService.delete(id);
await channelService.turnOnAir(id);
await channelService.turnOffAir(id);

// Videos
import { videoService } from '@/services';
await videoService.getAll();
await videoService.create(data);
await videoService.update(id, data);
await videoService.delete(id);
await videoService.getByYoutubeId(youtubeId);
```

---

## 🎉 Completion Criteria

Phase 3 complete ketika:

- ✅ All channel components use FastAPI
- ✅ All video components use FastAPI
- ✅ All user components use FastAPI
- ✅ Feature flags enabled for all services
- ✅ No more calls to Flask backend
- ✅ All CRUD operations tested
- ✅ Error handling works correctly

---

**Next Phase:** 4 - Production Rollout & Monitoring

---

**Status:** ✅ Ready to start
**Time Estimate:** 2-3 days
**Priority:** High

**Last Updated:** 2026-02-25
