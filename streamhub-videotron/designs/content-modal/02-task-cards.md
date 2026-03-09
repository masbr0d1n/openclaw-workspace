# Content Details Modal Revamp - Task Cards
## Implementation Tasks for Development Team

---

## Overview

This document contains detailed task cards for implementing the Content Details Modal Revamp. Tasks are organized by team (Frontend/Backend) and priority.

**Total Estimated Time:** 
- Frontend: 18 hours (~2-3 days)
- Backend: 3 hours (optional enhancements)

---

## Frontend Tasks

### TASK-FE-001: Component Setup
**Priority:** 🔴 Critical  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Set up the new component structure and foundation for the Content Details Modal.

#### Acceptance Criteria
- [ ] Create directory: `/src/components/content-details-modal/`
- [ ] Create main component file: `content-details-modal.tsx`
- [ ] Create index file: `index.ts` with exports
- [ ] Define TypeScript interfaces in `types.ts`
- [ ] Integrate with existing Dialog component from shadcn/ui
- [ ] Basic modal opens/closes correctly
- [ ] Props interface matches design document

#### Technical Notes
```typescript
// Required interfaces
interface ContentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: number | null;
}

interface ContentDetailsModalData extends Video {
  channel?: ChannelInfo;
  tags?: string[];
  quality_label?: QualityLabel;
  file_size?: number;
  related_videos?: Video[];
}
```

#### Dependencies
- shadcn/ui Dialog component
- Video types from `/src/types/video.types.ts`
- API route: `/api/v1/videos/[id]`

#### Files to Create
```
/src/components/content-details-modal/
├── index.ts
├── content-details-modal.tsx
└── types.ts
```

---

### TASK-FE-002: Video Player Section
**Priority:** 🔴 Critical  
**Estimate:** 3 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Implement the video player component that supports both YouTube and uploaded videos.

#### Acceptance Criteria
- [ ] Create `content-modal-video-player.tsx` component
- [ ] Support YouTube embeds with privacy-enhanced mode
- [ ] Support uploaded video playback with HTML5 video
- [ ] Display loading skeleton while video loads
- [ ] Handle errors gracefully (unavailable videos)
- [ ] Show thumbnail fallback when video unavailable
- [ ] Responsive aspect ratio (16:9)
- [ ] Play button overlay on thumbnail

#### Technical Notes
```typescript
// YouTube embed URL format
const youtubeUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;

// Uploaded video proxy URL
const proxyUrl = `/api/videos/file${videoUrl}`;
```

#### Component Props
```typescript
interface VideoPlayerProps {
  video: ContentDetailsModalData;
  isLoading: boolean;
  onError: () => void;
}
```

#### Files to Create
```
/src/components/content-details-modal/
└── content-modal-video-player.tsx
```

---

### TASK-FE-003: Metadata Section
**Priority:** 🔴 Critical  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Display comprehensive metadata including channel info, description, tags, and statistics.

#### Acceptance Criteria
- [ ] Create `content-modal-metadata.tsx` component
- [ ] Display title with proper typography
- [ ] Show description with line clamping
- [ ] Display channel info with avatar/logo
- [ ] Link to channel page
- [ ] Show tags as badges (max 10, show "more" if exceeded)
- [ ] Display stats grid (uploaded, duration, views, updated)
- [ ] Format dates in Indonesian locale (id-ID)
- [ ] Format view count with K/M suffixes

#### Technical Notes
```typescript
// Date formatting
const formattedDate = new Date(dateString).toLocaleDateString('id-ID', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

// View count formatting
const formatViews = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};
```

#### Component Props
```typescript
interface MetadataProps {
  video: ContentDetailsModalData;
  channel?: ChannelInfo;
}
```

#### Files to Create
```
/src/components/content-details-modal/
└── content-modal-metadata.tsx
```

---

### TASK-FE-004: Technical Specs Section
**Priority:** 🟡 High  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Display technical specifications in a grid layout with icons and quality indicators.

#### Acceptance Criteria
- [ ] Create `content-modal-specs.tsx` component
- [ ] Display 6 spec cards in responsive grid
- [ ] Show resolution with quality label (4K, 2K, FHD, HD, SD)
- [ ] Display video codec and audio codec
- [ ] Show bitrates with proper units (Mbps, kbps)
- [ ] Display frame rate (fps)
- [ ] Handle missing/null values gracefully (show "-")
- [ ] Add icons for each spec type
- [ ] Hover effects on spec cards

#### Technical Notes
```typescript
// Quality label calculation
const getQualityLabel = (width: number, height: number): string => {
  if (height >= 2160) return '4K';
  if (height >= 1440) return '2K';
  if (height >= 1080) return 'Full HD';
  if (height >= 720) return 'HD';
  if (height >= 480) return 'SD';
  return `${width}x${height}`;
};

// Bitrate formatting
const formatBitrate = (bitrate: number | null): string => {
  if (!bitrate) return '-';
  if (bitrate >= 1_000_000) return `${(bitrate / 1_000_000).toFixed(2)} Mbps`;
  return `${(bitrate / 1_000).toFixed(2)} kbps`;
};
```

#### Component Props
```typescript
interface SpecsProps {
  video: ContentDetailsModalData;
}
```

#### Files to Create
```
/src/components/content-details-modal/
└── content-modal-specs.tsx
```

---

### TASK-FE-005: Actions Section
**Priority:** 🔴 Critical  
**Estimate:** 3 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Implement action buttons for edit, delete, share, download, and toggle active status.

#### Acceptance Criteria
- [ ] Create `content-modal-actions.tsx` component
- [ ] Edit button: opens edit modal/form
- [ ] Delete button: opens confirmation dialog
- [ ] Share button: opens share dialog with options
- [ ] Download button: triggers download (if permitted)
- [ ] Toggle active button: optimistic update + API call
- [ ] Loading states for all async actions
- [ ] Success/error toasts for all actions
- [ ] Confirm delete with AlertDialog
- [ ] Share options: Copy Link, Twitter, Facebook, LinkedIn

#### Technical Notes
```typescript
// API calls
const updateVideo = async (id: number, data: VideoUpdate) => {
  const response = await fetch(`/api/v1/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

const deleteVideo = async (id: number) => {
  const response = await fetch(`/api/v1/videos/${id}`, {
    method: 'DELETE',
  });
  return response.status === 204;
};
```

#### Component Props
```typescript
interface ActionsProps {
  video: ContentDetailsModalData;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onToggleActive: () => void;
  onDownload: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}
```

#### Files to Create
```
/src/components/content-details-modal/
├── content-modal-actions.tsx
├── content-modal-delete-dialog.tsx
└── content-modal-share-dialog.tsx
```

---

### TASK-FE-006: Related Content Section
**Priority:** 🟡 High  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Display related videos based on category, tags, or channel.

#### Acceptance Criteria
- [ ] Create `content-modal-related.tsx` component
- [ ] Fetch related videos from API (or filter client-side)
- [ ] Display 4 related videos in responsive grid
- [ ] Show thumbnail, title, views, category badge
- [ ] Click to open related video in same modal
- [ ] Lazy load after main content renders
- [ ] Display loading skeletons
- [ ] Handle empty state (no related content)
- [ ] Limit to 4 videos maximum

#### Technical Notes
```typescript
// Fetch related videos (if API available)
const fetchRelatedVideos = async (videoId: number, limit = 4) => {
  const response = await fetch(`/api/v1/videos/${videoId}/related?limit=${limit}`);
  const data = await response.json();
  return data.data || [];
};

