# Content Menu User Flow
## Project: PROJ-007 - Content Menu Enhancement
## Task: TASK-002 - User Flow Design

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT MENU SYSTEM FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  START HERE  │
                              └──────┬───────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │   1. MEDIA LIBRARY     │
                        │                        │
                        │ • Upload media files   │
                        │ • Organize by folders  │
                        │ • Preview & edit       │
                        │ • Tag & categorize     │
                        └───────────┬────────────┘
                                    │
                                    │ Select media
                                    ▼
                        ┌────────────────────────┐
                        │   2. PLAYLISTS         │
                        │                        │
                        │ • Create playlist      │
                        │ • Add/remove media     │
                        │ • Set play order       │
                        │ • Schedule duration    │
                        └───────────┬────────────┘
                                    │
                                    │ Choose playlist
                                    ▼
                        ┌────────────────────────┐
                        │   3. LAYOUTS           │
                        │                        │
                        │ • Select layout type   │
                        │ • Position media       │
                        │ • Configure zones      │
                        │ • Preview display      │
                        └───────────┬────────────┘
                                    │
                                    │ Apply layout
                                    ▼
                        ┌────────────────────────┐
                        │   4. FEEDS             │
                        │   (Dynamic Content)    │
                        │                        │
                        │ • Add RSS/social feeds │
                        │ • Configure refresh    │
                        │ • Map to layout zones  │
                        │ • Test live preview    │
                        └───────────┬────────────┘
                                    │
                                    │ Integrate feeds
                                    ▼
                        ┌────────────────────────┐
                        │   5. CAMPAIGN          │
                        │                        │
                        │ • Create campaign      │
                        │ • Set schedule         │
                        │ • Target displays      │
                        │ • Review & submit      │
                        └───────────┬────────────┘
                                    │
                                    │ Submit for approval
                                    ▼
                        ┌────────────────────────┐
                        │   6. APPROVAL WORKFLOW │
                        │                        │
                        │ • Review pending       │
                        │ • Approve/Reject       │
                        │ • Add comments         │
                        │ • Track history        │
                        └───────────┬────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                     Approved            Rejected
                          │                   │
                          ▼                   ▼
              ┌───────────────────┐  ┌─────────────────┐
              │  7. ARCHIVE       │  │  Return to      │
              │                   │  │  Campaign       │
              │ • View archived   │  │  (edit & resub) │
              │ • Search/filter   │  └─────────────────┘
              │ • Restore/delete  │
              └───────────────────┘
