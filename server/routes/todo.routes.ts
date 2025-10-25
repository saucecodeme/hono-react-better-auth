import { Hono } from "hono";
import { getTodosByUserId } from "../db/queries";
import { authMiddleware } from "../middleware/auth.middleware";
import { HonoEnv } from "../types";

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
  });
