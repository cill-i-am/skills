---
name: tech-spec
description: Write an implementation-ready technical design when a separate spec is requested or needed.
---

# Technical Design

Use the accepted request, relevant decisions, and actual callers to establish the problem and constraints. Inspect code to resolve technical facts; ask only about material choices that cannot be inferred safely.

Keep the spec as small as the decision permits. Include:

- the outcome, scope, and consequential constraints;
- ownership and changed boundaries, with TypeScript contract sketches where useful;
- the important call/data flow and expected failures;
- affected modules and a practical verification approach;
- unresolved decisions or external effects that limit implementation.

Compare alternatives when the choice is genuinely open. Do not invent three options, enumerate every function, or repeat the same contract across a long template. Existing accepted designs do not need to be re-litigated.

Use [coding standards](../coding-standards/SKILL.md) for relevant domain/boundary guidance. Keep API sketches consistent with installed versions and label unverified pseudocode. Plan tests around meaningful behaviour; TDD is optional unless requested.

A spec-only request ends with the design. A request that also authorizes implementation continues once consequential decisions are resolved. Save the artifact where requested or in the owning repository work record when durable delivery context is needed.
