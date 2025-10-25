import { Hono } from "hono";
import { createTodo, getTodosByUserId } from "../db/queries";
import { authMiddleware } from "../middleware/auth.middleware";
import { HonoEnv } from "../types";
import { z } from "zod";
import { todosInsertSchema, createTodoSchema } from "../types";

// const createTodoSchema = z.object({
//   title: z.string().min(1).max(500),
//   description: z.string().max(1000).optional(),
//   completed: z.boolean().default(false),
// });

// when working with RPC you need to make sure that everything is chained

export const todos = new Hono<HonoEnv>()
  .use(authMiddleware)
  .get("/", async (c) => {
    const user = c.get("user");

    try {
      const todos = await getTodosByUserId(user.id);
      return c.json(todos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      return c.json({ error: "Failed to fetch todos" }, 500);
    }
  })
  .post("/", async (c) => {
    const user = c.get("user");

    let body: unknown;
    try {
      body = await c.req.json();
    } catch (error) {
      console.log("after add json", error);
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const parsed = createTodoSchema.safeParse(body);

    if (!parsed.success) {
      // return c.json({ error: "Invalid payload", details: parsed.error.flatten() }, 400);
      return c.json(
        { error: "Invalid payload", details: z.treeifyError(parsed.error) },
        400
      );
    }

    try {
      // const todo = await createTodo(user.id, parsed.data);
      const fakeTodo = {
        id: 1,
        userId: user.id,
        title: parsed.data.title,
        description: parsed.data.description || "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return c.json(fakeTodo, 201);
    } catch (error) {
      console.error("Failed to create todo:", error);
      return c.json({ error: "Failed to create todo" }, 500);
    }
  });
