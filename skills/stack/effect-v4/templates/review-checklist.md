# Effect change review

Use only the sections relevant to the change.

## Contract and trust

- [ ] The exact installed v4 packages and API signatures are known.
- [ ] Unknown inputs are decoded; public output has a deliberate encoding.
- [ ] Expected failures, defects, and interruption remain distinguishable.
- [ ] Identity and authorization are established independently from Schema validity.

## Ownership and reliability

- [ ] Resource, runtime, subscription, and fiber lifetimes have explicit owners.
- [ ] Cancellation reaches the real foreign API, and cleanup is awaited.
- [ ] Concurrency, queue/buffer size, retries, and total operation time are bounded.
- [ ] Cache/batch keys include all identity affecting the result.
- [ ] Transactions retain their context; retries and replay are safe for side effects.
- [ ] Durable claims match the actual engine, storage, and crash tests.

## Evidence

- [ ] Changed code was typechecked against the identified dependencies.
- [ ] Failure and lifecycle paths have relevant tests, not only the happy path.
- [ ] Adapter/deployment behaviour was tested where a fake cannot prove it.
- [ ] Logs, traces, and serialized state avoid leaking secrets or private data.
- [ ] Delivery distinguishes completed checks from remaining validation.
