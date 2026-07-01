---
name: grilling
description: Relentless reference-first planning interview. Use when stress-testing a product, architecture, feature, PRD, or implementation plan against existing code/docs; when the user says grill, challenge, interrogate, poke holes; or when ADR/glossary decisions should be captured before building.
---

# Grilling

Run a focused decision interview before implementation. The goal is shared
understanding: fewer hidden assumptions, explicit tradeoffs, and a plan that can
survive contact with the codebase.

This skill is planning-only. Do not implement, edit code, create issues, or write
a tech spec unless the user explicitly asks after the interview.

## Modes

Use **Reference Interview Mode** by default. Ground questions in the existing
codebase, docs, issues, ADRs, specs, and agent instructions before asking the
user.

Use **Docs Mode** when the user asks for durable artifacts, ADRs, glossary,
decision records, PRD notes, or design docs while the interview runs.

Reference Interview Mode and Docs Mode are different uses:

- Reference Interview Mode uses existing artifacts as evidence and produces a
  conversation handoff.
- Docs Mode also creates or updates durable artifacts from settled decisions.

## Reference Pass

Before asking product/domain questions, inspect the available references that
can answer them:

- existing PRDs, specs, ADRs, glossary/domain docs, README files, and
  `CONTEXT.md`;
- root and local `AGENTS.md` files;
- relevant issues, comments, or acceptance criteria when available;
- source files, tests, schemas, public APIs, and package boundaries around the
  proposed change.

Do not ask the user to repeat facts that are already present in those artifacts.
Ask only for decisions, preferences, priorities, or missing context that the
references cannot settle.

Completion criterion: the first question is grounded in inspected references, or
the response says which expected references were absent.

## Interview Rules

- Ask one question at a time. Never bundle several decision questions together.
- For each question, give a recommendation and briefly name the tradeoffs you
  considered.
- If codebase or document inspection can answer the question, inspect first and
  ask only to confirm a decision or resolve ambiguity.
- Resolve dependency decisions before downstream details.
- Keep a visible decision ledger in the conversation: decided, open, and
  deferred.
- Push on hidden complexity, fallback paths, speculative abstraction, unclear
  ownership, untyped boundaries, state duplication, and untested failure modes.
- Accept the user's answer when it is clear. Do not re-litigate settled
  decisions unless a later answer contradicts them.
- Stop when the remaining questions would no longer change the plan, spec, or
  next implementation slice.

Completion criterion: the next slice has clear goals, non-goals, ownership,
boundaries, data flow, failure behavior, tests, and open questions.

## Question Shape

Use this shape for each question:

```md
Question: <one decision>

My recommendation: <recommended answer and why>

Tradeoffs considered: <short contrast with plausible alternatives>
```

If the user agrees, record the decision and ask the next question. If they
disagree, clarify the new decision and continue from there.

## Docs Mode

In Docs Mode, maintain draft artifacts as the interview discovers stable
decisions. Keep them brief and update them after each settled decision.

Possible artifacts:

- ADR for consequential architecture decisions;
- glossary for domain terms and overloaded words;
- PRD/design notes for product intent and acceptance criteria;
- risk log for known tradeoffs, unknowns, and deferred choices.

Write files only when the user asks for files or the target workflow requires
durable artifacts. Otherwise, keep the artifacts inline.

Completion criterion: every settled durable decision appears exactly once in the
chosen artifact, and unresolved decisions remain explicit open questions.

## Handoff

End with:

- decisions made;
- open questions;
- recommended next slice;
- whether the result is ready for `tech-spec`, `to-prd`, `to-issues`, or direct
  implementation.
