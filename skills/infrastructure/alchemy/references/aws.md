# AWS

Use this file for Alchemy v2 applications on AWS. Open the narrow guide under `https://alchemy.run/aws/` and the generated provider page before writing exact resource props.

## Baseline

```ts
import * as Alchemy from "alchemy";
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: AWS.providers(),
    state: AWS.state(),
  },
  Effect.gen(function* () {
    return {};
  }),
);
```

`AWS.state()` stores state in the target account and region. Keep the account, region, profile, and stage explicit before any mutation. `alchemy aws bootstrap` creates the per-account assets bucket used by Lambda deployments and therefore requires confirmation.

## Choose A Runtime

- `AWS.Lambda.Function`: default for serverless HTTP and event-driven workloads.
- Lambda MicroVMs: isolated or long-running compute driven by Lambda through internal RPC.
- ECS/Fargate: long-running services packaged as containers.
- EC2: full machine and networking control.
- EKS/Kubernetes: Kubernetes-native workloads where the orchestration overhead is justified.

Do not choose ECS, EC2, or EKS merely because the application uses Docker. Start with Lambda unless runtime duration, protocols, process model, hardware, or operational constraints require another host.

## Lambda Pattern

```ts
import * as AWS from "alchemy/AWS";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class Api extends AWS.Lambda.Function<Api>()(
  "Api",
  { main: import.meta.url, url: true },
  Effect.gen(function* () {
    return {
      fetch: Effect.succeed(HttpServerResponse.text("ok")),
    };
  }),
) {}
```

The class is both runtime declaration and typed binding target. Yield it from the stack to register it and return `functionUrl`, ARN, role, or log outputs needed by tests and operators.

Use `Stack.useSync` for synchronous stage-aware props such as memory. Keep request/event work in the returned runtime API, not in outer initialization.

## Bindings Are IAM

AWS capabilities are operation-specific bindings:

```ts
import * as S3 from "alchemy/AWS/S3";

const bucket = yield* S3.Bucket("Blobs");
const putObject = yield* S3.PutObject(bucket);
const getObject = yield* S3.GetObject(bucket);
```

Each binding provides a typed runtime operation and contributes the corresponding least-privilege IAM statement. Prefer the narrow operation binding over passing a broad SDK client or hand-writing wildcard policies.

Rules:

- Bind only operations the runtime actually uses.
- Provide the matching `*Http`/runtime Layer required by the host.
- Review generated IAM scope during plan and tests.
- Keep resource creation, event subscription, and runtime calls in the same typed graph.

## Data

- S3: object storage, multipart operations, streaming bodies, and bucket events.
- DynamoDB: typed operation bindings and DynamoDB Streams.
- RDS/Aurora: managed Postgres/MySQL, generated connectivity, Data API, and runtime `Connect` bindings.

Prefer streaming S3 reads for large objects. Treat DynamoDB attribute shapes and database rows as external data; decode them at the adapter boundary. Keep database credentials redacted and connection lifetimes appropriate to the runtime.

## Messaging And Events

- SQS: `Queue`, send bindings, queue sinks, and `consumeQueueMessages` event sources.
- SNS: topics, publish bindings, and fan-out.
- Kinesis: ordered streams, put bindings, and Lambda stream consumers.
- EventBridge: buses and rules.
- Scheduler: cron/rate invocation.
- S3 events and DynamoDB Streams: source-specific Lambda subscriptions.

Example producer shape:

```ts
import * as SQS from "alchemy/AWS/SQS";

const jobs = yield* SQS.Queue("Jobs");
const send = yield* SQS.SendMessage(jobs);
```

Consumer APIs take Effect Streams. Make handlers idempotent, configure retries and dead-letter behavior deliberately, and test duplicate delivery where the source is at-least-once.

## APIs And Websites

- Function URL: simplest public Lambda HTTP endpoint.
- Schemaless RPC: trusted internal Lambda/MicroVM or service communication.
- Effect RPC: schema-validated Effect/TypeScript client boundary.
- Effect HTTP: schema-validated ordinary HTTP boundary.
- API Gateway: stages, authorizers, API keys, usage plans, or gateway-specific controls.
- StaticSite/Vite website resources: S3 plus CloudFront composition.

Use `apis.md` before selecting a modality. Do not add API Gateway when a Function URL satisfies the actual requirements.

## Networking And Domains

Use the `Network` helper when ECS/EC2/RDS needs a conventional VPC topology. Use primitives only when subnet, route, endpoint, ACL, NAT, or peering requirements differ from the helper.

For custom domains, coordinate Route53, ACM, the serving resource, and validation records in one graph. Confirm the hosted zone and account before mutation; certificate and DNS changes can affect unrelated traffic.

## Authentication And State

Alchemy supports AWS SSO, standard environment credentials, and stored access keys through profiles.

- Prefer SSO locally.
- Prefer short-lived, federated CI credentials over long-lived keys.
- Use a separate profile/account boundary for production when available.
- Run `alchemy profile show` and AWS identity checks before high-impact plans or deploys.
- Never copy local credentials into stack outputs or CI logs.

## Observability

- Lambda and service logs flow to CloudWatch.
- Declare dashboards and metric alarms with the resources they observe.
- Return useful URLs/ARNs and stable dimensions for tests and operations.
- Add Effect spans and structured fields inside runtime handlers; use `observability.md` for cross-provider guidance.

## Verification

- `alchemy plan` targets the intended account, region, stage, and profile.
- Lambda assets are bootstrapped before CI deploys.
- IAM statements are operation- and resource-scoped.
- Event consumers have retry, batch, failure, and dead-letter behavior.
- Public URLs, API contracts, and domain records are integration-tested.
- Real-cloud tests use unique stages and guaranteed cleanup.
- Destructive tests never target production or shared persistent data.
