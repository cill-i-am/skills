# Drizzle workspace verification

On 17 November 2026 the independent workspace passed frozen pnpm installation, peer checks, full TypeScript compilation (both database variants), the Vite production build, title-policy and migration-guard tests. Drizzle Kit generated the committed SQLite and Postgres SQL and snapshots with ORM/Kit 1.0.0-rc.5.

The Bun integration test deployed the D1 API to an explicitly local stage, applied the SQLite migration, rejected an unauthenticated read, created a note, read it back and destroyed the stage. It uses a fixture token. Neon/Postgres was typechecked; no live Neon branch, Hyperdrive connection, production migration or managed Postgres query was exercised.

See the [release validation](validation.md) for commands, the agent exercise and related limits.
