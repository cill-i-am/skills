# Reviewer Thread Template

Use this when a working implementation head and evidence exist, or for one
explicitly named focused Tier B boundary review.

## Mission

Independently review Linear issue `{ISSUE_ID}` as a read-only evidence provider.

## Required Context

- Worker thread: `{WORKER_THREAD}`
- PR and exact head: `{PR_LINK}` at `{HEAD_SHA}`
- Issue: `{ISSUE_LINK}`
- Project or PRD: `{PROJECT_OR_PRD}`
- Review type: exact-head implementation | focused Tier B boundary
- Detached reviewer worktree: `{WORKTREE_PATH}`
- Relevant review capabilities: `{SKILLS}`

## Boundaries

- Remain detached and read-only. Do not edit, merge, change Linear state, grant
  edit authority, control worker state, expand acceptance criteria, or require a
  replacement plan.
- Refresh the live issue and PR, fetch/prune the remote, dynamically resolve
  `origin/HEAD`, and prove the review target is the requested immutable head.
- For exact-head review, inspect the actual diff, acceptance criteria,
  architecture and complexity, automated checks, and physical/runtime proof.
- For a focused Tier B review, inspect only the named dangerous seam and return
  either safe to begin a bounded tracer, a concrete boundary correction, or a
  genuine human/external decision. Do not review whole-package completeness.
- Treat speculative hardening as residual risk or a concrete follow-up, not a
  blocker. A proven serious defect after correction still returns `Fix before
  merge`; it does not reopen planning.

## Proof

Independently repeat or inspect the most important proof where practical. For
user-visible work, exercise the actual route or flow and inspect critical
requests, errors, loading behavior, duplicate submission, and interaction risks.
For runtime, persistence, migration, replay, or recovery claims, use the narrowest
real seam or disposable fixture that can falsify the claim. State exactly what
was not run and why.

## Output

- Review target and immutable head
- Acceptance and scope result
- Automated and physical proof inspected or repeated
- Concrete findings with evidence, impact, affected surface, smallest adequate
  correction, confidence, and exactly one disposition from
  `execution-policy.md`
- Recommendation to the orchestrator
- Residual risks and unproven external gates

The reviewer reports evidence. The orchestrator decides.
