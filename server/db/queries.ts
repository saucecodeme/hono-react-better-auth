import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { todos } from "./schema";

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

type NewTodoInput = {
  title: string;
  description?: string | null;
  completed?: boolean;
};

export const createTodo = async (
  userId: string,
  { title, description, completed }: NewTodoInput
) => {
  const [todo] = await db
    .insert(todos)
    .values({
      title,
      description: description ?? null,
      completed: completed ?? false,
      userId,
    })
    .returning();

  return todo;
};