// Or filter client-side
const getRelatedVideos = (currentVideo: Video, allVideos: Video[], limit = 4) => {
  return allVideos
    .filter(v => v.id !== currentVideo.id && v.category === currentVideo.category)
    .slice(0, limit);
};
```

#### Component Props
```typescript
interface RelatedContentProps {
  currentVideo: ContentDetailsModalData;
  allVideos: Video[];
  onVideoSelect: (videoId: number) => void;
}
```

#### Files to Create
```
/src/components/content-details-modal/
└── content-modal-related.tsx
```

---

### TASK-FE-007: Accessibility & Polish
**Priority:** 🟡 High  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Ensure accessibility compliance and add final polish to the modal.

#### Acceptance Criteria
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation (Tab, Shift+Tab, Enter, Space, Escape)
- [ ] Focus management: trap focus inside modal
- [ ] Focus returns to trigger element on close
- [ ] Screen reader announcements for dynamic content
- [ ] Mobile responsive design (test on <768px)
- [ ] Touch-friendly button sizes (min 44x44px)
- [ ] Test with screen readers (NVDA/VoiceOver)
- [ ] Color contrast meets WCAG AA
- [ ] Add loading skeletons for all async content

#### Technical Notes
```typescript
// Focus trap example
useEffect(() => {
  if (open) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    
    // Trap focus logic...
  }
}, [open]);
```

#### Testing Checklist
- [ ] Keyboard-only navigation works
- [ ] Screen reader can navigate all content
- [ ] Focus indicators are visible
- [ ] Modal closes on Escape key
- [ ] Mobile layout is usable
- [ ] Touch targets are large enough

#### Files to Update
```
All component files in /src/components/content-details-modal/
```

---

### TASK-FE-008: Integration
**Priority:** 🔴 Critical  
**Estimate:** 2 hours  
**Assignee:** Frontend Developer  
**Status:** ⬜ Not Started

#### Description
Integrate the new modal into the application and replace old modals.

#### Acceptance Criteria
- [ ] Update `/src/app/dashboard/videos/page.tsx` to use new modal
- [ ] Replace `VideoDetailModal` imports with `ContentDetailsModal`
- [ ] Replace `VideoModal` imports with `ContentDetailsModal`
- [ ] Test in all content pages (videos, media library, etc.)
- [ ] Verify all features work correctly
- [ ] Performance testing (modal open < 300ms)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Remove or deprecate old modal components
- [ ] Update documentation

#### Technical Notes
```typescript
// Old usage
import { VideoDetailModal } from '@/components/video-detail-modal';

// New usage
import { ContentDetailsModal } from '@/components/content-details-modal';

// Update component usage
<ContentDetailsModal
  open={selectedVideo !== null}
  onOpenChange={(open) => setSelectedVideo(open ? null : null)}
  videoId={selectedVideo}
