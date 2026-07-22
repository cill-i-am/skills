---
name: ci-watch
description: Own one PR's next CI and comment poll. Use after a PR exists to refresh the exact head, report deltas, fix bounded in-scope failures, and stop cleanly when green, closed, merged, or genuinely blocked.
---

# CI Watch

One watcher owns one PR's next poll. It observes deltas and prompts action; it
does not decide readiness, replay governance history, or invent authority.

## Inputs

- repository and PR URL;
- owning issue and worker;
- current branch and exact head;
- pending check, review thread, or comment;
- next action and bounded retry/fix budget;
- stop condition and last meaningful observation.

Before starting, find any active watcher for the same PR. Reuse, update, or stop
it. Do not create overlapping worker, orchestrator, and project watchers for the
same event.

## Poll

1. Resolve the live PR and current head SHA. Never report checks for a stale
   head.
2. Refresh required checks, review decision, unresolved review threads, PR
   comments, and new Linear comments.
3. Compare with the last meaningful observation. Stay silent when nothing
   changed.
4. If an in-scope failure or concrete comment is actionable, diagnose it with
   `systematic-debugging`, reproduce it when practical, make the smallest fix,
   run relevant checks, commit/push if authorized, update the head, and continue
   within the retry/fix budget.
5. If the feedback changes product meaning, crosses issue scope, or needs
   credentials/provider/production/destructive authority, return it to the
   orchestrator with the concrete evidence and required decision.
6. Update Linear only with the live delta: new head, failed/passed check,
   resolved/new comment, fix, genuine gate, and next action.
7. Stop when required checks and comments are resolved, the PR is merged or
   closed, the budget is exhausted, or a genuine human/external dependency is
   reached.

Use GitHub tooling and the `gh-fix-ci` workflow when GitHub Actions fails.
A fixed-timeout test that passes promptly in isolation and on an unchanged full
rerun under lower contention is evidence to record; do not automatically weaken
the assertion, raise the timeout, or start a governance cycle.

## Automation

When inline waiting would waste the worker session, use `automation_update` to
create or update the single heartbeat for this PR. Include only the inputs
above. Verify the automation exists and has the intended next run. Do not copy
historic approvals, comment ID chains, full issue prose, or stale policy into
the prompt.

On every wakeup, refresh the current head and replace obsolete instructions.
Delete or stop the automation when its stop condition is met.

## Completion States

- **Green:** current-head required checks pass and actionable comments are
  resolved; notify the orchestrator that Decide is ready.
- **Pending:** one watcher owns the named next poll.
- **Fixed:** an authorized in-scope correction was pushed; continue against the
  new exact head.
- **Decision required:** product meaning, scope, or external/irreversible
  authority needs the orchestrator or human.
- **External unavailable:** authentication, CI provider, or another genuine
  dependency prevents the next poll or proof.

Final output names the PR, exact head, changed check/comment state, fixes,
Linear delta, next action and owner, stop condition, and residual risk.

Completion criterion: the report is current for the exact PR head, no second
watcher owns the next poll, and the watcher has stopped or has one bounded next
action.
