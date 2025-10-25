### Hono, React, Better Auth, RPC, Postgres, Tanstack, Bun

- Manual TanStack Router & Query Scaffold
- Create custom Button component with variants (Mimic from shadcn)
- Setup proxy in vite
- Implement Hono RPC
- Setup and run Docker container locally
- Database setup using Drizzle ORM
- Setup a query to fetch from backend
- Setup hono routes
- Setup Better Auth on the server side
- Sign Up and Sign In page
- Sign Out and improve Navbar (Show error toast on failed)
- Protect the todos page
- Generate & Migrate a new db schema -> Seed
- Auth middleware

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
