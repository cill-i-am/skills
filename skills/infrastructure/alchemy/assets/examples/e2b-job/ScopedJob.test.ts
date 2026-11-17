import { expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import { scopedJob } from "./ScopedJob.ts";

test("a failed job releases its guest and a retry uses a new guest", async () => {
  let next = 0;
  const released: number[] = [];
  const job = (fail: boolean) => scopedJob(
    Effect.sync(() => ++next),
    id => fail ? Effect.fail("fixture failure") : Effect.succeed(id),
    id => Effect.sync(() => { released.push(id); }),
  );
  expect(await Effect.runPromise(Effect.flip(job(true)))).toBe("fixture failure");
  expect(await Effect.runPromise(job(false))).toBe(2);
  expect(released).toEqual([1, 2]);
});
