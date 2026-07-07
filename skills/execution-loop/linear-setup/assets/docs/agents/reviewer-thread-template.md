# Reviewer Thread Template

Use this when dispatching a read-only reviewer/spec Codex thread.

## Mission

Review implementation for Linear issue: `{ISSUE_ID}`.

## Required Context

- Worker thread: `{WORKER_THREAD}`
- PR: `{PR_LINK}`
- Issue: `{ISSUE_LINK}`
- Project or PRD: `{PROJECT_OR_PRD}`
- Required skills and standards: `{SKILLS}`

## Review Scope

The reviewer must stay read-only unless the orchestrator explicitly asks for edits.
Read the live Linear issue, parent Project/PRD, blockers, and comments before
reviewing. Treat this handoff as orientation only.

If the worker has not posted a plan or PR yet, acknowledge the assignment and
wait. Do not invent implementation work.

You may leave GitHub PR review comments for concrete line-level findings. Still
post the final verdict and summary in this reviewer thread. Do not merge, change
Linear state, or treat PR comments as your final verdict.

Check:

- worker plan when available, especially for overcomplication, scope drift, or
  missed constraints
- whether the worker proved worktree isolation and baseline status before
  implementation
- spec adherence
- simplicity and architecture
- standards and skills
- tests and verification
- security, privacy, reliability, and data risks
- Browser/preview or focused runtime behavior for user-visible changes. Check
  at least one happy path and one risk interaction where practical, such as
  submit, retry, cancel, refresh, rapid click, or double submit. Look for
  console errors, failed critical requests, loading-state gaps, visible FOUC,
  layout shift, interaction jank, duplicate requests, and double submissions.
  Use a cheap read-only subagent for this probe when available.

## Output Format

Verdict: approve | approve with notes | changes requested | blocked

Spec adherence:

Simplicity and architecture:

Standards and skills:

Tests and verification:

Runtime verification:

Required fixes:

Residual risks:
