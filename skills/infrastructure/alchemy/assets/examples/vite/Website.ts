import * as Cloudflare from "alchemy/Cloudflare";
// Fragment for an existing supported Vite app. This is not a complete
// frontend scaffold. Resolve the project root and public/runtime env split.
export const Website = Cloudflare.Website.Vite("Website", {
  env: { DEPLOYMENT_LABEL: "example" },
});
export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;
