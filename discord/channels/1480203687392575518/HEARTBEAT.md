# HEARTBEAT.md — Project Monitoring

## Monitoring Rules

**Interval:** Setiap 5 menit saat task belum 100% selesai

### What to Check

1. **Agent Status** — Poll each agent for progress:
   - UI/UX Designer (<#1480204098685894656>) — TASK-001
   - Frontend Dev (<#1480203406420217928>) — TASK-002
   - QA Engineer (<#1480203785530904586>) — TASK-003

2. **Blockers** — Check if any agent is blocked:
   - If blocked → Investigate and resolve autonomously
   - If need escalation → Notify stakeholder

3. **Progress** — Update task status in project file

### Status Check Command

```
sessions_list → Check active agents
process poll → Check specific agent status
```

### Notification Rules

- ✅ **Notify stakeholder ONLY when:**
  - Product is 100% complete
  - Critical blocker that needs stakeholder decision

- ❌ **DO NOT notify for:**
  - Minor updates
  - Work in progress
  - Routine status checks

### Heartbeat Response Format

**If tasks complete:**
```
✅ PRODUK TELAH SELESAI
- [List completed items]
- Ready for review/deploy
```

**If tasks in progress:**
```
HEARTBEAT_OK
(Internal: Continue monitoring, no stakeholder notification)
```

**If critical blocker:**
```
🚨 BLOCKER KRITIS
- Issue: [description]
- Need: [stakeholder decision]
```

---

## Current Project: PROJ-001

**Tasks:**
| Task | Agent | Status |
|------|-------|--------|
| TASK-001 | UI/UX Designer | IN_PROGRESS |
| TASK-002 | Frontend Dev | BLOCKED |
| TASK-003 | QA Engineer | PENDING |

**Heartbeat Active:** ✅
**Last Check:** 2026-03-08 22:40 GMT+7