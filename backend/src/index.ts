import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { pool } from "./db/pool";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});

function shutdown(signal: string): void {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close((err) => {
    if (err) {
      logger.error("Error while closing server", { error: err.message });
      process.exit(1);
    }
    pool
      .end()
      .then(() => process.exit(0))
      .catch((poolErr: unknown) => {
        const message = poolErr instanceof Error ? poolErr.message : "Unknown error";
        logger.error("Error while closing database pool", { error: message });
        process.exit(1);
      });
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
