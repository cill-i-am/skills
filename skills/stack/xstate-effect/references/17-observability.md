# Logs, traces, inspection, and operational diagnostics

## Observe business meaning as well as runtime mechanics

Define a small public projection for operational use: workflow ID, safe state/tag, revision, current operation ID, elapsed time/deadline, retry count, and a bounded error code. Keep provider credentials, personal data, raw prompt content, file bodies, and actor handles out of logs and UI DTOs. State names should explain the current responsibility, not just say `loading` everywhere.

Use Effect logging/tracing in the services that perform work. The integration adds spans named `fromEffect`, `fromEffectStream`, `fromEffectEventStream`, and `action.<name>`, with actor ID/address attributes. Add application workflow/operation correlation through the application's tracer context, without treating high-cardinality identifiers as unbounded metric labels.

## Inspection protocol

The inspected integration/core generation uses `@xstate.actor` and `@xstate.transition` inspection events. Old inspector examples mentioning other categories are version-sensitive. Event rejection is a separate `deadLetters` stream, not an `@xstate.deadletter` inspection event in this baseline.

Attach observation with `inspect(actor)` and consume the stream under a deliberate scope. Alpha.6 `createEffectActor` does not accept all vanilla inspector constructor options. Some startup activity may predate a late subscriber; document whether you are recording from actor creation or only from observer attachment. Do not call the result a complete event log unless your design actually guarantees one.

Inspection can explain why a command did not produce the expected state: wrong actor, wrong event type/payload, explicit blocking child, unmet branch condition, or already terminal target. It cannot prove that a remote provider rolled back because a local child stopped.

## Notifications are not an audit database

An emitted event can power a toast or update an attached observer. It can be missed if no consumer is running. Required audit trails must be written through a reliable awaited service or transactional intent flow, with retention and access policy. Do not send a notification from a terminal transition and assume a best-effort observer will persist it before shutdown.

For compliance-sensitive actions, record proposal/version, authenticated decision maker, accepted command ID, effect intent, completion/reconciliation, and the source of any correction. These are application requirements; XState inspection alone does not supply them.

## Monitoring design

Track outcomes and rates: starts, normal completions, rejection/expiry, recovery failures, retries exhausted, unexpected actor errors, unhandled commands, rejected delivery, and cleanup failures. Track time spent in states that should not stall. Add alarms for a backlog exceeding a tested capacity or workflows missing their SLA.

Do not emit a metric label for every dynamic actor path, user ID, or raw error. Use bounded labels for machine kind/state/outcome and put IDs in protected trace/log fields. Sample expensive snapshot inspection rather than serializing a full context on every progress tick.

## Hosted inspectors and development tools

The documented hosted inspector examples can transmit machine definitions, events, and snapshots outside the application. Treat enabling them as a data-sharing decision. Use synthetic data, strip secrets, restrict access, and disable production transmission by default. A convenient share URL is not evidence of an approved security boundary.

When diagnosing a bug, capture exact package versions, sanitized event sequence, state before/after, service fake/reproduction, and lifetime owner. Reproduce locally with TestClock and deterministic services before concluding a race belongs to the library.

Sources: [integration tracing](27-source-index.md#effect-testing), [inspection](27-source-index.md#inspection), [observation](27-source-index.md#effect-observation), [releases](27-source-index.md#release-and-source-records).
