# Source Study

This reference records the source and skill audit behind the first-principles rewrite.

## Skill Sentence Audit

The first-principles rewrite audit inspected an expanded working copy of the old skill with 28 Markdown/YAML files and 4,971 sentence-like units. The reusable skills-repo version contained the same long guide stack without the duplicate suffixed files. The audit opened every skill file and flagged stale duplicates, repeated guide prose, stale `.repos/effect` path assumptions, negation-first wording, old `Context.Tag` defaults, over-narrow `Effect.fnUntraced` advice, and broad generated feature lists.

Rewrite decision:

- Remove duplicate stale reference files.
- Replace the large guide stack with four focused references.
- Keep one source of truth for each rule.
- Keep `SKILL.md` procedural and push details into references.
- Use opencode, executor, and effect-smol as source-backed exemplars rather than copying generic Effect docs.

## Source Coverage

Line-oriented source pass on 2026-07-07:

| Repo        | Files |     Lines | Effect Import Files | Effect Call Files |
| ----------- | ----: | --------: | ------------------: | ----------------: |
| opencode    | 4,098 | 1,156,154 |               1,059 |             1,087 |
| executor    | 1,654 |   867,545 |                 760 |               643 |
| effect-smol | 2,010 |   628,198 |                 863 |             1,071 |

Candidate files included TypeScript, JavaScript, Markdown/MDX docs and skills, package manifests, TypeScript configs, and Vitest configs. Obvious vendor, generated, build, output, cache, media, binary, and lockfile paths were excluded.

The scanner opened each candidate file and indexed every line for imports, calls, dependency evidence, and categories. Manual rereads focused on the routed files in `source-lookup.md`. Do not claim every line was semantically hand-read; claim complete line indexing plus focused manual review.

## opencode Findings

opencode is useful for app/runtime architecture:

- `app-runtime.ts` builds one app runtime from explicit layers and a shared memo map.
- `runner.ts` models resumable work as a state machine with `Deferred`, `Fiber`, `Scope`, `Exit`, and typed Busy/Cancelled errors.
- `instance-state.ts` uses `ScopedCache`, current scope finalizers, and external disposer registration.
- `test/lib/effect.ts` keeps test and live layers explicit, closes scopes, and pretty-prints causes.
- Protocol and client files keep generated Promise and Effect surfaces contract-first.
- The repo skill and AGENTS file prefer current source, named services, Schema at API/domain boundaries, thin handlers, explicit layers, and scoped tests.

## executor Findings

executor is useful for SDK, Cloudflare, and host callback boundaries:

- Schema-boundary skills prefer `decodeUnknownEffect`, `fromJsonString`, and `decodeUnknownOption(parseJson())` over casts and probes.
- Typed-error skills add a new error only for distinct recovery/status/UI/retry/telemetry behavior.
- SDK code builds typed clients with `HttpClient` transforms instead of raw fetch seams.
- Error classes add `message` getters when schema tagged errors would render blank in telemetry.
- The execution engine uses `Deferred`, `Queue`, `Fiber`, and `Exit` for idempotent pause/resume.
- Host code uses one Effect entry at Promise/SDK/Durable Object boundaries, then maps defects to opaque public results and logs causes out-of-band.
- Telemetry tests query exported spans and poll with bounded `Schedule`.

## effect-smol Findings

effect-smol is useful for API spelling and library-level idioms:

- `.patterns/effect.md` rejects `try/catch` inside `Effect.gen` for recoverable failures.
- `Effect.fnUntraced` is documented as the reusable function form that omits stack-frame/span capture and avoids generator wrapper allocation.
- `Effect.fn` is documented as the traced reusable function form, with named and unnamed variants.
- Current v4-style examples prefer `Context.Service` class syntax.
- `Layer` models service construction, dependencies, construction errors, scoped resources, memoization, and lifecycle hooks.
- `Scope` owns finalizers and is the lifetime boundary behind scoped resources.

## Reusable Conclusions

- Source-backed Effect guidance starts with boundary classification, not a module list.
- Schema, typed errors, services/layers, resources, concurrency, observability, retries, and tests are separate reasons to use Effect.
- Pure sync logic remains plain TypeScript.
- Runtime execution belongs at host edges.
- Generated protocol/client code comes from one source contract.
- `fnUntraced` is a valid library/hot-path tool, not a forbidden escape hatch and not the application default.
- Tests prove failure and cleanup behavior, not just the happy path.
