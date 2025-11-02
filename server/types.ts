// setup hono env
import { auth } from "./lib/auth";
import { todos, tags } from "./db/schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

export type Todo = typeof todos.$inferSelect;
export type TodoQuery = Omit<Todo, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// Zod schemas from Drizzle ORM schemas
export const todosInsertSchema = createInsertSchema(todos);
export const createTodoSchema = todosInsertSchema
  .pick({ title: true, description: true, tags: true })
  .refine((p) => !!p.title && p.title.trim().length > 0, {
    message: "Title is required",
  });
export type CreateTodo = z.infer<typeof createTodoSchema>;

export const patchTodoSchema = todosInsertSchema
  .pick({
    title: true,
    description: true,
    completed: true,
    tags: true,
  })
  .partial()
  .refine(
    (payload) => Object.keys(payload).length > 0,
    "Provide at least one of title, description, completed, or tags."
  );
export type PatchTodo = z.infer<typeof patchTodoSchema>;

// * Tag
export type Tag = typeof tags.$inferSelect;
export type TagQuery = Omit<Tag, "createdAt"> & {
  createdAt: string;
};

export const tagsInsertSchema = createInsertSchema(tags);
export const createTagSchema = tagsInsertSchema
  .pick({ name: true, colorHex: true })
  .refine((p) => !!p.name && p.name.trim().length > 0, {
    message: "Name is required",
  })
  .refine((p) => !!p.colorHex && p.colorHex.trim().length === 7, {
    message: "Only accept Hex color format e.g. #ffffff",
  });
export type CreateTag = z.infer<typeof createTagSchema>;
export const patchTagSchema = tagsInsertSchema
  .pick({
    name: true,
    colorHex: true,
  })
  .partial()
  .refine((p) => !!p.name, {
    message: "Name is required",
  });
export type PatchTag = z.infer<typeof patchTagSchema>;

export type NewTagV2 = typeof tags.$inferInsert;
