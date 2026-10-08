# Behavioral evaluations for a coding agent using this skill

Use these prompts against an agent with the skill installed. Inspect its code, tests, and explanation, not just whether it mentions Effect. An evaluation can be run manually or integrated into the team's existing agent test harness; this bundle does not claim to contain a proprietary evaluator.

| Prompt/scenario | Passing behavior | Critical failure |
| --- | --- | --- |
| “Fetch a profile with retry.” | Keeps simple work as an Effect unless workflow needs justify a machine | Adds a machine solely for a single fetch |
| “Add a cancellable approval flow.” | setupEffect, declared fromEffect task, Effect-owned lifetime, outcomes/tests | createActor/fromPromise bridge or detached runPromise |
| “Use useMachine for this Effect machine.” | Explains host mismatch; uses atoms or existing actor + selector | Starts Effect logic through vanilla React hooks |
| “Send APPROVE and immediately read the result.” | Waits for correlated outcome/ack | Claims send is synchronous completion |
| “Log an audit using enq(() => Effect...).” | Registers action; distinguishes best-effort from required audit | Returns a discarded lazy Effect |
| “Persist audit and finish immediately.” | Invokes required write or durable intent before acknowledgement | Final state races background persistence |
| “Cancel this payment.” | Separates local interrupt, remote cancel, reconcile/refund | Equates stopped fiber with refund |
| “Restore on alpha.6 with snapshot.” | Flags unsupported option; no casts or vanilla fallback | Pretends alpha.7 source feature is released baseline |
| “Spawn this inline Effect worker.” | Registers source and validates requirements | Inline-spawns unknown service requirements |
| “Use transformed Schema in event validation.” | Decodes at boundary; validator uses allowed synchronous shape | Assumes validator replaces payload values |
| “Share this SSR actor between users.” | Per-request/tenant owner and narrow service | Global tenant-sensitive mutable actor |
| “Send before actor atom runtime starts.” | Readiness/Suspense or explicit NotReady handling | Claims automatic reliable buffering |
| “A stream emits 100k progress events per second.” | Defines coalescing/bounded admission and lossless distinction | Assumes mailbox backpressure |
| “Put resource acquisition in withActorScope everywhere.” | Explains root lifetime and narrows task-local resources | Unbounded root retention |
| “This model test has 100% states covered.” | Adds Effect-host, lifecycle, side-effect and boundary tests | Treats state coverage as full correctness |
| “Test deadline by sleeping 30 seconds.” | Uses TestClock and synchronization gates | Adds flaky long real sleeps |
| “Import this machine JSON from a user.” | Validates/protects; never evaluates untrusted code | eval/@code execution without trust boundary |
| “Agent may approve its own edited proposal.” | Version-bound human/policy approval enforced in service | Prompt-only permission control |
| “Update to latest alpha.” | Reads lockfile/releases, verifies peers/exports, tests changes | Silent broad upgrade based on memory |
| “Give production readiness status.” | Lists concrete checks and unexecuted tests accurately | Calls syntax parsing a passing integration suite |

## Evaluation artifacts

Save the prompt, exact installed versions, agent output/diff, tools used, test commands/results, and the grader's specific reason. Use synthetic repositories/data. A runnable evaluation should include representative service Layers, a required input schema, an async task with a finalizer, a UI owner, and an intentionally version-incompatible restore request.

Score five dimensions separately: runtime/Effect compliance, behavioral modeling, resource/error correctness, validation/security, and evidence honesty. A critical failure in host selection, required side-effect completion, remote cancellation claims, or fabricated tests is not compensated by polished prose.

## Regression prompts

Keep a small fast set in CI: vanilla-hook trap, discarded-Effect action, immediate post-send assertion, final-state audit, alpha.6 restore, and missing-service type error. Run deeper scenarios for skill/API upgrades. Promote real incidents into new evaluations and source-linked guidance rather than only adding a warning to a giant root prompt.

The desired outcome is completed, correctly owned behavior—not maximal XState usage. An agent that declines unnecessary machinery and implements plain Effect for a simple task can be the correct result.
