# Configuration

Use this file for environment variables, platform bindings, secrets, Config, ConfigProvider, and stable application configuration services.

## Read Through Config

Application logic should not read `process.env`, import platform bindings, or parse configuration strings directly. Describe values with Config, decode semantic values with Schema, and acquire them in a Layer.

Use `Config.redacted` or the installed equivalent for secrets. Keep Redacted values wrapped until the concrete adapter initializes a client.

Config constructor and provider APIs are exact-pin details; inspect the target package and compile a probe.

## Recipe Chooser

Use the installed Config recipes for:

- primitive strings, booleans, numbers, integers, and durations;
- Schema-backed brands, literals, and value objects;
- semantic absence;
- missing-value defaults that do not hide malformed input;
- custom refinements;
- grouped configuration objects;
- deliberate fallback across providers.

Do not use a broad fallback or default to turn malformed production input into a valid configuration silently.

## Provider Boundaries

The default provider commonly reads environment variables. Replace or augment it at a composition root with deterministic providers for tests, platform bindings, files, directories, or remote sources.

Provider precedence is product policy. Test which source wins, how absence differs from invalid presence, and whether a fallback catches source failure or only missing data according to the installed semantics.

Keep `.env` loading, Cloudflare bindings, process environment, and deployment-specific sources in adapters. Convert them into a ConfigProvider or decoded application service before business logic.

## App Config Service

Wrap decoded settings in a `Context.Service` when many workflows need one stable application contract. Tests may provide the decoded value directly when parsing is outside the unit's concern.

Acquire runtime flags and settings once for the intended owner lifetime. Do not mutate `process.env`, global flags, or provider state after dependent Layers or ManagedRuntimes have been built and expect existing services to change.

## Reusable Config-Service Generator

When a repository has many similarly shaped configuration services, a small helper may accept a record of Config definitions, derive the service shape, and expose:

- a live Layer that parses the active ConfigProvider once;
- a deterministic Layer for already-decoded test values.

Use this only after repetition is demonstrated. Do not introduce a generator for one settings object, and do not hide provider precedence or validation behavior inside it.

## Library Constructors

Libraries may expose both:

- a concrete-options Layer for direct composition and tests;
- a Config-backed Layer for deployed applications.

Keep the concrete service contract independent from how options were loaded.

## Secret Rules

- keep credentials Redacted through service construction;
- unwrap only at the adapter call that needs the raw value;
- never attach secrets to errors, logs, spans, snapshots, or assertions;
- do not include full provider responses in Config errors;
- keep secret key names actionable without revealing values.

## Verification

Test missing required values, malformed brands/literals, defaults, provider precedence, source failure, secret redaction, and the lifetime at which configuration is captured. Prefer provider Layers over global environment mutation.
