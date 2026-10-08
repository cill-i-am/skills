# Forms, wizards, search, and interaction design

## Keep form data and workflow control distinct

A form library can own field registration, formatting, dirty/touched flags, and local validation presentation. Effect Schema can own boundary parsing and domain constraints. The machine owns the interaction lifecycle: which step is available, whether a submission is in flight, whether confirmation is needed, and what cancellation means. Do not put a separate actor around every input simply because a machine exists for the flow.

Avoid a dual source of truth. Choose where draft data lives and define synchronization events at explicit boundaries. For a small wizard, machine context may contain the draft. For a large form, retain the form library's data and send a validated snapshot/revision on NEXT or SUBMIT. A stale submission must not silently overwrite edits made while the request was running.

## A robust form state model

Use states such as `editing`, `validating`, `submitting`, `saved`, `recoverableFailure`, and `conflict`. Synchronous checks belong in pure transition branching or boundary validation. Remote uniqueness/eligibility checks are Effects invoked from an explicit state. A guard cannot await a network request.

Represent field errors as bounded serializable data, not raw SDK errors. Clear obsolete errors on relevant edits. Decide whether submission failure preserves the draft, whether navigation requires confirmation, and whether saving makes the form terminal or returns to an editable saved state. Terminal final states cannot accept later edit events without a new actor.

## Wizards and dependent fields

Use nested states for a sequence with common cancellation, and history only when resuming the previous substep is correct. A default history target is required in v6. Deep history can restore a now-invalid step after a prerequisite changes; validate prerequisites before resuming. Reset dependent answers when an earlier answer changes, and test that hidden values cannot bypass validation.

Store stable domain identifiers, not UI component instances, in context. Keep URL navigation as a projection/command boundary rather than assuming the URL authorizes a state change. Route-state transitions are a capability, not permission. Direct links must be checked against persisted facts and server-side eligibility.

## Search and autosave

For search, debounce input, cancel the obsolete invocation, correlate independent callbacks, and render empty-query, waiting, loading, empty-result, success, and failure distinctly. The [search implementation](../examples/src/search.ts) illustrates state-owned debouncing with Effect services.

For autosave, latest-wins cancellation alone is insufficient for a server write. Use document revisions, conditional writes, and a clear queue/coalescing policy. An older request can be accepted remotely even after local interruption. Report conflict rather than silently choosing the last arriving response. Consider one in-flight save plus one coalesced pending revision instead of unconstrained concurrent writes.

## Optimistic UI

Model the optimistic change, authoritative acknowledgement, rejection, and reconciliation separately. Record the previous revision or an operation capable of reversal, not a vague `isOptimistic` flag. Undo may be a compensating command after the server accepted a change; it is not always local state restoration. Do not claim eventual success while a retry budget is exhausted.

## Accessibility and resilience

Use states/tags to derive visible status and available commands. Announce meaningful progress through a status region; avoid flooding screen readers with every stream tick. Move focus after an intentional step transition, not every context update. Preserve keyboard access to cancellation and error recovery. Do not use color alone for success/failure states.

Define behavior for double-clicks, enter-key resubmission, navigation during work, browser offline/online, reconnect, page refresh, and multiple tabs editing the same entity. Client machines improve interaction correctness but never replace server validation or authorization. Add end-to-end tests around the real UI ownership, not only pure state transitions.

Sources: [state model semantics](27-source-index.md#statecharts), [UI integration](27-source-index.md#effect-atoms), [Effect tasks](27-source-index.md#effect-logic). UX patterns here are recommended designs, not built-in form-framework features.
