#!/usr/bin/env node
/** Pure target guard. It does not authorize a deployment or contact a provider. */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export function assertPreviewStage(stage, prNumber) {
  if (typeof stage !== "string" || typeof prNumber !== "string") {
    throw new TypeError("stage and PR number must be strings");
  }
  if (prNumber.match(/^[1-9][0-9]{0,9}$/)?.[0] !== prNumber) {
    throw new Error("PR number must be a positive decimal integer without leading zeroes");
  }
  if (stage !== `pr-${prNumber}` || !/^pr-[1-9][0-9]{0,9}$/.test(stage)) {
    throw new Error("Stage must exactly match pr-<verified PR number>");
  }
  return stage;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 4) throw new Error("Usage: node assert-preview-stage.mjs STAGE PR_NUMBER");
    console.log(assertPreviewStage(process.argv[2], process.argv[3]));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Invalid preview target");
    process.exitCode = 1;
  }
}
