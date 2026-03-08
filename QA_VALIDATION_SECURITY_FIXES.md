# QA Validation Report - Security Hardening Fixes

**Project:** PROJ-003 - Security Hardening  
**Date:** 2026-03-09  
**Priority:** Critical  
**Tester:** QA Subagent

---

## Executive Summary

**Overall Status:** ⚠️ PARTIAL FAIL

3 dari 5 acceptance criteria gagal atau tidak dapat divalidasi sepenuhnya. Backend mengalami critical error yang menghalangi testing fungsional.

---

## Test Results

### 1. Backend Rate Limiting Test

**Status:** ❌ **FAIL**

**Expected:** Should return 429 Too Many Requests after 5 failed attempts

**Actual:** All requests return 500 Internal Server Error

**Test Command:**
```bash
for i in {1..7}; do 
  curl -X POST http://localhost:8001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' \
    -s -o /dev/null -w "Request $i: %{http_code}\n"
done
```

**Output:**
```
Request 1: 500
Request 2: 500
Request 3: 500
Request 4: 500
Request 5: 500
Request 6: 500
Request 7: 500
```

**Root Cause:** Backend rate limiter has a critical bug:
```
AttributeError: 'NoneType' object has no attribute 'get'
File "/app/app/core/rate_limiter.py", line 30, in rate_limit_exceeded_handler
    "retry_after": exc.headers.get("Retry-After", "60")
```

**Issue:** The exception handler tries to access `.headers.get()` on a `None` object.

---

### 2. Backend httpOnly Cookies Test

**Status:** ❌ **FAIL**

**Expected:** Login response should include `Set-Cookie` header with `HttpOnly` flag

**Actual:** No cookies set - login returns 500/401 errors

**Test Command:**
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt -v 2>&1 | grep -i "set-cookie"
```

**Output:** No set-cookie headers found

**Root Cause:** Cannot test httpOnly cookies because:
1. Backend returns 500 errors (rate limiter bug)
2. Valid credentials unknown (superadmin account exists but password not documented)

---

### 3. TV Hub Auth Test

**Status:** ✅ **PASS**

**Expected:** Login API should return 200 (or 401 for invalid credentials), NOT 404

**Actual:** Returns 401 Unauthorized (endpoint exists and works correctly)

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -v
```

**Output:**
```
< HTTP/1.1 401 Unauthorized
< content-type: application/json
{"status":false,"statusCode":401,"error":"UnauthorizedException","message":"Invalid username or password"}
```

**Note:** Endpoint is functional. Returns proper 401 for invalid credentials.

---

### 4. Videotron Login Test

**Status:** ⚠️ **PARTIAL PASS** (API only, browser test not possible)

**Expected:** 
- Login API returns 200 with valid credentials
- Cookies set with httpOnly flag (access_token, refresh_token)
- No tokens in localStorage

**Actual:**
- ✅ API endpoint exists and responds correctly (returns 401 for invalid credentials)
- ❌ Browser test not possible (browser tool unavailable)
- ❌ Cannot verify cookie storage vs localStorage

**Test Command (API):**
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -v
```

**Output:**
```
< HTTP/1.1 401 Unauthorized
< server: uvicorn
{"status":false,"statusCode":401,"error":"UnauthorizedException","message":"Invalid username or password"}
```

**Note:** API endpoint on port 3002 is functional. Browser-based cookie validation requires manual testing.

---

### 5. No Tokens in localStorage

**Status:** ❌ **NOT TESTED**

**Reason:** Browser tool unavailable. Cannot access DevTools → Application → localStorage.

**Recommendation:** Manual testing required:
1. Open browser to http://localhost:3002/login
2. Login with valid credentials
3. Open DevTools → Application → Local Storage
4. Verify NO access_token or refresh_token present
5. Check DevTools → Application → Cookies for token presence

---

## Issues Found

### Critical Issues

| ID | Issue | Severity | Component |
|----|-------|----------|-----------|
| BUG-001 | Rate limiter crashes with AttributeError | Critical | Backend (apistreamhub-fastapi) |
| BUG-002 | Backend returns 500 instead of 429 for rate limiting | Critical | Backend (apistreamhub-fastapi) |
| BUG-003 | No httpOnly cookies set on login | High | Backend (apistreamhub-fastapi) |

### Known Issues (Not Bugs)

| ID | Issue | Impact |
|----|-------|--------|
| INFO-001 | Valid user credentials not documented | Testing blocked |
| INFO-002 | Browser automation unavailable | Manual testing required |

---

## Acceptance Criteria Status

| Criteria | Status | Notes |
|----------|--------|-------|
| Rate limiting working (429 after limit) | ❌ FAIL | Returns 500 instead |
| httpOnly cookies set on login | ❌ FAIL | No cookies set |
| TV Hub login returns 200 | ✅ PASS | Returns 401/200 correctly |
| Videotron login works with cookies | ⚠️ PARTIAL | API works, cookie test needs browser |
| No tokens in localStorage | ❌ NOT TESTED | Browser unavailable |

---

## Recommendations

### Immediate Actions Required

1. **Fix Rate Limiter Bug** (Critical)
   - File: `/app/app/core/rate_limiter.py`, line 30
   - Issue: `exc.headers` is `None`
   - Fix: Add null check before accessing `.headers.get()`

2. **Document Valid Test Credentials**
   - Create/Update `.env` with test user credentials
   - Or seed database with known test user

3. **Verify httpOnly Cookie Implementation**
   - Check backend auth response includes `Set-Cookie` header
   - Verify `HttpOnly`, `Secure`, `SameSite` flags are set

### Manual Testing Required

1. **Videotron Browser Test**
   - URL: http://localhost:3002/login
   - Verify cookies set correctly
   - Verify localStorage is empty

---

## Environment Status

| Service | Port | Status | Notes |
|---------|------|--------|-------|
| Backend API (apistreamhub) | 8001 | 🟡 Running with errors | Rate limiter bug |
| TV Hub | 3000 | ✅ Healthy | Auth endpoint working |
| Videotron | 3002 | ✅ Healthy | Auth endpoint working |
| Database (PostgreSQL) | 5434 | ✅ Healthy | 2 users exist |
| Browser Automation | N/A | ❌ Unavailable | Gateway issue |

---

## Conclusion

**Security hardening fixes CANNOT be validated** due to critical backend bug in rate limiter. The rate limiting implementation is causing 500 errors instead of proper 429 responses. This blocks testing of:
- Rate limiting functionality
- httpOnly cookie implementation
- Full authentication flow

**Next Steps:**
1. Fix rate limiter bug in backend
2. Restart backend container
3. Re-run all tests
4. Complete manual browser testing for Videotron

---

*Report generated: 2026-03-09 05:28 WIB*