```

---

## Step-by-Step Scenarios

### Scenario 1: Creating a New Campaign (Happy Path)

**User Role:** Content Manager

1. **Media Library**
   - User clicks "Upload Media" button
   - Selects video/image files from local storage
   - System processes and generates thumbnails
   - User adds tags: "promotion", "Q1-2026", "retail"
   - User organizes into folder: "Spring Campaign 2026"

2. **Playlists**
   - User clicks "Create New Playlist"
   - Names playlist: "Spring Promo Loop"
   - Drags media from library into playlist
   - Sets order: Intro → Product Showcase → CTA
   - Configures duration: 30 seconds per loop

3. **Layouts**
   - User selects "Create Layout"
   - Chooses template: "Split Screen (70/30)"
   - Assigns playlist to main zone (70%)
   - Assigns dynamic weather feed to side zone (30%)
   - Previews on target display resolution (1920x1080)
   - Saves layout as "Spring Promo Layout v1"

4. **Feeds**
   - User clicks "Add Dynamic Feed"
   - Selects feed type: "Weather API"
   - Configures location: "Jakarta, ID"
   - Sets refresh interval: 15 minutes
   - Maps feed to right zone in layout
   - Tests live preview

5. **Campaign**
   - User clicks "Create Campaign"
   - Names campaign: "Spring Promotion 2026"
   - Selects layout: "Spring Promo Layout v1"
   - Sets schedule:
     - Start: 2026-03-15 00:00
     - End: 2026-04-15 23:59
     - Active hours: 08:00-22:00 daily
   - Targets displays: "Store-Front-01", "Store-Front-02"
   - Adds campaign description and notes
   - Clicks "Submit for Approval"

6. **Approval Workflow**
   - System notifies: "Campaign submitted for approval"
   - Approver receives notification
   - Approver reviews campaign details
   - Approver clicks "Approve"
   - System activates campaign per schedule
   - Campaign moves to "Active" status

7. **Archive** (Post-Campaign)
   - After 2026-04-15, campaign auto-archives
   - User can view in Archive section
   - User searches: "Spring 2026"
   - User can restore (reactivate) or permanently delete

---

### Scenario 2: Approval Rejection & Revision

**User Role:** Content Manager & Approver

1. **Submission**
   - Content Manager submits campaign as in Scenario 1

2. **Review**
   - Approver opens "Approval Request List"
   - Sees campaign: "Spring Promotion 2026"
   - Clicks to view details
   - Notices: Playlist duration exceeds policy (max 2 min, current 3 min)

3. **Rejection**
   - Approver clicks "Reject"
   - Adds comment: "Please reduce playlist duration to 2 minutes max per company policy"
   - Selects rejection reason: "Content Policy Violation"
   - Submits rejection

4. **Notification**
   - Content Manager receives notification: "Campaign rejected"
   - Opens rejection details with comment

5. **Revision**
   - Content Manager clicks "Edit Campaign"
   - Navigates to Playlists section
   - Reduces playlist duration to 90 seconds
   - Saves changes
   - Resubmits for approval

6. **Re-Approval**
   - Approver receives new submission
   - Reviews changes
   - Approves campaign
   - Campaign scheduled successfully

---

### Scenario 3: Restoring Archived Content

**User Role:** Content Manager

1. **Search Archive**
   - User navigates to Archive section
   - Uses search: "Holiday 2025"
   - Filters by date range: Dec 2025
   - Finds campaign: "Holiday Sale 2025"

2. **Review Archived Campaign**
   - User clicks campaign to view details
   - Reviews all components:
     - Media files (still available in library)
     - Playlist configuration
     - Layout design
     - Previous schedule
     - Performance metrics (if tracked)

3. **Restore Decision**
   - User decides to reuse for "Holiday Sale 2026"
   - Clicks "Restore Campaign"
   - System creates copy: "Holiday Sale 2026" (draft status)
   - Original archive remains unchanged

4. **Update & Resubmit**
   - User updates campaign dates: Dec 2026
   - Updates media (replaces outdated pricing)
   - Submits for approval workflow
   - Follows standard approval process

---

## User Interaction Points

### Media Library
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Upload | "Upload" button (top-right) | Opens file picker |
| Preview | Thumbnail click | Opens media preview modal |
| Organize | Drag & drop to folders | Moves media to folder |
| Tag | Tag input field | Adds metadata tags |
| Delete | Trash icon on media card | Moves to trash (soft delete) |
| Search | Search bar (top) | Filters media by name/tag |

### Playlists
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Create | "New Playlist" button | Opens playlist creation form |
| Add Media | "Add Media" button | Opens media library picker |
| Reorder | Drag handles on playlist items | Changes play order |
| Remove | "X" icon on item | Removes from playlist |
| Preview | "Preview" button | Plays playlist in modal |
| Duration | Duration input per item | Sets display time |

### Layouts
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Select Template | Template gallery grid | Chooses base layout |
| Customize | Canvas editor | Drag zones, resize |
| Assign Content | Zone dropdown | Selects playlist/feed for zone |
| Preview | "Preview" button | Shows full-screen mockup |
| Save | "Save Layout" button | Saves with name |

### Feeds
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Add Feed | "Add Feed" button | Opens feed type selector |
| Configure | Feed settings form | Sets URL, refresh, mapping |
| Test | "Test Feed" button | Shows live preview |
| Remove | "Remove" link | Deletes feed from layout |

### Campaign
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Create | "New Campaign" button | Opens campaign wizard |
| Schedule | Date/time pickers | Sets start/end/active hours |
| Target | Display selector (multi) | Chooses target screens |
| Submit | "Submit for Approval" | Sends to approval queue |
| Edit Draft | "Edit" button (draft only) | Allows modifications |

### Approval Workflow
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| View Queue | Approval list (dashboard) | Shows pending items |
| Review | Campaign card click | Opens detail view |
| Approve | Green "Approve" button | Activates campaign |
| Reject | Red "Reject" button | Opens rejection form |
| Comment | Comment textarea | Adds feedback |
| History | Timeline view | Shows approval trail |

### Archive
| Interaction | UI Element | Action |
|-------------|-----------|--------|
| Search | Search bar | Finds archived content |
| Filter | Filter dropdowns (date, type) | Narrows results |
| View | Archive item click | Shows archived details |
| Restore | "Restore" button | Creates active copy |
| Delete | "Delete Permanently" | Hard delete (with confirmation) |
| Export | "Export" button | Downloads campaign package |

---

## Edge Cases & Error States

### 1. Media Upload Failure
- **Trigger:** File too large, unsupported format, network error
- **UI:** Red error banner with specific message
- **Recovery:** "Retry Upload" button, format guidelines link

### 2. Approval Timeout
- **Trigger:** No approver action within 48 hours
- **UI:** Yellow warning badge on campaign
- **Recovery:** Auto-escalation notification to senior approver

### 3. Schedule Conflict
- **Trigger:** Overlapping campaign on same display
- **UI:** Conflict warning modal during scheduling
- **Recovery:** Shows conflicting campaigns, suggests alternatives

### 4. Feed Unavailable
- **Trigger:** External feed API down or timeout
- **UI:** Fallback content displayed, orange status indicator
- **Recovery:** Auto-retry, alert content manager

### 5. Insufficient Permissions
- **Trigger:** User tries to approve without rights
- **UI:** "Access Denied" message, contact admin link
- **Recovery:** Request permission workflow

---

## Flow Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Campaign Creation Time | < 10 minutes | Time from start to submission |
| Approval Turnaround | < 24 hours | Submission to decision |
| Rejection Rate | < 20% | Rejected / Total submissions |
| Archive Search Success | > 90% | Successful finds / Total searches |
| User Satisfaction | > 4.5/5 | Post-task survey score |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-09 | Muse | Initial flow design |

---

*End of User Flow Document*
