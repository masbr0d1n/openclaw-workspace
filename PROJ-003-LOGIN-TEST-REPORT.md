# PROJ-003: Login Functionality Test Report (Post Security Changes)

**Date:** 2026-03-09  
**Tester:** AI Subagent  
**Priority:** High  

---

## Executive Summary

⚠️ **CRITICAL ISSUE:** Backend is running outdated code in Docker container. Security hardening changes (rate limiting, httpOnly cookies) exist in workspace but are NOT deployed to the running backend.

---

## 1. Backend Test Results (apistreamhub-fastapi)

### Status: ⚠️ RUNNING OLD CODE

**Location:** `/home/sysop/.openclaw/workspace/apistreamhub-fastapi`  
**Running:** Yes (Docker container `apistreamhub-api`, port 8001 → 8000)  
**Container Age:** 2 days old (started Mar 07)  
**Code Changes:** Mar 09 (NOT deployed)

### Test Results:

#### ✅ Backend is Running
```bash
$ curl http://localhost:8001/api/v1/auth/me
{"detail":"Not authenticated"}  # HTTP 401 - Expected for unauthenticated request
```

#### ❌ Rate Limiting NOT Working
```bash
# Expected: 429 on 6th request (limit is 5/minute)
# Actual: All requests return 401
for i in {1..7}; do 
  curl -X POST http://localhost:8001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}' -s -o /dev/null -w "%{http_code}\n"
done

# Output:
# 401, 401, 401, 401, 401, 401, 401  (NO 429)
```

**Root Cause:** Docker container running old code without rate limiting.

#### ❌ httpOnly Cookies NOT Set
```bash
# Expected: Set-Cookie headers in login response
# Actual: Tokens returned in JSON body only
curl -v -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}'

# Response headers: NO Set-Cookie
# Response body: {"data": {"access_token": "...", "refresh_token": "..."}}
```

**Root Cause:** Backend login endpoint doesn't set cookies, returns JSON tokens.

---

## 2. Videotron Frontend Test Results

### Status: ⚠️ MISCONFIGURED FOR CURRENT BACKEND

**Location:** `/home/sysop/.openclaw/workspace/streamhub-videotron`  
**Running:** Yes (port 3002)  
**Code Status:** Updated for httpOnly cookies

### Test Results:

#### ✅ Login Endpoint Accessible
```bash
$ curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}'

# Returns: 200 OK with tokens in JSON
```

#### ❌ No Cookies Set (Expected httpOnly)
- Frontend configured with `withCredentials: true`
- Frontend expects cookies via `Set-Cookie` headers
- Backend sends JSON tokens instead
- **Result:** Login succeeds but tokens not stored securely

#### ❌ Protected Routes Will Fail
- After login, frontend expects cookies to be automatically sent
- Backend expects Bearer token in Authorization header OR cookies
- Mismatch will cause 401 errors on protected routes after page refresh

---

## 3. TV Hub Frontend Test Results

### Status: ❌ INCOMPLETE MIGRATION

**Location:** `/home/sysop/.openclaw/workspace/streamhub-tvhub`  
**Running:** Yes (port 3001)  
**Code Status:** PARTIALLY updated

### Test Results:

#### ❌ Auth API Routes Missing
```bash
$ curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}'

# Returns: 404 Not Found
```

**Root Cause:** TV Hub missing API proxy routes for `/api/v1/auth/*`

#### ❌ Still Using localStorage/Zustand for Tokens
```typescript
// src/app/login/page.tsx (line ~57)
login(user, access_token, refresh_token);  // Stores tokens in Zustand

// src/stores/auth.store.ts
persist({
  name: 'auth-storage',
  partialize: (state) => ({
    user: state.user,
    accessToken: state.accessToken,  // ⚠️ Persisting tokens!
    isAuthenticated: state.isAuthenticated,
  })
})

// src/app/login/page.tsx (line ~54)
localStorage.setItem('login_category', 'tv_hub');  // ⚠️ Using localStorage
```

**Root Cause:** TV Hub login page and auth store NOT fully migrated to httpOnly cookie pattern.

---

## 4. Issues Summary

### Critical Issues (Must Fix Before Deployment)

