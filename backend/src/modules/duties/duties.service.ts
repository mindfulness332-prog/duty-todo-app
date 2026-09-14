import { NotFoundError, ServiceUnavailableError } from "../../errors/AppError";
import * as dutiesRepository from "./duties.repository";
import { toDuty, type Duty } from "./duties.types";
import { validateId, validateName } from "./duties.validation";

interface PgErrorLike {
  code?: string;
}

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
]);

function isConnectionError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const code = (err as PgErrorLike).code;
  return typeof code === "string" && CONNECTION_ERROR_CODES.has(code);
}

async function withConnectionErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    if (isConnectionError(err)) {
      throw new ServiceUnavailableError("Database is currently unavailable");
    }
    throw err;
  }
}

export async function listDuties(): Promise<Duty[]> {
  const rows = await withConnectionErrorHandling(() => dutiesRepository.findAll());
  return rows.map(toDuty);
}

export async function createDuty(rawName: unknown): Promise<Duty> {
  const name = validateName(rawName);
  const row = await withConnectionErrorHandling(() => dutiesRepository.create({ name }));
  return toDuty(row);
}

export async function updateDuty(id: string, rawName: unknown): Promise<Duty> {
  validateId(id);
  const name = validateName(rawName);

  const row = await withConnectionErrorHandling(() => dutiesRepository.update(id, { name }));
  if (!row) {
    throw new NotFoundError(`Duty with id ${id} not found`);
  }
  return toDuty(row);
}

export async function removeDuty(id: string): Promise<void> {
  validateId(id);

  const removed = await withConnectionErrorHandling(() => dutiesRepository.remove(id));
  if (!removed) {
    throw new NotFoundError(`Duty with id ${id} not found`);
  }
}
