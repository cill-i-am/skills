// Invoked by scripts/test-state-migration.py inside a fresh loopback-only Moto server.
import assert from "node:assert/strict";
import { makeS3State, makeDynamoDBState } from "@alchemy.run/aws/StateStore";
import { migrateToDynamoDB, rollbackToS3 } from "@alchemy.run/aws/StateStore/Migration";
import { AWSEnvironment } from "@alchemy.run/aws/Environment";
import * as Credentials from "@alchemy.run/aws/Credentials";
import * as Region from "@alchemy.run/aws/Region";
import * as Endpoint from "@alchemy.run/aws/Endpoint";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Redacted from "effect/Redacted";
import * as Random from "effect/crypto/SecureRandom";

const address = new URL(process.argv[2]);
assert.equal(address.hostname, "127.0.0.1");
assert.equal(address.protocol, "http:");
const fetchImpl = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  assert.equal(url.origin, address.origin, "Unexpected external endpoint");
  return fetchImpl(input, init);
};
const target = { stack: "fixture", stage: "rehearsal" };
const environment = Layer.succeed(AWSEnvironment, Effect.succeed({
  accountId: "123456789012", region: "us-east-1", endpoint: address.origin,
  credentials: Effect.succeed({
    accessKeyId: Redacted.make("fixture"), secretAccessKey: Redacted.make("fixture"),
  }),
}));
const services = Layer.mergeAll(
  Credentials.fromEnvironment, Region.fromEnvironment, Endpoint.fromEnvironment,
  Random.layerWebCrypto, FetchHttpClient.layer,
).pipe(Layer.provideMerge(environment));
const legacy = makeS3State({ bucketName: "legacy-fixture", prefix: "legacy" });
const modern = makeDynamoDBState({
  tableName: "state-fixture", overflowBucketName: "overflow-fixture",
  migrateFrom: { bucketName: "legacy-fixture", prefix: "legacy" },
});
const row = {
  resourceType: "test:Record", fqn: "Db", logicalId: "Db", instanceId: "physical-123",
  providerVersion: 1, status: "created", downstream: [], bindings: [], props: {}, attr: { value: "preserved" },
};
const step = (task) => Effect.runPromise(Effect.scoped(task).pipe(Effect.provide(services)));
const identity = { ...target, fqn: row.fqn };
await step(Effect.gen(function* () {
  const db = yield* legacy;
  yield* db.set({ ...identity, value: row });
  yield* db.setOutput({ ...target, value: { test: true } });
}));
const migrated = await step(Effect.flatMap(modern, db => migrateToDynamoDB(db, target)));
assert.equal(migrated[0].status, "migrated");
assert.equal(migrated[0].records, 1);
await step(Effect.gen(function* () {
  const db = yield* modern;
  assert.deepEqual(yield* db.list(target), ["Db"]);
  assert.equal((yield* db.get(identity)).instanceId, row.instanceId);
  assert.deepEqual(yield* db.getOutput(target), { test: true });
}));
const restored = await step(Effect.flatMap(modern, db => rollbackToS3(db, target)));
assert.equal(restored[0].status, "rolled-back");
await step(Effect.gen(function* () {
  const db = yield* legacy;
  assert.equal((yield* db.get(identity)).instanceId, row.instanceId);
  assert.deepEqual(yield* db.getOutput(target), { test: true });
}));
console.log("Migration and rollback preserved the resource identity, row count and stack output.");
