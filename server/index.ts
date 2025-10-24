import { Hono } from "hono";
import { getTodos } from "./db/queries";
import { auth } from "./lib/auth";

const app = new Hono().basePath("/api");

const router = app
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/todos", async (c) => {
    try {
      const todos = await getTodos();
      return c.json(todos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      return c.json({ error: "Failed to fetch todos" }, 500);
    }
  })
  .get("/user", (c) => {
    return c.json([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Alice Johnson" },
    ]);
  });

export type AppType = typeof router;
export default app;
