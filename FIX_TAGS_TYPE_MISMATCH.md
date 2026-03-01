# ✅ Fix: Tags Type Mismatch Error

## Problem

**Error:**
```
column "tags" is of type text[] but expression is of type json
HINT: You will need to rewrite or cast the expression.
```

**Root Cause:**
- Database column `tags` is `TEXT[]` (PostgreSQL array)
- SQLAlchemy model used `JSON` type
- SQLAlchemy sends data as JSON, not as array
- PostgreSQL rejects JSON for TEXT[] column

## Solution

Changed SQLAlchemy model from `JSON` to `ARRAY(String)`:

**Before:**
```python
from sqlalchemy import JSON

tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
```

**After:**
```python
from sqlalchemy import ARRAY

tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
```

## Why This Works

- `ARRAY(String)` tells SQLAlchemy this is a PostgreSQL array type
- Python list `["tag1", "tag2"]` is automatically converted to PostgreSQL array `{"tag1","tag2"}`
- Matches the database column type `TEXT[]`

## Verification

After fix, upload with tags should work:

**Request:**
```
tags: '["test", "image"]'
```

**Database storage:**
```sql
INSERT INTO videos (tags, ...) VALUES ($19::TEXT[], ...)
-- $19 = {"test","image"}  (PostgreSQL array, not JSON)
```

## Files Changed

- `app/models/video.py` - Changed `tags` from `JSON` to `ARRAY(String)`

## Deployment

- Rebuilt backend: `apistreamhub-api:tags-fix`
- Deployed to port 8001
- Ready for testing

---

**Tags upload should now work!** ✅
