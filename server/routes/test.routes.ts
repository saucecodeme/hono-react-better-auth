import { Hono } from "hono";
import type { HonoEnv } from "../types";
import { getTodosWithTagsByUserId } from "../db/queries";
import { createTagV2, addTagsToTodo } from "../db/mutation";
import { createTagSchema } from "../types";
import z from "zod";
import { zValidator } from "@hono/zod-validator";

const TEST_USER_ID = "jjvyw78HaUMPeBSsakzF6MAGbypo2ffT";
export const test = new Hono<HonoEnv>()
  .get("/getTodosWithTags", async (c) => {
    const userId = TEST_USER_ID;
    try {
      const res = await getTodosWithTagsByUserId(userId);
      return c.json(res, 200);
    } catch (error) {
      console.log("Failed to fetch tags:", error);
      return c.json({ error: "Failed to fetch todos" }, 500);
    }
  })
  .get("/addTagsToTodo", async (c) => {
    const res = await addTagsToTodo(
      "4e9b9537-7f66-42d4-a012-e70982283f59",
      ["Tanstack"],
      {
        polly: "#222222",
      }
    );
    return c.json(res, 200);
  })
  .post("/", async (c) => {
    const userId = TEST_USER_ID;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const parsed = createTagSchema.safeParse(body);
    if (parsed.error)
      return c.json(
        { error: "Invalid payload", details: z.treeifyError(parsed.error) },
        400
      );
    console.log(parsed.data);
    try {
      const tag = await createTagV2(userId, {
        name: parsed.data.name,
        colorHex: parsed.data.colorHex,
      });
      return c.json(tag, 201);
    } catch (error) {
      console.log("Failed to create tags:", error);
      return c.json({ error: "Failed to create tags" }, 500);
    }
  });
