import { Hono, type Context } from "hono";
import type { HonoEnv } from "../types";
import { authMiddleware } from "../middleware/auth.middleware";
import Antropic from "@anthropic-ai/sdk";

const anthropic = new Antropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const getPlanTodoPrompt = (title: string, description: string) => {
  // const PLAN_TODO_PROMPT = `
  // # Task Breakdown Prompt

  // You are a structured, detail-oriented assistant that decomposes tasks into clear, actionable subtasks.

  // Given a task, analyze it and generate a **step-by-step breakdown** of smaller todos needed to complete it.

  // ## Input
  // - **Task Title:** ${title}
  // ${description ? `- **Task Description:** ${description}` : ""}

  // ## Instructions
  // - Break the main task into smaller, logically ordered subtasks.
  // - Each subtask should have a clear, action-oriented title.
  // - Include a short description *only if it adds clarity* (optional).
  // - If a subtask could benefit from an external reference, include a helpful link in Markdown format (e.g., [Drizzle ORM Docs](https://orm.drizzle.team)).
  // - Output **must be valid JSON** — no extra text, comments, or explanations.

  // ## Output Format
  // [
  //   {
  //     "title": "Subtask title",
  //     "description": "Brief optional description with an optional [Link](https://example.com)"
  //   }
  // ]
  // `;

  const PLAN_TODO_PROMPT = `
  # Task Breakdown Prompt
  You are a structured, detail-oriented assistant that decomposes tasks into clear, actionable subtasks.

  Given a task, analyze it and generate a **step-by-step breakdown** of smaller todos needed to complete it.

  ## Input
  - **Task Title:** ${title}
  ${description ? `- **Task Description:** ${description}` : ""}

  ## Instructions
  - Break the main task into smaller, logically ordered subtasks.
  - Each subtask **must** have:
    - a clear, action-oriented \`title\`
    - a concise \`description\` (optional, but add it when it clarifies intent)
    - a \`steps\` array explaining **how to complete** that subtask, in 2–6 concrete steps
  - If a subtask could benefit from an external reference, include a helpful link in Markdown format in the description (e.g. \`[Drizzle ORM Docs](https://orm.drizzle.team)\`).
  - Output **must be valid JSON** — no extra text, comments, or explanations.
  - Keep language practical and instructional (what to click, what to read, what to create).

  ## Output Format
  [
    {
      "title": "Subtask title",
      "description": "Brief optional description with an optional [Link](https://example.com)",
      "steps": [
        "Step 1: ...",
        "Step 2: ...",
        "Step 3: ..."
      ]
    }
  ]
  `;
  return PLAN_TODO_PROMPT;
};

export const invalidPayload = (c: Context) => {
  return c.json({ error: "Invalid JSON payload" }, 400);
};

export const ai = new Hono<HonoEnv>()
  .use(authMiddleware)
  .post("/plan-todo", async (c) => {
    const user = c.get("user");

    let body: { title: string; description?: string };
    try {
      body = await c.req.json();
    } catch {
      return invalidPayload(c);
    }

    const { title, description } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    try {
      const prompt = getPlanTodoPrompt(title, description ?? "");
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
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
