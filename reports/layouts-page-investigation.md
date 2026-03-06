# Layouts Page Error Investigation Report

**Date:** 2026-03-06 21:11 GMT+7  
**Page:** `/dashboard/layouts` (Videotron)  
**Status:** 🔴 CRITICAL - Multiple Root Causes Found

---

## 🚨 Errors Reported

1. **Request failed with status code 404**
2. **No QueryClient set, use QueryClientProvider to set one**

---

## 🔍 Root Cause Analysis

### Issue #1: No QueryClientProvider (FRONTEND)

**Severity:** 🔴 CRITICAL  
**Location:** Frontend - App not wrapping children with Providers

**Finding:**
- ✅ `QueryClientProvider` IS defined in `/workspace/streamhub-videotron/src/components/providers.tsx`
- ❌ **NOT being used** in the app root layout
- ❌ **NOT being used** in dashboard layout

**Evidence:**
```tsx
// /workspace/streamhub-videotron/src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
// ❌ Missing: <Providers>{children}</Providers>
```

**Impact:** All pages using `useQuery`, `useMutation`, or `useQueryClient` from `@tanstack/react-query` will fail with "No QueryClient set" error.

---

### Issue #2: Missing API Route (BACKEND PROXY)

**Severity:** 🔴 CRITICAL  
**Location:** Frontend - Next.js API Routes

**Finding:**
- ✅ Backend API endpoint EXISTS: `/workspace/apistreamhub-fastapi/app/api/v1/layouts.py`
- ✅ Frontend service EXISTS: `/workspace/streamhub-videotron/src/services/layout-service.ts`
- ❌ **Next.js API route MISSING**: `/workspace/streamhub-videotron/src/app/api/v1/layouts/route.ts`

**Evidence:**
```bash
# Existing API routes in /workspace/streamhub-videotron/src/app/api/v1/
auth/          ✅
playlists/     ✅
role-presets/  ✅
users/         ✅
videos/        ✅
layouts/       ❌ MISSING!
```

**Architecture:**
```
Frontend (page.tsx)
    ↓ calls /api/v1/layouts/
Next.js API Route (SHOULD EXIST)
    ↓ proxies to backend
FastAPI Backend (http://localhost:8001/api/v1/layouts/)
```

**Impact:** All layout API calls return 404 because Next.js has no route handler to proxy requests to the backend.

---

## 📋 Files That Need Changes

### Frontend Team Should Fix:

#### 1. Add QueryClientProvider to Root Layout
**File:** `/workspace/streamhub-videotron/src/app/layout.tsx`

**Current:**
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { ... };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
```

**Should Be:**
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = { ... };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 2. Create Layouts API Route Handler
**File:** `/workspace/streamhub-videotron/src/app/api/v1/layouts/route.ts` (CREATE NEW)

**Template (based on videos/route.ts):**
```tsx
/**
 * Next.js Route Handler - Layouts
 * GET /api/v1/layouts - List layouts
 * POST /api/v1/layouts - Create layout
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const url = new URL(`${BACKEND_API_URL}/layouts/`);
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Layouts list proxy error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${BACKEND_API_URL}/layouts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Layout create proxy error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3. Create Layout Detail API Route (Optional but Recommended)
**File:** `/workspace/streamhub-videotron/src/app/api/v1/layouts/[id]/route.ts`

Needed for: GET, PUT, DELETE `/api/v1/layouts/:id`

---

## 🎯 Recommendation

**Priority:** 🔴 **FRONTEND TEAM** should fix both issues

**Reason:** 
- Backend API (`layouts.py`) is already implemented and working
- Frontend is missing:
  1. React Query provider setup
  2. Next.js API route handlers

**Estimated Effort:** 30-60 minutes

---

## 📝 Additional Routes Needed

For full layouts CRUD support, create these routes:

```
/workspace/streamhub-videotron/src/app/api/v1/layouts/
├── route.ts              # GET, POST (list & create)
└── [id]/
    ├── route.ts          # GET, PUT, DELETE (detail, update, delete)
    └── duplicate/
        └── route.ts      # POST (duplicate layout)
```

---

## ✅ Verification Steps After Fix

1. Start backend: `cd apistreamhub-fastapi && uvicorn app.main:app --reload`
2. Start frontend: `cd streamhub-videotron && npm run dev`
3. Navigate to: `http://localhost:3000/dashboard/layouts`
4. Verify:
   - ✅ No "No QueryClient set" error in console
   - ✅ Layouts list loads successfully
   - ✅ Create/Edit/Delete actions work

---

**Report Generated By:** QA Subagent  
**Task Duration:** < 10 minutes
