# Content Details Modal Revamp - Design Document
## Project: Content Details Modal Enhancement
## Priority: High
## Assigned To: UI/UX Designer (Muse) → Frontend Implementation

---

## Executive Summary

This document outlines the complete redesign of the Content Details Modal for StreamHub Videotron. The revamp consolidates two existing modals (`video-modal.tsx` and `video-detail-modal.tsx`) into a unified, feature-rich component that provides comprehensive content information with improved UX.

**Status:** Design Complete → Ready for Implementation

---

## 1. Current State Analysis

### Existing Components

#### 1.1 `video-modal.tsx` (Enhanced Video Modal)
**Location:** `/src/components/video-modal.tsx`

**Features:**
- Video player (YouTube + uploaded videos)
- Basic metadata (title, description, created date, views)
- Technical specifications (codec, resolution, duration, file size)
- Category badge display
- Loading states with skeletons

**Limitations:**
- No action buttons (edit, delete, share)
- No related content section
- Limited metadata display
- No channel/category information
- Missing user interactions

#### 1.2 `video-detail-modal.tsx` (Video Detail Modal)
**Location:** `/src/components/video-detail-modal.tsx`

**Features:**
- Thumbnail preview
- Title and badges (duration, upload date)
- Description section
- Detailed video specifications (6 specs in grid)
- Upload/update timestamps

**Limitations:**
- No video playback capability
- No action buttons
- No related content
- No channel information
- Static display only

### Current Data Structure

```typescript
// Video Interface (from /src/types/video.types.ts)
export interface Video {
  id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  channel_id: number;
  thumbnail_url: string | null;
  thumbnail_data: string | null;
  video_url: string | null;
  duration: number | null;
  view_count: number;
  is_live: boolean;
  is_active: boolean;
  
  // Video metadata from FFmpeg
  width: number | null;
  height: number | null;
  video_codec: string | null;
  video_bitrate: number | null;
  audio_codec: string | null;
  audio_bitrate: number | null;
  fps: number | null;
  
  created_at: string;
  updated_at: string;
}
```

### Current API Endpoints

```
GET    /api/v1/videos/[id]          - Get video details
PUT    /api/v1/videos/[id]          - Update video
DELETE /api/v1/videos/[id]          - Delete video
POST   /api/v1/videos/[id]/view     - Increment view count
GET    /api/v1/videos               - List videos (for related content)
```

---

## 2. Revamp Requirements

### 2.1 Functional Requirements

#### FR-001: Unified Content Preview
- Support both YouTube and uploaded videos
- Responsive video player with adaptive quality
- Thumbnail fallback when video unavailable
- Loading states for all media

#### FR-002: Comprehensive Metadata Display
- Title, description, tags
- Upload/update timestamps
- View count, duration
- Channel/category information
- Status badges (active, live, draft)

#### FR-003: Technical Specifications
- Video: codec, resolution, bitrate, FPS
- Audio: codec, bitrate
- File size and format
- Quality indicators (4K, 2K, FHD, HD, SD)

#### FR-004: User Actions
- Edit video details
- Delete video (with confirmation)
- Share video (copy link, social)
- Download video (if permitted)
- Toggle active/inactive status

#### FR-005: Related Content
- Show 3-6 related videos from same channel
- Based on: same category, tags, or upload date
- Clickable thumbnails to open in modal

#### FR-006: Channel Information
- Channel name and logo
- Channel description (optional)
- Link to channel page
- Other videos from channel

### 2.2 Non-Functional Requirements

#### NFR-001: Performance
- Modal open time < 300ms
- Lazy load related content
- Optimistic UI updates for actions
- Efficient re-rendering

#### NFR-002: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels throughout

#### NFR-003: Responsiveness
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interactions
- Adaptive layouts

#### NFR-004: Error Handling
- Graceful degradation for missing data
- User-friendly error messages
- Retry mechanisms for failed loads
- Fallback UI states

---

## 3. Design Specifications

### 3.1 Visual Mockup (HTML/CSS Prototype)

See: `01-content-modal-prototype.html` for interactive prototype.

### 3.2 Component Structure

