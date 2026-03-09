# Content Details Modal - Design Spec (Final)

## Source
HTML Prototype: `/home/sysop/.openclaw/media/inbound/4edc677b-e343-42ab-8098-9fe076bd5348`

---

## Design Structure

### 1. Modal Overlay
- ID: `modalOverlay`
- Background: `rgba(0, 0, 0, 0.75)` with `backdrop-filter: blur(4px)`
- Position: `fixed inset-0 z-50`

### 2. Modal Container
- Class: `bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto`

### 3. Header (Sticky)
- Position: `sticky top-0 bg-white border-b border-gray-200 px-6 py-4`
- Contains:
  - Title (text-2xl font-semibold)
  - Badges: Active (bg-success), HD (bg-info)
  - Description (text-sm text-gray-600 line-clamp-2)
  - Close button (X icon, top right)

### 4. Body (p-6 space-y-6)

**A. Video Player & Metadata Row**
- Grid: `grid-cols-1 lg:grid-cols-3 gap-6`
- Video Player (lg:col-span-2):
  - Container: `video-player aspect-video rounded-xl overflow-hidden relative group`
  - Thumbnail with opacity-80
  - Play button overlay (centered, w-20 h-20 rounded-full)
  - Video info overlay (bottom, gradient background)
  - Info: duration, views, source (YouTube/Uploaded)

- Metadata Sidebar:
  - Channel Info (avatar w-12 h-12, name, description, link)
  - Stats Grid (2x2): Uploaded, Duration, Views, Updated
  - Tags: pill badges (bg-gray-200)

**B. Technical Specifications**
- Title: "Technical Specifications" with microchip icon
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3`
- 6 Cards (spec-card):
  1. Resolution (Full HD, 1920x1080)
  2. Video Codec (H.264, AVC)
  3. Video Bitrate (5.2 Mbps, High Quality)
  4. Audio Codec (AAC, Stereo)
  5. Audio Bitrate (192 kbps, High Quality)
  6. Frame Rate (30 fps, Standard)

**C. Actions**
- Title: "Actions" with cog icon
- Buttons:
  1. Edit Details (bg-primary, primary button)
  2. Share (bg-white, border)
  3. Download (bg-white, border)
  4. Toggle Active (bg-success)
  5. Delete (bg-white, text-danger, ml-auto)

**D. Related Content**
- Title: "Related Content" with th-large icon
- Grid: `grid-cols-2 md:grid-cols-4 gap-4`
- 4 Cards (related-card):
  - Thumbnail (aspect-video) + duration badge
  - Title (line-clamp-2)
  - Views + Category badge

### 5. Footer (Sticky)
- Position: `sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3`
- Info: Video ID, Source, Last synced

---

## CSS Classes

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}
.video-player {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}
.spec-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.related-card:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.action-btn:hover {
  transform: translateY(-1px);
}
```

---

## Colors
- Primary: #4F46E5 (Indigo)
- Success: #10B981 (Green)
- Danger: #EF4444 (Red)
- Info: #3B82F6 (Blue)

---

## Task Breakdown

| Task | Team | Priority |
|------|------|----------|
| Update modal structure match HTML | Frontend | Critical |
| Add sticky header/footer | Frontend | High |
| Update video player styling | Frontend | High |
| Update metadata sidebar | Frontend | High |
| Update tech specs grid (6 cards) | Frontend | High |
| Update action buttons styling | Frontend | Medium |
| Update related content grid | Frontend | Medium |
| Add CSS hover effects | Frontend | Medium |
| QA validate visual match | QA | Critical |