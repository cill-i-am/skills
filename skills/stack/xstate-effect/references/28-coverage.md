# Coverage map and deliberate boundaries

This matrix maps the requested documentation surface to usable references. “Example” means source is included, not that it was executed during the build. “Guide” means substantive guidance/snippets; “gated” means version/capability checks are required. See [VALIDATION](../VALIDATION.md) for actual checks.

| Topic | Location | Evidence/artifact level |
| --- | --- | --- |
| When to choose XState versus plain Effect | 01, 02 | Decision guide and workflow template |
| Installation, versions, alpha risks | 00, 25 | Exact reference manifests; release/source distinctions |
| Machine structure and input/output | 02, 04, 26 | Approval example |
| Context, immutable updates, schema contracts | 03, 04 | Approval/search; documentation discrepancy recorded |
| Events, guards, transition functions | 03 | v6 snippets; pure transition test |
| Targetless/self/re-entry, hierarchy and blocking | 03, 20 | Search and statechart examples |
| Wildcards and payload matches | 03, 07 | Guide; exact matching restrictions |
| Named/background actions and errors | 03, 10 | Background-actions example |
| Internal events and enqueue operations | 03, 04, 09 | Guide; trust and timing restrictions |
| Effect runtime, Layers, service inference | 05 | Actor-service example; negative type assertion |
| Scope/finalizer ownership | 05, 06, 08 | Resource example and cancellation/cleanup test sources |
| Task actors, typed failures | 06, 10 | Approval/task failure test sources |
| Latest-value and parent-event streams | 06 | Streams example and test sources |
| Invoke versus spawn | 07 | Guide, composition example, and registered-spawn fragment |
| Child events, listeners, system registry | 07 | Lifetime/correlation guide |
| Parallel work and cancellation policy | 08, 20 | Parallel prerequisites example |
| Retry, backoff, supervisor restart | 08, 15 | Task retry source; fresh-scope supervision guide |
| Delays, state/task/waiter timeouts | 09 | Deadline and debounce TestClock test sources |
| Output, snapshots, waitFor, join | 10, 26 | Example project uses integration observation |
| Emitted events, dead letters, inspection | 07, 10, 17 | Protocol/observability guide |
| React and Effect atoms | 11 | Optional component and exact binding manifest |
| Registry lifetime, selectors, readiness, SSR | 11 | Guide; UI errors/ownership checklist |
| Forms, wizard, autosave, optimistic UI | 12, 22 | Recipes and design trade-offs; search source |
| Human approval and agent tools | 13, 18, 22 | Local approval/protocol source; production boundaries |
| Backend services and multiple surfaces | 13 | Command/read-model and ownership design |
| Persistence versus serialization | 14, 21 | Detailed capability distinction |
| Snapshot restoration | 14 | alpha.7 source-preview isolated; not baseline feature |
| Recovery, idempotency, outbox, ownership fencing | 14 | Architecture guide; not implemented storage subsystem |
| Unit/integration/type/UI/recovery tests | 15 | Fourteen test cases plus negative type file; UI/recovery guidance |
| Graph/property/path/replay/coverage testing | 16 | Host-aware strategy; optional APIs version-gated |
| Tracing, logging, inspector privacy | 17 | Library contracts plus recommended operations |
| Tenant security and validation | 18 | Schema/policy facade; production limitations explicit |
| Memory, mailbox, capacity, scaling | 19 | Source-based mailbox caveat and capacity design |
| History, choice, state input, route states | 20 | Guide/snippets, version-specific semantics |
| Tags, metadata, per-state matching | 04, 20 | Exhaustive matching example |
| Stately tooling, SCXML, definition import | 21 | Constrained interoperability/security guide |
| Other frameworks/stores/FSM/actor logic | 21 | Explicit alternatives mapping, not alternate runtime defaults |
| Dos/don'ts and diagnosis | 23, 24 | Review table and symptom-based guide |
| Repository conventions and CI | 25 | Audit script, templates, run instructions |
| Public integration surface | 26 | Released root export inventory and atom members |
| Provenance and refresh policy | 27 | Primary-source index and frozen source commit |
| Agent behavior/regression evaluation | 29 | Pass/fail scenarios and scorecard |
| Implementation review | 30 | Acceptance checklist |

## What is intentionally not included

No Effect 3 tutorial or migration chapter. No vanilla actor runtime as an alternative default. No invented `xstate-effect` community package or Promise bridge advertised as the official integration. No duplicated generic Effect reference covering unrelated SQL/HTTP libraries. No full copy of all external docs. No fake lockfile, fabricated test run, or claim that a source branch proves npm availability.

The bundle does not implement every recipe end-to-end, because payment systems, authentication, durable storage, provider integrations, and UI deployment require application-specific contracts. It does provide the state-model/service/lifetime/validation/testing decisions needed to implement them responsibly. Extend examples only after validating the actual installed API.
