# Validation record

Audit date: **7 October 2026**.

## Checks completed in the build environment

| Check | Result | What it proves |
| --- | --- | --- |
| Skill structure, relative file/heading links, fenced blocks, JSON, basic example policy | Passed | Bundle structure is internally consistent; no alternate host/Promise actor bridge was found in authored runtime examples |
| TypeScript/TSX syntax parsing | **16 files, zero parse diagnostics** | Grammar is valid to the available TypeScript 5.8.3 parser; not a semantic typecheck |
| Script syntax | Passed | Both Node scripts parsed successfully; the Python validator executed |
| Audit script on deliberately bad/clean fixtures | Passed | Six expected violation categories were detected, and the clean fixture exited successfully |
| Broken-link negative fixture | Passed | Structural validator rejected a deliberately missing local link |
| Malformed-TypeScript negative fixture | Passed | Syntax parser rejected deliberately invalid TypeScript |

The available local tools were Node 22.16.0, Python 3.13.5, and the globally installed TypeScript **5.8.3** parser. The example project requests TypeScript **5.9.3**; that dependency could not be installed. Parsing with the available compiler is not a certification of the pinned dependency combination.

Machine-readable records: [structure](validation/structure.json), [syntax](validation/syntax.json), [tool fixtures](validation/tool-fixtures.json). These are actual local tool results, not fabricated application-test output.

## Not executed

Package-registry access failed at DNS resolution. The explicit metadata command `npm view @xstate/effect@0.1.0-alpha.6 version --fetch-retries=0 --fetch-timeout=3000` returned `EAI_AGAIN` for `registry.npmjs.org`.

Consequently, dependency installation/resolution, dependency-aware `tsc`, the **fourteen example test cases**, the demo, optional React typecheck/browser rendering, and preview restoration **were not executed**. No real resolved lockfile could be generated. No blanket “all code compiles” or “tests pass” claim is made.

The examples are original complete source files intended for the stated pins. They can still contain semantic incompatibilities that a connected install/typecheck reveals. Negative type assertions prove the expected constraints only when `tsc` runs against the real packages. The preview is intentionally incompatible with the alpha.6 example build and is excluded from it.

## Primary-source review

The guide was checked against official documentation, tagged package exports/implementation, release listings, and the frozen source-preview commit identified in [the source index](references/27-source-index.md). The review distinguished older site instructions from the stable Effect 4 release, constructor options from vanilla actor options, required machine-shaped Effect action arguments from core action examples, and released behavior from source-preview restoration.

Local link validation does not fetch remote URLs. The source inventory and topic coverage do not assert that every link reachable from the website was automatically crawled. Recommended application patterns are distinguished from built-in library capabilities.

## Required connected-environment validation

From `examples`, run:

```sh
npm install
npm run typecheck
npm test
npm run demo
```

Review and commit the generated lockfile after successful resolution and tests; use clean/frozen installs thereafter. Typecheck the optional UI separately. Verify package peers and exports before changing pins. Add application-specific authorization, provider idempotency, durable recovery, and end-to-end tests before production use.

## Review interpretation

Passing local checks means the package is structurally usable and the example source parses. It does **not** establish runtime correctness, provider safety, durable execution, production readiness, optional package compatibility, or publication of alpha.7.
