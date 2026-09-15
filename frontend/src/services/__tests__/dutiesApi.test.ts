// dutiesApi imports config/env, which reads `import.meta.env` — Vite-only
// syntax Jest can't parse. Mocking the module keeps Jest from ever loading
// the real file (same gotcha and fix as in useDuties.test.ts).
jest.mock("../../config/env", () => ({ env: { apiBaseUrl: "http://localhost:3000/api" } }));

import { ApiError } from "../ApiError";
import { getDuties } from "../dutiesApi";

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  }) as jest.Mock;
}

describe("dutiesApi error parsing", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns data on a successful response", async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ data: [{ id: "1", name: "Buy groceries" }] }) });

    await expect(getDuties()).resolves.toEqual([{ id: "1", name: "Buy groceries" }]);
  });

  it("builds an ApiError from a well-formed { error } response body", async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "VALIDATION_ERROR", message: "name is required" } }),
    });

    await expect(getDuties()).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "name is required",
    });
  });

  it("falls back to a generic ApiError instead of throwing when the body has no error shape", async () => {
    // e.g. a proxy/gateway 502 that never reached our own error handler.
    mockFetchOnce({ ok: false, status: 502, json: async () => ({ message: "Bad Gateway" }) });

    await expect(getDuties()).rejects.toMatchObject({
      status: 502,
      code: "UNKNOWN_ERROR",
    });
  });

  it("falls back to a generic ApiError when the error body isn't JSON at all", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    await expect(getDuties()).rejects.toBeInstanceOf(ApiError);
  });

  it("throws a NETWORK_ERROR ApiError when fetch itself rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch")) as jest.Mock;

    await expect(getDuties()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});
