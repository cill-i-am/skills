# AWS compute, data, events, and IAM

## Select the runtime by workload

Use Lambda for request/event functions when its runtime and execution model fit. Use ECS/Fargate for container services and run-to-completion tasks. Use EC2 for a VM-level requirement. Use EKS when Kubernetes is an explicit operational choice, not merely because the app uses containers. MicroVM support is a distinct isolated-execution capability; use the current guide rather than inferring its image or lifecycle API from EC2.

Before designing, establish account, region, credentials, state backend, network exposure, data ownership, and cost constraints. Use an explicit sandbox profile locally and short-lived credentials in CI. Avoid cross-region defaults hidden in SDK environment configuration.

## Lambda with a typed S3 capability

```ts
import * as AWS from "alchemy/AWS";
import * as S3 from "alchemy/AWS/S3";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Inside Lambda construction:
const bucket = yield* S3.Bucket("Documents");
const getObject = yield* S3.GetObject(bucket);
// In a request handler:
const object = yield* getObject({ Key: "example.txt" });
```

Provide `S3.GetObjectHttp` at the runtime boundary. A binding's capability declaration and its HTTP implementation Layer are separate. Add `PutObject`/`PutObjectHttp` only for consumers that write. The AWS SDK-shaped request omits the bound Bucket field; Alchemy supplies the resource and wires the corresponding permission.

The complete [Lambda asset](examples.md) uses `AWS.Lambda.Function`, `main: import.meta.url`, and the documented Function URL option. `functionUrl: true` makes a public endpoint in the tutorial form; it is not protected by default. Add application authentication or the appropriate AWS endpoint policy before handling private data.

## Data choices

S3 suits objects; DynamoDB suits access-pattern-driven key/value and document data; relational systems suit SQL joins and transactions. Define partitioning, indexes, retention, backups, and migration strategy before picking a resource solely because it is easy to declare. DynamoDB table key changes can be replacements, not a transparent schema migration.

Bind the minimum operation needed. Test missing objects/items, conditional writes, duplicate operations, and permission failure. Stream S3 bodies instead of buffering large objects. Distinguish an absent object from an AccessDenied or network error; catching all reads as NotFound can hide a production incident.

For relational databases, separate cluster provisioning, credentials, network access, schema migration, and runtime connection management. A Lambda or ECS service in a VPC must still have the appropriate path to the database and any external endpoints. Avoid granting broad network access as the default fix for a timeout.

## Events and asynchronous work

Use SQS for queued delivery, SNS for publish/subscribe, and other documented event sources for their actual semantics. Bind the consumer through Alchemy's event-source mechanism and supply the matching runtime Layer. Do not manually duplicate an event mapping already created by the binding.

Delivery retries require idempotency. Bound batches and concurrency, configure a dead-letter policy, and distinguish retryable provider failures from invalid messages. For streams, checkpoints and partial batch failure semantics are resource-specific. Read the exact guide before assuming an acknowledgement model copied from Cloudflare Queues applies to AWS.

## Containers and networks

ECS Tasks and Services differ: a Task finishes; a Service maintains desired running capacity. Specify image provenance, startup health, ports, resource sizing, logs, graceful termination, and task identity. Image build can occur during planning/diff and may need Docker; a plan is not guaranteed to be computationally cheap or side-effect-free locally.

For public HTTP, make the load balancer/endpoint and TLS path explicit. For private services, verify subnet routes, security groups, DNS, and calling identity. Separate application secrets from image layers and build arguments. Use immutable image references in reproducible releases.

## IAM and CI

Prefer capabilities that generate narrowly scoped statements, then inspect the actual policy. Runtime and deployment roles are different. A function that can read one bucket does not need the deployment role's authority. For GitHub OIDC, restrict audience and subject and protect the referenced environment; do not copy a tutorial's AdministratorAccess policy into production.

## Verification and recovery

Local emulation is useful but not proof of AWS IAM propagation, service quotas, VPC routing, or every event-source feature. Use a narrow approved integration suite and verify actual provider state independently. Record failed cleanup and retained resources. A resource replacement does not imply data transfer or zero downtime; rehearse it on a disposable copy before production.

## Sources

- [aws](https://alchemy.run/aws/)
- [aws/setup](https://alchemy.run/aws/setup/)
- [aws/compute/choosing-a-runtime](https://alchemy.run/aws/compute/choosing-a-runtime/)
- [aws/compute/ecs](https://alchemy.run/aws/compute/ecs/)
- [aws/compute/ec2](https://alchemy.run/aws/compute/ec2/)
- [aws/compute/eks](https://alchemy.run/aws/compute/eks/)
- [aws/compute/microvms](https://alchemy.run/aws/compute/microvms/)
- [aws/tutorial/part-2](https://alchemy.run/aws/tutorial/part-2/)
- [aws/data/s3](https://alchemy.run/aws/data/s3/)
- [aws/data/dynamodb](https://alchemy.run/aws/data/dynamodb/)
- [aws/local-development](https://alchemy.run/aws/local-development/)
- [aws/tutorial/part-5](https://alchemy.run/aws/tutorial/part-5/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
