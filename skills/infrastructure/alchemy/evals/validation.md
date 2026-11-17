# Release acceptance — 17 November 2026

Alchemy 2.0.0-beta.87, tag commit 33c10dd55f5559beee2ec96b155c3a6429e44a93. The fixture families use Effect 4.1.4 and pnpm 12.16.1. All 121 files of the pre-change Executor payload matched repository main before this update. Executor reads the merged main branch.

## Executed checks

| Surface | Evidence |
|---|---|
| Version and package resolution | Both fixture workspaces installed with frozen lockfiles, reported zero peer issues and passed their own TypeScript check. An intentionally missing provider import produced TS2307. |
| Local Workers and data | Bun/workerd exercised R2 health, rejected auth, missing key, write/read and teardown. Drizzle D1 applied committed migrations, rejected unauthorized access, persisted and read a note, then tore down. SQLite and Postgres generation, 12 Drizzle pure/guard tests and the Vite production build passed. |
| Released engine and Domain | 509 tests across seven tagged suites passed against published packages. These exercise external lookup, adoption, rename, protected replacement/removal, retry, sandbox port transport, Domain story ordering, backfill, middleware, isolation and live reads. Two additional runner invocations in concurrent linked Git worktrees produced distinct effective stages. |
| State migration | The actual S3 and DynamoDB state implementations migrated and rolled back a scoped synthetic stage on Moto 5.1.18. The harness checked physical identity, row count and stack output. Its HTTP guard rejects every external origin. |
| Workload-specific examples | The custom provider passed create, unchanged redeploy, update and teardown against a stage-scoped in-memory store. Cloud Run-to-SQS and the E2B per-job binding compiled. A scoped-job fake verified a failed attempt released its guest and a retry acquired and released a new guest. |
| Offline discovery | Release guide, symbol, service and example indexes are machine-generated. Route tests exercise Alchemist, unmanaged lookup, worktrees, federation, Domain backfill, sandboxes, Turso and DigitalOcean availability. |

## Ten-ticket agent acceptance

A fresh read-only Codex session (gpt-6.2-sol) received the candidate instructions/references and ten tickets together. It had no answer key and performed no deployments. The responses were compared to the audit criteria. This is one decision-routing trial; the 24 older general cases and eight Drizzle prompts remain authored cases, and no comparative performance uplift was measured.

| Ticket | Observed decision | Runtime evidence or remaining boundary |
|---|---|---|
| R2 private upload | Worker binding, auth, scoped keys and rejected calls | Local round trip and unauthorized read |
| Existing Workers | Direct dependency, typed cross-stack reference, unmanaged lookup | Engine lookup and ownership tests |
| Persistent DO rename | Separate class and graph identity, preserve protection | Engine protected rename and replacement refusal; live DO namespace migration pending |
| Existing S3 state | Explicit legacy backend or rehearsed migration, fence, verify and roll back | S3→DynamoDB→S3 emulator rehearsal; AWS bucket-policy enforcement pending |
| Parallel checkouts | Distinct effective stages and exact cleanup of remote exceptions | Two simultaneous linked-worktree runner invocations and preview guard tests |
| Cloud Run → SQS | Workload federation, queue-scoped permission, propagation and denied-caller check | Typed binding; real GCP token exchange and AWS authorization pending |
| New projection | Replay history, authorize each live view, check concurrent stories | Domain simulation, middleware and live-read tests; hosted backfill pending |
| Disposable jobs | Scoped E2B client, timeout, cleanup, external checkpoints and guest credential boundary | Compiled E2B binding and failure/retry fake; hosted guest isolation pending |
| Move frontend | Check exact host/framework adapter, dynamic route, deep links and static assets | Vite build; remote SSR/asset parity depends on destination |
| DigitalOcean on beta.87 | Identified later-source availability, preserved dependencies | Release manifest/catalogue absence and retrieval test |

## Reproduce

In each example workspace run `pnpm install --frozen-lockfile`, `pnpm peers check` and `pnpm typecheck`. Use Bun for the R2, D1, custom-provider and scoped-job tests. For the emulator fixtures set `ALCHEMY_HOME` to a fresh temporary directory and use a credential-free environment. In the Drizzle workspace also run `pnpm test:unit`, `pnpm test:guards` and `pnpm --filter @example/web build`.

From the skill root:

```sh
python3 scripts/validate-skill.py
python3 -m unittest discover -s tests
node --test tests/preview-stage.test.mjs
python3 scripts/test-import-control.py
python3 scripts/test-release.py /path/to/tagged-alchemy
uv run --with 'moto[server]==5.1.18' python scripts/test-state-migration.py
```

The release suite reads the committed upstream tests at the verified tag and adapts their repository-local import aliases to public exports. Live accounts, credentials, paid services, CI deployment triggers and production state were outside this acceptance run.
