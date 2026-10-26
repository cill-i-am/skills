# Graph exploration, property testing, and replay

## What model-based tests add

Example-based tests verify scenarios you wrote down. Model-based exploration can find a path you forgot: editing after failure, cancelling after a partial completion, or resuming history after a prerequisite changes. The model is still authored by you; reaching every state in a wrong model does not prove the product correct.

Core v6 `xstate/graph` exposes path helpers such as `getShortestPaths`, `getSimplePaths`, and `getPathsFromEvents`. The newer `@xstate/test` docs describe property tests, path execution, replay, and coverage. Pin and inspect the installed testing package exports/peers before using that surface. A documentation page being current does not make an unqualified npm install compatible with the audited adapter baseline.

## Bound the state space

Context values can make a finite-looking chart effectively infinite: counters, timestamps, arbitrary search strings, generated IDs, retry loops, and dynamic child collections all expand it. Choose finite representative inputs and explicit exploration limits. Define equivalence carefully: collapsing all revisions can hide stale-write bugs, while distinguishing every timestamp makes useful coverage impossible.

Generate invalid and boundary payloads deliberately as separate boundary tests. Generated type-correct commands do not test authentication, schema rejection, oversized input, or network delivery semantics. Include operation IDs in tests where correlation matters, but choose a small finite set.

## Run paths through the right host

Pure path generation does not execute service effects. For each path, instantiate the real machine using `createEffectActor` within a fresh scope, supply deterministic fake services, send the step event, and await the expected observable outcome. Do not use a test library's default live execution mode unless its host is explicitly compatible with the integration.

```text
for each generated path:
  create a fresh Effect scope and controlled service fakes
  createEffectActor(machine, input)
  for each step:
    release any prerequisite fake-service gate
    send the event
    await the expected state/revision or acknowledgement
    assert domain invariants and public projection
  close scope and assert cleanup
```

This is algorithmic pseudocode, not a claim about a specific `@xstate/test` function signature. Use a custom executor when needed rather than dropping the Effect host. A pure model can inject task outcomes for exploration, but those injected outcomes do not prove the real invocation's cancellation or finalization behavior.

## Invariants worth checking

A publish never runs without approval for the current revision. A cancelled local operation never transitions back to success from a stale callback. At most one write for a document revision is authoritative. A failed validation does not discard the user's recoverable draft. A completed actor has no active state-owned subscription. A compensation failure remains visible rather than becoming normal success.

Check invariants after every step, not just at final states. Also test forbidden-event behavior: ignored, rejected, escalated, and explicitly acknowledged are different contracts. An invariant based only on `snapshot.value` may miss an incorrect external side effect; include fake-service call history.

## Reproducible failures

Persist the failing seed, event sequence, inputs, relevant fake outcomes, and exact versions. Replay must not use wall-clock randomness or real network services. Shrink counterexamples to a minimal sequence, then promote important ones into a focused regression test with a human-readable name. Keep private payloads out of CI artifacts.

Coverage should distinguish state coverage, transition coverage, branch/guard coverage, generated input coverage, and lifecycle/side-effect coverage. “100% states reached” says nothing about cancellation races, remote idempotency, or SSR registry leaks. Combine the graph suite with the integration suite in [testing](15-testing.md).

Sources: [v6 model-based testing and graph](27-source-index.md#model-testing), [Effect testing host](27-source-index.md#effect-testing). Execution strategy and invariants are recommended test design.
