export interface ErrorDetail {
  field: string;
  issue: string;
}

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly details?: ErrorDetail[];

  constructor(message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = new.target.name;
    if (details) {
      this.details = details;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class ServiceUnavailableError extends AppError {
  readonly statusCode = 503;
  readonly code = "SERVICE_UNAVAILABLE";
}
