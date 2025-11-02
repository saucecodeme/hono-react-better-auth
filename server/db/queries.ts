import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { todos, tags } from "./schema";

export const getTodos = async () => {
  return await db.select().from(todos).orderBy(desc(todos.createdAt));
};

export const getTodosByUserId = async (userId: string) => {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
};

export const getTodosWithTagsByUserId = async (userId: string) => {
  return await db.query.todos.findMany({
    where: eq(todos.userId, userId),
    with: {
      todosToTags: {
        with: {
          tag: true,
        },
      },
    },
  });
};

export const getTagsByUserId = async (userId: string) => {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(desc(tags.createdAt));
};
