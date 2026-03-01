# Fix Issues - Upload Form

## Issues

1. **Form Order** - Video File should be first
2. **Backend Error** - column channels.logo_url does not exist
3. **Frontend Warning** - DialogContent requires DialogTitle

## Fix 1: Form Order - Video File First

**File:** `streamhub-nextjs/src/app/dashboard/content/page.tsx`

**New Order:**
1. Video File (first)
2. Title
3. Description
4. Category

## Fix 2: Backend - logo_url Column Missing

**Error:**
```
column channels.logo_url does not exist
```

**Solution:**

### Option A: Add column to database
```sql
ALTER TABLE channels ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
```

### Option B: Remove from schema/model
Check if Channel model/schema references logo_url and remove it.

## Fix 3: Frontend - DialogTitle Accessibility

**File:** `streamhub-nextjs/src/app/dashboard/content/page.tsx`

**Solution:** Add VisuallyHidden wrapper to DialogTitle

```tsx
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// In DialogContent:
<DialogHeader className="space-y-1 px-0 pt-0">
  <VisuallyHidden>
    <DialogTitle>Upload Video</DialogTitle>
  </VisuallyHidden>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-2xl font-bold">Upload Video</CardTitle>
      <CardDescription>
        Upload a video file from your device
      </CardDescription>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setUploadDialogOpen(false)}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
</DialogHeader>
```

## Implementation

See fixes in next steps.
