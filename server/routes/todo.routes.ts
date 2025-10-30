import { Hono } from "hono";
import { getTodosByUserId } from "../db/queries";
import { createTodo, patchTodo, deleteTodo } from "../db/mutation";
import { authMiddleware } from "../middleware/auth.middleware";
import type { HonoEnv } from "../types";
import { z } from "zod";
import { createTodoSchema, patchTodoSchema } from "../types";
import { zValidator } from "@hono/zod-validator";

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
    } catch {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const parsed = createTodoSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { error: "Invalid payload", details: z.treeifyError(parsed.error) },
        400
      );
    }

    try {
      const todo = await createTodo(user.id, parsed.data);
      return c.json(todo, 201);
    } catch (error) {
      console.error("Failed to create todo:", error);
      return c.json({ error: "Failed to create todo" }, 500);
    }
  })
  .patch("/:id", zValidator("json", patchTodoSchema), async (c) => {
    const user = c.get("user");
    const todoId = c.req.param("id");

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const parsed = patchTodoSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { error: "Invalid payload", details: z.treeifyError(parsed.error) },
        400
      );
    }

    try {
      const todo = await patchTodo(user.id, todoId, parsed.data);
      if (!todo) {
        return c.json({ error: "Todo not found" }, 404);
      }

      return c.json(todo, 200);
    } catch (error) {
      console.error("Failed to update todo: ", error);
      return c.json({ error: "Failed to update todo" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    try {
      const todo = await deleteTodo(user.id, id);
      if (!todo) {
        return c.json({ error: "Todo not found" }, 404);
      }
      return c.json(todo, 200);
    } catch (error) {
      console.error("Failed to delete todo: ", error);
      return c.json({ error: "Failed to delete todo" }, 500);
    }
  });
