# Persistence, durable queues, rate limiting, and event logs

## Pick the guarantee before the module

| Need | Candidate | Questions to resolve |
| --- | --- | --- |
| Simple stored values | `KeyValueStore` | Namespace, encoding, expiry, atomicity, encryption, host adapter |
| Reusable persisted values | `Persistence`, `Persistable`, `PersistedCache` | Schema identity, serialization, expiry, invalidation, tenant key |
| Work surviving process loss | `PersistedQueue` | Acknowledgement, redelivery, leasing, retries, dead letters, storage adapter |
| Distributed request limits | `RateLimiter`, compatible backing store | Key scope, atomicity, expiry, fairness, failure policy |
| Recorded application events | `eventlog` modules | Journal durability, authorization, ordering, replay, projection recovery |

These families are present in the baseline API inventory. Their exact constructors, stability annotations, storage semantics, and supported adapters must be checked in the installed source before assembly. The module name alone is not a delivery guarantee.

## Persistent values

Schema-decode values when reading and encode deliberately when writing. Include namespace, tenant, schema identity where needed, and the complete lookup identity in keys. Avoid ambiguous concatenation; use a structured encoding or a rigorously defined key format.

A cache remains a cache even when backed by a database. Define the source of truth, invalidation strategy, expiry, negative caching, and stale-read tolerance. Test corruption, missing values, incompatible payload shapes, and partial writes. Do not silently replace corrupt durable business state with a default value.

Encrypt sensitive stored data when the threat model requires it; redaction only changes display. Decide who can read, rewrite, export, and delete stored material, including backups. Key rotation and retention are part of the design, not annotations on a schema.

## Durable job processing recipe

Persist an operation envelope containing a stable job ID, authorized tenant/resource identity, payload schema version, and retry metadata. A consumer validates the envelope, checks whether the operation already completed, performs the side effect using an idempotency mechanism, persists the result, and acknowledges according to the queue's contract.

Test the crash windows between side effect and result persistence, and between result persistence and acknowledgement. Expect redelivery unless the actual adapter and protocol prove a stronger guarantee. Do not advertise exactly-once external effects because a queue persists messages.

Bound attempts, age, concurrency, and payload size. Quarantine poison messages with a reason and an operator recovery path. Heartbeats and visibility leases need ownership and renewal; a stalled consumer must not hold work indefinitely. Deleting a job without recording why is not a recovery strategy.

## Rate limiting

Choose the unit: request, user, tenant, API key, provider, or costly operation. Limit both arrival rate and active concurrency where necessary. A process-local limiter cannot enforce an account-wide limit across replicas.

Define behaviour when the limiter's storage is unavailable: fail closed for protection-sensitive actions, or deliberately permit bounded traffic when availability wins. Never let that choice happen accidentally through a blanket error catch. Test burst behaviour, key expiry, shared-store races, clock assumptions, and tenant fairness.

## Event log and journal design

An event is an immutable record of a fact, not a request to trust an external caller. Define event schemas, identity, ordering scope, deduplication key, and authorization. Separate a journal's authoritative history from derived projections and live PubSub notifications.

Replay must not repeat external side effects unintentionally. Projection handlers should be deterministic or explicitly record the non-deterministic input needed for replay. Use checkpoints and transactional writes where the journal/driver supports them. Test rebuilding a projection from scratch and resuming after interruption midway through a batch.

The baseline includes SQL journal/server modules and encrypted/unencrypted event-log variants. Inspect their actual authentication, key handling, and synchronization protocols before adoption. Choosing an “encrypted” module does not settle session authorization, key distribution, data retention, or metadata exposure.

**Do** document the storage and delivery guarantees actually tested. **Don't** equate persistent cache, journal, durable queue, and transactional database.

**Do** test crash recovery with a fresh process and real storage. **Don't** call a same-process restart test proof of durability.

## Official sources

- [Persistence family](https://effect.website/docs/v4/api/effect)
- [PersistedQueue](https://effect.website/docs/v4/api/effect/persistence/PersistedQueue)
- [KeyValueStore](https://effect.website/docs/v4/api/effect/persistence/KeyValueStore)
- [RateLimiter](https://effect.website/docs/v4/api/effect/persistence/RateLimiter)
- [EventLog](https://effect.website/docs/v4/api/effect/eventlog/EventLog)
- [SqlEventJournal](https://effect.website/docs/v4/api/effect/eventlog/SqlEventJournal)
