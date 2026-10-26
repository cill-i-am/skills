# Create or extend a first stack


## Start with the actual requirement

For a new project, choose a provider, a state backend, a runtime only if one is needed, and a package manager. A bucket-only stack is a useful small first deployment, not a compulsory tutorial for every task. For an existing project, edit its composition root rather than creating a second competing stack.

Inspect package scripts before running them: `prepare`, build plugins, and stack imports are executable code. Package installation is not a read-only operation. Preserve existing tool versions and do not run interactive bootstrap commands on the user's behalf without the necessary authorization.

## New-project setup

The current prerequisites are Bun or Node.js 22+. A baseline-aligned pnpm starting point is shown below. The pinned source catalogue uses Effect 4.0.0 even though some setup prose still mentions RC tags:

```sh
mkdir infrastructure-demo
cd infrastructure-demo
pnpm init
pnpm add --save-exact alchemy@2.0.0-beta.81 effect@4.0.0 @effect/platform-bun@4.0.0 @effect/platform-node@4.0.0
pnpm add -D typescript @types/node
```

This is a one-time version-selection step, not a CI command. Check peer compatibility and freeze the selected versions and lockfile. Bun, npm, and Yarn are also supported; use the project-selected package manager rather than introducing another lockfile. Configure ESM and a TypeScript module resolution mode compatible with the selected runtime. Use the upstream matching example's tsconfig when platform bundling introduces additional requirements.

## Minimal deployment graph

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "ExampleApp",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const uploads = yield* Cloudflare.R2.Bucket("Uploads");
    return { bucketName: uploads.bucketName };
  }),
);
```

Save the file as `alchemy.run.ts`. Do not add a web runtime until the requirement needs HTTP, events, or another execution target. Return useful non-secret outputs; avoid returning complete credential-bearing resources.

## Authentication and the first operation

Use local Alchemy profiles for interactive authentication:

```sh
pnpm exec alchemy profile edit --profile sandbox
pnpm exec alchemy plan --config alchemy.run.ts --stage live-demo --profile sandbox
```

The initial `Cloudflare.state()` use may request permission to bootstrap its shared backend, even for `plan`. A plan is not unconditional proof of zero cloud writes. Inspect the prompt and target account. A deploy, after its effects are authorized, uses:

```sh
pnpm exec alchemy deploy --config alchemy.run.ts --stage live-demo --profile sandbox
```

Do not prescribe exported Cloudflare API credentials for an ordinary local login; profiles support interactive methods. CI is different and uses its documented provider credential resolver.

## Extend without changing identity

Move a reusable resource declaration into a module and import the same declaration from its consumers. File movement should preserve stack name, stage, namespace path, logical ID, and physical-name overrides. Add a runtime's required bindings during construction, include the runtime in the stack, and return its URL for tests.

Put `.alchemy/`, local environment files, credentials, and generated secret material outside version control. Commit a non-secret environment-variable inventory and migration files. Keep the project reproducible from its lockfile.

## Prove the result

Run the project's static checks, then appropriate local tests. For an approved deployment, verify the actual account/stage, resulting resource identifiers, readiness, and a representative operation—not merely the CLI's exit code. Destroy only a confirmed disposable target. Never turn cleanup into deletion of production data or a shared state backend.


## Sources

- [getting-started](https://alchemy.run/getting-started/)
- [cloudflare/tutorial/part-1](https://alchemy.run/cloudflare/tutorial/part-1/)
- [cloudflare/setup](https://alchemy.run/cloudflare/setup/)
- [environments/profiles](https://alchemy.run/environments/profiles/)
- [state-store](https://alchemy.run/state-store/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).
