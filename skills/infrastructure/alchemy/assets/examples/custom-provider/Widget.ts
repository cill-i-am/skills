import { Resource } from "alchemy";
import * as Provider from "alchemy/Provider";
import * as Effect from "effect/Effect";
export interface WidgetProps { name: string; enabled: boolean }
export interface WidgetAttributes { id: string; name: string; enabled: boolean }
export type Widget = Resource<"Example.Widget", WidgetProps, WidgetAttributes>;
export const Widget = Resource<Widget>("Example.Widget");

// Supply a separate store per stack/stage. This example models one process.
export const WidgetProvider = (store: Map<string, WidgetAttributes>) =>
  Provider.succeed(Widget, Widget.Provider.of({
    read: ({ output, fqn }) => Effect.sync(() => store.get(output?.id ?? fqn)),
    reconcile: ({ output, fqn, news }) => Effect.sync(() => {
      const id = output?.id ?? fqn;
      const current = store.get(id);
      if (current && current.name === news.name && current.enabled === news.enabled) {
        return current;
      }
      const next = { id, name: news.name, enabled: news.enabled };
      store.set(id, next);
      return next;
    }),
    delete: ({ output }) => Effect.sync(() => { store.delete(output.id); }),
    list: () => Effect.sync(() => Array.from(store.values())),
  }));
