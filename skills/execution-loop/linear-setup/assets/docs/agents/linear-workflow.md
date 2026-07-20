# Linear Workflow

Linear is the durable source of truth for non-trivial product work.

## Defaults

- Start non-trivial features as a Linear Project or PRD document.
- Break approved work into an outcome hierarchy of vertical-slice Issues.
- Use Linear blocker relations for dependency graphs.
- Use one user-visible Codex worker thread per implementation issue.
- Create one read-only reviewer/spec thread at dispatch time for every
  non-trivial implementation.
- Keep worker evidence in the Codex thread, Linear issue, and PR.

## Outcome-First Issue Hierarchy

Linear should explain what will become true without requiring the reader to know
the codebase's internal vocabulary.

Use this hierarchy:

1. The Project or PRD names the overall user, business, or operational outcome.
2. Parent Issues name coherent capability outcomes within that Project.
3. Child Issues name independently verifiable delivery outcomes that contribute
   to the parent outcome.

Keep the hierarchy to these two Issue levels unless a deeper level is genuinely
needed for human comprehension. Use parent/sub-Issue relationships for scope
grouping and blocker relationships for execution order; they are not
interchangeable. Dispatch only leaf Issues to workers. Keep a parent outcome open
until its children are complete and the combined outcome is verified.

Write every Issue title as a concise, plain-language outcome. The title should
complete the sentence: "When this is done, it will be true that ..." Prefer the
affected actor or system and the observable result. Put handlers, classes,
schemas, migrations, queues, and other implementation details in the Issue body.

Avoid titles led by `Fix`, `Add`, `Implement`, `Refactor`, `Update`, `Migrate`, or
`Handle` when they merely describe engineering activity. Technical nouns are
appropriate only when the technical capability is itself the outcome a reader
needs to track.

Examples:

- Instead of "Fix gated-access exception in owned-compute handler", use
  "Owners can access their compute without authorization failures".
- Instead of "Add retry queue to ingestion worker", use "Interrupted imports
  resume without losing progress".
- Instead of "Refactor token refresh service", use "Sessions recover when
  access tokens expire".

If work cannot be expressed as an independently meaningful outcome, keep it as
an implementation note or checklist item inside the owning Issue. Create a
separate technical-enablement Issue only when it needs independent ownership or
blocking, and name the operational capability it enables.

## Issue Lifecycle

Use this lifecycle unless the repo defines a narrower mapping:

1. `Backlog`: not ready for execution.
2. `Ready`: groomed, unblocked, acceptance criteria clear.
3. `In Progress`: assigned to a worker thread.
4. `In Review`: PR or implementation ready for reviewer/spec pass.
5. `Done`: orchestrator accepted evidence and merge/deploy status.
6. `Blocked`: cannot proceed without an external decision or dependency.

## Pull Requests

- One issue should produce one PR by default.
- Link PRs to Linear Issues.
- Do not merge while required blockers, reviewer requests, or CI failures remain.
- Prefer small, continuously integrated slices over broad branches.

## Evidence

Every completed issue should record:

- implemented scope
- verification commands and results
- Browser/preview evidence when user-visible behavior changed
- known risks or follow-up issues