/>
```

#### Files to Update
```
/src/app/dashboard/videos/page.tsx
/src/app/dashboard/content/components/*.tsx (wherever old modals are used)
```

#### Migration Steps
1. Add new modal alongside old modals
2. Test thoroughly
3. Update all usage locations
4. Remove old modal files
5. Update imports in dependent files

---

## Backend Tasks (Optional Enhancements)

### TASK-BE-001: Related Videos Endpoint
**Priority:** 🟢 Low  
**Estimate:** 2 hours  
**Assignee:** Backend Developer  
**Status:** ⬜ Not Started

#### Description
Create API endpoint to fetch related videos based on category, tags, or channel.

#### Acceptance Criteria
- [ ] Create GET `/api/v1/videos/[id]/related` endpoint
- [ ] Support query parameters: limit, by (category/tags/channel)
- [ ] Default limit: 4, max: 8
- [ ] Default sort by: category
- [ ] Exclude current video from results
- [ ] Add caching layer (Redis if available)
- [ ] Write unit tests
- [ ] Document endpoint in API docs

#### Technical Notes
```python
# FastAPI endpoint example
@router.get("/videos/{video_id}/related")
async def get_related_videos(
    video_id: int,
    limit: int = Query(4, ge=1, le=8),
    by: str = Query("category", enum=["category", "tags", "channel"])
):
    # Get current video
    video = await get_video(video_id)
    
    # Build query based on 'by' parameter
    if by == "category":
        related = await get_videos_by_category(video.category_id, exclude=video_id, limit=limit)
    elif by == "tags":
        related = await get_videos_by_tags(video.tags, exclude=video_id, limit=limit)
    else:
        related = await get_videos_by_channel(video.channel_id, exclude=video_id, limit=limit)
    
    return {"status": True, "data": related}
```

#### Files to Create/Update
```
/src/routes/videos.py (or equivalent)
/src/services/video_service.py
/tests/test_videos.py
```

---

### TASK-BE-002: Share Analytics Endpoint
**Priority:** 🟢 Low  
**Estimate:** 1 hour  
**Assignee:** Backend Developer  
**Status:** ⬜ Not Started

#### Description
Create endpoint to track share events for analytics.

#### Acceptance Criteria
- [ ] Create POST `/api/v1/videos/[id]/share` endpoint
- [ ] Track platform (twitter, facebook, linkedin, copy)
- [ ] Store in analytics table
- [ ] Include timestamp and user info
- [ ] Write unit tests
- [ ] Document endpoint

#### Technical Notes
```python
# Request body
class ShareEvent(BaseModel):
    platform: str  # twitter, facebook, linkedin, copy
    user_id: Optional[int]

# Database schema
CREATE TABLE video_share_events (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    platform VARCHAR(50),
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Files to Create/Update
```
/src/routes/videos.py
/src/models/analytics.py
/src/db/migrations/
```

---

## Testing Tasks

### TASK-TEST-001: Unit Tests
**Priority:** 🟡 High  
**Estimate:** 2 hours  
**Assignee:** QA / Developer  
**Status:** ⬜ Not Started

#### Description
Write comprehensive unit tests for all modal components.

#### Test Coverage
- [ ] Component renders correctly with mock data
- [ ] Video player loads YouTube videos
- [ ] Video player loads uploaded videos
- [ ] Metadata displays correctly
- [ ] Specs format correctly
- [ ] Actions trigger correct handlers
- [ ] Related content fetches and displays
- [ ] Date/time formatting (Indonesian locale)
- [ ] Duration formatting
- [ ] File size formatting
- [ ] Quality label calculation

#### Tools
- Vitest (existing test framework)
- React Testing Library
- Mock Service Worker (MSW) for API mocking

---

### TASK-TEST-002: Integration Tests
**Priority:** 🟡 High  
**Estimate:** 2 hours  
**Assignee:** QA / Developer  
**Status:** ⬜ Not Started

#### Description
Write integration tests for modal workflows.

#### Test Scenarios
- [ ] Modal opens from content list
- [ ] Edit action opens edit modal
- [ ] Delete action removes video (with confirmation)
- [ ] Share action copies link
- [ ] Toggle action updates status
- [ ] Related content loads correctly
- [ ] Keyboard navigation works
- [ ] Modal closes on Escape

---

### TASK-TEST-003: E2E Tests
**Priority:** 🟢 Medium  
**Estimate:** 2 hours  
**Assignee:** QA / Developer  
**Status:** ⬜ Not Started

#### Description
Write end-to-end tests for complete user flows.

#### Test Flows
- [ ] Full user flow: open → view → share → close
- [ ] Edit flow: open → edit → save → verify
- [ ] Delete flow: open → delete → confirm → verify removed
- [ ] Related content flow: open → click related → verify new content loads

#### Tools
- Playwright (recommended) or Cypress
- Test in Chrome, Firefox, Safari

---

## Task Dependencies

```
TASK-FE-001 (Setup)
    ↓
TASK-FE-002 (Video Player) ──┐
TASK-FE-003 (Metadata) ──────┼──→ TASK-FE-005 (Actions)
TASK-FE-004 (Specs) ─────────┘         ↓
TASK-FE-006 (Related) ───────────→ TASK-FE-007 (A11y & Polish)
                                           ↓
                                    TASK-FE-008 (Integration)

TASK-BE-001 (Related API) ──→ Can be done in parallel
TASK-BE-002 (Share Analytics) → Can be done in parallel

TASK-TEST-001 (Unit) ──┐
TASK-TEST-002 (Integration) ──→ After FE tasks complete
TASK-TEST-003 (E2E) ───┘
```

---

## Definition of Done

### For Each Task
- [ ] Code implemented according to spec
- [ ] TypeScript types defined
- [ ] Unit tests written and passing
- [ ] Code reviewed by peer
- [ ] No console errors or warnings
- [ ] Accessibility checked
- [ ] Responsive design verified
- [ ] Documentation updated

### For Complete Feature
- [ ] All tasks completed
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Cross-browser tested
- [ ] Deployed to staging
- [ ] User acceptance testing complete
- [ ] Deployed to production
- [ ] Old code removed/deprecated

---

## Contact & Support

**Designer:** Muse (UI/UX Designer)  
**Project Lead:** [To be assigned]  
**Frontend Lead:** [To be assigned]  
**Backend Lead:** [To be assigned]  

**Design Document:** `/designs/content-modal/00-design-document.md`  
**Prototype:** `/designs/content-modal/01-content-modal-prototype.html`  

For questions, refer to the design document or open a GitHub issue.

---

*Task cards created: March 9, 2026*  
*Ready for sprint planning*
