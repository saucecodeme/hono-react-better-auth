import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import type { HonoEnv } from "../types";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export const ai = new Hono<HonoEnv>()
  .use(authMiddleware)
  .post("/plan-todo", async (c) => {
    const user = c.get("user");

    let body: { title: string; description?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const { title, description } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    try {
      const prompt = `You are a helpful assistant that breaks down tasks into actionable sub-tasks.
Given a todo task, analyze it and create a step-by-step plan by breaking it down into smaller, manageable todos.

Task Title: ${title}
${description ? `Task Description: ${description}` : ""}

Please provide a detailed breakdown of this task into smaller todos. Format your response as a JSON array of todo objects, where each object has:
- title: A clear, actionable title for the sub-task
- description: A brief description of what needs to be done (optional)

Return ONLY the JSON array, no additional text or explanation.

Example format:
[
  {
    "title": "Research Drizzle ORM documentation",
    "description": "Read through the official Drizzle ORM docs to understand core concepts"
  },
  {
    "title": "Install Drizzle ORM dependencies",
    "description": "Add drizzle-orm and drizzle-kit packages to the project"
  }
]`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      // Extract JSON from the response
      let responseText = content.text.trim();

      // Remove markdown code blocks if present
      if (responseText.startsWith("```")) {
        responseText = responseText
          .replace(/^```json?\n?/, "")
          .replace(/\n?```$/, "");
      }

      const plannedTodos = JSON.parse(responseText);

      return c.json({
        success: true,
        todos: plannedTodos,
      });
    } catch (error) {
      console.error("Failed to plan todo with AI:", error);
      return c.json(
        {
          error: "Failed to plan todo with AI",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });
