# Screens API Implementation Report - TASK-B2.1

## Summary
- **Status:** ✅ COMPLETE
- **Endpoints:** 8
- **Tables:** 3 (screens, screen_groups, screen_group_items)
- **Implementation Date:** 2026-03-05
- **Time Taken:** ~30 minutes
- **Backend Location:** `/home/sysop/.openclaw/workspace/apistreamhub-fastapi`

---

## API Endpoints

### 1. GET /api/v1/screens
- **Description:** List all screens with optional filtering and pagination
- **Query Parameters:**
  - `skip` (int, default: 0): Number of records to skip
  - `limit` (int, default: 100): Maximum number of records to return
  - `status` (enum, optional): Filter by status (online/offline/maintenance)
  - `search` (string, optional): Search by name or device_id
- **Response:** `{ screens: [...], count: number }`

**Example:**
```bash
curl http://localhost:8000/api/v1/screens/
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "screens": [
    {
      "id": "uuid-string",
      "device_id": "device-001",
      "name": "Lobby TV",
      "location": "Main Lobby",
      "resolution": "1920x1080",
      "status": "offline",
      "last_heartbeat": null,
      "api_key": "screen_xxx",
      "created_at": "2026-03-05T10:00:00Z",
      "updated_at": "2026-03-05T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 2. GET /api/v1/screens/:id
- **Description:** Get detailed information about a specific screen
- **Path Parameters:**
  - `id` (UUID): Screen UUID
- **Response:** `{ screen: {...} }`

**Example:**
```bash
curl http://localhost:8000/api/v1/screens/<uuid>
```

---

### 3. POST /api/v1/screens
- **Description:** Create a new screen device
- **Request Body:**
  ```json
  {
    "name": "Lobby TV",
    "device_id": "device-001",
    "location": "Main Lobby",
    "resolution": "1920x1080"
  }
  ```
- **Response:** `{ screen: {...} }`
- **Status Code:** 201 Created

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/screens/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Lobby TV","device_id":"device-001","location":"Main Lobby","resolution":"1920x1080"}'
```

---

### 4. PUT /api/v1/screens/:id
- **Description:** Update screen information
- **Path Parameters:**
  - `id` (UUID): Screen UUID
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "location": "New Location",
    "resolution": "3840x2160",
    "status": "online"
  }
  ```
- **Response:** `{ screen: {...} }`

**Example:**
```bash
curl -X PUT http://localhost:8000/api/v1/screens/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","location":"New Location"}'
```

---

### 5. DELETE /api/v1/screens/:id
- **Description:** Delete a screen device
- **Path Parameters:**
  - `id` (UUID): Screen UUID
- **Response:** `{ success: true, message: "Screen deleted successfully" }`

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/screens/<uuid>
```

---

### 6. POST /api/v1/screens/:id/heartbeat
- **Description:** Update screen heartbeat and status
- **Path Parameters:**
  - `id` (UUID): Screen UUID
- **Request Body:**
  ```json
  {
    "status": "online"
  }
  ```
- **Response:** `{ success: true, last_heartbeat: timestamp, message: "..." }`

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/screens/<uuid>/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'
```

---

### 7. GET /api/v1/screens/groups
- **Description:** List all screen groups
- **Query Parameters:**
  - `skip` (int, default: 0): Number of records to skip
  - `limit` (int, default: 100): Maximum number of records to return
- **Response:** `{ groups: [...], count: number }`

**Example:**
```bash
curl http://localhost:8000/api/v1/screens/groups
```

---

### 8. POST /api/v1/screens/groups
- **Description:** Create a new screen group
- **Request Body:**
  ```json
  {
    "name": "Lobby Group",
    "screen_ids": ["uuid-1", "uuid-2"]
  }
  ```
- **Response:** `{ group: {...} }`
- **Status Code:** 201 Created

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/screens/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Lobby Group","screen_ids":["uuid-1","uuid-2"]}'
```

---

## Database Schema

### Table: screens
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| device_id | VARCHAR(255) | UNIQUE, NOT NULL | Device identifier |
| name | VARCHAR(500) | NOT NULL | Screen name |
| location | VARCHAR(500) | NULL | Physical location |
| resolution | VARCHAR(50) | NULL | Screen resolution |
| status | VARCHAR(20) | DEFAULT 'offline', CHECK constraint | online/offline/maintenance |
| last_heartbeat | TIMESTAMP WITH TIME ZONE | NULL | Last heartbeat timestamp |
| api_key | VARCHAR(255) | UNIQUE | API key for device auth |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_screens_device_id` - Fast device_id lookups
- `idx_screens_status` - Fast status filtering
- `screens_api_key_key` - Unique constraint on api_key
- `screens_device_id_key` - Unique constraint on device_id

---

### Table: screen_groups
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(500) | NOT NULL | Group name |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

---

### Table: screen_group_items
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| group_id | UUID | FOREIGN KEY → screen_groups(id), ON DELETE CASCADE | Group reference |
| screen_id | UUID | FOREIGN KEY → screens(id), ON DELETE CASCADE | Screen reference |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_screen_group_items_group_id` - Fast group lookups
- `idx_screen_group_items_screen_id` - Fast screen lookups
- UNIQUE constraint on (group_id, screen_id)

