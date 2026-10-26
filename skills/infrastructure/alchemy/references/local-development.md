# Local development, emulation, and debugging

## Keep local and live identities separate

Use a dedicated development stage and inspect its provider configuration. Do not use a production stage with `alchemy dev`; local/live resource transitions can be replacements. A locally executing Worker may still reference a real database, queue, API, or secret. Make every live dependency explicit in a short environment inventory.

```sh
pnpm exec alchemy dev --config alchemy.run.ts --stage dev-example --profile sandbox
```

The command starts processes and can bootstrap state or access cloud APIs. It is not a static check. Confirm required runtimes, ports, Docker, and provider-specific setup before running it. Do not interpret emulator startup as permission to provision real infrastructure.

## What to emulate

Cloudflare's documented local mode covers Workers, Durable Objects, KV, R2, D1, Queues, and Workflows using workerd and local simulators. AWS local support uses a Docker-based emulator for its supported surface, including selected compute and data resources. Read the exact local-provider guide for the resources the application uses; platform coverage changes faster than this skill.

Use local storage for disposable fixtures. Keep migration files identical to production even though the data differs. Seed deterministic example data through explicit test setup, not every request or every construction pass. Keep fixture credentials distinct from real upstream credentials.

When a feature requires live infrastructure, select it deliberately with the documented `Alchemy.remote()` mechanism and restrict it to a sandbox account/resource. Explain the missing emulation and expected cost or data effects. Do not claim `dev: true` proves zero cloud calls when remote resources or arbitrary application HTTP requests remain.

## Debugging sequence

First reproduce with the smallest affected stack and exact installed version. Check constructor/runtime boundaries, missing Layers, environment resolution, and entrypoint selection. Then check whether the behaviour is emulator-specific. Compare logs with request or job identifiers, not full sensitive payloads. If the app requires a container, confirm image build and port health separately from the Worker-to-container binding.

For stale local state, identify whether the issue is application data, engine state, or cached build output. Back up anything valuable before a targeted reset. Do not delete all local state as a first step, especially when a local stack references remote resources. Keep reset commands scoped to an explicitly disposable stage.

## Frontend development

Let the selected framework integration own its development server and runtime bridging. Do not start a second incompatible Wrangler or Cloudflare Vite pipeline for the same build. Check that native resource bindings reach server code, while public build-time variables remain safe for browsers. Test deep-link navigation, SSR, hot reload, and a server-to-resource call.

## What local success does not prove

Local tests may miss IAM propagation, provider account settings, DNS/TLS, cold starts, quota enforcement, cross-region networking, eventual consistency, and external delivery retries. Add a small authorized live test for the specific claim. Record the gap rather than overbuilding a custom emulator to approximate an existing official one.

## Sources

- [environments/local-development](https://alchemy.run/environments/local-development/)
- [cloudflare/local-development](https://alchemy.run/cloudflare/local-development/)
- [aws/local-development](https://alchemy.run/aws/local-development/)
- [testing/test-harness](https://alchemy.run/testing/test-harness/)
- [cloudflare/tutorial/part-4](https://alchemy.run/cloudflare/tutorial/part-4/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
