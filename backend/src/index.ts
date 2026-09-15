import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { pool } from "./db/pool";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
  logger.info(`CORS allowed origin: ${env.allowedOrigin}`);
});

function shutdown(signal: string): void {
  logger.info(`Received ${signal}, shutting down gracefully`);

  // server.close() only stops accepting new connections and waits for
  // in-flight requests to finish — a client holding an idle keep-alive
  // connection open can make that callback never fire. This timer forces
  // the process to exit anyway rather than hang on SIGTERM forever.
  const forceExitTimer = setTimeout(() => {
    logger.error(`Graceful shutdown did not complete within ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close((err) => {
    if (err) {
      logger.error("Error while closing server", { error: err.message });
      clearTimeout(forceExitTimer);
      process.exit(1);
      return;
    }
    pool
      .end()
      .then(() => {
        clearTimeout(forceExitTimer);
        process.exit(0);
      })
      .catch((poolErr: unknown) => {
        const message = poolErr instanceof Error ? poolErr.message : "Unknown error";
        logger.error("Error while closing database pool", { error: message });
        clearTimeout(forceExitTimer);
        process.exit(1);
      });
  });
  server.closeIdleConnections();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
