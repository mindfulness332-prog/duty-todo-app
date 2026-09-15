import { NotFoundError, ServiceUnavailableError } from "../../../errors/AppError";
import { ValidationError } from "../../../errors/AppError";
import * as dutiesRepository from "../duties.repository";
import * as service from "../duties.service";
import type { DutyRow } from "../duties.types";

jest.mock("../duties.repository");

const mockedRepository = dutiesRepository as jest.Mocked<typeof dutiesRepository>;
const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeRow(overrides: Partial<DutyRow> = {}): DutyRow {
  return {
    id: VALID_ID,
    name: "Buy groceries",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("duties.service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listDuties", () => {
    it("maps repository rows to the public Duty shape", async () => {
      mockedRepository.findAll.mockResolvedValue([makeRow()]);

      const result = await service.listDuties();

      expect(result).toEqual([{ id: VALID_ID, name: "Buy groceries" }]);
    });

    it("wraps a database connection error as ServiceUnavailableError", async () => {
      mockedRepository.findAll.mockRejectedValue(
        Object.assign(new Error("boom"), { code: "ECONNREFUSED" }),
      );

      await expect(service.listDuties()).rejects.toThrow(ServiceUnavailableError);
    });

    it("wraps pg's own client-side timeout errors as ServiceUnavailableError", async () => {
      // pg's connectionTimeoutMillis/query_timeout (db/pool.ts) throw a plain
      // Error with no .code — confirmed against a real pool, not assumed —
      // so these have to be caught by message instead of error code.
      mockedRepository.findAll.mockRejectedValue(
        new Error("Connection terminated due to connection timeout"),
      );

      await expect(service.listDuties()).rejects.toThrow(ServiceUnavailableError);
    });

    it("lets an unrelated error propagate unchanged", async () => {
      mockedRepository.findAll.mockRejectedValue(new Error("something else"));

      await expect(service.listDuties()).rejects.toThrow("something else");
    });
  });

  describe("createDuty", () => {
    it("rejects an empty name without calling the repository", async () => {
      await expect(service.createDuty("")).rejects.toThrow(ValidationError);
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("trims the name before saving", async () => {
      mockedRepository.create.mockResolvedValue(makeRow({ name: "Buy groceries" }));

      await service.createDuty("  Buy groceries  ");

      expect(mockedRepository.create).toHaveBeenCalledWith({ name: "Buy groceries" });
    });

    it("wraps a database connection error as ServiceUnavailableError", async () => {
      mockedRepository.create.mockRejectedValue(
        Object.assign(new Error("boom"), { code: "ECONNREFUSED" }),
      );

      await expect(service.createDuty("Buy groceries")).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe("updateDuty", () => {
    it("rejects a malformed id without calling the repository", async () => {
      await expect(service.updateDuty("not-a-uuid", "New name")).rejects.toThrow(ValidationError);
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the repository finds no matching row", async () => {
      mockedRepository.update.mockResolvedValue(undefined);

      await expect(service.updateDuty(VALID_ID, "New name")).rejects.toThrow(NotFoundError);
    });

    it("returns the updated duty when found", async () => {
      mockedRepository.update.mockResolvedValue(makeRow({ name: "New name" }));

      const result = await service.updateDuty(VALID_ID, "New name");

      expect(result).toEqual({ id: VALID_ID, name: "New name" });
    });
  });

  describe("removeDuty", () => {
    it("rejects a malformed id without calling the repository", async () => {
      await expect(service.removeDuty("not-a-uuid")).rejects.toThrow(ValidationError);
      expect(mockedRepository.remove).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when nothing was deleted", async () => {
      mockedRepository.remove.mockResolvedValue(false);

      await expect(service.removeDuty(VALID_ID)).rejects.toThrow(NotFoundError);
    });

    it("resolves when the row was deleted", async () => {
      mockedRepository.remove.mockResolvedValue(true);

      await expect(service.removeDuty(VALID_ID)).resolves.toBeUndefined();
    });
  });
});
