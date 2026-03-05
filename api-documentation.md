# API Documentation - Shared Backend (apistreamhub-fastapi)

**Purpose:** Shared API backend for TV Hub & Videotron products  
**Base URL:** `http://localhost:8000` (production: `http://localhost:8001`)  
**Documentation:** `/docs` (Swagger UI), `/redoc` (ReDoc)  

---

## ✅ SHARED APIs (Both Products)

### 1. Authentication API

**Base Path:** `/api/v1/auth`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/register` | POST | No | Register new user |
| `/auth/login` | POST | No | Login and get JWT tokens |
| `/auth/refresh` | POST | No | Refresh access token |
| `/auth/me` | GET | Yes | Get current user info |

#### Login Request/Response

**Request:**
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "string (username or email)",
  "password": "string"
}
```

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "bearer",
    "expires_in": 259200
  }
}
```

---

### 2. Videos API

**Base Path:** `/api/v1/videos`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/videos/` | GET | No | Get all videos |
| `/videos/{id}` | GET | No | Get video by ID |
| `/videos/upload` | POST | Yes | Upload video (multipart/form-data) |
| `/videos/{id}` | PUT | Yes | Update video metadata |
| `/videos/{id}` | DELETE | Yes | Delete video |
| `/videos/file/{path}` | GET | No | Stream video file |

#### Get Videos Response

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "youtube_id": "string|null",
      "channel_id": 1,
      "video_url": "/uploads/videos/xxx.mp4",
      "thumbnail_url": "string|null",
      "thumbnail_data": "base64|string|null",
      "duration": 120.5,
      "view_count": 0,
      "is_live": false,
      "is_active": true,
      "width": 1920,
      "height": 1080,
      "video_codec": "h264",
      "fps": 30.0,
      "category": "string",
      "tags": ["tag1", "tag2"],
      "expiry_date": "2026-12-31",
      "content_type": "video|image",
      "created_at": "2026-03-05T10:00:00",
      "updated_at": "2026-03-05T10:00:00"
    }
  ],
  "count": 3
}
```

---

### 3. Playlists API

**Base Path:** `/api/v1/playlists`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/playlists/` | GET | No | Get all playlists |
| `/api/v1/playlists/{id}` | GET | No | Get playlist by ID |
| `/api/v1/playlists/` | POST | Yes | Create new playlist |
| `/api/v1/playlists/{id}` | PUT | Yes | Update playlist |
| `/api/v1/playlists/{id}` | DELETE | Yes | Delete playlist |
| `/api/v1/playlists/{id}/items` | POST | Yes | Add item to playlist |

#### Get Playlists Response

**Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "string",
    "description": "string",
    "default_duration": 10.0,
    "transition": "fade|none|slide",
    "loop": true,
    "is_published": true,
    "items_count": 4,
    "total_duration": 213.0,
    "used_in": 0,
    "created_at": "2026-03-05T10:00:00",
    "updated_at": "2026-03-05T10:00:00"
  }
]
```

---

### 4. Users API

**Base Path:** `/api/v1/users`

**Note:** Requires admin or superadmin role for list operations.

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/users` | GET | Yes (Admin) | Get all users |
| `/users/{id}` | GET | Yes | Get user by ID |
| `/users/{id}` | PUT | Yes (Admin) | Update user |
| `/users/{id}` | DELETE | Yes (Admin) | Delete user |

#### Get Users Response

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "string",
      "email": "user@example.com",
      "full_name": "string",
      "role": "user|admin|superadmin",
      "is_active": true,
      "is_admin": false,
      "page_access": {},
      "created_at": "2026-03-05T10:00:00"
    }
  ]
}
```

---

### 5. Channels API (TV Hub Specific)

**Base Path:** `/api/v1/channels`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/channels` | GET | No | Get all channels |
| `/channels/{id}` | GET | No | Get channel by ID |
| `/channels` | POST | Yes | Create channel |
| `/channels/{id}` | PUT | Yes | Update channel |
| `/channels/{id}` | DELETE | Yes | Delete channel |

**Note:** This API is primarily used by TV Hub. Videotron may not need this endpoint.

---

### 6. Streaming API (TV Hub Specific)

**Base Path:** `/api/v1/streaming`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/streaming/start` | POST | Yes | Start streaming |
| `/streaming/stop` | POST | Yes | Stop streaming |
| `/streaming/status` | GET | Yes | Get streaming status |

**Note:** TV Hub specific feature for RTMP/UDP streaming relay.

---

### 7. Role Presets API (Shared)

**Base Path:** `/api/v1/role-presets`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/role-presets` | GET | Yes | Get all role presets |
| `/role-presets/{id}` | GET | Yes | Get preset by ID |

---

### 8. Screens API (Videotron)

