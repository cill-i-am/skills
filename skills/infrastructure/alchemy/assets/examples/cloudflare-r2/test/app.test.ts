import { expect } from "bun:test";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Bun";
import * as Effect from "effect/Effect";
import Stack from "../alchemy.run.ts";

// Deliberately local, non-secret fixture. Do not reuse in a live environment.
const token = "local-example-fixture-token";
process.env.APP_API_TOKEN = token;
const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  stage: `test-local-r2-${process.pid}`,
  dev: true,
});
const deployed = beforeAll(deploy(Stack), { timeout: 300_000 });
afterAll(destroy(Stack));

test("health, authorization, missing key, and text round trip", Effect.gen(function* () {
  const { url } = yield* deployed;
  if (!url) throw new Error("The example stack did not return a URL");
  const base = url.replace(/\/$/, "");
  const health = yield* Effect.tryPromise(() => fetch(`${base}/health`));
  expect(health.status).toBe(200);
  const key = `test-${crypto.randomUUID()}.txt`;
  const unauthorized = yield* Effect.tryPromise(() => fetch(`${base}/objects/${key}`));
  expect(unauthorized.status).toBe(401);
  const headers = { authorization: `Bearer ${token}` };
  const missing = yield* Effect.tryPromise(() => fetch(`${base}/objects/${key}`, { headers }));
  expect(missing.status).toBe(404);
  const write = yield* Effect.tryPromise(() => fetch(`${base}/objects/${key}`, {
    method: "PUT", headers, body: "hello from the local test",
  }));
  expect(write.status).toBe(204);
  const read = yield* Effect.tryPromise(() => fetch(`${base}/objects/${key}`, { headers }));
  expect(read.status).toBe(200);
  expect(yield* Effect.tryPromise(() => read.text())).toBe("hello from the local test");
}));
