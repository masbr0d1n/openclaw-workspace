# Auth API Routes Fix

## Issue
Login API was returning 404 because auth API routes were missing from the Next.js app.

## Solution
Created Next.js API route handlers that proxy requests to the backend service at `http://localhost:8001`.

## Created Routes

### 1. Login Route
**File:** `src/app/api/v1/auth/login/route.ts`
- Accepts POST requests with `username` and `password`
- Forwards to backend: `POST http://localhost:8001/api/v1/auth/login`
- Transforms `email` to `username` if needed for compatibility
- Forwards cookies from backend response to client

### 2. Logout Route
**File:** `src/app/api/v1/auth/logout/route.ts`
- Accepts POST requests
- Forwards to backend: `POST http://localhost:8001/api/v1/auth/logout`
- Forwards cookies from backend response

### 3. Register Route
**File:** `src/app/api/v1/auth/register/route.ts`
- Accepts POST requests with user registration data
- Forwards to backend: `POST http://localhost:8001/api/v1/auth/register`
- Forwards cookies from backend response

### 4. Get Current User Route
**File:** `src/app/api/v1/auth/me/route.ts`
- Accepts GET requests
- Forwards client cookies to backend: `GET http://localhost:8001/api/v1/auth/me`
- Returns current user data

### 5. Refresh Token Route
**File:** `src/app/api/v1/auth/refresh/route.ts`
- Accepts POST requests with `refresh_token` query param
- Forwards to backend: `POST http://localhost:8001/api/v1/auth/refresh`
- Forwards cookies from backend response

## Testing

### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected response:
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer",
    "expires_in": 259200,
    "user": {...}
  }
}
```

### Test with Email (backward compatibility)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}'
```

## Important Notes

1. **Server Restart Required**: The Next.js dev server must be restarted to pick up the new route files.

2. **Cookie Forwarding**: All routes properly forward Set-Cookie headers from the backend to enable httpOnly cookie authentication.

3. **Backend Dependency**: These routes require the backend service to be running on `http://localhost:8001`.

## Acceptance Criteria

- ✅ Login API route created
- ✅ Logout API route created
- ✅ Register API route created
- ✅ Get current user route created
- ✅ Refresh token route created
- ✅ Cookies forwarded from backend
- ⏳ Server restart needed for routes to become active
- ⏳ Login API should return 200 (not 404) after restart

## Next Steps

1. Restart the Next.js dev server:
   ```bash
   # Kill current process
   # Then restart:
   cd /home/sysop/.openclaw/workspace/streamhub-tvhub
   npm run dev
   ```

2. Test login flow through the UI at `http://localhost:3000/login`

3. Verify cookies are being set correctly in browser dev tools
