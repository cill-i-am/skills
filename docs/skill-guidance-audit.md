# Shared skill guidance audit and portable updates

Date: 2026-09-05. Baseline: `cill-i-am/skills@e6072592f3d64c411af81f1e07a653e38a1f1140`.

## Decision and scope

Keep all 36 capabilities, with `linear-setup` renamed to `workflow-setup`. The initial pass ports improvements to 17 existing skills from [Meal Planner PR #206](https://github.com/cill-i-am/meal-planner/pull/206) in a portable form. The subsequent approved change makes planning and delivery work with either Linear or versioned repository files. In total, 28 skill directories are updated and eight remain audit-only.

The user's source choice applies to the receiving project, not to this bundle's consumers automatically. This PR does not migrate Meal Planner, edit global skill installations, or move any live tracker records.

The review uses Eric Provencher's [Rethinking skills and prompts for GPT-6 Astra](https://x.com/pvncher/status/2095991462416490862) as a design lens: concise selection descriptions, useful outcomes and constraints, conditional detail, proportional verification, and continued work within existing authorization. The post motivates review; it is not empirical proof that fewer words improve every task or model.

## Applied changes

Across the initial 17 ported `SKILL.md` files, entrypoint words fall from **15,734 to 3,744** (76.2%) and description characters from **3,975 to 1,428** (64.1%). Lines fall from 2,190 to 352. These are whitespace word counts and character counts, not model tokens; supporting references are separate. The [inventory](skill-guidance-inventory.json) records all 36 skills and current before/after measurements, including the workflow extension.

| Skill | Entrypoint words | Result |
| --- | --- | --- |
| [build-intent-layer](../skills/core-standards/build-intent-layer/SKILL.md) | 1378 → 212 | Place only useful scoped instructions; stop generating mandatory intermediate instruction nodes. |
| [code-review](../skills/core-standards/code-review/SKILL.md) | 1372 → 245 | Evidence-backed findings, scope-sensitive fixes, and independent read-only review without a mandatory handoff ladder. |
| [coding-standards](../skills/core-standards/coding-standards/SKILL.md) | 1182 → 273 | Keep typed boundaries and ownership; remove universal storage, heartbeat, migration, and documentation prescriptions. |
| [improve-codebase-architecture](../skills/core-standards/improve-codebase-architecture/SKILL.md) | 1654 → 160 | Assess representative call paths and useful gains; avoid whole-repository rescans and speculative flexibility. |
| [tdd](../skills/core-standards/tdd/SKILL.md) | 802 → 167 | Test observable behavior through real seams; avoid requiring TDD for every reversible edit. |
| [tech-spec](../skills/core-standards/tech-spec/SKILL.md) | 1394 → 204 | Write only the contracts, decisions, and evidence implementation needs; avoid a fixed expansive template. |
| [ci-watch](../skills/execution-loop/ci-watch/SKILL.md) | 570 → 220 | Follow the current head, reuse one watcher, repair authorized failures, and create monitoring only when requested. |
| [simplify](../skills/execution-loop/simplify/SKILL.md) | 340 → 121 | Remove complexity that serves no current behavior; eliminate fixed pass counts and mandatory output forms. |
| [systematic-debugging](../skills/execution-loop/systematic-debugging/SKILL.md) | 476 → 169 | Use causal evidence and the narrowest useful reproduction; continue through authorized fixes. |
| [worktree-isolation](../skills/execution-loop/worktree-isolation/SKILL.md) | 599 → 280 | Preserve existing work and requested starting points; fetch a fresh base when needed without rewriting active branches. |
| [alchemy](../skills/infrastructure/alchemy/SKILL.md) | 941 → 305 | Version-aware infrastructure edits; conditional provider references; reuse authorization while checking real deploy effects. |
| [grilling](../skills/planning/grilling/SKILL.md) | 851 → 195 | Resolve consequential questions without a fixed interview format or a second permission step for authorized follow-through. |
| [deep-research](../skills/research/deep-research/SKILL.md) | 424 → 167 | Research to the decision and evidence needed; allow a brief-only request without running the investigation. |
| [app-forms](../skills/stack/app-forms/SKILL.md) | 488 → 163 | Keep form state and submit decoding correct without banning unrelated local UI state. |
| [effect-ts](../skills/stack/effect-ts/SKILL.md) | 1233 → 305 | Use the installed version and real lifecycle semantics; compile changed code before demanding extra probes. |
| [tanstack-react-best-practices](../skills/stack/tanstack-react-best-practices/SKILL.md) | 1356 → 241 | Use performance rules for credible problems; preserve local state, version semantics, and equivalent example behavior. |
| [tanstack-routing](../skills/stack/tanstack-routing/SKILL.md) | 674 → 317 | Use installed framework evidence; missing bundled guides alone do not block work or force installation. |

### Portability decisions

- Replace Meal Planner policy links with conditional references to the receiving repository's actual execution policy.
- Preserve real data and compatibility contracts. A shared skill cannot assume every receiving project is greenfield.
- Make Effect ownership conditional on an Effect-based subsystem, TanStack Query advice conditional on its use, and separate API-service ownership conditional on that architecture.
- Remove household-specific storage wording. Native Durable Object SQL and an established ORM are both valid choices when they fit the actual subsystem.
- Retain conditional routes from grilling to domain modeling and wayfinder. The shared planning skills remain useful; they are not prerequisites for every clear request.
- Retain shared planning and delivery capabilities. Removing a project-local worker skill does not establish that a shared worker capability is redundant. Generalize the setup and workflow assumptions instead of maintaining duplicate role skills.

### Supporting references and correctness

The port carries the supporting changes needed to keep the shortened entrypoints consistent: instruction placement, conditional identity/maintenance/control-plane guidance, useful API documentation, Effect source/probe and error/lifecycle guidance, native RPC reconstruction, and meaningful test seams. It removes the obsolete Effect audit-history reference, duplicated React instruction index, and two shallow TDD reference files after checking their callers.

Two React examples receive specific corrections. Effect Events intentionally change identity; the reference no longer recommends treating them as stable callbacks. This follows the [React API caveats](https://react.dev/reference/react/useEffectEvent#caveats). The `flatMap` alternative now preserves the original rejection of empty/falsy names and emails, with the documented snippets checked on representative values. Fewer iterations are not presented as measured speed proof. Independent async work uses existing Promise or Effect tools before recommending another dependency.

The persistence-test reference now chooses a representative database dialect. An in-memory SQLite test can be suitable for a SQLite adapter; it does not establish PostgreSQL or MySQL behavior simply because the application uses Drizzle. [Drizzle supports multiple dialects](https://orm.drizzle.team/docs/overview).

## Project Source Choice

`workflow-setup` preserves an existing declaration or asks once when a source choice is missing. It writes one durable owner for the choice and canonical locations, linked from `AGENTS.md`. Templates are optional defaults for missing documents that the requested workflow needs. Existing project policies and authorization take precedence over the templates.

The shared planning and delivery skills read the selection reference, then only `linear.md` or `repo.md`. Descriptions and UI prompts no longer presume Linear. No parallel copies of `to-prd`, `to-issues`, `triage`, `worker`, or `orchestrator` are introduced.

- Linear mode uses current Project/PRD records, issues, and native blockers. It preserves existing locations and live state vocabulary. Missing access leaves a dependent operation unverified; it does not create a repository backlog.
- Repository mode uses versioned Markdown at declared locations. It covers stable identifiers, grouping versus dependencies, decision versus delivery records, readiness, ownership, branch concurrency, evidence, and completion. Local proposals remain distinguishable from published shared records.
- Repository completion follows the declared acceptance event. A pre-merge record cannot truthfully include a future merge result; a coordinator may need a small authorized record update afterward. The guide makes that pending publication explicit.
- Code, domain language, ADRs, and PR/check evidence retain their natural authoritative homes. Each planning or delivery record has one owner, with links elsewhere.
- Source changes require an explicit migration request. The guide calls for verifying the new owner and retiring superseded records rather than maintaining two writable trackers.

The extension also corrects authority wording in the affected templates and roles: generic orchestration does not grant permission to create user-owned tasks or automations; subagent context depends on the actual tool; a read-only request does not inherit publishing steps.

## Baseline Audit Follow-Up

The [19-skill audit](remaining-skills-audit.md) remains an immutable-baseline assessment. The workflow extension addresses its relevant planning, storage, authority, and validation findings. Eight capability directories remain unchanged: `anti-sleep`, `cyber-audit`, `handoff`, `setup-help`, `teach`, `domain-modeling`, `research-prompt`, and `youtube-transcript`. Their recommendations remain future work. Other partially updated skills can still have unapplied recommendations; this is not a claim that the entire reference library has been rewritten.

## Verification

- `pnpm test` passes. The validator checks metadata, workflow resources, and local Markdown links in both the categorized source tree and a flattened installation layout.
- Disposable negative checks reject a missing local reference, a reference that works only before installation, a missing repository-mode guide, and an empty description followed by other metadata.
- A clean install using the cached `skills` CLI 1.5.23 finds all 36 skills and 36 metadata files. Installed file bytes are compared with the reviewed source.
- Independent agents exercise realistic requests with only the relevant skill and raw project artifacts. Repository setup/planning writes actual local Markdown at custom paths. A read-only Linear request follows an existing declaration at a custom path and produces unpublished slices from the supplied snapshot. Each loads only its selected mode guide.
- Repository acceptance and publication are exercised against a disposable local Git origin; [workflow validation](workflow-choice-validation.md) records the requests, observed artifacts, and limits of all three model evaluations.
- The initial port's React example checks and representative-database source checks remain applicable.

The old policy/discovery scripts matched prose and tested handwritten scenario functions that did not invoke a model. They are replaced by real packaging integrity checks and bounded independent agent evaluations. These evaluations support the exercised cases; they do not certify all agent behavior. Linear live writes and hosted merge APIs are not exercised, and no live tracker records or provider resources are changed.
