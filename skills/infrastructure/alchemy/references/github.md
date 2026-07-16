# GitHub

Use this file for Alchemy's GitHub provider, GitHub Actions CI, PR preview comments, credentials-as-code, repository resources, Actions secrets/variables, webhooks, and repository event subscriptions.

## Contents

- Provider setup and auth
- PR preview comments
- Credentials-as-code stack
- Secrets and variables
- Repository resources
- Webhooks and repository events
- GitHub Actions workflow notes
- Gotchas

## Provider Setup And Auth

Import and merge the provider when a stack declares GitHub resources:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  GitHub.providers(),
)
```

`GitHub.providers()` covers:

- `GitHub.Comment`
- `GitHub.Repository`
- `GitHub.Secret`
- `GitHub.Variable`
- `GitHub.Webhook`
- auth provider integration for `alchemy login`

Auth methods:

- `gh-cli`: delegates to `gh auth token`; run `gh auth login` first. This is the best local default.
- `env`: reads `GITHUB_ACCESS_TOKEN` first, then `GITHUB_TOKEN`.
- `stored`: prompts for a PAT and stores it under `~/.alchemy/credentials`.

Commands:

```sh
gh auth login
pnpm exec alchemy login --configure
pnpm exec alchemy login --profile admin --configure
```

Token scopes depend on resources:

- PR comments: `repo` for private repos or `public_repo` for public repos; GitHub Actions `GITHUB_TOKEN` also needs `pull-requests: write`.
- Secrets and variables: token must be allowed to administer repository Actions secrets/variables.
- Webhooks: token needs admin access to the repository.
- Repository delete: token needs `delete_repo`, and the resource must opt into deletion.

## PR Preview Comments

Use `GitHub.Comment` with a stable logical ID. The first deploy creates the comment; later deploys update the same comment body.

```ts
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";

if (process.env.PULL_REQUEST) {
  yield* GitHub.Comment("preview-comment", {
    owner: "your-org",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: Output.interpolate`
Preview deployed

URL: ${web.url}
Commit: ${process.env.GITHUB_SHA?.slice(0, 7)}
`,
  });
}
```

Do not generate a new logical ID per commit. Keep `"preview-comment"` stable so pushes update the same PR comment.

By default comments are not deleted on destroy. Set `allowDelete: true` only for temporary comments where deletion is desired.

## Credentials-As-Code Stack

Use a dedicated `stacks/github.ts` for repository secrets/variables and provider CI credentials. Deploy it manually with an elevated `admin` profile, then let normal app deploys use scoped CI credentials.

```ts
// stacks/github.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

export default Alchemy.Stack(
  "github",
  {
    providers: Layer.mergeAll(
      Cloudflare.providers(),
      GitHub.providers(),
    ),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const accountId = yield* Config.string("CLOUDFLARE_ACCOUNT_ID");

    const token = yield* Cloudflare.ApiToken.AccountApiToken("CIToken", {
      accountId,
      policies: [
        {
          effect: "allow",
          permissionGroups: [
            "Workers Scripts Write",
            "Workers KV Storage Write",
            "Workers R2 Storage Write",
            "D1 Write",
            "Queues Write",
            "Pages Write",
            "Account Settings Write",
            "Secrets Store Write",
            "Workers Tail Read",
          ],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: "*",
          },
        },
      ],
    });

    yield* GitHub.Secret("cf-api-token", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_API_TOKEN",
      value: token.value,
    });

    yield* GitHub.Secret("cf-account-id", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_ACCOUNT_ID",
      value: Redacted.make(accountId),
    });
  }),
);
```

Deploy:

```sh
pnpm exec alchemy deploy stacks/github.ts --profile admin
```

Use the admin profile only for this stack. Do not use it for routine app deploys.

## Secrets And Variables

Use `GitHub.Secret` for sensitive values. Values must be redacted unless already redacted by another provider output.

```ts
import * as GitHub from "alchemy/GitHub";
import * as Redacted from "effect/Redacted";

yield* GitHub.Secret("database-url", {
  owner: "your-org",
  repository: "your-repo",
  environment: "production",
  name: "DATABASE_URL",
  value: Redacted.make(databaseUrl),
});
```

Use `GitHub.Variable` for plain-text non-secrets:

```ts
yield* GitHub.Variable("deploy-region", {
  owner: "your-org",
  repository: "your-repo",
  name: "DEPLOY_REGION",
  value: "iad",
});
```

Bulk helpers:

```ts
yield* GitHub.Secrets({
  owner: "your-org",
  repository: "your-repo",
  environment: "production",
  secrets: {
    CLOUDFLARE_API_TOKEN: cloudflareToken.value,
    DATABASE_URL: databaseUrl,
  },
});

yield* GitHub.Variables({
  owner: "your-org",
  repository: "your-repo",
  variables: {
    DEPLOY_REGION: "iad",
    APP_ENV: "production",
  },
});
```

Notes:

- Repository secrets and environment secrets are different locations. Moving a secret into or out of an environment deletes the old location and upserts the new one.
- Secret values cannot be read back from GitHub, so Alchemy re-encrypts and upserts them.
- Environment secrets require the target environment to exist and the token to have permission.
- Bulk helpers use the map key as the logical ID and GitHub name, so avoid duplicate keys across helpers in the same stack scope.

## Repository Resources

`GitHub.Repository` manages repository settings. Repositories retain by default on destroy to protect commits, issues, and PR history.

```ts
import * as GitHub from "alchemy/GitHub";

