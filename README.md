### Hono, React, Better Auth, RPC, Postgres, Tanstack, Bun

-   Manual TanStack Router & Query Scaffold
-   Create custom Button component with variants (Mimic from shadcn)
-   Setup proxy in vite
-   Implement Hono RPC
-   Setup and run Docker container locally
-   Database setup using Drizzle ORM

### Local Dev

1. Install dependencies

```sh
bun install
```

2. Copy `.env.example` to your own `.env` file
3. Setup database

```sh
bun run db:up
bun run db:migrate
```

4. Running

```sh
bun run dev
```

open http://localhost:3000
