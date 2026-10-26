# Workflow brief: <name>

## Objective and why a machine

Describe the user/business outcome and the event-driven complexity a machine resolves. Explain why plain Effect composition is insufficient, or choose plain Effect instead.

## Existing context and evidence

Relevant feature/service files, exact installed versions/lockfile, owner/runtime, public protocol, storage source of truth. Separate observed facts from proposed changes.

## Goals and non-goals

State observable outcomes and explicit boundaries. Do not promise a durable system when the implementation is in-memory.

## Model and invariants

List states, commands/facts, context, output, and key invariants. Identify final business outcomes versus actor failure. Attach a transition matrix and concrete success/failure/cancellation scenarios.

## Effect service boundaries

Name narrow services, input/output/error types, declared task/stream sources, and background actions. Identify each required side effect and when completion may be acknowledged.

## Ownership and concurrency

Name the actor owner and lifetime; task/root/application resources; command correlation; latest-wins/queue/parallel policy; admission limits; observer ownership; shutdown behavior.

## Trust and recovery

Authentication/authorization and schema decoding; tenant binding; proposal/revision approval; remote ambiguity/idempotency/compensation; persistence version/restart/wakeup policy when needed.

## Alternatives and trade-offs

Plain Effect, a simpler model, a different owner, and relevant storage designs. Explain consequential choices rather than listing alternatives without a decision.

## Validation and delivery

Pure, Effect-host, type, UI, property, recovery, and end-to-end tests as relevant. Rollout, operational signals, package compatibility checks, and rollback/stop-ingress plan.

## Open decisions and evidence gaps

State unresolved facts, owners, and the test/research needed to resolve them. Do not invent approvals, measurements, or completed tests.
