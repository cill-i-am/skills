import { scopedJob } from "./ScopedJob.ts";
import * as E2B from "@alchemy.run/e2b";
import * as Effect from "effect/Effect";
import type { SandboxBase } from "@alchemy.run/e2b/CreateSandbox";

// The acquiring host owns the provider credential. The job takes no guest credentials.
export const makeJob = (base: SandboxBase) => Effect.gen(function* () {
  const sandboxes = yield* E2B.CreateSandbox(base);
  return () => scopedJob(
    sandboxes.create({ timeout: 120 }),
    guest => guest.exec("node --version"),
    guest => guest.kill(),
  );
});
// Provide E2B.CreateSandboxHttp on the calling runtime. Bound the caller's lifetime
// as well; the E2B timeout limits residual compute if the cleanup request fails.
