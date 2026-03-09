# Project Brief — PROJ-005: Code Quality Improvement

## Project Info
- **Project ID:** PROJ-005
- **Name:** Code Quality Improvement
- **Type:** Quality Assurance
- **Priority:** Medium
- **Created:** 2026-03-09
- **Stakeholder:** Andriy

---

## Background
Berdasarkan evaluasi PROJ-002, ditemukan:
- Backend: Tests perlu ditambah (ada 32 tests, bisa ditingkatkan)
- Frontend: Tidak ada unit tests
- LayoutBuilder component terlalu besar (>700 lines)
- No ESLint strict mode

---

## Tasks

### Backend Tasks (apistreamhub-fastapi)
| Task ID | Title |
|---------|-------|
| TASK-001 | Add missing unit tests |
| TASK-002 | Improve test coverage |

### Frontend Tasks (Videotron)
| Task ID | Title |
|---------|-------|
| TASK-003 | Setup Vitest for unit testing |
| TASK-004 | Add component tests |
| TASK-005 | Break down LayoutBuilder component |

### Frontend Tasks (TV Hub)
| Task ID | Title |
|---------|-------|
| TASK-006 | Setup Vitest for unit testing |
| TASK-007 | Add component tests |

---

## Acceptance Criteria
- [ ] Backend test coverage > 80%
- [ ] Frontend has Vitest setup
- [ ] Basic component tests exist
- [ ] LayoutBuilder modularized (if applicable)

---

**Status:** 🟡 IN PROGRESS