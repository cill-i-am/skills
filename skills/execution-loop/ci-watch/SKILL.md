---
name: ci-watch
description: Follow a PR’s current CI and review feedback; fix authorized in-scope failures.
---

# CI Follow-up

Resolve the PR's current head, required checks, and actionable review comments. Reuse an existing watcher for the same PR. Compare observations with the last meaningful state and report changes only.

For an in-scope failure, inspect the logs, reproduce when practical, fix it, and run affected checks. Commit/push only within existing authorization, then follow the new head. Do not weaken assertions or raise timeouts without understanding a failure. Feedback that changes scope or requires an unauthorized effect goes back to the delivery owner.

Use a bounded inline wait when a result is likely soon. After an unchanged timeout, make at most one targeted fallback and end that polling attempt. Create or update an automation only when the user has asked for continued monitoring; verify activation and keep it quiet until a meaningful change. Stop it when checks/comments are resolved, the PR closes, or the requested follow-up ends.

Report the PR, exact head, changed check/comment state, any fix, and the pending action if one remains. Green checks do not grant merge authority. Follow the target repository’s execution policy when one is configured. One watcher owns one PR's next poll. Report a material delivery-state change to the existing owner within the authorized workflow.
