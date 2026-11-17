import * as Alchemy from "alchemy";
import * as AWS from "@alchemy.run/aws";
import * as Effect from "effect/Effect";
import Api from "./src/Api.ts";
export default Alchemy.Stack("ExampleLambdaApi", {
  providers: AWS.providers(), state: Alchemy.localState(),
}, Effect.gen(function* () { const api = yield* Api; return { url: api.functionUrl }; }));
