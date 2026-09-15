import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  // pg defaults both of these to 0 (wait forever). Without them, an
  // unreachable database leaves requests hanging indefinitely instead of
  // failing fast into the 503 path in duties.service.ts.
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
});

// Without this listener, an error on an idle client in the pool (e.g. the
// database restarting or a dropped network connection) becomes an uncaught
// exception and crashes the whole process instead of just failing the query.
pool.on("error", (err) => {
  logger.error("Unexpected error on idle PostgreSQL client", { error: err.message });
});
