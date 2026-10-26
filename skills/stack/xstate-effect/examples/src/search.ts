import { Context, Effect, Schema } from 'effect';
import { fromEffect, setupEffect } from '@xstate/effect';
import { standardSchemaValidator } from 'xstate/validation';

export class Search extends Context.Service<Search, {
  readonly lookup: (query: string) => Effect.Effect<ReadonlyArray<string>, Error>;
}>()('example/Search') {}

export interface SearchContext {
  readonly query: string;
  readonly results: ReadonlyArray<string>;
  readonly error: string;
}

const queryTransition = ({ context, event }: {
  readonly context: SearchContext;
  readonly event: { readonly type: 'QUERY'; readonly query: string };
}) => {
  const query = event.query.trim();
  return {
    target: query.length === 0 ? 'idle' as const : 'debouncing' as const,
    reenter: true,
    context: { ...context, query, results: [], error: '' }
  };
};

const searchTask = fromEffect({
  schemas: { input: Schema.Struct({ query: Schema.String }) },
  effect: ({ input }) => Search.use((api) => api.lookup(input.query))
});

/** Local latest-wins search; remote writes require a different revision policy. */
export const searchMachine = setupEffect({
  schemas: {
    context: Schema.Struct({
      query: Schema.String,
      results: Schema.Array(Schema.String),
      error: Schema.String
    }),
    events: { QUERY: Schema.Struct({ query: Schema.String }) }
  },
  actors: { search: searchTask }
}).createMachine({
  id: 'search',
  validator: standardSchemaValidator(),
  context: { query: '', results: [], error: '' },
  initial: 'idle',
  states: {
    idle: { on: { QUERY: queryTransition } },
    debouncing: {
      after: { 250: { target: 'searching' } },
      on: { QUERY: queryTransition }
    },
    searching: {
      invoke: {
        src: 'search',
        input: ({ context }) => ({ query: context.query }),
        onDone: ({ context, event }) => ({
          target: 'results', context: { ...context, results: event.output }
        }),
        onError: ({ context }) => ({
          target: 'failed', context: { ...context, error: 'Search unavailable' }
        })
      },
      on: { QUERY: queryTransition }
    },
    results: { on: { QUERY: queryTransition } },
    failed: { on: { QUERY: queryTransition } }
  }
});