```
ContentDetailsModal
├── ModalHeader
│   ├── Title
│   ├── StatusBadges
│   └── CloseButton
│
├── ModalBody
│   ├── VideoPreviewSection
│   │   ├── VideoPlayer (YouTube/Upload)
│   │   ├── ThumbnailFallback
│   │   └── PlaybackControls
│   │
│   ├── MetadataSection
│   │   ├── Title & Description
│   │   ├── ChannelInfo
│   │   ├── TagsList
│   │   └── StatsRow (views, duration, date)
│   │
│   ├── TechnicalSpecsSection
│   │   ├── VideoSpecs (grid)
│   │   ├── AudioSpecs (grid)
│   │   └── FileInfo
│   │
│   ├── ActionsSection
│   │   ├── EditButton
│   │   ├── DeleteButton
│   │   ├── ShareButton
│   │   └── ToggleActiveButton
│   │
│   └── RelatedContentSection
│       ├── SectionHeader
│       └── RelatedVideosGrid
│
└── ModalFooter
    ├── LastUpdated
    └── QuickLinks
```

### 3.3 Layout Specifications

#### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────┐
│  [Title]                              [Status][✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌──────────────────────┐ │
│  │                     │  │  Metadata            │ │
│  │    Video Player     │  │  - Channel           │ │
│  │    (16:9)           │  │  - Description       │ │
│  │                     │  │  - Tags              │ │
│  │                     │  │  - Stats             │ │
│  └─────────────────────┘  └──────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Technical Specifications (3-column grid)    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Actions: [Edit] [Delete] [Share] [Toggle]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Related Content (4-column grid)             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Mobile (<768px)
```
┌─────────────────────────┐
│  [Title]        [✕]     │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │   Video Player    │  │
│  │   (full width)    │  │
│  └───────────────────┘  │
│                         │
│  Metadata               │
│  - Channel              │
│  - Description          │
│  - Tags                 │
│  - Stats                │
│                         │
│  Technical Specs        │
│  (2-column grid)        │
│                         │
│  Actions (stacked)      │
│  [Edit] [Delete]        │
│  [Share] [Toggle]       │
│                         │
│  Related Content        │
│  (2-column grid)        │
│                         │
└─────────────────────────┘
```

### 3.4 Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary Action | Indigo | `#4F46E5` |
| Success | Emerald | `#10B981` |
| Danger | Red | `#EF4444` |
| Warning | Amber | `#F59E0B` |
| Info | Blue | `#3B82F6` |
| Muted Text | Gray | `#6B7280` |
| Background | White/Gray | `#FFFFFF` / `#F9FAFB` |
| Border | Gray | `#E5E7EB` |

### 3.5 Typography

```
Title:        text-xl font-semibold (20px)
Section Head: text-sm font-medium text-muted-foreground (14px)
Body:         text-sm (14px)
Caption:      text-xs text-muted-foreground (12px)
```

### 3.6 Spacing System

```
xs:  0.25rem (4px)
sm:  0.5rem (8px)
md:  1rem (16px)
lg:  1.5rem (24px)
xl:  2rem (32px)
2xl: 3rem (48px)
```

---

## 4. User Interactions

### 4.1 Modal Open Flow

```
User clicks content
    ↓
Fetch video details (API: GET /api/v1/videos/[id])
    ↓
Display loading skeleton
    ↓
Render modal with data
    ↓
Lazy load related content
    ↓
Auto-focus close button (accessibility)
```

### 4.2 Action Flows

#### Edit Action
```
Click Edit → Open Edit Modal/Form → Save Changes → 
Update UI Optimistically → Show Success Toast → 
Close Edit Modal → Refresh Data if needed
```

#### Delete Action
```
Click Delete → Show Confirmation Dialog → 
Confirm → API Call (DELETE /api/v1/videos/[id]) → 
Show Loading → Success → Close Modal → 
Show Success Toast → Remove from List
```

#### Share Action
```
Click Share → Open Share Menu → 
Options: Copy Link, Twitter, Facebook, LinkedIn → 
Execute Share → Show Success Toast
```

#### Toggle Active
```
Click Toggle → Optimistic UI Update → 
API Call (PUT /api/v1/videos/[id]) → 
Success: Keep State / Error: Revert + Show Error
```

### 4.3 Keyboard Navigation

```
Tab          - Cycle through interactive elements
Shift+Tab    - Reverse cycle
Enter/Space  - Activate focused button
Escape       - Close modal
Arrow Keys   - Navigate related content grid
```

### 4.4 Loading States

- **Initial Load:** Full skeleton layout
- **Video Load:** Spinner overlay on player
- **Related Content:** Skeleton cards
- **Actions:** Button loading spinners
- **Optimistic Updates:** Immediate UI feedback

---

## 5. Technical Requirements

### 5.1 Frontend Components Needed

#### New Components
```
1. ContentDetailsModal.tsx (main component)
2. ContentModalHeader.tsx
3. ContentModalVideoPlayer.tsx
4. ContentModalMetadata.tsx
5. ContentModalSpecs.tsx
6. ContentModalActions.tsx
7. ContentModalRelated.tsx
8. ContentModalShareDialog.tsx
9. ContentModalDeleteDialog.tsx
```

#### Reused Components (from shadcn/ui)
```
- Dialog, DialogContent, DialogHeader, DialogTitle
- Button
- Badge
- Skeleton
- Tabs, TabsContent, TabsList, TabsTrigger
- Card, CardContent
- Separator
- Tooltip
- Toast (for notifications)
- AlertDialog (for confirmations)
```

#### Icons (lucide-react)
```
- Video, Youtube, Upload (source indicators)
- Edit, Trash2, Share2, Download (actions)
- Calendar, Clock, Eye, Activity (metadata)
- Film, Music, Gauge, Cpu, Monitor (specs)
- X, Check, AlertCircle (status)
- ChevronRight, ExternalLink (navigation)
```

### 5.2 API Requirements

#### Existing Endpoints (No Changes Needed)
```
GET    /api/v1/videos/[id]      - Get video details
PUT    /api/v1/videos/[id]      - Update video
DELETE /api/v1/videos/[id]      - Delete video
GET    /api/v1/videos           - List videos (filter for related)
```

#### New Endpoints (Optional Enhancements)

**GET /api/v1/videos/[id]/related**
```typescript
// Query params:
// - limit (default: 4, max: 8)
// - by (default: 'category', options: 'category', 'tags', 'channel')

Response:
{
  status: boolean;
  statusCode: number;
  message: string;
  data: Video[];
}
```

**POST /api/v1/videos/[id]/share**
```typescript
// For tracking share analytics (optional)
Body: { platform: 'twitter' | 'facebook' | 'linkedin' | 'copy' }

Response:
{
  status: boolean;
  statusCode: number;
  message: string;
}
```

### 5.3 Data Structure Enhancements

#### Extended Video Interface (Frontend)
```typescript
export interface ContentDetailsModalData extends Video {
  // Extended fields for modal
  channel?: {
    id: number;
    name: string;
    logo_url?: string;
    description?: string;
  };
  
  tags?: string[];
  
  quality_label?: '4K' | '2K' | 'FHD' | 'HD' | 'SD';
  
  file_size?: number; // in bytes
  
  related_videos?: Video[];
}
```

### 5.4 State Management

```typescript
interface ContentModalState {
  // Modal state
  isOpen: boolean;
  selectedVideoId: number | null;
  
  // Data state
  video: ContentDetailsModalData | null;
  loading: boolean;
  error: Error | null;
  
  // Action state
  isEditing: boolean;
  isDeleting: boolean;
  isSharing: boolean;
  isToggling: boolean;
  
  // Related content
  relatedVideos: Video[];
  relatedLoading: boolean;
}
```

### 5.5 Performance Optimizations

1. **Lazy Loading:** Related content loads after main modal renders
2. **Memoization:** React.memo for static sections
3. **Virtual Scrolling:** If related content > 10 items
4. **Image Optimization:** Next.js Image component for thumbnails
5. **API Caching:** React Query / SWR for video data
6. **Debounced Actions:** Prevent double-clicks on buttons

---

## 6. Implementation Tasks

### 6.1 Frontend Tasks

#### TASK-FE-001: Component Setup
**Priority:** High  
**Estimate:** 2 hours

- [ ] Create component directory: `/src/components/content-details-modal/`
- [ ] Set up main modal component structure
- [ ] Implement basic Dialog integration
- [ ] Add TypeScript interfaces

#### TASK-FE-002: Video Player Section
**Priority:** High  
**Estimate:** 3 hours

- [ ] Create video player component
- [ ] Support YouTube embeds
- [ ] Support uploaded video playback
- [ ] Add loading states
- [ ] Handle errors gracefully

#### TASK-FE-003: Metadata Section
**Priority:** High  
**Estimate:** 2 hours

- [ ] Display title, description
- [ ] Show channel information
- [ ] Render tags as badges
- [ ] Display stats (views, duration, date)
- [ ] Format dates/times (Indonesian locale)

#### TASK-FE-004: Technical Specs Section
**Priority:** Medium  
**Estimate:** 2 hours

- [ ] Create specs grid layout
- [ ] Display video specifications
- [ ] Display audio specifications
- [ ] Add quality indicators
- [ ] Handle missing data gracefully

#### TASK-FE-005: Actions Section
**Priority:** High  
**Estimate:** 3 hours

- [ ] Implement Edit button (opens edit modal)
- [ ] Implement Delete button (with confirmation)
- [ ] Implement Share button (share dialog)
- [ ] Implement Toggle Active button
- [ ] Add loading states for all actions
- [ ] Implement optimistic updates

#### TASK-FE-006: Related Content Section
**Priority:** Medium  
**Estimate:** 2 hours

- [ ] Fetch related videos from API
- [ ] Display related videos grid
- [ ] Add click handlers to open in modal
- [ ] Implement lazy loading
- [ ] Add loading skeletons

#### TASK-FE-007: Accessibility & Polish
**Priority:** Medium  
**Estimate:** 2 hours

- [ ] Add ARIA labels
- [ ] Implement keyboard navigation
- [ ] Focus management
- [ ] Screen reader testing
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

#### TASK-FE-008: Integration
**Priority:** High  
**Estimate:** 2 hours

- [ ] Replace old `video-modal.tsx` usage
- [ ] Replace old `video-detail-modal.tsx` usage
- [ ] Update `/dashboard/videos/page.tsx`
- [ ] Test in all content pages
- [ ] Performance testing

**Total Frontend Estimate:** 18 hours (~2-3 days)

### 6.2 Backend Tasks

#### TASK-BE-001: Related Videos Endpoint (Optional)
**Priority:** Low  
**Estimate:** 2 hours

- [ ] Create GET /api/v1/videos/[id]/related endpoint
- [ ] Implement related content algorithm (category/tags/channel)
- [ ] Add query parameters (limit, sort by)
- [ ] Add caching layer
- [ ] Write unit tests

#### TASK-BE-002: Share Analytics (Optional)
**Priority:** Low  
**Estimate:** 1 hour

- [ ] Create POST /api/v1/videos/[id]/share endpoint
- [ ] Track share events in database
- [ ] Add analytics dashboard (future enhancement)

**Total Backend Estimate:** 3 hours (optional enhancements)

---

## 7. Testing Requirements

### 7.1 Unit Tests

```typescript
// Component tests
- ContentDetailsModal renders correctly
- Video player loads YouTube videos
- Video player loads uploaded videos
- Metadata displays correctly
- Actions trigger correct handlers
- Related content fetches and displays

// Utility tests
- Date formatting (Indonesian locale)
- Duration formatting
- File size formatting
- Quality label calculation
```

### 7.2 Integration Tests

```typescript
- Modal opens from content list
- Edit action opens edit modal
- Delete action removes video
- Share action copies link
- Toggle action updates status
- Related content loads correctly
```

### 7.3 E2E Tests

```typescript
- Full user flow: open modal → view details → share → close
- Keyboard navigation flow
- Mobile responsive flow
- Error handling flow
```

### 7.4 Accessibility Tests

```typescript
- Screen reader compatibility (NVDA, VoiceOver)
- Keyboard-only navigation
- Focus indicators visible
- ARIA labels correct
- Color contrast WCAG AA
```

---

## 8. Success Metrics

### 8.1 Performance Metrics
- Modal open time: < 300ms
- Video load time: < 2s
- Related content load: < 1s
- Action response: < 500ms

### 8.2 User Experience Metrics
- Reduced support tickets about content details
- Increased engagement with related content
- Faster content management workflows
- Positive user feedback

### 8.3 Technical Metrics
- Zero console errors
- 100% TypeScript type coverage
- >90% test coverage
- Lighthouse accessibility score: >95

---

## 9. Migration Plan

### Phase 1: Development (Days 1-3)
- Create new components
- Implement all features
- Write tests
- Internal review

### Phase 2: Testing (Day 4)
- QA testing
- Accessibility audit
- Performance testing
- Bug fixes

### Phase 3: Deployment (Day 5)
- Deploy to staging
- User acceptance testing
- Deploy to production
- Monitor for issues

### Phase 4: Cleanup (Day 6)
- Remove old modal components
- Update documentation
- Archive deprecated code

---

## 10. Appendix

### A. File Structure

```
/src/components/content-details-modal/
├── index.ts
├── content-details-modal.tsx
├── content-modal-header.tsx
├── content-modal-video-player.tsx
├── content-modal-metadata.tsx
├── content-modal-specs.tsx
├── content-modal-actions.tsx
├── content-modal-related.tsx
├── content-modal-share-dialog.tsx
├── content-modal-delete-dialog.tsx
└── types.ts
```

### B. References

- Existing modal: `/src/components/video-modal.tsx`
- Existing detail modal: `/src/components/video-detail-modal.tsx`
- Video types: `/src/types/video.types.ts`
- API routes: `/src/app/api/v1/videos/`
- Design system: shadcn/ui components

### C. Contact

**Designer:** Muse (UI/UX Designer)  
**Project:** Content Details Modal Revamp  
**Priority:** High  
**Status:** Design Complete → Ready for Development

---

*Document created: March 9, 2026*  
*Last updated: March 9, 2026*
