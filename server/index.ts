import { Hono } from "hono";
import { auth } from "./lib/auth";
import { todos } from "./routes/todo.routes";

const app = new Hono().basePath("/api");

const router = app
  .on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw))
  .route("/todos", todos)
  .get("/user", (c) => {
    return c.json([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Alice Johnson" },
    ]);
  });

export type AppType = typeof router;
export default app;
