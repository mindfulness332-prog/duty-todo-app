import { EventEmitter } from "node:events";
import type { NextFunction, Request, Response } from "express";
import { requestLogger } from "../requestLogger";
import { logger } from "../../utils/logger";

jest.mock("../../utils/logger", () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

function createMockResponse(): Response {
  const emitter = new EventEmitter();
  return Object.assign(emitter, { statusCode: 200, writableEnded: false }) as unknown as Response;
}

describe("requestLogger", () => {
  const next = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("logs once when the response finishes normally", () => {
    const req = { id: "req-1", method: "GET", originalUrl: "/api/duties" } as Request;
    const res = createMockResponse();

    requestLogger(req, res, next);
    (res as unknown as { writableEnded: boolean }).writableEnded = true;
    res.emit("finish");
    res.emit("close"); // Node emits close after finish too — must not double-log

    expect(logger.info).toHaveBeenCalledTimes(1);
    const [, meta] = (logger.info as jest.Mock).mock.calls[0] as [string, Record<string, unknown>];
    expect(meta).toMatchObject({
      requestId: "req-1",
      method: "GET",
      path: "/api/duties",
      status: 200,
    });
    expect(meta["aborted"]).toBeUndefined();
  });

  it("logs once with aborted:true when the connection closes before finishing", () => {
    const req = { id: "req-2", method: "GET", originalUrl: "/api/duties" } as Request;
    const res = createMockResponse();

    requestLogger(req, res, next);
    res.emit("close"); // no 'finish' — client disconnected mid-response

    expect(logger.info).toHaveBeenCalledTimes(1);
    const [, meta] = (logger.info as jest.Mock).mock.calls[0] as [string, Record<string, unknown>];
    expect(meta).toMatchObject({ requestId: "req-2", aborted: true });
  });

  it("calls next()", () => {
    const req = { id: "req-3", method: "GET", originalUrl: "/" } as Request;
    const res = createMockResponse();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
