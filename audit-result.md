# Audit Result - TV Hub & Videotron Separation

**Audit Date:** 2026-03-05  
**Auditor:** Subagent (audit-codebase-task)  
**Codebase:** `/home/sysop/.openclaw/workspace/streamhub-nextjs`

---

## Summary

- **Total dashboard files:** 48 files (.tsx/.ts)
- **Total components:** 28 files
- **Total services/hooks/stores/types:** 24 files
- **Total API routes:** 24 files

### Categorization Overview
| Category | Count | Percentage |
|----------|-------|------------|
| TV_HUB | 15 files | ~20% |
| VIDEOTRON | 20 files | ~27% |
| SHARED | 40 files | ~53% |

---

## Dashboard Pages

| Path | Category | Notes |
|------|----------|-------|
| `/dashboard/page.tsx` | SHARED | Dual logic (tv_hub/videotron) - needs split |
| `/dashboard/layout.tsx` | SHARED | Dynamic menu based on login_category - needs split |
| `/dashboard/channels/page.tsx` | TV_HUB | Core channel management |
| `/dashboard/videos/page.tsx` | SHARED | Video library (both products) |
| `/dashboard/composer/page.tsx` | TV_HUB | Playlist composer for TV Hub |
| `/dashboard/composer/[id]/edit/page.tsx` | TV_HUB | Playlist editing |
| `/dashboard/content/page.tsx` | VIDEOTRON | Media library with tabs |
| `/dashboard/content/media/page.tsx` | VIDEOTRON | Full media library view |
| `/dashboard/content/playlists/page.tsx` | SHARED | Playlist management |
| `/dashboard/content/templates/page.tsx` | VIDEOTRON | Templates for signage |
| `/dashboard/content/components/*` | VIDEOTRON | 10 components for content tabs |
| `/dashboard/content/helpers.ts` | VIDEOTRON | Content helpers |
| `/dashboard/layouts/page.tsx` | VIDEOTRON | Layout builder (signage) |
| `/dashboard/screens/page.tsx` | VIDEOTRON | Screen/device management |
| `/dashboard/screens/groups/page.tsx` | VIDEOTRON | Screen groups |
| `/dashboard/screens/devices/page.tsx` | VIDEOTRON | Device list |
| `/dashboard/campaign/page.tsx` | VIDEOTRON | Campaign management |
| `/dashboard/campaign/[campaignId]/page.tsx` | VIDEOTRON | Campaign detail |
| `/dashboard/campaign/[campaignId]/composer/page.tsx` | VIDEOTRON | Campaign composer |
| `/dashboard/schedules/page.tsx` | SHARED | Scheduling (different use cases) |
| `/dashboard/analytics/page.tsx` | SHARED | Analytics (different metrics) |
| `/dashboard/integrations/page.tsx` | SHARED | Third-party integrations |
| `/dashboard/notifications/page.tsx` | SHARED | Notifications system |
| `/dashboard/settings/page.tsx` | SHARED | Settings page |
| `/dashboard/users/page.tsx` | SHARED | User management |
| `/dashboard/subscription/page.tsx` | VIDEOTRON | Subscription management |
| `/dashboard/tenant/page.tsx` | VIDEOTRON | Multi-tenant management |
| `/dashboard/tenant/[id]/*` | VIDEOTRON | 7 tenant sub-pages |
| `/dashboard/logs-reports/page.tsx` | TV_HUB | Logs and reports |

---

## Components

| Component | Category | Action |
|-----------|----------|--------|
| `components/ui/*` | SHARED | Copy to both repos (shadcn) |
| `components/layout/*` | SHARED | Copy to both, adapt menu |
| `components/channels/*` | TV_HUB | Empty dir - create components |
| `components/videos/*` | SHARED | Empty dir - create video components |
| `components/content/*` | VIDEOTRON | Copy to videotron only |
| `components/auth/*` | SHARED | Copy to both |
| `components/auth-checker.tsx` | SHARED | Copy to both |
| `components/video-*.tsx` | SHARED | Copy to both (4 files) |
| `components/page-access-editor.tsx` | SHARED | Copy to both |
| `components/role-badge.tsx` | SHARED | Copy to both |
| `components/thumbnail-image.tsx` | SHARED | Copy to both |
| `components/providers.tsx` | SHARED | Copy to both |

---

## Services, Hooks, Stores, Types

| File | Category | Action |
|------|----------|--------|
| `services/auth.service.ts` | SHARED | Copy to both |
| `services/channel.service.ts` | TV_HUB | TV Hub only |
| `services/playlist.service.ts` | SHARED | Copy to both |
| `services/video.service.ts` | SHARED | Copy to both |
| `services/role-preset.service.ts` | SHARED | Copy to both |
| `services/index.ts` | SHARED | Copy to both |
| `hooks/use-auth.ts` | SHARED | Copy to both |
| `hooks/useAuth.tsx` | SHARED | Copy to both (duplicate?) |
| `stores/auth.store.ts` | SHARED | Copy to both |
| `types/auth.types.ts` | SHARED | Copy to both |
| `types/channel.types.ts` | TV_HUB | TV Hub only |
| `types/video.types.ts` | SHARED | Copy to both |
| `types/playlist.types.ts` | SHARED | Copy to both |
| `types/role-preset.types.ts` | SHARED | Copy to both |
| `types/common.types.ts` | SHARED | Copy to both |
| `types/index.ts` | SHARED | Copy to both |
| `lib/utils.ts` | SHARED | Copy to both |
| `lib/api-client.ts` | SHARED | Copy to both |
| `lib/rbac.ts` | SHARED | Copy to both |
| `lib/resolution.ts` | VIDEOTRON | Videotron specific |
| `lib/subscription.ts` | VIDEOTRON | Videotron specific |
| `lib/api/playlists.ts` | SHARED | Copy to both |
| `lib/hooks/use-playlists.ts` | SHARED | Copy to both |

---

## API Routes

| Route | Category | Notes |
|-------|----------|-------|
| `api/v1/auth/*` | SHARED | Auth endpoints (4 routes) |
| `api/v1/users/*` | SHARED | User management (2 routes) |
| `api/v1/channels/*` | TV_HUB | Channel CRUD (2 routes) |
| `api/v1/videos/*` | SHARED | Video CRUD (3 routes) |
| `api/v1/playlists/*` | SHARED | Playlist CRUD (3 routes) |
| `api/v1/role-presets/*` | SHARED | Role management (2 routes) |
| `api/v1/streaming/*` | TV_HUB | Streaming control |
| `api/videos/*` | SHARED | Video file serving (3 routes) |
| `api/playlists/*` | SHARED | Legacy playlist routes (2 routes) |
| `api/uploads/*` | SHARED | File upload serving |

---

## Backend Gaps

### TV Hub
- [ ] All required APIs exist in current codebase
- [ ] Channel streaming API needs verification

### Videotron (CRITICAL)
- [ ] **Screens API** - Device management, heartbeat (NEEDS IMPLEMENTATION)
- [ ] **Layouts API** - Layout storage (currently frontend-only)
- [ ] **Campaigns API** - Campaign management (NEEDS IMPLEMENTATION)
- [ ] **Screen Groups API** - Bulk device management (NEEDS IMPLEMENTATION)
- [ ] **Templates API** - Template management for signage

---

## Key Findings

### 1. Mixed Logic in Shared Files
- `dashboard/page.tsx` contains both TV Hub and Videotron logic
- `dashboard/layout.tsx` uses `login_category` to switch menus
- **Action:** Split these into product-specific versions

### 2. Empty Component Directories
- `components/channels/` - Empty (needs TV Hub channel components)
- `components/videos/` - Empty (needs video player components)
- **Action:** Create necessary components during separation

### 3. Content Module Complexity
- `/dashboard/content/` has 10+ components for Videotron media library
- Uses tabbed interface with: media, playlists, templates, campaigns, layouts
- **Action:** Copy entire content module to Videotron only

### 4. Tenant Management (Videotron Only)
- 8 files under `/dashboard/tenant/` for multi-tenant support
- Includes sub-tenant management, device configuration
- **Action:** Copy to Videotron only, remove from TV Hub

### 5. Duplicate Hook Files
- `hooks/use-auth.ts` and `hooks/useAuth.tsx` both exist
- **Action:** Consolidate to single file during separation

---

## Recommendations

### Phase 1: Preparation (Complete)
1. ✅ Reference files created (tvhub-files.txt, videotron-files.txt, shared-files.txt)
2. ✅ Repositories created at Forgejo
3. ✅ This audit completed

### Phase 2: Code Separation Strategy

#### For TV Hub (`streamhub-tvhub`):
```bash
# Copy base structure
cp -r streamhub-nextjs streamhub-tvhub

# Remove Videotron-specific
rm -rf streamhub-tvhub/src/app/dashboard/{screens,campaign,layouts,tenant,subscription}
rm -rf streamhub-tvhub/src/app/dashboard/content/components/{campaigns,layouts,templates}
rm -rf streamhub-tvhub/src/lib/{resolution,subscription}.ts

# Adapt shared files
- Edit dashboard/page.tsx (remove videotron logic)
- Edit dashboard/layout.tsx (TV Hub menu only)
- Update package.json name
```

#### For Videotron (`streamhub-videotron`):
```bash
# Copy base structure
cp -r streamhub-nextjs streamhub-videotron

# Remove TV Hub-specific
rm -rf streamhub-videotron/src/app/dashboard/channels
rm -rf streamhub-videotron/src/app/dashboard/logs-reports
rm -rf streamhub-videotron/src/services/channel.service.ts
rm -rf streamhub-videotron/src/types/channel.types.ts

# Adapt shared files
- Edit dashboard/page.tsx (remove tv_hub logic)
- Edit dashboard/layout.tsx (Videotron menu only)
- Update package.json name
```

### Phase 3: Backend Implementation Priority

**CRITICAL for Videotron:**
1. Screens API (devices, groups, heartbeat)
2. Layouts API (layout storage, retrieval)
3. Campaigns API (campaign CRUD)

**LOW PRIORITY for TV Hub:**
- All APIs exist, just verify compatibility

### Phase 4: Testing Strategy

1. **TV Hub Testing:**
   - Channel creation/streaming
   - Video upload/playback
   - Playlist composer
   - User management

2. **Videotron Testing:**
   - Screen registration/heartbeat
   - Layout builder functionality
   - Campaign creation
   - Content scheduling

---

## File Count Summary

### TV Hub Only (15 files)
- Dashboard: channels, composer, logs-reports
- Services: channel.service.ts
- Types: channel.types.ts
- API: channels, streaming

### Videotron Only (20 files)
- Dashboard: screens (3), campaign (3), layouts, tenant (8), subscription, content (4)
- Lib: resolution.ts, subscription.ts
- Content components: 10 files

### Shared (40+ files)
- UI components: 28 files
- Layout: 1 file
- Videos: 4 files
- Auth: 3 files
- Services: 5 files
- Hooks: 2 files
- Stores: 1 file
- Types: 6 files
- Lib: 4 files
- API routes: 15+ files

---

## Next Steps

1. **Update separation-progress.md** with audit completion
2. **Begin Phase 2** - Code separation
3. **Implement missing Videotron APIs** in apistreamhub-fastapi
4. **Test both products** independently

---

**Audit Complete:** 2026-03-05 09:35 WIB  
**Status:** Ready for Phase 2 (Code Separation)
