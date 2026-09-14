import type { Request, Response } from "express";
import { notFoundHandler } from "../notFoundHandler";

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("notFoundHandler", () => {
  it("responds with 404 and identifies the unmatched route", () => {
    const req = { method: "GET", originalUrl: "/unknown" } as Request;
    const res = createMockResponse();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "NOT_FOUND", message: "Route not found: GET /unknown" },
    });
  });
});
