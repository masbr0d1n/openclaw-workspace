# TOOLS.md — Frontend Developer Agent

## Tool Registry

All tools available to Pixel (Frontend Developer agent), covering component scaffolding, API integration, testing, and inter-agent communication.

---

## 🎨 Component Generation Tools

### `generate_component`
Scaffolds a typed React component with tests.

**Input:**
```json
{
 "name": "string",
 "type": "atom | molecule | organism | page",
 "props": [{ "name": "string", "type": "string", "required": true }],
 "has_loading_state": true,
 "has_empty_state": true,
 "has_error_state": true
}
```
**Output:** Component file, types file, test file, Storybook story (optional)

---

### `generate_shadcn_form`
Generates a complete form using React Hook Form + Zod + shadcn/ui.

**Input:**
```json
{
 "form_name": "string",
 "fields": [{ "name": "string", "type": "text | email | password | select | checkbox | textarea", "validation": "string" }],
 "submit_action": "string",
 "api_endpoint": "string"
}
```
**Output:** Form component with validation schema, error display, and submit handler

---

### `generate_data_table`
Creates a TanStack Table with sorting, filtering, and pagination.

**Input:**
```json
{
 "entity": "string",
 "columns": [{ "key": "string", "label": "string", "sortable": true }],
 "api_endpoint": "string",
 "row_actions": ["view", "edit", "delete"]
}
```
**Output:** DataTable component with hooks, column definitions, and API integration

---

### `generate_page`
Scaffolds a Next.js App Router page with layout and data fetching.

**Input:**
```json
{
 "route": "string",
 "page_name": "string",
 "fetch_strategy": "server | client | hybrid",
 "api_endpoints": ["string"]
}
```
**Output:** `page.tsx` (server component), `_components/` directory, loading.tsx, error.tsx

---

## 🔌 API Integration Tools

### `generate_api_client`
Creates typed API client functions from OpenAPI spec.

**Input:**
```json
{
 "openapi_spec": "object | path",
 "base_url": "string",
 "auth_type": "bearer | cookie | none"
}
```
**Output:** `lib/api/` directory with typed query functions and TanStack Query hooks

---

### `validate_api_types`
Checks that frontend TypeScript types match the latest backend OpenAPI schema.

**Input:**
```json
{
 "types_path": "string",
 "openapi_spec_path": "string"
}
```
**Output:** Type mismatch report with exact diff

---

## 🧪 Testing Tools

### `generate_component_test`
Generates React Testing Library tests for a component.

**Input:**
```json
{
 "component_path": "string",
 "test_scenarios": ["renders_correctly", "handles_user_interaction", "shows_loading", "shows_error"]
}
```
**Output:** Test file with async tests, user-event interactions, and accessibility checks

---

### `run_a11y_audit`
Runs accessibility audit on component or page using axe-core.

**Input:**
```json
{
 "target": "component | page",
 "path": "string"
}
```
**Output:** A11y violation report with WCAG references and fix suggestions

---

### `run_lighthouse`
Runs Lighthouse performance audit.

```bash
npx lighthouse http://localhost:3000 --output=json --only-categories=performance,accessibility
```
**Output:** Scores for Performance, Accessibility, Best Practices, SEO

---

## 📡 Inter-Agent Communication Tools

### `acknowledge_api_contract`
Acknowledges receipt of API contract from Backend Developer.

**Input:**
```json
{
 "contract_version": "string",
 "breaking_changes_acknowledged": true,
 "migration_plan": "string"
}
```

---

### `request_design_clarification`
Requests design clarification from UI/UX Designer.

**Input:**
```json
{
 "component": "string",
 "questions": ["string"],
 "context": "string"
}
```

---

### `report_task_complete`
Reports feature completion to Project Manager.

**Input:**
```json
{
 "task_id": "string",
 "components_created": ["string"],
 "routes_affected": ["string"],
 "notes": "string"
}
```

---

## Tool Usage Guidelines

1. Always use `validate_api_types` after receiving a new API contract from Forge
2. Run `run_a11y_audit` on every new interactive component before marking it done
3. `generate_api_client` should be run once per sprint if any endpoints changed
4. Never skip loading/error/empty states — `generate_component` scaffolds all three by default
5. Use `generate_shadcn_form` for all user-input forms — never write raw controlled inputs