| # | Issue | Component | Impact | Priority |
|---|-------|-----------|--------|----------|
| 1 | Backend running old Docker image | Backend | No security hardening active | 🔴 CRITICAL |
| 2 | Backend doesn't set httpOnly cookies | Backend | Frontend auth will fail | 🔴 CRITICAL |
| 3 | TV Hub missing auth API routes | TV Hub | Login returns 404 | 🔴 CRITICAL |
| 4 | TV Hub still stores tokens in Zustand | TV Hub | XSS vulnerability remains | 🔴 CRITICAL |

### High Priority Issues

| # | Issue | Component | Impact | Priority |
|---|-------|-----------|--------|----------|
| 5 | Rate limiting not deployed | Backend | Brute force protection inactive | 🟠 HIGH |
| 6 | Videotron expects cookies, backend sends JSON | Both | Auth flow broken | 🟠 HIGH |

---

## 5. Root Cause Analysis

### Primary Issue: Deployment Gap
The security hardening code exists in the workspace but was never deployed to the Docker container:
- Code changes: Mar 09, 2026
- Container started: Mar 07, 2026 (2 days old)
- **Result:** Running 2-day-old code without security fixes

### Secondary Issue: Incomplete Frontend Migration
- **Videotron:** Fully migrated to httpOnly cookies ✅
- **TV Hub:** Partially migrated ❌
  - Login page still stores tokens in Zustand
  - Auth store persists tokens
  - Missing API proxy routes for auth endpoints

---

## 6. Recommendations

### Immediate Actions (Required)

#### 1. Rebuild and Restart Backend Docker Container
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Verify:**
```bash
# Check rate limiting (should get 429 on 6th request)
for i in {1..7}; do 
  curl -X POST http://localhost:8001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' -s -o /dev/null -w "%{http_code}\n"
done

# Check cookies (should see Set-Cookie header)
curl -v -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}' 2>&1 | grep -i "set-cookie"
```

#### 2. Update Backend Login Endpoint to Set httpOnly Cookies
**File:** `apistreamhub-fastapi/app/api/v1/auth.py`

Add cookie setting to login endpoint:
```python
from fastapi import Response

@router.post("/login", response_model=AuthResponse)
async def login(request: Request, user_login: UserLogin, db: AsyncSession = Depends(get_db)) -> Response:
    # ... existing auth logic ...
    
    response = JSONResponse(content={...})  # Existing response
    
    # Add httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=not settings.DEBUG,  # HTTPS only in production
        samesite="lax",
        max_age=900,  # 15 minutes
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=2592000,  # 30 days
        path="/"
    )
    
    return response
```

#### 3. Fix TV Hub Auth API Routes
**Create:** `streamhub-tvhub/src/app/api/v1/auth/login/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  
  // Forward cookies from backend response
  const nextResponse = NextResponse.json(data);
  
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    nextResponse.headers.set('set-cookie', setCookie);
  }
  
  return nextResponse;
}
```

#### 4. Fix TV Hub Login Page to NOT Store Tokens
**File:** `streamhub-tvhub/src/app/login/page.tsx`

Change:
```typescript
// BEFORE (line ~57)
login(user, access_token, refresh_token);

// AFTER
login(user);  // Only pass user data, tokens are in cookies
```

**File:** `streamhub-tvhub/src/stores/auth.store.ts`

Remove token storage:
```typescript
interface AuthState {
  user: User | null;
  // REMOVE: accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Update login action
login: (user: User) => {
  set({ user, isAuthenticated: true, isLoading: false });
}

// Update persist
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  // REMOVE: accessToken
})
```

### Testing Checklist (After Fixes)

- [ ] Backend rate limiting active (429 on 6th failed login)
- [ ] Backend sets httpOnly cookies on login
- [ ] Videotron login works with cookies
- [ ] Videotron protected routes accessible after login
- [ ] TV Hub login works (no 404)
- [ ] TV Hub doesn't store tokens in localStorage/Zustand
- [ ] TV Hub protected routes accessible after login
- [ ] Logout clears cookies on both frontends
- [ ] Token refresh works automatically

---

## 7. Conclusion

The security hardening changes are **NOT YET ACTIVE** in the running system. The code exists in the workspace but the backend Docker container is running 2-day-old code without:
- Rate limiting
- httpOnly cookie support

Additionally, TV Hub has an incomplete migration and still stores tokens insecurely.

**Estimated Fix Time:** 1-2 hours
**Risk Level:** HIGH (security features not active)

---

**Report Generated:** 2026-03-09 05:15 GMT+7  
**Next Steps:** Deploy backend updates, fix TV Hub, re-test
