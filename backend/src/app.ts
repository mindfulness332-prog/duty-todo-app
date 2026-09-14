import express, { type Express } from "express";
import { requestId } from "./middlewares/requestId";
import { requestLogger } from "./middlewares/requestLogger";
import { cors } from "./middlewares/cors";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { errorHandler } from "./middlewares/errorHandler";
import { healthRouter } from "./health/health.routes";
import { dutiesRouter } from "./modules/duties/duties.routes";

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(requestLogger);
  app.use(cors);
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/duties", dutiesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
