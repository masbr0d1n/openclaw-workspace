# LESSON LEARNED - Missing Auth Routes

## Issue
Frontend login gagal dengan 404 karena tidak ada API routes untuk auth endpoints.

## Root Cause
Saat membuat perubahan environment configuration, auth API routes tidak dibuat untuk semua frontend.

## Solution
Buat auth API routes untuk setiap frontend:

```
src/app/api/v1/auth/
├── login/route.ts
├── logout/route.ts
├── register/route.ts
├── me/route.ts
└── refresh/route.ts
```

## Rule untuk Future Projects
**SELALU** buat auth API routes untuk setiap frontend baru:
- ✅ TV Hub (sudah ada)
- ✅ Videotron (baru ditambahkan)

## Checklist untuk New Frontend
- [ ] Auth routes (login, logout, register, me, refresh)
- [ ] Videos routes (CRUD, upload)
- [ ] Environment configuration
- [ ] API client with withCredentials

**Date:** 2026-03-09
**Project:** PROJ-007