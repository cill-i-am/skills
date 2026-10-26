# Glossary and concept distinctions

| Term | Meaning in this skill |
| --- | --- |
| Effect | A description of computation with success `A`, expected failure `E`, and service requirements `R` |
| Laziness | The described work runs when interpreted, not merely when a description is constructed; eager JavaScript arguments can still execute early |
| Requirement | A service needed by an Effect; tracked in `R`, not an automatically available global |
| Service | A capability identified in Context and implemented by a value |
| Context | A collection of service implementations and references available to execution |
| Layer | A description of constructing services, including dependencies, failures, and resource lifetime |
| Memoization | Sharing a Layer construction within the relevant memoization boundary, not a universal process-wide singleton |
| Scope | An owner for finalizers and scoped resources |
| Fiber | A lightweight Effect execution with structured concurrency and interruption semantics; not an operating-system thread |
| Interruption | A request to stop a fiber cooperatively and run appropriate cleanup |
| Defect | An unexpected failure outside the typed expected-error contract |
| Cause | Structured failure information, including typed failures, defects, and interruption |
| Exit | The completed success or failure outcome of an Effect |
| Result | A success/failure value useful when both cases should be handled as data |
| Option | A value that is present or absent without implying an exceptional failure |
| Decode | Validate/transform an external representation into the domain representation |
| Encode | Validate/transform a domain value into its external representation |
| Codec | A schema with a relationship between encoded and decoded values, potentially requiring services |
| Brand | A distinct static identity for a value; meaningful runtime validity still needs appropriate construction/decoding |
| Queue | A coordination structure where each offered item is taken by a consumer; not automatically a durable broker |
| PubSub | A broadcast coordination structure for current subscriptions, not automatically a replayable journal |
| Deferred | A one-shot asynchronous completion point; in-memory unless using an explicitly durable facility |
| Semaphore | A limit on concurrent access; local unless a distributed implementation supplies stronger scope |
| Stream | An effectful sequence consumed incrementally with error, requirement, and resource semantics |
| Sink | A stream consumer/reduction that may leave unconsumed input |
| Channel | A lower-level composition boundary for stream-like processing and encoding |
| Backpressure | Slowing or suspending production when consumption cannot keep up; different from dropping/sliding data |
| Schedule | A policy for timing and continuation of retry/repeat work, not inherently a durable scheduler |
| Cache | A bounded reuse mechanism whose key, lifetime, failure policy, and invalidation must be designed |
| Request resolver | A facility for combining/resolving typed external requests, with batching and optional caching |
| In-memory transaction | Coordinated Tx* state changes under `Effect.tx`; not a SQL or distributed transaction |
| Database transaction | Atomicity/isolation supplied by a database connection/driver; does not include arbitrary external side effects |
| Idempotency | Repeating the same logical operation has the intended single-operation effect under a defined identity and storage protocol |
| Durable workflow | A schema-defined process executed by an engine with explicitly configured durable execution/storage semantics |
| Activity | A named workflow effect whose completed result can be persisted and replayed by the engine |
| Compensation | A business operation attempting to counter a previous action; not guaranteed rollback |
| Entity | An addressed cluster execution/lifecycle boundary; its in-memory state is not automatically persisted |
| Passivation | Stopping an idle entity so it can be recreated later |
| Atom | A reactive state description evaluated and owned by an AtomRegistry |
| AsyncResult | Reactive state representing asynchronous computation rather than merely its final value |
| Composition root | A boundary that chooses concrete implementations and supplies application dependencies |
| Host boundary | Where non-Effect code or a platform invokes an Effect program and owns its lifecycle |
| Source-reviewed | Compared with identified official source; not proof of successful compilation or execution |
| Integration-tested | Exercised against the real selected adapter/environment for specified behaviours |

## Common category errors

A schema is not authorization. A type is not runtime validation. A fiber is not a worker thread. A scope is not durable storage. A cache is not a system of record. A persisted message is not persisted entity state. A timeout is not rollback. A retry delay cap is not an attempt limit. A generated client is not deployment compatibility. A successful model response is not proof that an external action occurred.

## Official sources

- [Official v4 guide](https://effect.website/docs/v4/getting-started)
- [Effect](https://effect.website/docs/v4/api/effect/Effect)
- [Layer](https://effect.website/docs/v4/api/effect/Layer)
- [Workflow](https://effect.website/docs/v4/api/effect/workflow/Workflow)
- [Atom](https://effect.website/docs/v4/api/effect/reactivity/Atom)
