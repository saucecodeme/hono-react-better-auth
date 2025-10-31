import { eq, and } from "drizzle-orm";
import { todos, tags } from "./schema";
import { db } from "./db";
import type { CreateTodo, PatchTodo, CreateTag, PatchTag } from "../types";

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
