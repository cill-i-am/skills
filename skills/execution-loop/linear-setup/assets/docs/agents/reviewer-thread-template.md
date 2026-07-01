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
- spec adherence
- simplicity and architecture
- standards and skills
- tests and verification
- security, privacy, reliability, and data risks
- Browser/preview behavior for user-visible changes where practical

## Output Format

Verdict: approve | approve with notes | changes requested | blocked

Spec adherence:

Simplicity and architecture:

Standards and skills:

Tests and verification:

Required fixes:

Residual risks:
