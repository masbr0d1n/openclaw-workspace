# Content Menu - Operational Scenarios

**Project:** PROJ-007 - Content Menu Enhancement
**Document:** Operational Scenarios
**Created:** 2026-03-09

---

## Primary Flow: Content Pipeline

```
Media Library → Playlists → Layouts → Feeds → Campaign → Approval → Archive
```

---

## Scenario 1: New Campaign Deployment

### Step 1: Upload Media
**Location:** Content → Media Library
1. Click "Upload" button
2. Select video/image files
3. Add metadata (title, description, tags)
4. Select channel/category
5. Click "Save"

**Output:** Media available in library

---

### Step 2: Create Playlist
**Location:** Content → Playlists
1. Click "Create Playlist"
2. Name the playlist
3. Drag media from library
4. Set duration per item
5. Arrange sequence
6. Save playlist

**Output:** Playlist ready for layout

---

### Step 3: Design Layout
**Location:** Content → Layouts
1. Click "Create Layout"
2. Select resolution (FHD, HD, 4K)
3. Add zones (video, image, text, clock)
4. Assign playlist to video zone
5. Preview layout
6. Save layout

**Output:** Layout ready for campaign

---

### Step 4: Create Feed (Optional)
**Location:** Content → Feeds (Dynamic Content)
1. Create dynamic content feed
2. Configure data source
3. Map to layout zones
4. Test feed
5. Save feed

**Output:** Dynamic content ready

---

### Step 5: Create Campaign
**Location:** Content → Campaign
1. Click "Create Campaign"
2. Name campaign
3. Select start/end date
4. Select target screens
5. Assign layout
6. Set priority
7. Submit for approval

**Output:** Campaign pending approval

---

### Step 6: Approval Workflow
**Location:** Content → Approval Workflow
1. Approver receives notification
2. Review campaign details
3. Preview content
4. Approve or Reject with feedback
5. If approved → Campaign active
6. If rejected → Back to creator

**Output:** Approved campaign deployed

---

### Step 7: Archive
**Location:** Content → Archive
1. Completed campaigns auto-archive
2. Search archived content
3. Restore if needed
4. Permanent delete (with confirmation)

---

## Scenario 2: Content Revision

### Trigger: Approval Rejected
1. Creator receives rejection notification
2. Open campaign from notification
3. Review feedback
4. Edit content/layout
5. Re-submit for approval
6. Repeat until approved

---

## Scenario 3: Emergency Update

### Steps:
1. Go to Campaign → Active
2. Select campaign
3. Click "Edit" (creates draft)
4. Make changes
5. Submit for approval
6. Fast-track approval
7. Deploy update

---

## Key Interactions

| From | To | Action |
|------|---|--------|
| Media Library | Playlist | Drag & drop media |
| Playlist | Layout | Assign to zone |
| Layout | Campaign | Select layout |
| Campaign | Approval | Submit workflow |
| Approval | Archive | Auto-archive |

---

## User Roles

| Role | Permissions |
|------|-------------|
| Creator | Upload, Create, Submit |
| Reviewer | View, Comment |
| Approver | Approve, Reject, Deploy |
| Admin | All + Archive management |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-09