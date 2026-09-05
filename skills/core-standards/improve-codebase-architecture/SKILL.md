---
name: improve-codebase-architecture
description: Assess a code area for concrete ownership, boundary, or module-design improvements.
---

# Architecture Assessment

Use the user's scope. For a broad scan, identify representative areas or call paths and disclose coverage gaps instead of repeatedly searching the whole repository.

Inspect callers, data flow, and the current design before proposing a change. Load only relevant [coding standards](../coding-standards/SKILL.md). Look for duplicated policy, scattered invariants, leaking representations, unnecessary wrappers, difficult testing seams, or unclear resource ownership.

Recommend changes only when concrete evidence shows a useful gain in correctness, clarity, locality, or testability. Name the affected files/call path, friction, proposed ownership change, and how to verify it. Rank by practical benefit; omit aesthetic preferences and hypothetical flexibility.

An assessment-only request does not authorize a refactor. Read-only checks or disposable probes may clarify a candidate. If implementation or a spec is already requested, continue to that work without asking again; use [tech-spec](../tech-spec/SKILL.md) only when a separate design artifact adds value.
