import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";
// Yield this inside a stack with GitHub.providers(). No comment is created
// unless the GitHub environment identifies a PR. The URL must be non-secret.
export const previewComment = (url: Output.Output<string>) => Effect.gen(function* () {
  const github = yield* GitHub.GitHubEnv;
  if (github?.pr) {
    yield* GitHub.Comment("PreviewComment", {
      owner: github.owner,
      repository: github.repository,
      issueNumber: github.pr,
      body: Output.interpolate`Preview: ${url}`,
    });
  }
});
