import { neon, neonConfig } from "@neondatabase/serverless";
import {
  drizzle as neonDrizzle,
  NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// prod
// const sql = neon(process.env.DATABASE_URL);
// export const db = drizzle({ client: sql });

// dev
// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });
// export const db = drizzle({ client: pool });

let dbClient:
  | (NodePgDatabase<Record<string, never>> & {
      $client: Pool;
    })
  | NeonHttpDatabase<Record<string, never>>;

const getDbConnection = () => {
  if (!process.env.DATABASE_URL)
    throw new Error("No database connection string provided");

  if (!dbClient && process.env.APP_ENV === "development") {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    dbClient = drizzle({ client: pool });
  }

  if (!dbClient && process.env.APP_ENV === "production") {
    const sql = neon(process.env.DATABASE_URL);
    dbClient = neonDrizzle({ client: sql });
  }
  return dbClient;
};

export const db = getDbConnection();
