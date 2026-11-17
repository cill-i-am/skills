import { expect } from "bun:test";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Test from "@alchemy.run/test/Bun";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";
import Api from "../apps/api/src/Api.ts";

const token = "local-d1-fixture";
process.env.APP_API_TOKEN = token;
const suite = Test.make({
  providers: Cloudflare.providers(),
  dev: true,
  stage: `test-d1-${process.pid}`,
});
const Stack = Alchemy.Stack("D1Acceptance", {
  state: Alchemy.localState(), providers: Cloudflare.providers(),
}, Effect.gen(function* () {
  const api = yield* Api;
  return { url: api.url };
}));
const deployed = suite.beforeAll(suite.deploy(Stack), { timeout: 120_000 });
suite.afterAll(suite.destroy(Stack));

suite.test("applies the committed migration and persists a note", Effect.gen(function* () {
  const { url } = yield* deployed;
  if (!url) throw new Error("Missing local API URL");
  const endpoint = new URL("/notes", url);
  const request = (init?: RequestInit) => Effect.promise(() => fetch(endpoint, init));
  expect((yield* request()).status).toBe(401);
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
  const created = yield* request({ method: "POST", headers, body: JSON.stringify({ title: "Local note" }) });
  expect(created.status).toBe(201);
  const result = yield* request({ headers });
  expect(result.status).toBe(200);
  const body = yield* Effect.promise(() => result.json());
  expect(body.notes).toContainEqual(expect.objectContaining({ title: "Local note" }));
}));
