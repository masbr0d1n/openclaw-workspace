# Backend URL Audit Report

**Date:** 2026-03-07  
**Status:** ✅ COMPLETE - All critical client-side direct backend calls fixed

## Summary

Audited both TV Hub and Videotron projects for hardcoded backend URLs. Fixed all **client-side** code to use Next.js proxy (`/api/v1`) instead of direct calls to `localhost:8001`.

---

## Files Fixed

### 1. API Client Libraries (Client-Side)

**streamhub-tvhub:**
- ✅ `src/lib/api/playlists.ts` - Changed from `http://localhost:8001` to `/api/v1`

**streamhub-videotron:**
- ✅ `src/lib/api/playlists.ts` - Changed from `http://localhost:8001` to `/api/v1`

### 2. Component Files (Client-Side)

**streamhub-tvhub:**
- ✅ `src/components/video-preview-card.tsx` - Changed from `http://192.168.8.117:3000` to relative path
- ✅ `src/components/video-player-modal.tsx` - Changed from `http://192.168.8.117:3000` to relative path

**streamhub-videotron:**
- ✅ `src/components/video-preview-card.tsx` - Changed from `http://192.168.8.117:3000` to relative path
- ✅ `src/components/video-player-modal.tsx` - Changed from `http://192.168.8.117:3000` to relative path

### 3. Dashboard Pages (Client-Side)

**streamhub-videotron:**
- ✅ `src/app/dashboard/content/page-before-tabs.tsx` - Removed BACKEND_URL, uses relative paths
- ✅ `src/app/dashboard/content/page-before-view-modal.tsx` - Removed BACKEND_URL, uses relative paths
- ✅ `src/app/dashboard/content/components/media-library-full.tsx` - Removed BACKEND_URL, uses relative paths

---

## Files Already Correct (No Changes Needed)

### api-client.ts (Both Projects)
- ✅ `src/lib/api-client.ts` - Already uses `/api/v1` (relative path)

### Server-Side API Routes
Server-side routes in `src/app/api/` use `process.env.BACKEND_API_URL` which is correct:
- These run on the server, not client
- They properly use environment variables
- Fallback URLs only activate when env vars are missing (Docker production)

### .env.local Files (Both Projects)
- ✅ Configuration is correct:
  ```
  BACKEND_API_URL=http://localhost:8001
  NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8001
  ```

---

## Pattern Applied

### ❌ Before (Direct Backend Calls)
```typescript
// Client-side - WRONG!
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8001';
fetch(`${API_BASE}/api/v1/playlists`);

// Components - WRONG!
return `http://192.168.8.117:3000/uploads/videos/${filename}`;
```

### ✅ After (Next.js Proxy)
```typescript
// Client-side - CORRECT!
const API_BASE = '/api/v1';
fetch(`${API_BASE}/playlists`);

// Components - CORRECT!
return `/uploads/videos/${filename}`;
```

---

## Verification

### Client-Side Code
All client-side code now uses relative paths through Next.js proxy:
- ✅ API calls: `/api/v1/*`
- ✅ Video URLs: `/uploads/videos/*`
- ✅ No hardcoded IPs or localhost URLs in client bundles

### Server-Side Code
Server-side API routes remain unchanged (correct pattern):
- Use `process.env.BACKEND_API_URL` env var
- Run on server, not exposed to client
- Fallback URLs only for Docker production environments

---

## Next Steps

1. ✅ Restart both dev servers to apply changes
2. Test playlist operations in both projects
3. Test video playback in both projects
4. Verify no CORS errors in browser console

---

## Report Sent To
Frontend Channel: `<#1476052074415394938>`
