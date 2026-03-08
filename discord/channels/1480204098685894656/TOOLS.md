# TOOLS.md — UI/UX Designer Agent

## Tool Registry

All tools available to Muse (UI/UX Designer agent), covering research, wireframing, design generation, and handoff utilities.

---

## 🔍 Research & Discovery Tools

### `generate_user_persona`
Creates a detailed user persona from requirements context.

**Input:**
```json
{
 "product_context": "string",
 "target_audience": "string",
 "pain_points": ["string"],
 "goals": ["string"]
}
```
**Output:** Persona document with name, demographics, motivations, frustrations, behaviors, and Jobs-to-be-Done

---

### `generate_user_flow`
Maps the user's journey through a feature.

**Input:**
```json
{
 "feature": "string",
 "entry_points": ["string"],
 "key_actions": ["string"],
 "exit_points": ["string"]
}
```
**Output:** User flow diagram (Mermaid flowchart) with decision points and error paths

---

### `generate_information_architecture`
Creates site map or navigation structure.

**Input:**
```json
{
 "product_type": "web_app | mobile_app | dashboard | marketing_site",
 "primary_entities": ["string"],
 "user_roles": ["string"]
}
```
**Output:** IA diagram with navigation levels, page hierarchy, and access rules

---

## 🎨 Design Generation Tools

### `generate_wireframe_spec`
Produces a detailed wireframe specification in markdown.

**Input:**
```json
{
 "page_name": "string",
 "layout_type": "dashboard | form | list | detail | auth | landing",
 "key_components": ["string"],
 "data_fields": ["string"],
 "user_actions": ["string"]
}
```
**Output:** Wireframe spec with layout description, component placement, content zones, and interaction notes

---

### `generate_component_spec`
Creates a detailed design specification for a UI component.

**Input:**
```json
{
 "component_name": "string",
 "variants": ["string"],
 "states": ["default", "hover", "focus", "active", "disabled", "loading", "error"],
 "props": [{ "name": "string", "type": "string", "description": "string" }]
}
```
**Output:** Component spec with anatomy, states, tokens, measurements, and accessibility notes

---

### `generate_design_tokens`
Creates or extends the design token set.

**Input:**
```json
{
 "token_type": "color | spacing | typography | shadow | radius | animation",
 "brand_values": ["string"],
 "existing_tokens": "object (optional)"
}
```
**Output:** Token definitions in JSON + Tailwind config format

---

### `audit_color_contrast`
Checks color combinations for WCAG 2.1 AA compliance.

**Input:**
```json
{
 "foreground": "#hex",
 "background": "#hex",
 "text_size": "normal | large"
}
```
**Output:** Contrast ratio, WCAG AA/AAA pass/fail, suggested alternatives if failing

---

## 📦 Handoff Tools

### `generate_handoff_package`
Creates a complete design handoff document for Frontend Developer.

**Input:**
```json
{
 "feature_name": "string",
 "components": ["string"],
 "pages": ["string"],
 "tokens_used": ["string"],
 "interaction_notes": ["string"]
}
```
**Output:** Handoff markdown with component specs, token references, responsive behavior notes, and accessibility requirements

---

### `generate_visual_acceptance_criteria`
Creates testable visual criteria for QA Engineer.

**Input:**
```json
{
 "component_or_page": "string",
 "key_design_decisions": ["string"]
}
```
**Output:** Visual checklist for QA with specific, observable criteria (colors, spacing, typography, states)

---

### `request_data_schema`
Requests data field information from Backend Developer.

**Input:**
```json
{
 "component": "string",
 "data_needs": ["string"],
 "display_questions": ["string"]
}
```
**Output:** Request routed to `be-forge`

---

## 🔁 Review Tools

### `design_review_checklist`
Runs a self-review checklist against a design deliverable.

**Input:**
```json
{
 "deliverable_type": "wireframe | mockup | component | flow",
 "checklist_scope": ["accessibility", "responsiveness", "states", "consistency", "content"]
}
```
**Output:** Checklist with pass/fail per item and priority fixes

---

## Tool Usage Guidelines

1. Always run `generate_user_flow` before wireframing — never design without a flow
2. `audit_color_contrast` must be run on all text/background combinations before handoff
3. `generate_handoff_package` is mandatory before Frontend Developer starts implementation
4. `generate_visual_acceptance_criteria` must be sent to QA alongside every design handoff
5. Run `design_review_checklist` as a self-QA step before delivering any design
6. All new color tokens must pass WCAG AA — no exceptions
