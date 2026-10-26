# Troubleshooting by symptom

| Symptom | First checks | Likely correction |
| --- | --- | --- |
| Effect host missing | `createActor`, `useMachine`, `useActorRef` starting logic | Start with `createEffectActor` / actor atoms |
| Action appears not to run | Effect returned from an arbitrary callback | Register action in `setupEffect`, enqueue declared action |
| Service requirement missing | Wrong Layer boundary, hidden inline spawn, override | Register actor, provide required service to owner |
| State still old after send | Immediate `getSnapshot` read | Await state/revision or acknowledgement |
| Success waiter hangs | Machine is active in failed/declined state | Observe outcome set, bound wait, surface failure |
| Atom send fails on first click | Runtime not ready | Render after readiness/Suspense |
| Workflow restarts on rerender | Atom/runtime constructed in render | Stable owner and input identity |
| Upload cancels on navigation | Route provider owns actor | Move owner to intended feature/application lifetime |
| Resource leaks after completion | Root-scoped acquisition, untracked spawned listener | Narrow acquisition scope; stop listener; test cleanup |
| Unexpected late root error | Background action failed after transition | Handle action failure locally or invoke critical work |
| Deadline test hangs | Wrong clock or timer not installed | TestClock layer, producer gate, real runner watchdog |
| Deadline unexpectedly resets | Self-transition re-enters state | Use targetless update or absolute deadline |
| Duplicate remote operation | Retry/restart with new key or ambiguous timeout | Stable idempotency and reconciliation |
| Notification absent | Lazy/late emitted consumer | Attach before send or expose current/durable outcome |
| Invalid event not in dead letters | It was delivered but unhandled | Inspect active transitions/command acknowledgement |
| Child reconnects on every step | Subscription invoked on each leaf | Move invocation to enclosing connected state |
| Inferred context becomes awkward | Shared flags, missing state schemas, merge assumptions | Model typestate and explicit schema contracts |
| Restore option rejected | alpha.6 has no snapshot option | Upgrade only after verification or document limitation |
| CI passes graph tests but runtime fails | Pure tests did not execute Effect host | Add service/lifetime integration tests |

## A disciplined debugging sequence

First record exact installed versions, failing input, initial state, owner, and the smallest event sequence. Check the public package declarations rather than adapting an example until TypeScript stops complaining. Run the same sequence with deterministic local services and a TestClock. Remove the UI/transport only after recording their ordering/correlation behavior.

Observe the actor's status as well as its state value. An active machine waiting for RETRY, a normally completed rejected workflow, a stopped actor, and an errored actor are different. Inspect `join`, snapshots, and typed task failures accordingly. Do not swallow unknown errors just to keep a subscription alive.

For missing effects, inspect named-action registration and runtime ownership first. For duplicated effects, inspect repeated actor construction, re-entry, Strict Mode/provider remount, retries, and restore behavior. For stale data, inspect request/revision correlation and remote acceptance after local cancellation. For leaks, count active child/listener actors and inspect scope finalizers.

## Reduce without changing the bug

Keep the Effect host in the reproduction. Replacing the failing actor with vanilla `createActor` changes services, clocking, and ownership. Keep the same package versions and event sequence. Replace external services with controlled fakes that preserve their timing/failure/cancellation contract, not always-immediate `Effect.succeed` calls that erase the race.

A useful reproduction contains the machine, service interfaces, owner/runtime, command sequence, expected invariant, observed result, and cleanup assertions. For an upstream report, sanitize identifiers/data and include the exact release tag. Do not submit a speculative claim that an alpha API guarantees behavior not documented or tested.

## Triage documentation contradictions

When website, release source, and installed declarations disagree, prefer the installed contract for code and record the discrepancy. Do not conceal it with `any`. The context merge and alpha.7 restore distinctions in this bundle are examples of facts that need version-specific tests. Preserve tests as upgrade tripwires once resolved.

Sources: [version contract](00-version-contract.md), [observation](10-observation-errors.md), [lifetime](05-actor-lifecycle-services.md), [UI](11-react-and-atoms.md), [testing](15-testing.md).
