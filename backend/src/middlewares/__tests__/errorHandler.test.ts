import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "../errorHandler";
import { NotFoundError, ValidationError } from "../../errors/AppError";

jest.mock("../../utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  const next = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("maps ValidationError to 400 with details and requestId", () => {
    const req = { id: "req-1" } as Request;
    const res = createMockResponse();
    const err = new ValidationError("name is required", [{ field: "name", issue: "required" }]);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "name is required",
        details: [{ field: "name", issue: "required" }],
        requestId: "req-1",
      },
    });
  });

  it("maps NotFoundError to 404 without a details key when none is set", () => {
    const req = {} as Request;
    const res = createMockResponse();
    const err = new NotFoundError("Duty not found");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "NOT_FOUND", message: "Duty not found" },
    });
  });

  it("maps malformed JSON body errors to 400", () => {
    const req = {} as Request;
    const res = createMockResponse();
    const err = Object.assign(new SyntaxError("Unexpected token"), {
      type: "entity.parse.failed",
    });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "VALIDATION_ERROR", message: "Request body is not valid JSON" },
    });
  });

  it("maps unknown errors to 500 without leaking internal details", () => {
    const req = {} as Request;
    const res = createMockResponse();
    const err = new Error("connection string: postgres://user:pass@host/db");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  });
});