**Base Path:** `/api/v1/screens`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/screens/` | GET | No | List all screens |
| `/screens/{id}` | GET | No | Get screen by ID |
| `/screens/` | POST | Yes | Create new screen |
| `/screens/{id}` | PUT | Yes | Update screen |
| `/screens/{id}` | DELETE | Yes | Delete screen |
| `/screens/{id}/heartbeat` | POST | Yes | Update screen heartbeat |
| `/screens/groups` | GET | No | List screen groups |
| `/screens/groups` | POST | Yes | Create screen group |

#### Create Screen Request

**Request:**
```json
POST /api/v1/screens
Content-Type: application/json

{
  "name": "Lobby TV",
  "device_id": "device-001",
  "location": "Main Lobby",
  "resolution": "1920x1080"
}
```

#### Create Screen Response

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "screen": {
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
}
```

#### Update Heartbeat Request

**Request:**
```json
POST /api/v1/screens/{id}/heartbeat
Content-Type: application/json

{
  "status": "online"
}
```

#### Update Heartbeat Response

**Response:**
```json
{
  "success": true,
  "last_heartbeat": "2026-03-05T10:00:00Z",
  "message": "Heartbeat updated successfully"
}
```

#### List Screens Response

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "screens": [...],
  "count": 2
}
```

#### Create Screen Group Request

**Request:**
```json
POST /api/v1/screens/groups
Content-Type: application/json

{
  "name": "Lobby Group",
  "screen_ids": ["uuid-1", "uuid-2"]
}
```

#### Create Screen Group Response

**Response:**
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Success",
  "group": {
    "id": "uuid-string",
    "name": "Lobby Group",
    "screen_ids": ["uuid-1", "uuid-2"],
    "created_at": "2026-03-05T10:00:00Z"
  }
}
```

---

## 🔐 Authentication

All authenticated endpoints require JWT Bearer token in Authorization header:

```
Authorization: Bearer <access_token>
```

Token expiration: 3 days (259200 seconds)  
Refresh token expiration: 30 days

---

## 🌐 CORS Configuration

**Current CORS Origins:**
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:9000",
    "http://localhost:3300",
    "http://192.168.200.60:3000",
    "https://streamhub.uzone.id",
    "https://api-streamhub.uzone.id"
]
```

**⚠️ REQUIRED UPDATE:** Add TV Hub & Videotron ports:
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",  # TV Hub
    "http://localhost:3002",  # Videotron
    "http://localhost:9000",
    "http://localhost:3300",
    "http://192.168.200.60:3000",
    "https://streamhub.uzone.id",
    "https://api-streamhub.uzone.id"
]
```

---

## 🗄️ Database Schema

**Tables:**
- `users` - User accounts and authentication
- `videos` - Video library and metadata
- `channels` - Channel management (TV Hub)
- `playlists` - Playlist definitions
- `playlist_items` - Playlist content items
- `playlist_videos` - Playlist-video relationships
- `role_presets` - Role-based access presets
- `screens` - Videotron screen/device management ✅ NEW
- `screen_groups` - Screen group definitions ✅ NEW
- `screen_group_items` - Screen-group relationships ✅ NEW

---

## ⚠️ Known Issues & Limitations

### 1. CORS Configuration
- **Issue:** Missing localhost:3001 and localhost:3002
- **Impact:** TV Hub and Videotron frontends may face CORS errors
- **Fix Required:** Update `app/config.py` CORS_ORIGINS list
- **Priority:** HIGH

### 2. Product-Specific Endpoints
- **Channels API:** TV Hub only, not needed for Videotron
- **Streaming API:** TV Hub only, not needed for Videotron
- **Screens API:** ✅ IMPLEMENTED (Videotron device management)
- **Layouts API:** Not yet implemented (needed for Videotron)
- **Campaigns API:** Not yet implemented (needed for Videotron)

### 3. API Response Format
- ✅ Consistent response format across all endpoints
- ✅ Standard structure: `{status, statusCode, message, data}`
- ✅ Compatible with both TV Hub and Videotron frontends

### 4. Authentication
- ✅ JWT-based authentication working
- ✅ Token refresh mechanism in place
- ✅ Role-based access control implemented

---

## 📝 Recommendations

1. **Update CORS configuration** to include ports 3001 and 3002
2. **Document product-specific endpoints** clearly (TV Hub vs Videotron)
3. **Implement missing Videotron APIs:**
   - `/api/layouts` - Layout storage
   - `/api/campaigns` - Campaign management
4. **Add API versioning** for future compatibility
5. **Implement rate limiting** for public endpoints

---

**Created:** 2026-03-05  
**Backend Version:** 0.1.0  
**Status:** ✅ Screens API Implemented
