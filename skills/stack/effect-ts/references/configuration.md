# Configuration

Use this file for environment variables, platform bindings, secrets, `Config`, `ConfigProvider`, and app configuration services.

## Read Through Config

Application logic should not read `process.env`, import platform globals, or parse configuration strings directly. Describe configuration with `Config`, decode into domain types, and acquire it in a Layer.

```ts
export const DeploymentEnvironment = Schema.Literals([
  "development",
  "staging",
  "production",
]);

export const AppConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const environment = yield* Config.schema(DeploymentEnvironment, "APP_ENV");
    const databaseUrl = yield* Config.redacted("DATABASE_URL");
    const requestTimeout = yield* Config.duration("REQUEST_TIMEOUT").pipe(
      Config.withDefault(Duration.seconds(10)),
    );
    const emailEnabled = yield* Config.boolean("EMAIL_ENABLED").pipe(
      Config.withDefault(false),
    );

    return AppConfig.of({
      environment,
      databaseUrl,
      requestTimeout,
      emailEnabled,
    });
  }),
);
```

Use `Config.redacted(...)` for credentials and secrets. Keep the resulting `Redacted` value intact until the adapter must initialize a client.

## Config Recipe Chooser

- `Config.string`, `boolean`, `number`, `integer`, `duration`: primitive encoded values
- `Config.schema`: Schema-backed brand, literal, or value object
- `Config.redacted`: secret text
- `Config.option`: semantic absence
- `Config.withDefault`: only missing data receives a default; malformed input still fails
- `Config.mapOrFail`: custom refinement when no Schema recipe fits
- `Config.unwrap`: materialize a wrapped config structure
- `Config.orElse`: deliberate fallback for any parse failure, used sparingly

Do not use `withDefault` to hide malformed production configuration. A process should fail acquisition with a useful config error when required config is invalid.

## Provider Boundaries

The default provider reads environment variables. Replace or augment it at a composition root:

```ts
const TestConfigProvider = ConfigProvider.fromUnknown({
  APP_ENV: "staging",
  DATABASE_URL: "postgres://test",
  REQUEST_TIMEOUT: "50 millis",
  EMAIL_ENABLED: "true",
});

const TestLayer = AppConfigLive.pipe(
  Layer.provide(ConfigProvider.layer(TestConfigProvider)),
);
```

Provider chooser:

- `ConfigProvider.fromEnv(...)`: environment variables
- `ConfigProvider.fromUnknown(...)`: deterministic object-backed tests or host adapter input
- `ConfigProvider.layer(...)`: replace the active provider
- `ConfigProvider.layerAdd(...)`: add fallback or primary override behavior deliberately
- provider nesting/casing transforms: map structured recipes to host naming conventions

Keep `.env` loading, Cloudflare bindings, process environment access, and deployment-specific sources in adapters. Convert them to a provider or an app configuration service before business logic.

## App Config Service

Wrap decoded runtime settings in a service when many workflows need a stable application-level contract:

```ts
export interface AppConfigShape {
  readonly environment: DeploymentEnvironment;
  readonly databaseUrl: Redacted.Redacted<string>;
  readonly requestTimeout: Duration.Duration;
  readonly emailEnabled: boolean;
}

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()(
  "@app/AppConfig",
) {}
```

This separates environment decoding from application consumption and lets tests provide a fully decoded value with `Layer.succeed` when config parsing is not under test.

## Library Layer Options

Libraries may expose concrete and config-backed constructors:

```ts
export const layer = (options: ClientOptions) =>
  Layer.effect(Client, makeClient(options));

export const layerConfig = (options: Config.Wrap<ClientOptions>) =>
  Layer.effect(Client, Config.unwrap(options).pipe(Effect.flatMap(makeClient)));
```

Use concrete options in unit tests. Use `layerConfig` when the deployed application should read through the active provider.

## Secret Rules

- Store credentials as `Redacted` in configuration and service construction.
- Unwrap only at the adapter call that needs the raw secret.
- Never attach secrets to logs, spans, errors, snapshots, or assertion messages.
- Do not include raw provider responses in config errors.
- Keep secret names stable and actionable without revealing values.

## Verification

Test missing required values, malformed branded or literal values, defaults, provider precedence, and secret redaction. Avoid mutating global environment state when `ConfigProvider.fromUnknown(...)` can express the test.
