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
export const createTodoSchema = todosInsertSchema.pick({
  title: true,
  description: true,
});
export type CreateTodo = z.infer<typeof createTodoSchema>;
