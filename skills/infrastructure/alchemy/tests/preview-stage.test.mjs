import test from "node:test";
import assert from "node:assert/strict";
import { assertPreviewStage } from "../scripts/assert-preview-stage.mjs";

for (const pr of ["1", "42", "9999999999"]) {
  test(`allows exact preview ${pr}`, () => assert.equal(assertPreviewStage(`pr-${pr}`, pr), `pr-${pr}`));
}
for (const [stage, pr] of [
  ["prod", "42"], ["production", "42"], ["staging", "42"], ["", "42"],
  ["pr-43", "42"], ["pr-042", "042"], ["pr-0", "0"], ["pr--1", "-1"],
  ["pr-42\n", "42"], ["pr-42\n", "42\n"], ["pr-42\r", "42\r"], ["pr-42\u2028", "42\u2028"], [" pr-42", "42"], ["pr-42; echo unsafe", "42"],
  ["../../prod", "42"], ["pr-42", "42;echo unsafe"], ["pr-42", " 42"],
  ["pr-42", "42\n"], ["pr-10000000000", "10000000000"],
  ["pr-４２", "４２"], ["pr-42\0", "42"], [null, "42"], ["pr-42", 42],
]) {
  test(`rejects ${JSON.stringify([stage, pr])}`, () => assert.throws(() => assertPreviewStage(stage, pr)));
}