const repo = yield* GitHub.Repository("app-repo", {
  owner: "your-org",
  name: "my-app",
  description: "Production app repository",
  visibility: "private",
  hasWiki: false,
  hasProjects: false,
  deleteBranchOnMerge: true,
  allowMergeCommit: false,
  allowRebaseMerge: false,
  allowSquashMerge: true,
  topics: ["alchemy", "cloudflare", "typescript"],
});

yield* GitHub.Variable("repo-url", {
  owner: "your-org",
  repository: "my-app",
  name: "REPOSITORY_URL",
  value: repo.htmlUrl,
});
```

Repository behavior:

- Changing `name` with the same logical ID renames the repository in place.
- Changing `owner` is a replacement.
- `autoInit`, `gitignoreTemplate`, and `licenseTemplate` only apply at create time.
- Deletion requires explicit removal policy and a token with `delete_repo`.

## Webhooks And Repository Events

Use `GitHub.Webhook` when you need a raw GitHub repository webhook. Inside the stack `Effect.gen` body:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";

const secret = yield* Config.redacted("GITHUB_WEBHOOK_SECRET");

yield* GitHub.Webhook("repo-webhook", {
  owner: "your-org",
  repository: "your-repo",
  url: worker.url.as<string>(),
  events: ["push", "pull_request"],
  secret,
});
```

Prefer `GitHub.consumeRepositoryEvents(...)` inside a Cloudflare Worker when Alchemy should provision the webhook, claim the delivery route, verify signatures, and dispatch typed deliveries to an Effect handler.

```ts
// src/GitHubEvents.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class GitHubEvents extends Cloudflare.Worker<GitHubEvents>()(
  "GitHubEvents",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const secret = yield* Config.redacted("GITHUB_WEBHOOK_SECRET");

    yield* GitHub.consumeRepositoryEvents(
      {
        owner: "your-org",
        repository: "your-repo",
        events: ["push", "pull_request"],
        secret,
      },
      (event) => Effect.log(`received ${event.name} delivery ${event.id}`),
    );

    return {
      fetch: Effect.succeed(HttpServerResponse.text("ok")),
    };
  }).pipe(
    Effect.provide(
      Cloudflare.Workers.GitHubRepositoryEventSourceLive,
    ),
  ),
) {}
```

Stack:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import GitHubEvents from "./src/GitHubEvents.ts";

export default Alchemy.Stack(
  "GitHubEvents",
  {
    providers: Layer.mergeAll(
      Cloudflare.providers(),
      GitHub.providers(),
    ),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const worker = yield* GitHubEvents;
    return { url: worker.url.as<string>() };
  }),
);
```

Event-source notes:

- `GitHub.consumeRepositoryEvents` currently has a Cloudflare Worker implementation.
- The delivery path defaults to a deterministic per-repository path.
- Always provide a webhook secret unless there is a strong reason not to.
- The runtime verifies `X-Hub-Signature-256` before calling the handler.

## GitHub Actions Workflow Notes

Use explicit permissions. Only add `pull-requests: write` when posting PR comments.

```yaml
permissions:
  contents: read
  pull-requests: write
```

Deploy steps should pass provider secrets and GitHub context explicitly:

```yaml
- name: Deploy
  run: pnpm exec alchemy deploy --stage ${{ env.STAGE }}
  env:
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_SHA: ${{ github.sha }}
    PULL_REQUEST: ${{ github.event.number }}
```

For monorepos with package-level stacks:

```yaml
- run: pnpm --filter @acme/api exec alchemy deploy --stage ${{ env.STAGE }}
- run: pnpm --filter @acme/web exec alchemy deploy --stage ${{ env.STAGE }}
```

Cleanup must guard production and run in dependency order:

```yaml
- run: |
    if [ "${{ env.STAGE }}" = "prod" ]; then
      echo "ERROR: refusing to destroy prod"
      exit 1
    fi
- run: pnpm --filter @acme/web exec alchemy destroy --stage ${{ env.STAGE }}
- run: pnpm --filter @acme/api exec alchemy destroy --stage ${{ env.STAGE }}
```

## Gotchas

- `GitHub.providers()` is required for every GitHub resource and event-source webhook policy.
- `GITHUB_TOKEN` works for workflow-local operations only if permissions allow it. Do not assume it can create secrets, variables, webhooks, or repositories.
- Use a separate admin profile for `stacks/github.ts`; do not use admin credentials for normal deploys.
- Keep comment logical IDs stable to update in place.
- Use `allowDelete: true` only when deleting comments is intentional.
- Repository destroy retains by default. Deletion requires both explicit removal policy and token permission.
- Secrets are not readable after creation; debug secret updates by checking timestamps and workflow access, not by trying to read values.
- Variables are plain text. Never put tokens, database URLs, or passwords in variables.
- Webhooks require repository admin access.
- `GitHub.consumeRepositoryEvents(...)` needs a Cloudflare Worker host and `Cloudflare.Workers.GitHubRepositoryEventSourceLive`.
