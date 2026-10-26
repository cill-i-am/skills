import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTitle } from "../src/title.ts";

test("trims a title", () => assert.equal(normalizeTitle("  hello  "), "hello"));
test("rejects blank titles", () => assert.equal(normalizeTitle(" \t\n "), undefined));
test("accepts the boundary length", () => assert.equal(normalizeTitle("x".repeat(200))?.length, 200));
test("rejects overlong titles", () => assert.equal(normalizeTitle("x".repeat(201)), undefined));
