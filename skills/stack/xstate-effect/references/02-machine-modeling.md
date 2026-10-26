# Model behavior before writing configuration

## Start with invariants and outcomes

Write concrete scenarios, including the unhappy paths. For a review workflow: an unapproved item cannot publish; cancellation while publishing interrupts local work but may require remote reconciliation; a failed publish allows an explicit retry; expiry before approval cannot publish; duplicate approval cannot start two operations.

Describe terminal **business outcomes** separately from actor runtime status. A rejected review can be a successful actor completion with a domain result. `status: 'error'` means the actor itself failed, not simply that the business declined a request.

## States, context, events, and output

A state expresses a phase with different permitted behavior, owned work, or timeout rules. Context contains supporting data. An event communicates something that happened or a requested command. Output is the final result of the actor, not a continuously updated view.

Good phase names include `editing`, `validating`, `awaitingApproval`, `publishing`, `reconciling`, and `published`. Avoid one `active` state whose transitions inspect a dozen boolean flags. Conversely, do not create separate states for every string value or validation message.

Events should carry the information needed to process them and correlate outcomes. Prefer `APPROVE { reviewerId, commandId }` to `SET_STATUS { status: 'approved' }`. The former preserves the machine's authority over transitions. IDs supplied by clients are data, not proof of authorization.

## Transition inventory

| Current phase | Event/outcome | Next phase | Work and invariant |
| --- | --- | --- | --- |
| Editing | SUBMIT valid draft | Validating | Run asynchronous validation, if needed |
| Validating | Validation success | Awaiting approval | No publish yet |
| Awaiting approval | Authorized APPROVE | Publishing | Invoke one idempotent publish operation |
| Awaiting approval | Deadline | Expired | Do not publish |
| Publishing | Task success | Published | Store durable receipt/identifier |
| Publishing | Task failure | Failed or reconciling | Classify definite vs ambiguous failure |
| Publishing | CANCEL | Cancelling/reconciling | Local interruption is not remote rollback |
| Failed | RETRY | Publishing | Reuse or renew operation identity according to policy |

Use [the test matrix template](../templates/transition-test-matrix.md) to turn this into assertions. A table is a modeling tool, not a substitute for the machine.

## Choose topology deliberately

Use a parent state to share cancellation and keep an invocation alive across several child steps. Use parallel regions for genuinely independent dimensions, not merely to run two async calls. Use invoked child machines for reusable subflows with a clear input/output boundary. Use spawned children for a dynamic population whose lifetime is not bound to one state entry.

Prefer a machine per independently owned workflow. Do not make one global mega-machine contain every user and feature. Likewise, do not split each trivial state into an actor: every actor adds lifetime, communication, failure, and observation responsibilities.

## Model uncertainty

“Request timed out” does not mean “remote write failed.” For operations with irreversible consequences, represent `reconciling` or an explicit unknown outcome. Query by operation ID, retry an idempotent endpoint, or ask an operator. Do not optimistically return to a state that invites an unsafe duplicate write.

## Model evolution

Document why a state exists and what must remain invariant when it changes. Prefer named actor sources and stable machine/state IDs when snapshots or external tooling depend on them. Renaming a state can be a persistence compatibility change. A machine's display label and durable identifier should not be conflated.

Sources: [core reference](27-source-index.md#core-reference), [statecharts](27-source-index.md#statecharts). The scenario and transition inventory are original design examples.
