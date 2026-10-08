# Frontend frameworks, SSR, assets, and monorepo builds

## Start from the application's actual framework

Read the package manifest, Vite/Nitro/Next configuration, build scripts, server entrypoint, and deployment adapter. Choose the Alchemy integration for that framework and provider, not the closest-looking name. A Vite SPA, a TanStack Start SSR app, an Astro static site, and Next.js do not share the same runtime output.

The current Cloudflare TanStack Start guide uses `Cloudflare.Website.Vite`. Do not invent `Cloudflare.Website.TanStackStart` because another provider exposes an adapter with that name. Prisma's Website adapters have a different catalogue. Fetch the matching provider/framework page before writing unfamiliar props.

## A root-level Vite deployment

```ts
import * as Cloudflare from "alchemy/Cloudflare";

export const Website = Cloudflare.Website.Vite("Website", {
  env: { DEPLOYMENT_LABEL: "example" },
});
export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;
```

Yield `Website` from the stack and return its `url`. This declaration assumes the framework project is at the configured build root. For a monorepo, check the installed resource's working-directory/root option rather than guessing `cwd`, `root`, or `path`. Keep the build command and output directory consistent with the framework adapter.

For TanStack Start, preserve its normal Vite plugins such as `tanstackStart()` and React/Solid support. The current guide tells Alchemy-managed builds to remove a separately configured `@cloudflare/vite-plugin`, because Alchemy supplies the integration. Apply that only when transferring build ownership; do not strip a plugin from an unrelated Wrangler-managed project.

## Runtime bindings versus public build variables

A native resource passed through `env` can become a server-side binding. Infer the environment from the Website declaration and use it only in server code. A value exposed through a public prefix such as `VITE_` is browser-visible. Never place a database URL, API token, state-store credential, or secret there.

An API base URL may be a safe build-time Output, but a resource handle is not a string to interpolate into browser JavaScript. Prefer relative routes when frontend and API share an origin. For separate origins, define CORS, cookies, authentication, and preview-domain policy explicitly.

## SSR and bundling

Check that server-only dependencies stay out of browser bundles. A type-only import must really be erased. Avoid importing `alchemy.run.ts`, provider credentials, or a Node-only state backend from a client module. Keep public schema contracts separate from implementation and deployment modules.

Use the framework's supported runtime target. Do not assume Node APIs are available in workerd without the required compatibility configuration, or that a Node process deployment behaves like a Worker. Check compatibility dates/flags against current Cloudflare guidance and pin them intentionally. Do not upgrade the date automatically during a routine code edit.

## Assets, routes, and caching

Verify the entry HTML, hashed assets, SSR routes, direct deep links, redirects, and not-found behaviour. SPA fallback and SSR routing differ. Cache immutable build artifacts aggressively but do not apply that policy to authenticated HTML or private API responses. Include headers, cookies, and deployment version in cache design where needed.

For a custom build, use the documented static-site resource instead of inventing a framework adapter. Ensure the build output cannot include `.env`, source maps with sensitive embedded data, or server secrets. Public source maps are a deliberate decision, not an automatic consequence of a template.

## Preview and production checks

A preview website can still point at a production API or database if build variables are shared. Verify all server bindings and public URLs for the stage. Protect private previews and avoid shipping real customer data into them. Test server functionality, not only a successful asset upload.

For release rollback, identify whether the frontend was rebuilt against a newer API contract. Retaining an old static bundle does not restore an old backend or schema. Use compatible contracts and deploy order across independently owned stacks.

## Sources

- [cloudflare/frontend/frontends](https://alchemy.run/cloudflare/frontend/frontends/)
- [cloudflare/frontend/vite](https://alchemy.run/cloudflare/frontend/vite/)
- [cloudflare/frontend/tanstack-start](https://alchemy.run/cloudflare/frontend/tanstack-start/)
- [cloudflare/frontend/static-site](https://alchemy.run/cloudflare/frontend/static-site/)
- [prisma/frontend/websites](https://alchemy.run/prisma/frontend/websites/)
- [project-structure/monorepo](https://alchemy.run/project-structure/monorepo/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
