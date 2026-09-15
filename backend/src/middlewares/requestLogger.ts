import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  function logCompletion(aborted: boolean): void {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info("request completed", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ...(aborted ? { aborted: true } : {}),
    });
  }

  res.on("finish", () => logCompletion(false));

  // 'close' fires for every request, including ones that finish normally —
  // only treat it as a signal worth logging when the response never
  // actually finished (client disconnected, proxy timeout, etc.), which is
  // exactly the case the request log would otherwise miss entirely.
  res.on("close", () => {
    if (!res.writableEnded) {
      logCompletion(true);
    }
  });

  next();
}
