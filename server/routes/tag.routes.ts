import { Hono } from "hono";
import type { HonoEnv } from "../types";
import { authMiddleware } from "../middleware/auth.middleware";
import { getTagsByUserId } from "../db/queries";
import { createTagSchema } from "../types";
import { createTag } from "../db/mutation";
import { z } from "zod";

export const tags = new Hono<HonoEnv>()
  .use(authMiddleware)
  .get("/", async (c) => {
    const user = c.get("user");

    try {
      const tags = await getTagsByUserId(user.id);
      return c.json(tags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
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

    const parsed = createTagSchema.safeParse(body);
    if (parsed.error) {
      return c.json({
        error: "Invalid payload",
        details: z.treeifyError(parsed.error),
      });
    }

    try {
      const tag = await createTag(user.id, parsed.data);
      return c.json(tag, 201);
    } catch (error) {
      console.log("Failed to create tag:", error);
      return c.json({ error: "Failed to create todo" }, 500);
    }
  });
