# Layouts API Implementation Report - TASK-B2.2

## Summary
- **Status:** ✅ COMPLETE
- **Endpoints:** 6
- **Tables:** 1 (layouts)
- **Implementation Date:** 2026-03-05
- **Time Taken:** ~1 hour
- **Backend Location:** `/home/sysop/.openclaw/workspace/apistreamhub-fastapi`

---

## API Endpoints

### 1. GET /api/v1/layouts
- **Description:** List all layouts with optional filtering and pagination
- **Query Parameters:**
  - `skip` (int, default: 0): Number of records to skip
  - `limit` (int, default: 100): Maximum number of records to return
  - `created_by` (int, optional): Filter by creator user ID
- **Response:** `{ layouts: [...], count: number }`

**Example:**
```bash
curl http://localhost:8001/api/v1/layouts/
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "layouts": [
    {
      "id": "uuid-string",
      "name": "Main Screen Layout",
      "canvas_config": {
        "width": 1920,
        "height": 1080,
        "orientation": "landscape"
      },
      "layers": [
        {
          "type": "video",
          "position": {"x": 0, "y": 0},
          "size": {"width": 1920, "height": 1080}
        }
      ],
      "created_by": 1,
      "created_at": "2026-03-05T05:19:13.172081Z",
      "updated_at": "2026-03-05T05:19:13.172081Z"
    }
  ],
  "count": 1
}
```

---

### 2. GET /api/v1/layouts/:id
- **Description:** Get detailed information about a specific layout
- **Path Parameters:**
  - `id` (UUID): Layout UUID
- **Response:** `{ layout: {...} }`

**Example:**
```bash
curl http://localhost:8001/api/v1/layouts/<uuid>
```

---

### 3. POST /api/v1/layouts
- **Description:** Create a new layout
- **Request Body:**
  ```json
  {
    "name": "Main Screen Layout",
    "canvas_config": {
      "width": 1920,
      "height": 1080
    },
    "layers": [
      {
        "type": "video",
        "position": {"x": 0, "y": 0},
        "size": {"width": 1920, "height": 1080}
      }
    ]
  }
  ```
- **Response:** `{ layout: {...} }`
- **Status Code:** 200 Success

**Example:**
```bash
curl -X POST http://localhost:8001/api/v1/layouts/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Layout","canvas_config":{"width":1920,"height":1080},"layers":[{"type":"video","position":{"x":0,"y":0},"size":{"width":1920,"height":1080}}]}'
```

---

### 4. PUT /api/v1/layouts/:id
- **Description:** Update layout information
- **Path Parameters:**
  - `id` (UUID): Layout UUID
- **Request Body:**
  ```json
  {
    "name": "Updated Layout Name",
    "canvas_config": {
      "width": 3840,
      "height": 2160
    },
    "layers": [...]
  }
  ```
- **Response:** `{ layout: {...} }`

**Example:**
```bash
curl -X PUT http://localhost:8001/api/v1/layouts/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Layout","canvas_config":{"width":3840,"height":2160}}'
```

---

### 5. DELETE /api/v1/layouts/:id
- **Description:** Delete a layout
- **Path Parameters:**
  - `id` (UUID): Layout UUID
- **Response:** `{ success: true, message: "Layout deleted successfully" }`

**Example:**
```bash
curl -X DELETE http://localhost:8001/api/v1/layouts/<uuid>
```

---

### 6. POST /api/v1/layouts/:id/duplicate
- **Description:** Duplicate an existing layout
- **Path Parameters:**
  - `id` (UUID): Layout UUID to duplicate
- **Request Body:**
  ```json
  {
    "name": "Layout Copy"  // Optional, defaults to "<original_name> (Copy)"
  }
  ```
- **Response:** `{ layout: {...} }`
- **Status Code:** 201 Created

**Example:**
```bash
curl -X POST http://localhost:8001/api/v1/layouts/<uuid>/duplicate \
  -H "Content-Type: application/json" \
  -d '{"name":"Duplicated Layout"}'
```

---

## Database Schema

### Table: layouts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(500) | NOT NULL | Layout name |
| canvas_config | JSONB | NULL | Canvas configuration (width, height, orientation) |
| layers | JSONB | NULL | Array of layer objects |
| created_by | INTEGER | FOREIGN KEY → users(id) ON DELETE SET NULL | Creator user ID |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `layouts_pkey` - Primary key on id
- `idx_layouts_name` - Fast name lookups
- `idx_layouts_created_by` - Fast filtering by creator

---

## Files Created/Modified

### New Files
1. `/app/models/layout.py` - SQLAlchemy Layout model
2. `/app/schemas/layout.py` - Pydantic schemas for request/response validation
3. `/app/services/layout_service.py` - Business logic layer
4. `/app/api/v1/layouts.py` - API router with 6 endpoints
5. `/migrations/004_create_layouts.sql` - Database migration script

