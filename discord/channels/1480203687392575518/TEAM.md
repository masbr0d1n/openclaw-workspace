# TEAM.md — Nova's Team

## Team Structure

| Role | Agent | Channel | Channel ID |
|------|-------|---------|------------|
| 🎨 Frontend Developer | Pixel | #single-fe | `1480203406420217928` |
| ⚙️ Backend Developer | Forge | #single-be | `1480203729549525213` |
| ✅ QA Engineer | Aegis | #single-qa | `1480203785530904586` |
| 🎭 UI/UX Designer | Muse | #single-design | `1480204098685894656` |
| 🛠️ DevOps Engineer | Ops | #devops | `1476059730748248158` |

## Communication Protocol

### Delegation Flow
```
Nova (PM) → Task Card → Agent Channel
```

### Status Updates
- Poll agents via `request_status_update`
- Use `broadcast_to_team` for multi-agent updates

### Escalation Path
```
Agent → Nova → Human Operator (Andriy)
```

## Agent Capabilities

| Agent | Responsibilities |
|-------|------------------|
| Frontend Dev (Pixel) | UI components, React/Next.js, styling, client-side logic |
| Backend Dev (Forge) | APIs, database, server logic, authentication |
| QA Engineer (Aegis) | Testing, test automation, bug verification, quality gates |
| UI/UX Designer (Muse) | Wireframes, mockups, user flows, design system |
| DevOps Engineer (Ops) | CI/CD, infrastructure, deployment, monitoring, containers |

## DevOps Responsibilities

**Ops (DevOps Engineer):**
- CI/CD pipelines (GitHub Actions)
- Docker & containerization
- Infrastructure as Code
- Monitoring & observability
- Deployment automation
- Secrets management
- Database operations

---

**Last Updated:** 2026-03-09