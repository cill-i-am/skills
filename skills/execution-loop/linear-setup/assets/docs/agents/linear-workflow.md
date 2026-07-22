# Linear Workflow

Linear is the durable source of truth for non-trivial product work. Authority
and execution phases come from `execution-policy.md`.

## Defaults

- Start non-trivial features as a Linear Project or PRD document.
- Break approved work into an outcome hierarchy of vertical-slice Issues.
- Use Linear blocker relations for dependency graphs.
- Use one user-visible Codex worker thread per implementation issue.
- Create the independent reviewer when a working diff, draft PR, exact head, and
  executable evidence exist. Use an earlier reviewer only for a focused Tier B
  boundary.
- Keep durable outcome and decision evidence in Linear and the PR; keep live
  progress in the owning Codex thread.

## Outcome-First Issue Hierarchy

Linear should explain what will become true without requiring the reader to know
the codebase's internal vocabulary.

1. The Project or PRD names the overall user, business, or operational outcome.
2. Parent Issues name coherent capability outcomes within that Project.
3. Child Issues name independently verifiable delivery outcomes that contribute
   to the parent outcome.

Keep the hierarchy to these two Issue levels unless a deeper level is genuinely
needed for human comprehension. Parent/sub-Issue relations group scope; blocker
relations express execution order. Dispatch only Ready leaf Issues. Keep a
parent outcome open until its children and combined outcome are verified.

Write titles as concise plain-language outcomes that complete: “When this is
done, it will be true that ...” Put handlers, classes, schemas, migrations,
queues, and other implementation detail in the body. Avoid activity-led titles
such as `Fix`, `Add`, `Implement`, `Refactor`, `Update`, `Migrate`, or `Handle`
unless the technical capability is itself the tracked outcome.

If work cannot be expressed as an independently meaningful outcome, keep it as
an implementation note inside the owning Issue. Create separate technical
enablement only when it needs independent ownership or blocking.

## Issue Lifecycle

Use this lifecycle unless the repo defines a narrower mapping:

1. `Backlog`: not ready for execution.
2. `Ready`: outcome, testable acceptance, boundaries, dependencies, product
   decisions, proof expectations, and external/human gates are clear.
3. `In Progress`: assigned to one delivery owner.
4. `In Review`: exact implementation head and evidence are ready for review.
5. `Done`: the orchestrator accepted evidence and completed the delegated
   shipping decision.
6. `Blocked`: a genuine human decision or unavailable external dependency
   prevents progress.

A fixable local technical defect is not `Blocked`.

## Pull Requests

- One issue should produce one PR by default.
- Link PRs to Linear Issues and open a draft once a meaningful tracer works.
- Do not merge while a `Fix before merge` finding, required check, or genuine
  external gate for the claimed outcome remains unresolved.
- Prefer small, continuously integrated slices over broad branches.

## Evidence

Completed issues record only decision-useful evidence:

- exact implementation head and implemented scope;
- acceptance criteria mapped to automated and physical/runtime proof;
- CI, preview, or external-proof state;
- finding dispositions;
- residual risks, follow-ups, and unproven external gates;
- orchestrator decision.
