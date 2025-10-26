import { eq, and } from "drizzle-orm";
import { todos } from "./schema";
import { db } from "./db";
import type { CreateTodo, PatchTodo } from "../types";

export const createTodo = async (
  userId: string,
  { title, description }: CreateTodo
) => {
  const [todo] = await db
    .insert(todos)
    .values({
      title,
      description: description ?? null,
      completed: false,
      userId,
    })
    .returning();

  return todo;
};

// export const patchTodo = async (userId: string, todoId: string, patchTodo: PatchTodo) => {
//   const updatedTodo = db
//     .update(todos)
//     .set(patchTodo)
//     .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
//     .returning();
//   return updatedTodo;
// };

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
