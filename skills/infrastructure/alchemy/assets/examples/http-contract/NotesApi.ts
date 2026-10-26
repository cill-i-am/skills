import * as Schema from "effect/Schema";
import * as HttpApi from "effect/http-api/HttpApi";
import * as HttpApiEndpoint from "effect/http-api/HttpApiEndpoint";
import * as HttpApiGroup from "effect/http-api/HttpApiGroup";
export class Note extends Schema.Class<Note>("Note")({ id: Schema.String, title: Schema.String }) {}
export class NoteNotFound extends Schema.TaggedErrorClass<NoteNotFound>()(
  "NoteNotFound", { id: Schema.String }, { httpApiStatus: 404 },
) {}
const getNote = HttpApiEndpoint.get("getNote", "/:id", {
  params: Schema.Struct({ id: Schema.String }), success: Note, error: NoteNotFound,
});
export class Notes extends HttpApiGroup.make("Notes").add(getNote) {}
export class NotesApi extends HttpApi.make("NotesApi").add(Notes) {}
