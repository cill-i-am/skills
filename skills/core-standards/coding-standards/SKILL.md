---
name: coding-standards
description: Apply TypeScript conventions for domain models, boundaries, errors, and module design.
---

# TypeScript Conventions

Keep domain invariants, data ownership, and expected failures explicit. Parse serialized/untrusted inputs at their owning boundary and pass the refined result inward. Preserve the repository's accepted architecture and real compatibility/data contracts. Improve the changed path within scope; do not invent migrations or compatibility machinery for hypothetical consumers.

Prefer direct feature-local code and small intentional interfaces. Abstractions earn their place by owning policy, hiding complexity, translating a real boundary, or supporting a real caller. Pure synchronous work can remain ordinary functions. In an Effect-based backend, keep effectful workflows within its established runtime ownership.

Use topic references when a concrete question needs detail. They describe design defaults, not a requirement to audit every concern or reproduce every example. Root instructions and accepted decisions govern scope and authority. Do not turn a pattern preference into an approval gate.

| Question                                     | Reference                                       |
| -------------------------------------------- | ----------------------------------------------- |
| Domain invariants, brands, state transitions | [Domain modeling](DOMAIN_MODELING.md)           |
| Parsing, serialization, DTOs                 | [Boundaries](BOUNDARIES_AND_PARSING.md)         |
| Data/cache/state ownership                   | [Data flow](DATA_FLOW_AND_STATE.md)             |
| Expected failures and defects                | [Errors](ERROR_HANDLING.md)                     |
| Secret-safe logging and tracing              | [Observability](OBSERVABILITY.md)               |
| Feature boundaries and public exports        | [Feature slices](FEATURE_SLICE_ARCHITECTURE.md) |
| Dependencies, interfaces, adapters           | [Modules](DESIGNING_MODULES.md)                 |
| Cancellation, transactions, retries          | [Async workflows](ASYNC_AND_WORKFLOWS.md)       |
| Meaningful tests and runtime evidence        | [Testing](TESTING_AND_VERIFICATION.md)          |
| Type escape hatches and public contracts     | [TypeScript](TYPESCRIPT_CONTRACTS.md)           |
| Workers, Durable Objects, storage, queues    | [Cloudflare](CLOUDFLARE_ARCHITECTURE.md)        |
| Effect integration                           | [Effect conventions](EFFECT.md)                 |
| Meaning of a standard's term                 | [Vocabulary](VOCABULARY.md)                     |
