import { defineRelations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
});
export const relations = defineRelations({ notes });
