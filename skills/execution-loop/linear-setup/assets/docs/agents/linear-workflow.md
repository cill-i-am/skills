# Linear Workflow

Linear is the durable source of truth for non-trivial product work.

## Defaults

- Start non-trivial features as a Linear Project or PRD document.
- Break approved work into vertical-slice Issues.
- Use Linear blocker relations for dependency graphs.
- Use one user-visible Codex worker thread per implementation issue.
- Create one read-only reviewer/spec thread at dispatch time for every
  non-trivial implementation.
- Keep worker evidence in the Codex thread, Linear issue, and PR.

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
