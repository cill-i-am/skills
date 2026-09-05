# Shared skill guidance audit and portable updates

Date: 2026-09-05. Baseline: `cill-i-am/skills@e6072592f3d64c411af81f1e07a653e38a1f1140`.

## Decision and scope

Keep all 36 shared capabilities. This change ports the improvements to 17 existing skills from [Meal Planner PR #206](https://github.com/cill-i-am/meal-planner/pull/206), adapting them to the shared repository rather than copying project architecture or deleting shared workflow skills. The other 19 skills are audited with recommendations only; their files and the Linear workflow templates are unchanged.

The review uses Eric Provencher's [Rethinking skills and prompts for GPT-6 Astra](https://x.com/pvncher/status/2095991462416490862) as a design lens: concise selection descriptions, useful outcomes and constraints, conditional detail, proportional verification, and continued work within existing authorization. The post motivates review; it is not empirical proof that fewer words improve every task or model.

## Applied changes

Across the 17 updated `SKILL.md` files, entrypoint words fall from **15,734 to 3,744** (76.2%) and description characters from **3,975 to 1,428** (64.1%). Lines fall from 2,190 to 352. These are whitespace word counts and character counts, not model tokens; supporting references are separate. The [inventory](skill-guidance-inventory.json) records all 36 skills and before/after measurements.

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
- Keep all shared Linear roles, templates, and capability directories. Removing a project-local worker skill does not establish that a shared worker capability is redundant.

### Supporting references and correctness

The port carries the supporting changes needed to keep the shortened entrypoints consistent: instruction placement, conditional identity/maintenance/control-plane guidance, useful API documentation, Effect source/probe and error/lifecycle guidance, native RPC reconstruction, and meaningful test seams. It removes the obsolete Effect audit-history reference, duplicated React instruction index, and two shallow TDD reference files after checking their callers.

Two React examples receive specific corrections. Effect Events intentionally change identity; the reference no longer recommends treating them as stable callbacks. This follows the [React API caveats](https://react.dev/reference/react/useEffectEvent#caveats). The `flatMap` alternative now preserves the original rejection of empty/falsy names and emails, with the documented snippets checked on representative values. Fewer iterations are not presented as measured speed proof. Independent async work uses existing Promise or Effect tools before recommending another dependency.

The persistence-test reference now chooses a representative database dialect. An in-memory SQLite test can be suitable for a SQLite adapter; it does not establish PostgreSQL or MySQL behavior simply because the application uses Drizzle. [Drizzle supports multiple dialects](https://orm.drizzle.team/docs/overview).

## Audit of the remaining 19

The [remaining-skills audit](remaining-skills-audit.md) records per-skill findings, baseline locations, retained value, and proposed changes. Its recommendations are not applied in this PR. The most useful next pass is to simplify shared workflow entrypoints and template authority wording together while preserving ownership, review evidence, and external-action boundaries.

Some unchanged references and workflow templates still contain broad reading lists, exact output forms, or absolute preferences. This is a targeted port plus a documented audit, not a claim that the entire reference library has been rewritten or behaviorally certified.

## Verification

- `pnpm test` passes. Metadata, source/template checks, and the existing scripted policy/discovery scenarios pass.
- The updated validator checks actual local Markdown reference targets outside output templates. A disposable copy accepted the valid bundle and rejected an injected missing reference.
- The obsolete grilling wording assertions were removed: conditional discovery routing should not require a fixed phrase or mandatory sequence. Other existing policy wording assertions are retained and their limitations recorded below.
- A real clean install using the cached `skills` CLI 1.5.23 and this checkout found and installed **36 skills and 36 metadata files** with `--full-depth --copy --agent codex`.
- All **207 installed skill files** matched their source bytes; all **72 local Markdown reference links** checked outside templates resolved after installation. Frontmatter and UI metadata were parsed as YAML.
- Executing the documented before/after array snippets confirmed equivalent filtering for empty, absent, falsy, active, and inactive values.
- No live cloud deployment, provider mutation, external message, or application runtime test was needed for this guidance change.

The repository's scripted scenarios evaluate small hardcoded functions; they do not invoke a model using these skills. Passing those checks is static consistency evidence, not proof of agent decisions. Installation verifies packaging and reference availability. The React and database source checks support the specific corrections above; they do not validate every version-sensitive example in the bundle.
