import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
export default class Welcome extends Cloudflare.Workflow<Welcome>()(
  "Welcome",
  Effect.gen(function* () {
    return Effect.fn(function* (input: { name: string }) {
      const greeting = yield* Cloudflare.Workflows.task("prepare-greeting",
        Effect.succeed(`Hello, ${input.name}`));
      yield* Cloudflare.Workflows.sleep("cooldown", "30 seconds");
      return { greeting };
    });
  }),
) {}
