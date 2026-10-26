import { Resource } from "alchemy";
import * as Provider from "alchemy/Provider";
import * as Effect from "effect/Effect";
export interface WidgetProps { name: string; enabled: boolean }
export interface WidgetAttributes { id: string; name: string; enabled: boolean }
export type Widget = Resource<"Example.Widget", WidgetProps, WidgetAttributes>;
export const Widget = Resource<Widget>("Example.Widget");
// Explicitly nonfunctional scaffold: it fails rather than pretending to have
// reconciled/listed/deleted a resource. Implement the lifecycle and tests first.
export const WidgetProvider = () => Provider.succeed(Widget, Widget.Provider.of({
  reconcile: () => Effect.die("Implement observe / ensure / sync / fresh attributes"),
  delete: () => Effect.die("Implement ownership-aware, idempotent deletion"),
  list: () => Effect.die("Implement paginated, ownership-scoped listing"),
}));
