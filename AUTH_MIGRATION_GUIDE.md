# 🔐 Phase 2B: Auth Migration Guide

## Overview

This guide explains how to migrate authentication from Flask backend to FastAPI backend using a hybrid approach that allows gradual rollout.

---

## 🎯 What Changed

### New Auth Hook
```javascript
// OLD: Flask-only auth
import { useAuth } from './hooks/use-auth';

// NEW: Hybrid auth (Flask + FastAPI)
import { useAuth } from './hooks/use-auth-hybrid';
```

The new hook automatically switches between backends based on feature flags:
- `REACT_APP_ENABLE_NEW_LOGIN=false` → Uses Flask (old)
- `REACT_APP_ENABLE_NEW_LOGIN=true` → Uses FastAPI (new)

---

## 📋 Migration Steps

### Step 1: Test FastAPI Auth Backend (2 min)

```bash
cd /home/sysop/.openclaw/workspace

# Run auth flow test
./test-auth-flow.sh
```

Expected output:
```
================================
🔐 Auth Flow Test Script
================================

Step 1: Register new user
✅ Registration successful

Step 2: Login
✅ Login successful

Step 3: Access protected route (/auth/me)
✅ Protected route accessed successfully

Step 4: Token refresh
✅ Token refresh successful

Step 5: Verify new token works
✅ New token works correctly

Step 6: Test invalid token handling
✅ Invalid token correctly rejected

================================
📊 Test Results
================================
All auth tests passed! ✅
```

### Step 2: Enable FastAPI Auth in Frontend (1 min)

```bash
cd /home/sysop/.openclaw/workspace/streamhub-dashboard

# Add to .env.development
echo "REACT_APP_USE_FASTAPI=true" >> .env.development
echo "REACT_APP_ENABLE_NEW_LOGIN=true" >> .env.development

# Verify
cat .env.development | grep -E "USE_FASTAPI|ENABLE_NEW_LOGIN"
```

Expected output:
```
REACT_APP_USE_FASTAPI=true
REACT_APP_ENABLE_NEW_LOGIN=true
```

### Step 3: Restart Frontend (1 min)

```bash
cd /home/sysop/.openclaw/workspace/streamhub-dashboard

# Stop if running (Ctrl+C)
# Then restart
npm run dev-linux
```

### Step 4: Test Login in Browser (3 min)

1. Open browser: http://localhost:9000
2. Open DevTools → Network tab
3. Try to login with:
   - Username: `testuser`
   - Password: `testpass`
4. Check Network tab for:
   - ✅ Request to: `localhost:8000/api/v1/auth/login` (FastAPI)
   - ❌ NOT: `api-streamhub.uzone.id/auth` (Flask)

### Step 5: Test Token Refresh (2 min)

1. After login, open DevTools → Application → Session Storage
2. Find `access_token` and copy it
3. Use invalid token to test refresh:
   - Replace `access_token` with "invalid_token"
   - Refresh page or make API call
   - Should auto-refresh and get new token
4. Check Console for: `[API] Token refreshed successfully`

### Step 6: Test Logout (1 min)

1. Click logout button
2. Check Session Storage:
   - ✅ `access_token` should be gone
   - ✅ `refresh_token` should be gone
   - ✅ `user` should be gone
3. Should redirect to `/login`

---

## ✅ Verification Checklist

After completing steps above:

- [ ] `test-auth-flow.sh` passed all tests
- [ ] `.env.development` has `REACT_APP_ENABLE_NEW_LOGIN=true`
- [ ] Frontend restarted successfully
- [ ] Login works in browser with FastAPI
- [ ] Network tab shows calls to `localhost:8000/api/v1/auth/*`
- [ ] Token refresh works on 401 errors
- [ ] Logout clears all tokens
- [ ] Protected routes require authentication

---

## 🔍 Debugging

### Issue: Login fails with "Network Error"

