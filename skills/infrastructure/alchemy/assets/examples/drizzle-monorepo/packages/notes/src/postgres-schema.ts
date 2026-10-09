import { defineRelations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
});
export const relations = defineRelations({ notes });
