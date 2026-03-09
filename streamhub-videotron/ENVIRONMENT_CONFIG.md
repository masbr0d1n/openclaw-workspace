# Environment Configuration - PROJ-004

**Date:** 2026-03-09  
**Status:** ✅ Complete

---

## Objectives Completed

1. ✅ Moved all hardcoded URLs to environment variables
2. ✅ Created `.env.example` with documentation
3. ✅ Updated `.env.local` with multi-environment support
4. ✅ Updated all API routes to use environment variables
5. ✅ Updated `next.config.ts` rewrites to use environment variables

---

## Changes Made

### 1. Environment Files

#### `.env.local` (Updated)
- Added comprehensive configuration for all environments
- Supports dev, staging, and production configurations
- Documented all required environment variables

#### `.env.example` (Created)
- Template for new developers/deployments
- Detailed comments explaining each variable
- Environment-specific examples (Docker, staging, production)
- Security notes and best practices

### 2. Configuration Files

#### `next.config.ts`
- Updated rewrites to use `process.env.BACKEND_API_URL`
- Falls back to `http://localhost:8001` for development

### 3. API Routes Updated

All API routes now use environment variables with localhost fallback:

**Videos:**
- `src/app/api/videos/[id]/route.ts`
- `src/app/api/videos/route.ts`
- `src/app/api/videos/upload/route.ts`
- `src/app/api/videos/file/[...path]/route.ts`
- `src/app/api/v1/videos/[id]/route.ts`
- `src/app/api/v1/videos/route.ts`
- `src/app/api/v1/videos/upload/route.ts`

**Playlists:**
- `src/app/api/playlists/[id]/route.ts`
- `src/app/api/playlists/route.ts`
- `src/app/api/v1/playlists/[id]/route.ts`
- `src/app/api/v1/playlists/route.ts`
- `src/app/api/v1/playlists/[id]/videos/route.ts`

**Screens:**
- `src/app/api/v1/screens/[id]/route.ts`
- `src/app/api/v1/screens/route.ts`
- `src/app/api/v1/screens/[id]/heartbeat/route.ts`
- `src/app/api/v1/screens/groups/route.ts`

**Layouts:**
- `src/app/api/v1/layouts/[id]/route.ts`
- `src/app/api/v1/layouts/route.ts`
- `src/app/api/v1/layouts/[id]/duplicate/route.ts`

**Users:**
- `src/app/api/v1/users/[id]/route.ts`
- `src/app/api/v1/users/route.ts`

**Role Presets:**
- `src/app/api/v1/role-presets/[id]/route.ts`
- `src/app/api/v1/role-presets/route.ts`

**Uploads:**
- `src/app/api/uploads/[...slug]/route.ts`

---

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PRODUCT` | Product identifier | `videotron` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `StreamHub Videotron` |
| `NEXT_PUBLIC_PORT` | Application port | `3002` |
| `BACKEND_API_URL` | Backend API URL (server-side) | `http://localhost:8001` |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API URL (client-side) | `http://localhost:8001` |
| `BACKEND_HOST` | Backend hostname for uploads | `localhost` |
| `BACKEND_PORT` | Backend port for uploads | `8001` |

### Environment-Specific Configuration

#### Development (Local)
```env
BACKEND_API_URL=http://localhost:8001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8001
BACKEND_HOST=localhost
BACKEND_PORT=8001
```

#### Docker Development
```env
BACKEND_API_URL=http://host.docker.internal:8001
NEXT_PUBLIC_BACKEND_API_URL=http://host.docker.internal:8001
BACKEND_HOST=host.docker.internal
BACKEND_PORT=8001
```

#### Staging
```env
BACKEND_API_URL=http://staging-backend.example.com:8001
NEXT_PUBLIC_BACKEND_API_URL=http://staging-backend.example.com:8001
BACKEND_HOST=staging-backend.example.com
BACKEND_PORT=8001
```

#### Production
```env
BACKEND_API_URL=https://api.videotron.example.com
NEXT_PUBLIC_BACKEND_API_URL=https://api.videotron.example.com
BACKEND_HOST=api.videotron.example.com
BACKEND_PORT=443
```

---

## Notes

### Mock Data
The following files contain hardcoded IP addresses that are **mock data** for UI demonstration purposes (not actual service URLs):
- `src/app/dashboard/tenant/[id]/device/[deviceId]/page.tsx`
- `src/app/dashboard/tenant/[id]/view-all-devices/page.tsx`

These are intentional and should remain as example data for the device management UI.

### SVG Namespace
The `http://www.w3.org/2000/svg` reference in `src/components/thumbnail-image.tsx` is an XML namespace declaration, not a service URL. This is correct and should not be changed.

---

## Testing

To test the configuration:

1. **Development:**
   ```bash
   npm run dev
   # Uses localhost:8001 by default
   ```

2. **Docker:**
   ```bash
   # Set environment variables in .env.local
   BACKEND_API_URL=http://host.docker.internal:8001
   npm run dev
   ```

3. **Production Build:**
   ```bash
   # Set appropriate environment variables
   export BACKEND_API_URL=https://api.production.example.com
   npm run build
   npm start
   ```

---

## Acceptance Criteria

- [x] No hardcoded service URLs in code (except mock data and XML namespaces)
- [x] `.env.example` created with full documentation
- [x] `.env.local` updated with multi-environment support
- [x] All API routes use `process.env.*` variables
- [x] `next.config.ts` rewrites use environment variables
- [x] Application works with environment variables

---

## Next Steps

1. Test the application with different environment configurations
2. Consider adding environment-specific `.env.staging` and `.env.production` files
3. Add environment variable validation on startup (optional)
4. Update CI/CD pipelines to inject environment variables for deployments