**Check:**
```bash
# Is FastAPI running?
curl http://localhost:8000/docs

# Should show Swagger UI HTML
```

**Fix:**
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker-compose up -d
```

### Issue: CORS error in browser

**Check:** Browser Console → Network → auth/login → Headers

**Error:** `Access-Control-Allow-Origin`

**Fix:** Update FastAPI CORS settings in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:9000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Token not refreshing

**Check:** Browser Console for errors

**Fix:** Verify `api-client.js` interceptor is configured:
```javascript
// src/lib/api-client.js
// Should have response interceptor that handles 401
```

### Issue: Login uses old Flask backend

**Check:** `.env.development` feature flags
```bash
cat .env.development | grep ENABLE_NEW_LOGIN
```

**Should be:** `REACT_APP_ENABLE_NEW_LOGIN=true`

**Fix:**
```bash
# Update flag
sed -i 's/REACT_APP_ENABLE_NEW_LOGIN=.*/REACT_APP_ENABLE_NEW_LOGIN=true/' .env.development

# Restart frontend
npm run dev-linux
```

---

## 🎯 Token Flow Diagram

```
User Login
    ↓
POST /api/v1/auth/login
    ↓
FastAPI validates credentials
    ↓
Returns: { access_token, refresh_token, user }
    ↓
Store in sessionStorage
    ↓
Use access_token for API calls (in Authorization header)
    ↓
If 401 Unauthorized:
    ↓
POST /api/v1/auth/refresh with refresh_token
    ↓
Get new access_token
    ↓
Retry original request with new token
    ↓
If refresh fails:
    ↓
Clear all tokens
    ↓
Redirect to /login
```

---

## 📊 Response Formats

### FastAPI Auth Response

#### Login Success
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "is_active": true
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Token Refresh Success
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Get Current User
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "is_active": true,
    "created_at": "2026-02-25T10:00:00Z"
  }
}
```

---

## 🔄 Rollback Plan

If FastAPI auth has issues:

```bash
# Disable FastAPI auth
cd /home/sysop/.openclaw/workspace/streamhub-dashboard

# Update .env.development
sed -i 's/REACT_APP_ENABLE_NEW_LOGIN=true/REACT_APP_ENABLE_NEW_LOGIN=false/' .env.development

# Restart frontend
npm run dev-linux
```

This will revert to Flask backend immediately.

---

## 📝 Code Examples

### Using Auth Hook in Components

```javascript
import { useAuth } from '@/hooks/use-auth-hybrid';

function MyComponent() {
  const { user, signin, signout, isLoading } = useAuth();
  
  const handleLogin = async () => {
    await signin('username', 'password', () => {
      // Callback after successful login
      console.log('Logged in!', user);
    });
  };
  
  const handleLogout = () => {
    signout(() => {
      // Callback after logout
      console.log('Logged out!');
    });
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.username}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Checking Auth Status

```javascript
const { isAuthenticated, user, useFastAPI } = useAuth();

console.log('Is authenticated:', isAuthenticated);
console.log('Current user:', user);
console.log('Using FastAPI:', useFastAPI);
```

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `src/hooks/use-auth-hybrid.js` | Hybrid auth hook (Flask + FastAPI) |
| `src/hooks/use-auth-fastapi.js` | FastAPI-only auth hook |
| `src/hooks/use-auth.js` | Old Flask-only auth hook |
| `src/lib/api-client.js` | API client with token refresh |
| `src/services/auth.service.js` | Auth API calls |
| `test-auth-flow.sh` | Automated auth test script |

---

## ⏭️ Next Steps

After auth migration is complete:

1. **Phase 3A:** Migrate channel management components
2. **Phase 3B:** Migrate video management components
3. **Phase 3C:** Migrate user management components
4. **Phase 4:** Full production rollout

---

**Status:** ✅ Ready to migrate
**Time Estimate:** 10 minutes
**Risk Level:** Low (can rollback instantly)

**Last Updated:** 2026-02-25
