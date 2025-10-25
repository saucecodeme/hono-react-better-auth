import { db, pool } from "../server/db/db";
import * as schema from "../server/db/schema";
import { seed } from "drizzle-seed";

const seedDb = async () => {
  await seed(db, schema).refine((func) => ({
    // create 10 users with 10 todos list
    user: {
      columns: {},
      count: 10,
      with: {
        todos: 10,
      },
    },
    todos: {
      columns: {
        title: func.valuesFromArray({ values: ["Buy groceries", "Walk the dog", "Read a book", "Write code", "Exercise"] }),
        description: func.valuesFromArray({
          values: [
            undefined,
            "Milk, Bread, Eggs",
            "30-minute walk in the park",
            "Finish reading 'Clean Code'",
            "Work on Hono project",
            "30 minutes of cardio",
          ],
        }),
        // completed: func.valuesFromArray({ values: [false, true, false, false, true] }),
      },
    },
  }));
};

seedDb()
  .then(() => {
    console.log("Seeded local database successfully.");
    return pool.end();
  })
  .catch((error) => {
    console.error("Error seeding local database:", error);
    return pool.end();
  });
