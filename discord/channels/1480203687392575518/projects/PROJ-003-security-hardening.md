# Project Brief — PROJ-003: Security Hardening

## Project Info
- **Project ID:** PROJ-003
- **Name:** Security Hardening (Backend + Frontend)
- **Type:** Security Improvement
- **Priority:** High
- **Created:** 2026-03-09
- **Stakeholder:** Andriy

---

## Background
Berdasarkan evaluasi PROJ-002, ditemukan security issues yang perlu diatasi:

1. JWT secret hardcoded di backend
2. Token disimpan di localStorage (XSS vulnerable)
3. Tidak ada rate limiting

---

## Tasks

### Backend Tasks (apistreamhub-fastapi)

| Task ID | Title | Priority |
|---------|-------|----------|
| TASK-001 | Ganti JWT secret dengan environment variable | High |
| TASK-002 | Add rate limiting ke API endpoints | High |

### Frontend Tasks (streamhub-videotron & streamhub-tvhub)

| Task ID | Title | Priority |
|---------|-------|----------|
| TASK-003 | Implement httpOnly cookies untuk tokens (Videotron) | High |
| TASK-004 | Implement httpOnly cookies untuk tokens (TV Hub) | High |

---

## Acceptance Criteria
- [ ] JWT secret dibaca dari environment variable
- [ ] Rate limiting aktif di semua endpoints
- [ ] Token tidak lagi disimpan di localStorage
- [ ] httpOnly cookies implemented
- [ ] Login flow masih berfungsi
- [ ] Semua tests pass

---

**Status:** 🟡 IN PROGRESS