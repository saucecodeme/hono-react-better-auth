import { Hono } from "hono";
import { auth } from "./lib/auth";
import { todos } from "./routes/todo.routes";
import { tags } from "./routes/tag.routes";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";

// const app = new Hono().basePath("/api");
const app = new Hono();

const router = app
  .use(logger())
  .use("/*", serveStatic({ root: "./client" }))
  .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
  .route("/api/todos", todos)
  .route("/api/tags", tags)
  .get("*", serveStatic({ path: "./client/index.html" }));

export type AppType = typeof router;
export default app;
