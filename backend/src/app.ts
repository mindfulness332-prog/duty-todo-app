import express, { type Express } from "express";
import { requestId } from "./middlewares/requestId";
import { requestLogger } from "./middlewares/requestLogger";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { errorHandler } from "./middlewares/errorHandler";
import { healthRouter } from "./health/health.routes";

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(requestLogger);
  app.use(express.json());

  app.use("/health", healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
