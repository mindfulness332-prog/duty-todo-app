import type { NextFunction, Request, Response } from "express";
import { AppError, type ErrorDetail } from "../errors/AppError";
import { logger } from "../utils/logger";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
  };
}

function isMalformedJsonError(err: unknown): err is SyntaxError {
  return err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express only recognizes error middleware with 4 declared params.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.id;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { requestId, code: err.code, stack: err.stack });
    } else {
      logger.warn(err.message, { requestId, code: err.code });
    }

    const body: ErrorResponseBody = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (isMalformedJsonError(err)) {
    logger.warn("Malformed JSON body", { requestId });
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body is not valid JSON",
        ...(requestId ? { requestId } : {}),
      },
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;
  logger.error(message, { requestId, stack });

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      ...(requestId ? { requestId } : {}),
    },
  });
}
