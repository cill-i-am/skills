# Effect v4 evaluation and review plan

## Status

The [Effect v4 skill](../skills/stack/effect-v4/SKILL.md) contains 33 TypeScript
examples, three authored Node test suites, and 30 authored
[evaluation scenarios](../skills/stack/effect-v4/evals/scenarios.json). The agent
benchmark runner, coding-task fixtures, independent graders, and measured results
are not implemented or executed. Read the
[verification record](../skills/stack/effect-v4/VERIFICATION.md) for actual checks.

This document records proposed work, not additional completed features. The skill
remains v4-only; there is no previous-major migration material.

## First gate: verify the package

Run from the repository root with dependency access:

```sh
pnpm test
python3 skills/stack/effect-v4/scripts/verify-package.py
cd skills/stack/effect-v4/examples
npm install
npm run check
npm test
```

Review and commit the real generated lockfile, then use `npm ci` for repeat runs.
The fixture declares Effect 4.0.2 and TypeScript 7.0.2. Inspect matching source when
a check fails; do not suppress types, disable tests, or invent a passing result.
Run the repository's clean skill-install smoke test separately.

## Three conditions, not just with and without

Compare no Effect skill, the previous repository skill at
`5f0444701d83f8b30aa6f18b58c72273cd63f49d`, and the new skill at its reviewed commit.
Retrieve the old condition from Git history only; do not keep a second active
Effect skill in the maintained bundle. Comparing only new versus none does not
establish an improvement over the old skill.

A proposed pilot is ten tasks × three conditions × three attempts = 90 runs.
This is a pilot, not conclusive evidence for small differences. Keep unseen
holdout tasks for evaluating changes made after studying the initial failures.
No paid model runs or production operations are authorized by this document.

## Representative tasks

Use neutral task prompts that require diagnosing or implementing real code,
not only prompts that explicitly propose an obviously unsafe approach.

| Fixture | Independent checks |
| --- | --- |
| Foreign API cancellation | Work starts lazily; cancellation reaches the source; cleanup finishes |
| Request identity | Concurrent callers cannot share credentials or private state |
| Streaming lifetime | Full consumption, early stop, and failure release resources correctly |
| Import pipeline | Bounded concurrency and buffering; blocked work remains cancellable |
| Retry budget | Eligibility, exact attempts, delay bounds, total deadline and cleanup |
| Ambiguous mutation | Stable operation identity and reconciliation prevent blind duplication |
| Tenant-aware cache | Same record IDs cannot leak across tenants; failure TTL is intentional |
| SQL transactions | Every participating write rolls back against the real selected adapter |
| Virtual-time tests | Correct clock control and handshakes; exact failure and finalizer assertions |
| Durable approval workflow | Fresh-process restart and duplicate callbacks preserve authorization and idempotency |

## Execution and grading

Fix model/version, reasoning effort, permissions, dependency versions, initial
code, documentation access, and execution budget across conditions. Use fresh
workspaces, conversations, and isolated agent configuration homes. Ensure the
no-skill condition cannot find a global or ancestor-directory copy.

Install only operational skill material in the evaluated workspace. Withhold
`evals/`, this document, expected answers, and hidden tests. Keep independent
graders outside the writable workspace and run them after the agent finishes.
Do not expose the complete skill repository elsewhere in the same environment.

Record successful skill/reference reads as diagnostic selection evidence, not a
passing outcome. Test natural selection separately from explicit `$effect-v4`
invocation. Save tool events, code diffs, command output, elapsed time, and usage.

Compiler checks and runtime assertions decide correctness. Detect changed
lockfiles, weakened schemas, disabled tests, and type suppressions. Compare
claimed verification with actual commands. Use blinded human or separate-model
review for maintainability, not as a substitute for executable checks.

Tenant leakage, unauthorized actions, disabled checks, and invented verification
claims are hard failures reported separately from average task scores. Report
per-task outcomes and variability, token/time cost, and infrastructure failures.
A runner crash is not evidence for either condition's quality.

## Review backlog from the critical assessment

These are pending improvements, not changes claimed by this PR:

- Compile and execute the examples; strengthen timeout, error-variant and cleanup assertions.
- Recover useful depth in nested transactions, post-commit ordering, foreign callback context, and stateful test-control services, validating every example against the selected v4 packages.
- Add substantial tested monorepo and Drizzle integration slices rather than only small illustrative snippets.
- Evaluate a shorter entrypoint without discarding the reference library.
- Implement the isolated runner, fixtures, independent graders and three-condition benchmark before claiming materially better agent performance.

A complete benchmark deliverable needs pinned runner configuration, reproducible
fixtures, independent graders, real result artifacts, and a report separating
observations from interpretation. This PR provides the skill and starting plan.
