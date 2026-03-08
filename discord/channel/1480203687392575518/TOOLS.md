# TOOLS.md — Project Manager Agent

## Tool Registry

This document lists all tools available to Nova (Project Manager agent), their purpose, input/output contracts, and usage guidelines.

---

## 🗂️ Planning & Tracking Tools

### `create_task_card`
Creates a structured task card and routes it to the appropriate agent.

**Input:**
```json
{
  "title": "string",
  "description": "string",
  "assigned_to": "agent_id",
  "priority": "critical | high | medium | low",
  "story_points": "number (1-13)",
  "acceptance_criteria": ["string"],
  "dependencies": ["task_id"],
  "deadline": "YYYY-MM-DD"
}
```
**Output:** `task_id`, confirmation, agent notification

---

### `update_task_status`
Updates the status of an existing task.

**Input:**
```json
{
  "task_id": "string",
  "status": "todo | in_progress | review | blocked | done",
  "notes": "string (optional)"
}
```
**Output:** Updated task card, sprint board refresh

---

### `generate_sprint_report`
Produces a structured sprint summary report.

**Input:**
```json
{
  "sprint_id": "string",
  "include_metrics": true
}
```
**Output:** Markdown report with velocity, completed items, blockers, and next sprint recommendations

---

### `create_project_brief`
Generates a project initiation document from raw requirements.

**Input:**
```json
{
  "raw_requirements": "string",
  "stakeholder_name": "string",
  "deadline": "YYYY-MM-DD"
}
```
**Output:** Structured project brief with scope, objectives, milestones, risks

---

## 📡 Communication Tools

### `broadcast_to_team`
Sends a message or update to all agents simultaneously.

**Input:**
```json
{
  "message": "string",
  "type": "announcement | sprint_start | sprint_end | blocker_alert | priority_change"
}
```
**Output:** Delivery confirmation to all active agents

---

### `request_status_update`
Polls one or more agents for their current task status.

**Input:**
```json
{
  "agent_ids": ["string"],
  "context": "string (optional)"
}
```
**Output:** Aggregated status report from each agent

---

### `escalate_to_operator`
Escalates a blocker or critical decision to the human operator.

**Input:**
```json
{
  "issue_type": "blocker | scope_change | quality_failure | conflict",
  "description": "string",
  "impact": "string",
  "proposed_options": ["string"],
  "urgency": "low | medium | high | critical"
}
```
**Output:** Escalation ticket, operator notification

---

## 📊 Analysis Tools

### `risk_assessment`
Analyzes current project state and surfaces risk areas.

**Input:**
```json
{
  "sprint_data": "object",
  "blockers": ["string"],
  "deadline": "YYYY-MM-DD"
}
```
**Output:** Risk matrix (probability × impact), mitigation suggestions

---

### `estimate_velocity`
Calculates team velocity based on historical sprint data.

**Input:**
```json
{
  "past_sprints": ["sprint_object"],
  "current_capacity": "number (% availability)"
}
```
**Output:** Velocity estimate, sprint capacity recommendation

---

### `generate_roadmap`
Creates a high-level project roadmap from epics and milestones.

**Input:**
```json
{
  "epics": ["string"],
  "milestones": ["object"],
  "team_capacity": "number"
}
```
**Output:** Markdown roadmap table with timeline and ownership

---

## 🔧 Tool Usage Guidelines

1. **Always create task cards** before delegating to any agent — verbal/inline instructions are insufficient
2. **Use `broadcast_to_team`** for any change that affects more than one agent
3. **Never skip `risk_assessment`** at the start of a sprint when deadline is within 2 weeks
4. **Log all escalations** using `escalate_to_operator` — ad-hoc escalations without documentation are not permitted
5. **`generate_sprint_report`** must be run at the close of every sprint before starting the next one

---

## Tool Availability Matrix

| Tool | Sprint Planning | Daily Standup | Sprint Review | Ad-hoc |
|---|:---:|:---:|:---:|:---:|
| `create_task_card` | ✅ | ✅ | — | ✅ |
| `update_task_status` | — | ✅ | ✅ | ✅ |
| `generate_sprint_report` | — | — | ✅ | — |
| `broadcast_to_team` | ✅ | ✅ | ✅ | ✅ |
| `risk_assessment` | ✅ | — | ✅ | ✅ |
| `escalate_to_operator` | — | — | — | ✅ |