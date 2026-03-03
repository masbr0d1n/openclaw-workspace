# DELETE BUG - ROOT CAUSE & FIX

## Problem
Delete button in Saved Drafts table returning "Internal server error" (500)

## Investigation

### User Testing Results (Manual Browser Test)

**First click:**
```
Error deleting draft: Error: Internal server error
NextJS 8 d05ba3a7a5779c84.js:6:23606
```

**Second click:**
```
Draft not found. It may have been already deleted.
Please refresh the page.
```

### Key Findings

1. **Frontend function IS working** ✅
   - `handleDeleteDraft()` was called
   - DELETE request was sent

2. **Backend IS working** ✅
   - Backend logs showed: `DELETE /api/v1/playlists/... → 204 No Content`
   - Backend correctly returned 204 (success)

3. **Bug was in Next.js API proxy** ❌
   - Proxy tried to parse JSON from 204 No Content response
   - 204 No Content has NO body
   - `response.json()` failed on empty response
   - Error → 500 Internal Server Error

## Root Cause

**File:** `/streamhub-nextjs/src/app/api/playlists/[id]/route.ts`

**DELETE handler (line 83-103):**
```typescript
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // BUG: Trying to parse JSON from 204 No Content!
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    // Catch block returns 500!
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
```

**Why it failed:**
1. DELETE request sent to backend ✅
2. Backend deletes playlist successfully ✅
3. Backend returns `204 No Content` ✅ (HTTP standard for DELETE)
4. Next.js proxy tries: `const data = await response.json()` ❌
5. **204 has no body → JSON parsing fails** ❌
6. Catches error → returns 500 ❌

## Solution

**Check for 204 No Content before parsing JSON:**

```typescript
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // FIX: Handle 204 No Content (no body)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Parse JSON for other status codes (200, 404, 500, etc.)
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
```

## Deployment

**Fixed image:** `streamhub-frontend:delete-fixed`
**Container ID:** `98338bf7fd7c`
**Status:** Running
**Port:** 3000

## Test Results

### Before Fix
- Delete button → "Internal server error"
- Network tab: DELETE request → 500
- Item NOT deleted

### After Fix (Expected)
- Delete button → "Draft deleted successfully!"
- Network tab: DELETE request → 204
- Item deleted from list
- List refreshes

## Lessons Learned

1. **204 No Content is a valid HTTP response** - Standard for DELETE, PUT (no content return)
2. **204 responses have NO body** - Cannot parse JSON
3. **Always check status code before parsing** - Handle 204 separately
4. **API proxies must handle all HTTP codes** - Not just 200 with JSON

## HTTP Status Codes Reference

| Status | Meaning | Has Body? | Action |
|--------|---------|-----------|--------|
| 200 | OK | Yes | Parse JSON |
| 204 | No Content | **No** | **Don't parse!** |
| 404 | Not Found | Yes | Parse error JSON |
| 500 | Server Error | Yes | Parse error JSON |

---
**Date:** 2026-03-02 14:37
**Status:** ✅ FIXED - Ready for testing
**File:** `/streamhub-nextjs/src/app/api/playlists/[id]/route.ts`
