// src/lib/lakebase.ts
import { Pool } from "pg";

const rawConnectionString = process.env.LB_CONNECT_STRING!;
const username = process.env.LB_USERNAME!;
const password = process.env.LB_PASSWORD!;

if (!rawConnectionString || !username || !password) {
  throw new Error("Lakebase Env Variablen fehlen.");
}

function buildConnectionString() {
  const url = new URL(rawConnectionString);

  url.username = username;
  url.password = password;

  return url.toString();
}

declare global {
  var lakebasePool: Pool | undefined;
}

const getPool = () => {
  if (globalThis.lakebasePool) return globalThis.lakebasePool;

  globalThis.lakebasePool = new Pool({
    connectionString: buildConnectionString(),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return globalThis.lakebasePool;
};

export async function runLbQuery<T = unknown>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(query, params);

  return result.rows as T[];
}