### Modified Files
1. `/app/models/__init__.py` - Added layout model import
2. `/app/api/v1/__init__.py` - Added layouts router import
3. `/app/main.py` - Included layouts router
4. `/api-documentation.md` - Added Layouts API documentation
5. `/separation-progress.md` - Updated task status (this file)

---

## Testing Results

All endpoints tested and verified:

- [x] **List layouts** - GET /api/v1/layouts/ ✅
- [x] **Create layout** - POST /api/v1/layouts/ ✅
- [x] **Get layout detail** - GET /api/v1/layouts/:id ✅
- [x] **Update layout** - PUT /api/v1/layouts/:id ✅
- [x] **Delete layout** - DELETE /api/v1/layouts/:id ✅
- [x] **Duplicate layout** - POST /api/v1/layouts/:id/duplicate ✅

### Test Commands Used

```bash
# List layouts
curl http://localhost:8001/api/v1/layouts/

# Create layout
curl -X POST http://localhost:8001/api/v1/layouts/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Layout","canvas_config":{"width":1920,"height":1080},"layers":[{"type":"video","position":{"x":0,"y":0},"size":{"width":1920,"height":1080}}]}'

# Get layout detail
curl http://localhost:8001/api/v1/layouts/<uuid>

# Update layout
curl -X PUT http://localhost:8001/api/v1/layouts/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Layout","canvas_config":{"width":3840,"height":2160}}'

# Duplicate layout
curl -X POST http://localhost:8001/api/v1/layouts/<uuid>/duplicate \
  -H "Content-Type: application/json" \
  -d '{"name":"Duplicated Layout"}'

# Delete layout
curl -X DELETE http://localhost:8001/api/v1/layouts/<uuid>
```

### Test Results

**Create Layout Test:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "layout": {
    "id": "346cc6fd-0203-452e-8d0a-feaf7a34c5d9",
    "name": "Test Layout",
    "canvas_config": {"width": 1920, "height": 1080},
    "layers": [{"type": "video", "position": {"x": 0, "y": 0}, "size": {"width": 1920, "height": 1080}}],
    "created_by": null,
    "created_at": "2026-03-05T05:19:13.172081Z",
    "updated_at": "2026-03-05T05:19:13.172081Z"
  }
}
```

**Duplicate Layout Test:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "layout": {
    "id": "7ccabbef-d94a-4367-b84b-057be7153794",
    "name": "Duplicated Layout",
    "canvas_config": {"width": 3840, "height": 2160},
    "layers": [{"type": "video", "position": {"x": 0, "y": 0}, "size": {"width": 1920, "height": 1080}}],
    "created_by": null,
    "created_at": "2026-03-05T05:19:28.550595Z",
    "updated_at": "2026-03-05T05:19:28.550595Z"
  }
}
```

**Delete Layout Test:**
```json
{
  "success": true,
  "message": "Layout deleted successfully"
}
```

---

## Implementation Notes

### Design Decisions
1. **UUID for IDs:** Used PostgreSQL UUID type for layout primary keys for consistency with other Videotron APIs.
2. **JSONB for Config:** Used JSONB for canvas_config and layers to allow flexible schema evolution.
3. **Optional created_by:** Made created_by nullable to allow layouts without user association (future enhancement).
4. **Deep Copy on Duplicate:** The duplicate endpoint performs a deep copy of canvas_config and layers to avoid reference issues.
5. **Response Format:** Consistent with existing API format: `{status, statusCode, message, layout/layouts}`.

### Challenges Encountered
1. **Docker Container Updates:** Had to rebuild Docker image to include new code files.
2. **Circular Imports:** Fixed by carefully managing imports in `api/v1/__init__.py`.

---

## Swagger Documentation

The API is fully documented in Swagger UI:
- **URL:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

All endpoints include:
- Summary and description
- Request/response schemas
- Example values
- Status codes

---

## Next Steps

### Immediate
- [ ] Frontend integration (TASK-B7) - Connect Videotron composer to new Layouts API
- [ ] Add authentication/authorization to protect layout endpoints

### Pending Videotron APIs
- [x] **TASK-B2.1:** Screens API ✅ COMPLETE
- [x] **TASK-B2.2:** Layouts API ✅ COMPLETE
- [ ] **TASK-B2.3:** Campaigns API - Campaign management
- [x] **TASK-B2.4:** Screen Groups API ✅ COMPLETE (part of Screens API)
- [ ] **TASK-B2.5:** Templates API - Template management

### Phase 4: Testing & Deploy
- [ ] **TASK-T1:** Deploy TV Hub (port 3001)
- [ ] **TASK-T2:** Deploy Videotron (port 3002)
- [ ] **TASK-T3:** Final verification
- [ ] **TASK-T4:** Production release

---

**Implementation Complete:** 2026-03-05 12:20 WIB  
**Backend Version:** 0.1.0  
**Status:** ✅ READY FOR FRONTEND INTEGRATION
