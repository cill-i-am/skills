import * as Cloudflare from "alchemy/Cloudflare";
// Run this example with cloudflare-d1 as the working directory.
export const Database = Cloudflare.D1.Database("Database", {
  migrations: "./migrations",
});
