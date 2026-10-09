import { defineConfig } from "drizzle-kit";

// Run through the root db:generate:sqlite script; pnpm --filter sets package cwd.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/sqlite-schema.ts",
  out: "./drizzle/sqlite",
});
