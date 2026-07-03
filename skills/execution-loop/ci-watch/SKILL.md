---
name: ci-watch
description: Watch GitHub PR checks and comments. Use after production-ready opens or updates a PR, or when asked to monitor CI, inspect failing checks/review threads, fix in-scope failures, push follow-up commits, and update Linear.
---

# CI Watch

Own PR checks and PR feedback until they are green/resolved or genuinely
blocked.

This skill starts only after a PR exists. `production-ready` decides whether a
change is ready for PR handoff; `ci-watch` decides whether the PR remains green
and comment-resolved after handoff.

## Inputs

- PR URL or current branch PR
- Linear issue key and parent Project when available
- issue scope and out-of-scope boundaries
- current branch and head SHA when known

Use GitHub tooling for PR/check/log inspection. Use the GitHub `gh-fix-ci` skill
or its bundled scripts when GitHub Actions checks fail.

## Loop

1. Resolve the PR from URL or current branch.
2. Run `gh auth status`; stop if GitHub auth is unavailable.
3. Record the current PR head SHA. Re-read it after every push or rerun so check
   status is never reported for a stale commit.
4. Refresh the live Linear issue and parent Project when available. Treat the
   automation prompt or handoff as orientation, not the operative source of
   truth.
5. Check GitHub PR comments, review threads, review decisions, and new Linear
   comments. Address actionable in-scope reviewer comments before claiming the
   PR is ready; reply or update Linear when a comment is out of scope or
   blocked. Stop for orchestrator input when feedback changes scope, product
   behavior, architecture, data shape, or requires judgment.
6. Check PR status with `gh pr checks`.
7. If checks or review comments are pending:
   - poll inline for a short window when useful
   - if waiting would waste the worker session, create or update a 2-3 minute
     heartbeat automation for the worker thread with `automation_update` and
     continue this loop there
   - update Linear with the watcher status and the current pending checks or
     comments
8. If a GitHub Actions check fails:
   - inspect logs
   - identify root cause using `systematic-debugging`
   - fix only if the change stays inside the Linear issue/PR scope
   - run relevant local verification
   - commit and push
   - update Linear with failure, fix, and verification evidence
   - continue watching
9. If all required checks pass and actionable comments are resolved:
   - update Linear with green/comment-resolved status and evidence
   - report ready for orchestrator acceptance

## Block Conditions

Stop and update Linear when:

- failure is external/provider/credential related
- failure is unrelated to the PR or already failing on base
- repeated flake fails after one rerun or configured retry budget
- fix requires out-of-scope files
- PR review feedback changes scope, product behavior, architecture, data shape,
  or requires judgment
- GitHub auth/logs/comments are unavailable
- CI failure requires human judgment or secrets

## Automation Prompt

When creating an automation, include:

- repo path
- PR URL
- Linear issue key
- current branch
- current head SHA
- max retry/fix attempts
- instruction to check GitHub checks, PR comments, review threads, review
  decisions, and Linear comments
- instruction to fix actionable in-scope failures/comments and push follow-up
  commits
- instruction to update Linear on green/failure/comment/block
- instruction to stop when green or blocked

Prefer a 2-3 minute heartbeat for an active worker PR. Use a longer or detached
automation only when the user or environment requires it.

Use the Codex app `automation_update` tool for create/update/view/delete. Do not
write raw automation directives by hand. Do not create duplicate watchers for
the same PR; update or reuse an existing automation when possible.

## Completion States

- **Green:** required checks pass and actionable PR/Linear comments are resolved.
- **Pending:** checks, review threads, or comments are still waiting; an inline
  watch or heartbeat owns the next poll.
- **Fixed and pushed:** an in-scope CI/comment fix was committed and pushed; the
  loop continues against the new head SHA.
- **Blocked:** the next move needs credentials, provider state, human judgment,
  out-of-scope changes, or a base-branch/external fix.

Final output must include the completion state, PR URL, head SHA, check status,
comment/review-thread status, Linear update status, fixes pushed, and blockers
or residual risk.

Completion criterion: the reported state is for the current PR head SHA, all
required checks and actionable comments have an owner, and Linear has the same
status/evidence as the final report.
