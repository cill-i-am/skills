import { defineConfig } from "drizzle-kit";

// Run through the root db:generate:postgres script; pnpm --filter sets package cwd.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/postgres-schema.ts",
  out: "./drizzle/postgres",
});
