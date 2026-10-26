// Source-reviewed baseline example. A deployment creates real resources.
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
export default Alchemy.Stack(
  "ExampleBucket",
  { providers: Cloudflare.providers(), state: Alchemy.localState() },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.Bucket("Uploads");
    return { bucketName: bucket.bucketName };
  }),
);
