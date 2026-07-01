---
name: systematic-debugging
description: Root-cause debugging loop for bugs, failing tests, flakes, CI failures, performance regressions, and unexpected behavior. Use before proposing fixes when anything is broken, especially during worker implementation or CI-watch repair.
---

# Systematic Debugging

No fixes without a red-capable feedback loop and a root-cause investigation.
Skip steps only when you explicitly justify why they do not apply.

## Feedback Loop

Find the tightest pass/fail signal for the reported symptom:

1. failing test at the seam that reaches the bug
2. HTTP/scripted call against a running service
3. CLI invocation with a fixture input
4. browser automation asserting DOM, console, or network behavior
5. replayed trace: saved request, event, webhook, payload, or fixture
6. throwaway harness around the smallest runnable subset
7. property, fuzz, or repeated loop for flakes
8. bisection or differential loop when the bug appeared between known states

The loop should be red-capable, deterministic enough to trust, fast enough to
iterate, and runnable by the agent.

## Workflow

1. Reproduce the exact symptom and confirm it matches the user's report.
2. Minimize the reproduction until every remaining input, step, or dependency is load-bearing.
3. List 3-5 ranked, falsifiable hypotheses.
4. Add targeted probes that distinguish the hypotheses. Avoid broad "log everything" debugging.
5. Write or identify the regression test before the fix when a correct seam exists.
6. Apply the root-cause fix, then rerun the minimized repro and the original loop.
7. Remove temporary diagnostics, harnesses, and debug code before finishing.

Use a unique marker such as `[DEBUG-a4f2]` for temporary diagnostics so cleanup is
a single search.

## Guardrails

- Do not patch symptoms while the causal path is unknown.
- Do not widen scope while debugging a worker issue; create a concrete follow-up
  when the root cause reveals separate work.
- If a proper regression seam does not exist, say that plainly and verify with
  the strongest available loop instead of pretending a shallow test proves the fix.
- For provider, production data, destructive, or credential-dependent debugging,
  confirm stage, permissions, and safety before mutating anything.

## Finish

Report:

- reproduction command or loop
- root cause
- fix summary
- verification command/results
- any missing test seam or follow-up issue
