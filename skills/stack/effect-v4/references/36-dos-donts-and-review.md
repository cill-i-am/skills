# Dos, don’ts, and practical review checklists

## Code and modelling

| Do | Don't | Why |
| --- | --- | --- |
| Use the exact installed v4 declarations | Guess an import or hide drift with a cast | Plausible TypeScript can target a different API |
| Keep pure synchronous calculations direct | Create a service for every helper | Abstraction should buy a meaningful boundary |
| Use `Effect.gen` inline and `Effect.fn` for useful function/span boundaries | Build unreadable nests of combinators or wrapper-only functions | Express sequential work clearly |
| Use `Effect.fnUntraced` where tracing is unnecessary | Produce a span for every tiny hot-path helper | Instrumentation has operational cost |
| Decode unknown external input with its owning Schema | Assert a type onto JSON, storage, or database rows | Static types do not validate bytes |
| Model decoded and encoded types explicitly | Assume a codec is only a predicate | Transformations affect runtime representation |
| Use tagged domain errors for expected failures | Convert every failure to a string or a defect | Callers need a useful recovery contract |
| Preserve meaningful causes internally | Expose raw causes publicly | Diagnostics and disclosure have different needs |

## Services, lifetimes, and concurrency

| Do | Don't | Why |
| --- | --- | --- |
| Compose Layers at intentional roots | Hide a fresh runtime in service methods | Context and ownership must remain composable |
| Reuse the intended Layer value | Assume every separately built graph shares resources | Memoization has a scope and identity |
| Acquire resources with cleanup in the owning scope | Return an open resource from a scope already closed | The type alone cannot rescue wrong lifetime design |
| Bound active work and queued bytes | Use unbounded concurrency for untrusted input | Downstream capacity and memory are finite |
| Use child/scoped fibers with an explicit owner | Detach tasks merely to silence lifecycle problems | Unowned tasks are hard to cancel and observe |
| Propagate cancellation into Promise/callback APIs | Assume rejecting a Promise cancels its source | Foreign systems need a real cancellation mechanism |
| Keep uninterruptible regions narrow | Make a network call uninterruptible by default | Shutdown must not wait forever |
| Use workers for measured CPU parallelism | Treat fiber concurrency as extra CPU threads | They are different execution models |

## Reliability and data

| Do | Don't | Why |
| --- | --- | --- |
| Cap attempts, delays, and total time separately | Assume capped backoff eventually stops | Delay and continuation are separate |
| Retry eligible, replay-safe operations | Retry all mutations after any transport error | A lost response can hide a completed write |
| Put complete identity into cache/batch keys | Share tenant-sensitive results by bare record ID | Context is part of the lookup contract |
| Set failure caching policy explicitly | Assume only successful values are cached | Failures can outlive an outage |
| Keep SQL work in its transaction context | Run a repository Effect in a nested runtime | The transaction may be lost |
| Keep `Effect.tx` bodies repeat-safe | Perform irreversible I/O inside a retryable journal transaction | The body can run again |
| Test external crash windows | Equate durable messages with exactly-once side effects | Persistence alone cannot remove ambiguity |
| Persist entity state deliberately | Assume an active in-memory Ref survives passivation | Addressability is not durable state |

## Security, UI, and agents

| Do | Don't | Why |
| --- | --- | --- |
| Authorize each operation/resource | Treat schema validity as permission | Shape and authority are independent |
| Isolate request/session identity | Capture a caller in a global Layer or SSR registry | Concurrent identities must not mix |
| Encode only permitted public fields | Reuse a complete internal row as every API payload | Field ownership differs by operation |
| Bound tool actions and validate approval state | Trust model text claiming approval or completion | A model cannot grant itself authority |
| Keep secrets out of logs, browser state, and keys | Assume Redacted encrypts or sanitizes everything | Display redaction has limited scope |
| Test unmount, abort, and hydration | Check only the first successful render | Most UI lifetime bugs occur later |

## A focused review pass

Read the changed operation end to end. Identify its untrusted inputs, success and failure contract, service requirements, resource owner, concurrency budget, and execution boundary. Then inspect every foreign call, retry, fork, cache, and transaction in that path.

Ask what happens on invalid input, dependency failure, defect, cancellation, timeout, duplicate request, and shutdown. Add process loss and replay for durable/distributed work. Review which of those scenarios has a meaningful test and which still relies on an assumption.

Do not require a giant checklist for a small pure-function change. Select the checks that match the risk. Conversely, do not let a broad “tests pass” statement replace a missing transaction, cancellation, or tenant-isolation test.

## Delivery checklist

State the installed versions and the files changed. Explain consequential decisions and the actual tests run. Distinguish source review, syntax checks, typechecking, local tests, adapter integration, and deployment evidence. Name any unverified behaviour and its concrete next validation step. Do not invent benchmark results, approvals, or successful deployments.

## Official sources

- [Official Effect coding guidance](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Cache](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Cache.ts)
- [Transactional references](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/TxRef.ts)
- [Activity semantics](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Activity.ts)
- [Entity example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/80_cluster/10_entities.ts)
