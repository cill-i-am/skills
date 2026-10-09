# Effect v4 examples and tests

The `src/` directory contains 33 complete TypeScript source files. Thirty-one are mirrored exactly from guide code blocks; `snippet-map.json` records those relationships. `lifecycle.ts` and `batching.ts` add focused lifecycle and request-resolver probes.

The examples declare Effects, services, contracts, or factory functions. They do not start an HTTP listener, worker, real AI request, or external database connection on import. `http-client.ts` uses a reserved example domain and is a composition recipe, not a live integration test.

## Commands

```sh
npm install
npm run check
npm test
```

Effect is pinned to `4.0.2`; TypeScript is pinned to `7.0.2`, matching the development version in the baseline upstream manifest. Use Node 22 or newer for this fixture's ESM, test-runner and Fetch APIs, then validate against the actual deployment host separately.

`npm run check` performs semantic TypeScript checking. `npm test` builds first and then runs the three Node test files. Installing dependencies creates a real lockfile; review and commit it for repeatable CI, then use `npm ci` on subsequent runs.

## Test boundaries

`core.test.mjs` covers domain decoding and encoding, tagged failures, service provision, resource finalization, interruption, runtime state isolation, queues, Ref/TxRef, caches, streams, sinks, configuration, Option, and request resolver completion.

`reliability.test.mjs` covers TestClock, retry eligibility and attempt limits, overall timeout, bounded concurrency, concurrent cache lookups, negative caching, and configuration defaults.

`http.test.mjs` covers an in-process Fetch-style health handler and unknown routes. It does not open a network listener or prove TLS, proxy, load-balancer, database, or cloud-runtime behaviour.

The RPC, SQL, Atom, AI, workflow and entity files provide source-reviewed definitions/composition examples. A successful typecheck would validate their declarations against the pinned package; real transport, provider, engine, storage and UI integrations still require their own tests.

## Verification status

These test files were **authored but not executed** in the authoring environment. TypeScript **syntax** parsing was available, but installing Effect and the intended compiler was blocked by unavailable dependency downloads. Do not interpret the presence of tests as a passing test result. The authoritative record is [VERIFICATION.md](../VERIFICATION.md).

Do not repair an API mismatch by adding casts, ignored errors, or fake declarations. Inspect the exact v4 source and update both the example and its mirrored guide block where applicable.
