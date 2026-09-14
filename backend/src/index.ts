import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

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
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
