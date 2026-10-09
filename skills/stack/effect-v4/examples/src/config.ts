// Baseline: effect@4.0.2. See ../../references/17-configuration-and-secrets.md
import { Config, ConfigProvider, Effect } from "effect"

const appName = Config.String("APP_NAME").pipe(
  Config.withDefault("example-worker")
)
const testProvider = ConfigProvider.fromUnknown({ APP_NAME: "test-worker" })
export const configuredName = appName.parse(testProvider)

export const loadSecret = Effect.gen(function*() {
  const token = yield* Config.Redacted("SERVICE_TOKEN")
  return token
})
