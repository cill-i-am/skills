---
name: app-forms
description: TypeScript React form patterns. Use when building, reviewing, or refactoring TanStack Form flows, UI Field primitives, Effect Schema validation, clientside mutations, auth forms, or form state/reactivity without useState/useEffect.
---

# App Forms

Use this skill as a first-class stack skill for forms in `apps/*`, on the same
tier as the TanStack routing and React skills. It captures the default decision
that forms use TanStack Form with project UI primitives and Effect Schema.

## Required Context

Before implementing or reviewing a form:

1. Read `apps/AGENTS.md`.
2. Read the project's UI system docs or external UI skill, such as shadcn, when
   changing UI primitives or form markup.
3. Read `references/tanstack-form-effect-schema.md` for the implementation pattern.

## Defaults

- Use `@tanstack/react-form` for form state and field reactivity.
- Use Effect Schema for client-side validation and submit-time decoding.
- Use `Schema.toStandardSchemaV1(schema)` for TanStack Form validators when the installed Effect version supports it.
- Submit by calling clientside mutations or client libraries; do not post form data or use native server actions.
- Keep form values and derived form state out of `useState`.
- Use `form.Subscribe`, `useStore(form.store, selector)`, or TanStack Form listeners for reactive UI and field-change behavior.
- Use the project's `FieldGroup`, `Field`, `FieldLabel`, and `FieldError`
  equivalents when available; put `data-invalid` on the field wrapper and
  `aria-invalid` on the control.
- Keep submit behavior route-local until reuse is real. Share schemas, parsers, and boundary adapters through feature slices; avoid broad reusable form components that hide page behavior.

## Avoid

- React Hook Form, Formik, or another form library without a new recorded decision.
- `useEffect` to mirror form values, derive validity, or react to normal field changes.
- `useState` for submitted values, dirty state, pending state, or error state already owned by TanStack Form or a mutation client.
- Treating Standard Schema validation as enough when the submitted value needs branded or transformed Effect Schema output.
- Duplicating schema definitions for form validation and mutation inputs when they are the same logical shape.
