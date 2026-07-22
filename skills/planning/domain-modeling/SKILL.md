---
name: domain-modeling
description: Sharpen a project's domain language and durable architectural decisions. Use when terms are overloaded, concrete scenarios expose unclear boundaries, code and product claims conflict, a canonical glossary needs maintenance, or a consequential tradeoff may deserve an ADR.
---

# Domain Modeling

Actively improve the model while planning. Challenge fuzzy language, test
relationships with concrete scenarios, compare claims with code and docs, and
record only the domain language or architectural decisions that have genuinely
settled.

This is a planning and documentation capability. It does not grant
implementation, tracker mutation, publication, or filesystem-write authority.

## Read First

Inspect the nearest relevant sources before proposing language:

- `docs/agents/domain.md` when present;
- existing glossaries, domain docs, context maps, `CONTEXT.md` files, ADRs,
  architecture docs, PRDs, and feature docs;
- source types, schemas, public APIs, tests, persistence models, and issue terms
  around the concept being discussed;
- applicable `AGENTS.md` files.

Do not force a root `CONTEXT.md`. Resolve the repository's existing domain-doc
topology and nearest semantic owner. Read
`references/domain-doc-placement.md` when placement or glossary shape is not
obvious.

## Active Discipline

During a grilling, Wayfinder, PRD, tech-spec, or architecture session:

1. **Challenge overloaded terms.** When one word appears to name different
   actors, states, records, or boundaries, say so and recommend distinct
   canonical terms.
2. **Stress-test scenarios.** Use specific happy paths, edge cases, lifecycle
   transitions, ownership changes, partial failures, and boundary crossings to
   test whether the concepts remain coherent.
3. **Cross-check evidence.** Compare product claims with source, schemas, docs,
   tests, and live tracker context. Surface contradictions instead of silently
   choosing one version.
4. **Maintain canonical language.** Once a term settles, name its single durable
   owner and refer to it elsewhere. Define what the concept is and the boundary
   that distinguishes it; keep implementation chores out of the glossary.
5. **Separate durable intent.** Product intent belongs in the Project/PRD or
   repository vision docs. Operating authority belongs in the owning agent or
   execution docs. Only qualifying architectural tradeoffs become ADRs.

When working interactively, use `../grilling/` for one-question-at-a-time
decisions. This skill sharpens the language and evidence; grilling owns the
interview rhythm.

## Durable Writes

Keep proposed glossary entries and ADRs inline unless the user requests files
or the active workflow explicitly authorizes durable artifacts. When a write is
authorized:

- patch the nearest existing semantic owner instead of creating a parallel
  glossary;
- create a new glossary or ADR directory only when no established owner exists
  and the chosen path fits the repository's doc topology;
- preserve settled wording and user edits;
- store each decision once and link to it elsewhere.

## ADR Threshold

Offer an ADR only when all three are true:

1. **Hard to reverse:** changing the decision later has meaningful cost.
2. **Surprising without context:** a future reader could reasonably mistake the
   choice for an accident or try to “fix” it.
3. **A real tradeoff:** credible alternatives existed and the decision chose
   among them for specific reasons.

If any condition is absent, do not create an ADR. Read
`references/adr-guidance.md` for placement and the minimal format.

## Output

Return:

- canonical terms added, changed, rejected, or still ambiguous;
- concrete scenarios used to test the model;
- contradictions between language, code, docs, or tracker state;
- the single durable owner for each settled decision;
- any qualifying ADR proposal and why it passes all three tests;
- unresolved questions and the recommended planning handoff.

Completion criterion: relevant terms have one precise meaning and owner,
material contradictions are explicit, no unqualified ADR or duplicate source
of truth was created, and no implementation or external mutation began.
