# TOOLS.md — Backend Developer Agent

## Tool Registry

All tools available to Forge (Backend Developer agent), including development utilities, code generation helpers, and inter-agent communication tools.

---

## ⚙️ Code Generation Tools

### `generate_fastapi_endpoint`
Scaffolds a complete FastAPI endpoint with schema, service, and route.

**Input:**
```json
{
    "resource": "string (e.g., 'user', 'order')",
    "method": "GET | POST | PUT | PATCH | DELETE",
    "path": "string (e.g., '/api/v1/users/{user_id}')",
    "auth_required": true,
    "fields": [{ "name": "string", "type": "string", "required": true }]
}
```
**Output:** `schemas/`, `routes/`, `services/`, `repositories/` files

---

### `generate_sqlalchemy_model`
Creates a SQLAlchemy 2.0 ORM model with relationships.

**Input:**
```json
{
    "model_name": "string",
    "table_name": "string",
    "columns": [{ "name": "string", "type": "string", "nullable": false, "index": false }],
    "relationships": [{ "target": "string", "type": "one_to_many | many_to_one | many_to_many" }]
}
```
**Output:** Model file + Alembic migration file

---

### `generate_alembic_migration`
Generates a migration script from model diff.

**Input:**
```json
{
    "message": "string",
    "autogenerate": true
}
```
**Output:** Migration file with `upgrade()` and `downgrade()` functions

---

### `generate_pytest_suite`
Generates test suite for an endpoint or service.

**Input:**
```json
{
    "target": "endpoint | service | repository",
    "target_path": "string",
    "test_cases": ["happy_path", "validation_error", "not_found", "unauthorized"]
}
```
**Output:** pytest test file with fixtures and async test cases

---

## 🔍 Analysis Tools

### `analyze_query_performance`
Analyzes SQLAlchemy queries for N+1 issues and missing indexes.

**Input:**
```json
{
    "query_code": "string",
    "table_schema": "object"
}
```
**Output:** Performance report, optimization suggestions, estimated query cost

---

### `audit_security`
Scans endpoint code for common security vulnerabilities.

**Input:**
```json
{
    "file_path": "string",
    "checks": ["sql_injection", "missing_auth", "exposed_secrets", "unvalidated_input"]
}
```
**Output:** Vulnerability report with severity levels and fix recommendations

---

### `check_api_contract`
Validates that implementation matches the declared OpenAPI spec.

**Input:**
```json
{
    "spec_path": "string",
    "implementation_path": "string"
}
```
**Output:** Contract diff report — mismatches, missing fields, type violations

---

## 📡 Inter-Agent Communication Tools

### `publish_api_contract`
Shares updated OpenAPI schema with Frontend Developer.

**Input:**
```json
{
    "endpoints_changed": ["string"],
    "schema_snapshot": "object",
    "breaking_changes": ["string"],
    "migration_notes": "string"
}
```
**Output:** Contract notification sent to `fe-pixel`

---

### `request_design_spec`
Requests field/data specification from UI/UX Designer.

**Input:**
```json
{
    "feature": "string",
    "questions": ["string"],
    "deadline": "YYYY-MM-DD"
}
```
**Output:** Request routed to `ux-muse`

---

### `report_task_complete`
Reports task completion back to Project Manager.

**Input:**
```json
{
    "task_id": "string",
    "files_changed": ["string"],
    "test_coverage": "number",
    "api_changes": "string",
    "notes": "string"
}
```
**Output:** Completion event sent to `pm-nova`

---

## 🛠️ DevOps Utilities

### `run_tests`
Executes the test suite and returns coverage report.

```bash
pytest tests/ -v --cov=app --cov-report=term-missing
```

### `run_linter`
Runs ruff + mypy for code quality checks.

```bash
ruff check app/ && mypy app/ --strict
```

### `run_migration`
Applies pending Alembic migrations.

```bash
alembic upgrade head
```

---

## Tool Usage Guidelines

1. Always run `generate_sqlalchemy_model` before `generate_fastapi_endpoint` for new resources
2. Run `audit_security` on every new public-facing endpoint before marking task complete
3. `publish_api_contract` is **mandatory** after any endpoint signature change
4. Test coverage below 80% blocks `report_task_complete` — increase coverage first
5. Never use `run_migration` on production without a rollback plan documented

---

**Channel:** #single-be (Discord)  
**Agent:** Forge (`be-forge`)  
**Setup Date:** 2026-03-08
