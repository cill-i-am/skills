# Schema Contract Enforcement

Use this file when a repository needs to migrate or mechanically enforce Schema ownership, branded domain values, and immediate boundary parsing. This is an advanced repository guardrail, not a default requirement for every Effect project. Use `repository-enforcement.md` for broader Effect architecture rules.

## Classify The Surface First

Require Schema ownership for serializable, persisted, protocol, workflow, configuration, event, command, result, and view-state data.

Keep these as explicit TypeScript contracts when Schema would misrepresent them:

- function-bearing services and runtime capabilities;
- Layers, fibers, Scopes, queues, streams, clients, and platform handles;
- framework callback or component surfaces that are executable rather than data;
- raw provider DTOs that remain private until an adapter decodes or translates them.

Mixed data-plus-callback objects still contain a data contract. Split the data from the capability or give the data portion an owning Schema rather than treating one function member as a blanket exception.

## One Owner, Derived Consumers

Give each independently parseable contract one owning Schema at the lowest stable package boundary that owns its meaning.

- import the owner instead of rebuilding the same property set elsewhere;
- derive TypeScript types from the Schema;
- reuse Schema fields or combinators for related encoded contracts;
- allow projections only when they remain traceable to the owning Schema and do not create a second runtime contract;
- keep boundary translations explicit when authority, encoding, or failure semantics change.

Do not accept a manual interface merely because it is structurally assignable to a Schema-derived type. Structural similarity is not ownership.

## Prefer Branded Domain Values Over Strings

Follow `schema.md` for brand construction and decoding. IDs, paths, URLs, timestamps, digests, Git values, provider handles, commands, models, versions, and other semantic text should use constrained Schema brands when their meaning is narrower than arbitrary prose or interchangeability would be dangerous.

Decode at ingress, carry the branded value inward, and encode deliberately at egress. A helper that accepts and returns `string`, a cast, or a raw-string factory does not establish the invariant.

Keep raw strings for free-form prose, diagnostics, and encoded provider data before decoding. The goal is not to brand every string.

## Require Connected Provenance

The exact raw value must flow into the actual canonical parser, decoder, refinement, or adapter boundary. A safe-looking call elsewhere in the function does not bless unrelated parameters.

```ts
// Rejected: the decoder is unrelated to the value that escapes inward.
const loadRun = (input: string) => {
  Schema.decodeUnknownSync(RunId)("run_example")
  return repository.load(input)
}

// Accepted: this value crosses the real boundary exactly once.
const loadRun = (input: unknown) =>
  Schema.decodeUnknownEffect(RunId)(input).pipe(
    Effect.flatMap((runId) => repository.load(runId)),
  )
```

Do not treat these as provenance:

- a parameter, declaration, method, property, or file name;
- a familiar method such as `map`, `filter`, `make`, or `decode`;
- structural assignability to a Schema-like object;
- an unresolved, counterfeit, or lexically shadowed import;
- an unrelated decoder, parser, Effect call, or safe transform;
- a value that later escapes through assignment, capture, mutation, forwarding, or an unknown call.

Fail closed when the checker cannot prove a load-bearing boundary. Add an explicit adapter or refine the semantic rule rather than broadly trusting a name.

## Choose The Smallest Honest Guardrail

1. Schema constructors, exported types, focused compile-time assertions, and tests for a small codebase.
2. A syntax-aware rule for local declaration shapes and direct boundary calls.
3. A compiler-backed checker when correctness depends on canonical symbols, cross-file aliases, re-exports, generic projections, or the resolved type graph.

Do not create a custom checker until the repository has a clear invariant, a meaningful violation inventory, adversarial fixtures, and an owner willing to maintain it.

## Pair Every Exception With An Adversary

Positive fixtures should prove legitimate use of:

- the actual Schema decoder or parser;
- Schema-derived records and projections;
- constrained branded values;
- function-bearing capabilities;
- private provider or framework adapters;
- closed callbacks whose input comes from an already proven receiver.

Negative fixtures should cover:

- manual serializable DTOs beside an owning Schema;
- semantic raw strings flowing past ingress;
- brand assertions and structural brand spoofs;
- disconnected or unrelated decoder calls;
- counterfeit globals, imports, utilities, and Schema lookalikes;
- lexical shadowing and unresolved symbols;
- arbitrary parameter or method-name laundering;
- mutable, escaping, captured, or forwarded values;
- projections that cannot be traced to the canonical owner.

Keep intentionally malformed inputs unknown or encoded. Test the real decoder's rejection instead of casting invalid data into a branded or Schema-derived type.

## Keep Audits Honest

A migration audit should:

- report deterministic `path:line:column rule message Remedy: ...` diagnostics;
- distinguish actionable violations from reviewed executable or boundary exceptions;
- fail when any actionable finding or checker failure remains;
- exclude generated files through a documented ownership policy;
- clean up disposable configs and temporary output on every exit;
- run from the canonical repository check once the baseline is genuinely clean.

Do not use a diagnostic-count snapshot, hash baseline, broad path suppression, name allowlist, or success-forcing shell fallback. The target is zero actionable violations under a semantic rule, not a frozen count that permits known debt indefinitely.

Broader checks for Promise surfaces, runtime execution, detached fibers, Clock usage, package direction, and host exceptions belong in `repository-enforcement.md` rather than being folded into one oversized Schema checker.