---

## Files Created/Modified

### New Files
1. `/app/models/screen.py` - SQLAlchemy Screen model
2. `/app/models/screen_group.py` - SQLAlchemy ScreenGroup and ScreenGroupItem models
3. `/app/schemas/screen.py` - Pydantic schemas for request/response validation
4. `/app/services/screen_service.py` - Business logic layer
5. `/app/api/v1/screens.py` - API router with 8 endpoints
6. `/migrations/003_create_screens.sql` - Database migration script

### Modified Files
1. `/app/models/__init__.py` - Added screen model imports
2. `/app/api/v1/__init__.py` - Added screens router import
3. `/app/main.py` - Included screens router
4. `/app/config.py` - CORS already configured for ports 3001 & 3002
5. `/app/services/ffmpeg_service.py` - Fixed hardcoded path issue
6. `/app/api/v1/videos.py` - Fixed hardcoded path issue
7. `/api-documentation.md` - Added Screens API documentation
8. `/separation-progress.md` - Updated task status

---

## Testing Results

All endpoints tested and verified:

- [x] **Create screen** - POST /api/v1/screens ✅
- [x] **List screens** - GET /api/v1/screens ✅
- [x] **Get screen detail** - GET /api/v1/screens/:id ✅
- [x] **Update screen** - PUT /api/v1/screens/:id ✅
- [x] **Delete screen** - DELETE /api/v1/screens/:id ✅
- [x] **Heartbeat** - POST /api/v1/screens/:id/heartbeat ✅
- [x] **Create screen group** - POST /api/v1/screens/groups ✅
- [x] **List screen groups** - GET /api/v1/screens/groups ✅

### Test Commands Used

```bash
# Create screen
curl -X POST http://localhost:8000/api/v1/screens/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Lobby TV","device_id":"device-001","location":"Main Lobby","resolution":"1920x1080"}'

# List screens
curl http://localhost:8000/api/v1/screens/

# Get screen detail
curl http://localhost:8000/api/v1/screens/<uuid>

# Update screen
curl -X PUT http://localhost:8000/api/v1/screens/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Heartbeat
curl -X POST http://localhost:8000/api/v1/screens/<uuid>/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'

# Create screen group
curl -X POST http://localhost:8000/api/v1/screens/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Lobby Group","screen_ids":["uuid-1","uuid-2"]}'

# List screen groups
curl http://localhost:8000/api/v1/screens/groups

# Delete screen
curl -X DELETE http://localhost:8000/api/v1/screens/<uuid>
```

---

## Implementation Notes

### Challenges Encountered
1. **UUID Type Mismatch:** Initial implementation used String for UUID, but PostgreSQL requires proper UUID type. Fixed by using `PG_UUID(as_uuid=True)` in SQLAlchemy models.
2. **Route Ordering:** FastAPI matched `/groups` as a screen_id parameter. Fixed by defining `/groups` routes before `/{screen_id}` routes.
3. **Hardcoded Paths:** Existing code had hardcoded `/app/uploads` paths. Fixed by using relative paths based on current working directory.
4. **Database Port:** .env.dev had wrong database port (5433 instead of 5434). Fixed.

### Design Decisions
1. **UUID for IDs:** Used PostgreSQL UUID type for all primary keys for better performance and standardization.
2. **API Key Generation:** Auto-generated unique API keys for each screen for future device authentication.
3. **Status Enum:** Used PostgreSQL CHECK constraint for status values (online/offline/maintenance).
4. **Cascade Deletes:** Screen group items are automatically deleted when parent group or screen is deleted.
5. **Response Format:** Consistent with existing API format: `{status, statusCode, message, data/screens/group}`.

---

## Next Steps

### Immediate
- [ ] Frontend integration (TASK-B6) - Connect Videotron frontend to new Screens API
- [ ] Implement authentication for protected endpoints (currently all endpoints are open)

### Pending Videotron APIs
- [ ] **TASK-B2.2:** Layouts API - Layout storage and management
- [ ] **TASK-B2.3:** Campaigns API - Campaign management
- [ ] **TASK-B2.4:** Screen Groups API - Already implemented as part of Screens API ✅
- [ ] **TASK-B2.5:** Templates API - Template management

### Phase 4: Testing & Deploy
- [ ] **TASK-T1:** Deploy TV Hub (port 3001)
- [ ] **TASK-T2:** Deploy Videotron (port 3002)
- [ ] **TASK-T3:** Final verification
- [ ] **TASK-T4:** Production release

---

## Swagger Documentation

The API is fully documented in Swagger UI:
- **URL:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

All endpoints include:
- Summary and description
- Request/response schemas
- Example values
- Status codes

---

**Implementation Complete:** 2026-03-05 12:00 WIB  
**Backend Version:** 0.1.0  
**Status:** ✅ READY FOR FRONTEND INTEGRATION
