# Discord Channels Agent Configuration Index

This directory contains channel-specific agent configurations. Each channel has its own isolated identity, tools, and behavioral directives.

---

## Active Channels

| Channel ID | Channel Name | Agent Name | Agent Type | Config Location | Status |
|------------|--------------|------------|------------|-----------------|--------|
| `1480203406420217928` | #single-fe | **Pixel** | Frontend Developer | [`./1480203406420217928/`](./1480203406420217928/) | ✅ Active |
| `1476052074415394938` | #frontend | - | - | [`./1476052074415394938/`](./1476052074415394938/) | ⚠️ Partial |
| `1475392569193140264` | #backend | - | - | - | ⏳ Not Configured |
| `1479087649804521524` | #qa-testing | - | - | - | ⏳ Not Configured |
| `1478868518958137415` | #ba-coordinator | - | - | - | ⏳ Not Configured |
| `software-architect` | #software-architect | - | - | [`./software-architect/`](./software-architect/) | ⚠️ Partial |
| `1475383980353126402` | #single-pm | - | - | - | ⏳ Not Configured |

---

## Configuration Structure

Each channel directory should contain:

```
<channel-id>/
├── IDENTITY.md    # Who the agent is (name, role, tech stack)
├── SOUL.md        # Core beliefs, philosophy, working principles
├── AGENTS.md      # Behavioral directives, code standards, protocols
└── TOOLS.md       # Available tools and usage guidelines
```

### File Descriptions

| File | Purpose | Required |
|------|---------|----------|
| `IDENTITY.md` | Agent identity, role definition, tech stack | ✅ Yes |
| `SOUL.md` | Core beliefs, working philosophy, motto | ✅ Yes |
| `AGENTS.md` | Behavioral directives, quality standards, I/O format | ✅ Yes |
| `TOOLS.md` | Tool registry, usage guidelines | ⚠️ Optional |

---

## Agent Types

| Type | Description | Example |
|------|-------------|---------|
| **Frontend Developer** | Client-side implementation (React, Next.js, TypeScript) | Pixel |
| **Backend Developer** | Server-side APIs, databases, microservices | Forge |
| **UI/UX Designer** | Design systems, wireframes, user research | - |
| **QA Engineer** | Testing, automation, quality assurance | - |
| **Project Manager** | Task coordination, sprint planning, communication | Nova |
| **Business Analyst** | Requirements gathering, user stories | - |
| **Software Architect** | System design, tech decisions, architecture | - |

---

## How to Add New Channel Configuration

1. **Create directory:**
   ```bash
   mkdir -p discord/channels/<channel-id>
   ```

2. **Copy template:**
   ```bash
   cp discord/channels/1480203406420217928/*.md discord/channels/<channel-id>/
   ```

3. **Customize for agent type:**
   - Edit `IDENTITY.md` with agent name, role, tech stack
   - Edit `SOUL.md` with agent-specific beliefs
   - Edit `AGENTS.md` with behavioral directives
   - Edit `TOOLS.md` with relevant tools

4. **Update this index:**
   - Add row to "Active Channels" table
   - Mark status as ✅ Active

5. **Commit:**
   ```bash
   bash /home/sysop/.openclaw/workspace/commit-workspace.sh
   ```

---

## Validation

To validate channel configuration:

```bash
# Validate specific channel
./scripts/validate-agent-config.sh 1480203406420217928

# Validate all channels
./scripts/validate-agent-config.sh --all
```

---

## Global vs Channel-Specific

| Scope | Location | Use Case |
|-------|----------|----------|
| **Global Memory** | `MEMORY.md` | Cross-channel context, user info, system-wide settings |
| **Channel-Specific** | `discord/channels/<id>/` | Agent identity, role-specific behavior, specialized tools |

**Rule:** If it's about **who the agent is** → channel folder. If it's about **what happened** → MEMORY.md.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-08 | Initial index created with Pixel (#single-fe) configuration |

---

## See Also

- [Main MEMORY.md](../MEMORY.md) — Global long-term memory
- [Agent Skills](~/.npm-global/lib/node_modules/openclaw/skills/) — OpenClaw built-in skills
