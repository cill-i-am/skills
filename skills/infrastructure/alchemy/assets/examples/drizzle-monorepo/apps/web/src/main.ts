import { Health } from "@example/contracts/health";
import * as Schema from "effect/Schema";

const status = document.querySelector<HTMLParagraphElement>("#status");
if (!status) throw new Error("Missing status element");
try {
  const base = import.meta.env.VITE_API_URL;
  if (!base) throw new Error("Missing public API URL");
  const response = await fetch(new URL("/health", base));
  if (!response.ok) throw new Error(`Health check returned ${response.status}`);
  const health = Schema.decodeUnknownSync(Health)(await response.json());
  status.textContent = health.status;
} catch {
  status.textContent = "Health check failed";
}
// Deliberately no APP_API_TOKEN, Drizzle client, Alchemy import, or protected CRUD UI.
