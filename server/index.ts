import { Hono } from "hono";

const app = new Hono();

const router = app
    .get("/", (c) => {
        return c.text("Hello Hono!");
    })
    .get("/api/user", (c) => {
        return c.json([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
            { id: 3, name: "Alice Johnson" },
        ]);
    });

export type AppType = typeof router;
export default app;
