---
name: app-forms
description: Build or change TanStack Form flows using Effect Schema and the project’s UI fields.
---

# Forms

Use TanStack Form for field values and reactivity, the project's UI field primitives, and Effect Schema for validation and submit-time decoding. [Implementation reference](references/tanstack-form-effect-schema.md) covers the integration when needed.

Keep one owner for form and mutation state. Use Form subscriptions/listeners rather than mirroring values, validity, or pending state with React effects. Local UI state unrelated to the form is a separate concern.

Standard Schema validation may not return branded/transformed domain output. Decode the submitted value with the owning Effect Schema before calling the typed client mutation. Reuse the API input schema when it is the same contract; distinguish UI draft values when the shapes actually differ.

Keep one-off layout, copy, and submit behaviour route-local. Share a form abstraction only when repeated behaviour justifies it. Invalidate affected queries after success and expose honest validation, pending, and failure states with labels and accessible error associations.
