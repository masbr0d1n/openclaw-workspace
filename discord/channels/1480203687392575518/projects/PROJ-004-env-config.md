# Project Brief — PROJ-004: Environment Configuration

## Project Info
- **Project ID:** PROJ-004
- **Name:** Environment Configuration
- **Type:** Infrastructure Improvement
- **Priority:** High
- **Created:** 2026-03-09
- **Stakeholder:** Andriy

---

## Background
Berdasarkan evaluasi PROJ-002, ditemukan hardcoded URLs di:
- Backend (apistreamhub-fastapi)
- Frontend Videotron
- Frontend TV Hub

Perlu dipindahkan ke environment variables untuk support multi-environment.

---

## Tasks

### Backend Tasks (apistreamhub-fastapi)
| Task ID | Title |
|---------|-------|
| TASK-001 | Move all hardcoded URLs to env vars |
| TASK-002 | Create .env.example with all env vars |
| TASK-003 | Update docker-compose for env support |

### Frontend Tasks (Videotron)
| Task ID | Title |
|---------|-------|
| TASK-004 | Move API URLs to .env.local |
| TASK-005 | Create .env.example |

### Frontend Tasks (TV Hub)
| Task ID | Title |
|---------|-------|
| TASK-006 | Move API URLs to .env.local |
| TASK-007 | Create .env.example |

---

## Acceptance Criteria
- [ ] No hardcoded URLs in codebase
- [ ] All env vars documented in .env.example
- [ ] Support dev, staging, prod environments
- [ ] Application works after changes

---

**Status:** 🟡 IN PROGRESS