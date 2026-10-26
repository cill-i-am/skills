import * as Schema from "effect/Schema";

// Public transport shapes; no table, provider, migration, or database imports.
export const Note = Schema.Struct({ id: Schema.String, title: Schema.String });
export type Note = typeof Note.Type;
export const CreateNote = Schema.Struct({ title: Schema.String });
