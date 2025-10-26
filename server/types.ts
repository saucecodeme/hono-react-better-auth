// setup hono env
import { auth } from "./lib/auth";
import { todos } from "./db/schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

// Zod schemas from Drizzle ORM schemas
export const todosInsertSchema = createInsertSchema(todos);
export const createTodoSchema = todosInsertSchema
  .pick({ title: true, description: true })
  .refine((p) => !!p.title && p.title.trim().length > 0, {
    message: "Title is required",
  });
export type CreateTodo = z.infer<typeof createTodoSchema>;

export const patchTodoSchema = todosInsertSchema
  .pick({
    title: true,
    description: true,
    completed: true,
  })
  .partial()
  .refine(
    (payload) => Object.keys(payload).length > 0,
    "Provide at least one of title, description, or completed."
  );
export type PatchTodo = z.infer<typeof patchTodoSchema>;
