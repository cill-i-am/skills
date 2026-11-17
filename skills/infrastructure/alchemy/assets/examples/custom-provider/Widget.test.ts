import { expect } from "bun:test";
import * as Test from "@alchemy.run/test/Bun";
import * as Effect from "effect/Effect";
import { Widget, WidgetProvider, type WidgetAttributes } from "./Widget.ts";

const store = new Map<string, WidgetAttributes>();
const { test } = Test.make({ providers: WidgetProvider(store) });

test.provider("reconciles and removes a widget", stack => Effect.gen(function* () {
  const deploy = (enabled: boolean) => stack.deploy(Effect.gen(function* () {
    yield* Widget("sample", { name: "Example", enabled });
  }));
  yield* deploy(true);
  const first = Array.from(store.values())[0];
  expect(first.enabled).toBe(true);
  yield* deploy(true);
  expect(Array.from(store.values())).toEqual([first]);
  yield* deploy(false);
  expect(Array.from(store.values())).toEqual([{ ...first, enabled: false }]);
  yield* stack.destroy();
  expect(store.size).toBe(0);
}));
