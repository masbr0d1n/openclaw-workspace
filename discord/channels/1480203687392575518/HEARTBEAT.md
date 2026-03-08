# HEARTBEAT.md — Project Monitoring

## Monitoring Rules

**Interval:** Setiap 5 menit saat ada task belum 100% selesai

### Current Status Check

**Project:** PROJ-001 Streaming Portal Landing Page

| Task ID | Agent | Status | Runtime | Last Update |
|---------|-------|--------|---------|-------------|
| TASK-001 | UI/UX Designer | ✅ DONE | 2m | 22:43 |
| TASK-002 | Frontend Dev | ✅ DONE | 3m | 22:47 |
| TASK-003 | QA Engineer | 🟡 RUNNING | 19m | 22:50 |

**Total Unfinished Tasks: 1**

### Monitoring Checklist

**Setiap 5 menit, cek:**

1. **Subagent Status**
   ```
   subagents action=list
   ```

2. **Jika task running > 15 menit:**
   - ⚠️ Potential blocker
   - Consider: steer agent atau spawn new agent

3. **Jika task failed:**
   - Investigate root cause
   - Iterate sampai tersolusikan

### Notification Rules

- ✅ **Notify stakeholder ONLY when:**
  - **Produk 100% selesai** — Semua task DONE
  - **Blocker kritis** — Butuh keputusan stakeholder

- ❌ **DO NOT notify for:**
  - Work in progress
  - Routine status checks
  - Minor issues (solve autonomously)

### Heartbeat Response Format

**If ALL tasks complete:**
```
✅ PRODUK TELAH SELESAI
- TASK-001: ✅ Design
- TASK-002: ✅ Frontend
- TASK-003: ✅ QA

Ready for review: [location]
```

**If tasks still in progress:**
```
HEARTBEAT_OK

[Internal: Continue monitoring, check again in 5 minutes]
```

**If blocker detected:**
```
🚨 BLOCKER KRITIS
- Task: [task_id]
- Issue: [description]
- Runtime: [X minutes]
- Action needed: [decision]
```

---

## Project Location

**Landing Page:** `/home/sysop/.openclaw/workspace/streaming-portal/landing-page/`

**To Run:**
```bash
cd /home/sysop/.openclaw/workspace/streaming-portal/landing-page
npm run dev
```

---

**Last Updated:** 2026-03-08 23:06 GMT+7
**Heartbeat Active:** ✅