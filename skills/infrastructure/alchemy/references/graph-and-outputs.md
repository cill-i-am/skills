# Stacks, resources, actions, outputs, and references


## The graph model

A stack is the deployment unit. Its provider layer supplies lifecycle implementations; its state layer records the managed graph. Multiple provider layers can be merged with `Layer.mergeAll`; the state backend is a separate choice. A resource declaration describes an entity. Yielding it inside construction registers it with the graph; declaring a constant does not immediately create the cloud object.

Keep the composition root small. Export declarations or service Layers, group resources that share ownership, and avoid a new stack for each source file. A separate stack is justified by independent deployment, access, ownership, or retention—not by file count.

Resource identity includes the stack, stage, namespace/FQN, and logical ID. A logical ID is not a display label. A change to it can become a create/delete or rename operation. Explicit physical names require special review because they can defeat the isolation normally supplied by generated names.

## Outputs are deferred graph values

An `Output<T>` represents a value that may only be available after dependencies are applied. Passing an Output into another resource's inputs preserves that dependency. It is not a JavaScript string or a Promise to await.

```ts
import * as Output from "alchemy/Output";

// Inside a Stack generator, after yielding the resources:
const previewText = Output.interpolate`Preview: ${worker.url}`;
const configuration = worker.url.pipe(
  Output.map((endpoint) => JSON.stringify({ endpoint })),
);
```

Check the installed Output module before using a combinator. Use `Output.interpolate`, `Output.map`, `Output.all`, and supported serialization helpers rather than template strings, `JSON.stringify`, string coercion, or `if (output)`.

Keep ordinary `Output.map` transformations pure. For an intentional plan-time lookup, the documented `Output.fromEffect` and `Output.mapEffect` operators retain the Effect requirements; inspect when the lookup runs and what it can access. Mutating external systems belongs in an apply-phase Action/resource or runtime handler, not a hidden lookup. Never hide `Effect.runPromise` inside a mapper to force a value to resolve. `Output.all(a, b, c)` is the documented variadic form.

Where a guide uses `.as<string>()`, treat it as a type annotation, not runtime parsing or proof that an optional URL exists. Validate runtime input at the appropriate boundary.

## Actions versus resources versus runtime work

Use a Resource for something whose existence and lifecycle Alchemy owns. Use an Action for a dependency-ordered, apply-time operation that should rerun when inputs change. Use a runtime Effect for work caused by a user request, queue message, timer, or workflow step.

A schema migration is not an HTTP startup side effect. A one-off deployment artifact is not a request-level background job. Before authoring a new Action, check whether the provider's existing database, command, or build resource already models the operation.

Actions need explicit change inputs, idempotency, failure semantics, and secret handling. A command that always executes cannot be treated as safely memoized merely because it is in the stack.

## Cross-stack references

A reference reads a resource or another stack's persisted outputs; it does not deploy that producer stack. Establish the producer first and deploy consumers after it. Destroy in the opposite order, accounting for independent references the engine may not see as one graph.

```ts
import * as Alchemy from "alchemy";

// Shared contract module; no cloud credentials or runtime implementation.
export class Backend extends Alchemy.Stack<Backend, { url: string }>()(
  "Backend",
) {}
```

A consumer can yield the typed stack handle and pass its URL into frontend configuration. The default reference uses the current stage; deliberately referencing another stage introduces a shared-environment dependency. Record it and test failure when the referenced deployment does not exist.

Use the dedicated References guide for `Resource.ref`, stack/stage overrides, and the installed release's exact APIs. Do not guess a persisted state key or read Alchemy's internal JSON layout from application code.

## Review questions

Does each mutable object have one owner? Can two stages select the same physical name? Are computed values still Outputs? Is a cross-stack read being mistaken for orchestration? Does a new layer carry exactly the resources and permissions it promises? Can a routine rename replace irreplaceable data?


## Sources

- [infrastructure-as-code/stack](https://alchemy.run/infrastructure-as-code/stack/)
- [infrastructure-as-code/resource](https://alchemy.run/infrastructure-as-code/resource/)
- [infrastructure-as-code/action](https://alchemy.run/infrastructure-as-code/action/)
- [infrastructure-as-code/outputs](https://alchemy.run/infrastructure-as-code/outputs/)
- [infrastructure-as-code/references](https://alchemy.run/infrastructure-as-code/references/)
- [project-structure/monorepo](https://alchemy.run/project-structure/monorepo/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).
