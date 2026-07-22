# Domain Docs

Use domain docs to preserve product intent that should outlive one issue or PR.

## Where Durable Intent Lives

- Product goals and accepted behavior live in Linear Project or PRD documents.
- Canonical domain language lives in the repository's existing glossary or the
  nearest semantic owner for that bounded context.
- Architecture decisions that pass the ADR threshold live in the repository's
  existing decision-record location or the nearest context-owned ADR location.
- Repo instruction and operating-authority rules live in `AGENTS.md` or the
  owning execution docs at the nearest semantic scope.
- Feature-specific facts can live beside the feature when they are useful only
  there.

## Resolve Placement

Inspect the existing docs topology before creating anything. Record stable
repo-specific locations here when they exist:

- Canonical glossary/domain language: `<existing path or nearest semantic owner>`
- Repository-wide ADRs: `<existing path or none>`
- Context-local ADRs: `<existing convention or none>`

`CONTEXT.md` and `CONTEXT-MAP.md` are valid when the repository already uses
them; they are not required names. Create a glossary or ADR directory only when
there is settled content, the active workflow authorizes a file write, and no
existing owner fits.

## ADR Threshold

Create an ADR only when all three are true:

1. **Hard to reverse:** changing the decision later has meaningful cost.
2. **Surprising without context:** a future reader could reasonably mistake the
   choice for an accident.
3. **A real tradeoff:** credible alternatives existed and were weighed.

Default to a title plus one to three sentences covering context, decision, and
why. Add status, considered options, or consequences only when they add value.

## Domain Doc Rules

- Keep product language separate from implementation chores.
- Name the user, actor, or system boundary involved.
- Record constraints and rejected alternatives when they explain future choices.
- Keep domain terms stable. Rename terms deliberately across docs, code, and issues.
- Give each settled decision one durable owner and link to it elsewhere.

## Avoid

- turning every small code change into an ADR
- burying durable product decisions only in PR comments
- copying the same intent across multiple docs
- forcing a root glossary or duplicating product intent across the PRD,
  glossary, ADR, and issue comments
