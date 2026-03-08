# TOOLS.md — QA Engineer Agent

## Tool Registry

All tools available to Aegis (QA Engineer agent), including test generation, execution, bug tracking, and reporting tools.

---

## 📋 Test Planning Tools

### `generate_test_plan`
Creates a structured test plan for a feature.

**Input:**
```json
{
 "feature_name": "string",
 "acceptance_criteria": ["string"],
 "api_endpoints": ["string"],
 "ui_flows": ["string"],
 "risk_level": "low | medium | high"
}
```
**Output:** Test plan markdown with strategy, scope, entry/exit criteria, and test case index

---

### `generate_test_cases`
Generates comprehensive test cases including edge cases.

**Input:**
```json
{
 "feature": "string",
 "test_types": ["happy_path", "negative", "boundary", "security", "performance"],
 "api_spec": "object (optional)",
 "user_flows": ["string"]
}
```
**Output:** Test case table with ID, description, steps, expected result, and priority

---

## 🔌 API Testing Tools

### `run_api_test_suite`
Executes API test suite against a running environment.

**Input:**
```json
{
 "base_url": "string",
 "test_file": "string",
 "environment": "local | staging | production",
 "auth_token": "string (optional)"
}
```
**Output:** Test results with pass/fail per case, response times, and error details

---

### `generate_api_test`
Generates pytest test file for a specific API endpoint.

**Input:**
```json
{
 "endpoint": "string",
 "method": "GET | POST | PUT | PATCH | DELETE",
 "request_schema": "object",
 "response_schema": "object",
 "auth_required": true
}
```
**Output:** pytest file with parametrized test cases covering all scenarios

---

### `validate_api_response`
Validates API response against Pydantic schema.

**Input:**
```json
{
 "response_body": "object",
 "expected_schema": "object",
 "strict_mode": true
}
```
**Output:** Validation report — passed fields, failed fields, type mismatches

---

## 🖥️ UI/E2E Testing Tools

### `generate_playwright_test`
Generates Playwright E2E test for a user flow.

**Input:**
```json
{
 "flow_name": "string",
 "steps": [{ "action": "navigate | click | fill | assert", "target": "string", "value": "string" }],
 "assertions": ["string"]
}
```
**Output:** Playwright TypeScript test file

---

### `run_e2e_suite`
Runs Playwright test suite and generates report.

```bash
npx playwright test --reporter=html
```
**Output:** HTML report with pass/fail, screenshots on failure, video recordings

---

### `run_accessibility_audit`
Runs axe-core accessibility audit on a page or component.

**Input:**
```json
{
 "url": "string",
 "wcag_level": "A | AA | AAA"
}
```
**Output:** Violation list with rule ID, severity, element selector, and fix guidance

---

## 📊 Reporting Tools

### `generate_bug_report`
Creates a standardized bug report.

**Input:**
```json
{
 "title": "string",
 "severity": "Critical | High | Medium | Low",
 "steps_to_reproduce": ["string"],
 "expected": "string",
 "actual": "string",
 "evidence": "string (URL or description)",
 "assigned_to": "agent_id"
}
```
**Output:** Formatted bug report with auto-generated BUG-ID, routed to responsible agent

---

### `generate_qa_report`
Produces a complete QA cycle summary report.

**Input:**
```json
{
 "sprint_id": "string",
 "features_tested": ["string"],
 "bugs_found": ["bug_id"]
}
```
**Output:** QA report with metrics: pass rate, defect density, critical bugs, sign-off status

---

### `issue_qa_signoff`
Issues formal QA approval for a feature.

**Input:**
```json
{
 "task_id": "string",
 "features_verified": ["string"],
 "open_bugs": ["bug_id"],
 "risk_accepted": "string (if any deferred bugs)",
 "approved": true
}
```
**Output:** Sign-off record sent to `pm-nova` + feature marked ready for deployment

---

## Tool Usage Guidelines

1. Always run `generate_test_plan` before executing any tests
2. `generate_bug_report` is mandatory for every failure — no informal bug mentions
3. `run_accessibility_audit` must be run on every new page before sign-off
4. `issue_qa_signoff` is blocked if any Critical or High bugs remain open
5. Run `run_e2e_suite` on the full regression set before any production release
6. `validate_api_response` must be run against every API contract change

---

## Local Test Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `check-db-permissions.sh` | Verify database table ownership | `/home/sysop/.openclaw/workspace/scripts/` |
| `fix-db-permissions.sh` | Fix database permission issues | `/home/sysop/.openclaw/workspace/scripts/` |
| `test-ffmpeg-v2.sh` | Test thumbnail generation | `/home/sysop/.openclaw/workspace/` |

---

## Test Environments

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| Local | `http://localhost:8000` | Development testing |
| Staging | TBD | Pre-production validation |
| Production | TBD | Post-deployment smoke tests |

---

**Channel:** #single-qa (1480203785530904586)  
**Agent:** Aegis (qa-aegis)  
**Last Updated:** 2026-03-08
