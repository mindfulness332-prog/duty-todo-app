import { act, renderHook, waitFor } from "@testing-library/react";
import { useDuties } from "../useDuties";
import * as dutiesApi from "../../services/dutiesApi";
import { ApiError } from "../../services/ApiError";
import type { Duty } from "../../types/duty";

// A factory mock keeps Jest from ever loading the real dutiesApi module,
// which transitively imports `import.meta.env` (Vite-only syntax Jest can't parse).
jest.mock("../../services/dutiesApi", () => ({
  getDuties: jest.fn(),
  createDuty: jest.fn(),
  updateDuty: jest.fn(),
  deleteDuty: jest.fn(),
}));

const mockedApi = dutiesApi as jest.Mocked<typeof dutiesApi>;

function makeDuty(overrides: Partial<Duty> = {}): Duty {
  return { id: "1", name: "Buy groceries", ...overrides };
}

describe("useDuties", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches duties on mount", async () => {
    mockedApi.getDuties.mockResolvedValue([makeDuty()]);

    const { result } = renderHook(() => useDuties());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.duties).toEqual([makeDuty()]);
    expect(result.current.error).toBeNull();
  });

  it("sets an error message when the initial fetch fails", async () => {
    mockedApi.getDuties.mockRejectedValue(
      new ApiError(0, "NETWORK_ERROR", "Could not reach the server."),
    );

    const { result } = renderHook(() => useDuties());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Could not reach the server.");
    expect(result.current.duties).toEqual([]);
  });

  it("appends a newly created duty", async () => {
    mockedApi.getDuties.mockResolvedValue([]);
    mockedApi.createDuty.mockResolvedValue(makeDuty({ id: "2", name: "Walk the dog" }));

    const { result } = renderHook(() => useDuties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createDuty("Walk the dog");
    });

    expect(result.current.duties).toEqual([makeDuty({ id: "2", name: "Walk the dog" })]);
  });

  it("replaces the matching duty on update", async () => {
    mockedApi.getDuties.mockResolvedValue([makeDuty()]);
    mockedApi.updateDuty.mockResolvedValue(makeDuty({ name: "Buy groceries and milk" }));

    const { result } = renderHook(() => useDuties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateDuty("1", "Buy groceries and milk");
    });

    expect(result.current.duties).toEqual([makeDuty({ name: "Buy groceries and milk" })]);
  });

  it("removes the matching duty on delete", async () => {
    mockedApi.getDuties.mockResolvedValue([makeDuty()]);
    mockedApi.deleteDuty.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDuties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeDuty("1");
    });

    expect(result.current.duties).toEqual([]);
  });

  it("propagates a createDuty error instead of swallowing it", async () => {
    mockedApi.getDuties.mockResolvedValue([]);
    mockedApi.createDuty.mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "name must not be empty"),
    );

    const { result } = renderHook(() => useDuties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.createDuty("")).rejects.toThrow("name must not be empty");
    });

    expect(result.current.duties).toEqual([]);
  });
});
