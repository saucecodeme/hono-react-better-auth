import { eq, and } from "drizzle-orm";
import { todos, tags, todosToTags } from "./schema";
import { db } from "./db";
import type {
  CreateTodo,
  PatchTodo,
  CreateTag,
  PatchTag,
  NewTagV2,
} from "../types";

export const createTodo = async (
  userId: string,
  { title, description, tags }: CreateTodo
) => {
  const [todo] = await db
    .insert(todos)
    .values({
      title,
      description: description ?? null,
      tags: tags ?? [],
      completed: false,
      userId,
    })
    .returning();

  return todo;
};

export const patchTodo = async (
  userId: string,
  todoId: string,
  patchTodo: PatchTodo
) => {
  const updateData = Object.fromEntries(
    Object.entries(patchTodo).filter(([, value]) => value !== undefined)
  ) as PatchTodo;

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  const [todo] = await db
    .update(todos)
    .set(updateData)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();

  return todo ?? null;
};

export const deleteTodo = async (userId: string, todoId: string) => {
  const [todo] = await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();
  return todo ?? null;
};

// * Tags
export const createTag = async (
  userId: string,
  { name, colorHex }: CreateTag
) => {
  const [tag] = await db
    .insert(tags)
    .values({
      userId,
      name,
      colorHex,
    })
    .returning();
  return tag;
};

export const createTagV2 = async (
  userId: string,
  data: Omit<NewTagV2, "userId">
) => {
  const [newTag] = await db
    .insert(tags)
    .values({
      userId,
      name: data.name,
      colorHex: data.colorHex,
    })
    .returning();
  return newTag;
  // return { success: true, data: newTag };
};

export const patchTag = async (
  userId: string,
  tagId: string,
  patchTag: PatchTag
) => {
  const [tag] = await db
    .update(tags)
    .set(patchTag)
    .where(and(eq(tags.userId, userId), eq(tags.id, tagId)))
    .returning();
  return tag ?? null;
};

export const deleteTag = async (userId: string, tagId: string) => {
  const [tag] = await db
    .delete(tags)
    .where(and(eq(tags.userId, userId), eq(tags.id, tagId)))
    .returning();
  return tag ?? null;
};

//

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

function generateDefaultColor(tagName: string): string {
  // Generate a color based on the tag name hash
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Plum
    "#98D8C8", // Mint
    "#F7DC6F", // Gold
    "#BB8FCE", // Purple
    "#85C1E2", // Sky Blue
  ];

  // Simple hash function to get consistent color for same tag name
  const hash = tagName.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return colors[hash % colors.length];
}

/*

*/
export async function addTagsToTodo(
  todoId: string,
  tagNames: string[],
  tagColors?: Record<string, string> // Auto generates if not provided
) {
  /* 
  1. Input Validation
  - [x] Validate raw input
  - Remove duplicates and empty strings from tagNames then revalidate
  2. Create SQL transaction to interact with databse using Drizzle
  - Get the todo to verify it exists and get the userId
  - Loop process each tag
    - Check if the tag already exists for this user
    - Create the tag if it doen't exist (Auto color generates if not provided)
    - Validate color format
    - Check if the association already exists
    - Create association if not existed
  3. Return the result
  */

  if (!todoId || !tagNames || tagNames.length === 0) {
    return {
      success: false,
      error: "Invalid input: todoId and tagNames are required",
      data: [],
    };
  }

  const uniqueTagNames = [...new Set(tagNames.filter((name) => name.trim()))];
  if (uniqueTagNames.length === 0) {
    return {
      success: false,
      error: "No valid tag names provided",
      data: [],
    };
  }

  try {
    return await db.transaction(async (tx) => {
      const [todo] = await tx
        .select({
          id: todos.id,
          userId: todos.userId,
        })
        .from(todos)
        .where(eq(todos.id, todoId))
        .limit(1);

      if (!todo) {
        return {
          success: false,
          error: "Todo not found",
          data: [],
        };
      }

      const addedTags = [];
      const errors = [];
      const skipped = [];

      for (const tagName of uniqueTagNames) {
        try {
          let [existingTag] = await tx
            .select()
            .from(tags)
            .where(and(eq(tags.userId, todo.userId), eq(tags.name, tagName)))
            .limit(1);

          if (!existingTag) {
            const colorHex =
              tagColors?.[tagName] || generateDefaultColor(tagName);

            if (!isValidHexColor(colorHex)) {
              errors.push({
                tagName,
                error: `Invalid color format: ${colorHex}. Must be 7 characters like #FF0000`,
              });
              continue;
            }

            [existingTag] = await tx
              .insert(tags)
              .values({
                userId: todo.userId,
                name: tagName,
                colorHex,
              })
              .returning();
          }

          const [existingAssociation] = await tx
            .select()
            .from(todosToTags)
            .where(
              and(
                eq(todosToTags.todoId, todoId),
                eq(todosToTags.tagId, existingTag.id)
              )
            )
            .limit(1);

          if (existingAssociation) {
            skipped.push({
              tagName,
              reason: "Tag already assigned to this todo",
              tag: existingTag,
            });
            continue;
          }

          await tx.insert(todosToTags).values({
            todoId,
            tagId: existingTag.id,
          });

          addedTags.push(existingTag);
        } catch (error) {
          console.error(`Error adding tag "${tagName}":`, error);
          errors.push({
            tagName,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return {
        success: errors.length === 0,
        data: addedTags,
        error: errors.length > 0 ? errors : undefined,
        skipped: skipped.length > 0 ? skipped : undefined,
      };
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transaction failed",
      data: [],
    };
  }
}
