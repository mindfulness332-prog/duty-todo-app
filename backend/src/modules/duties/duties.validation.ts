import { ValidationError } from "../../errors/AppError";

const MAX_NAME_LENGTH = 200;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateName(name: unknown): string {
  if (typeof name !== "string") {
    throw new ValidationError("name is required and must be a string", [
      { field: "name", issue: "required" },
    ]);
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new ValidationError("name must not be empty", [{ field: "name", issue: "required" }]);
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ValidationError(`name must be at most ${MAX_NAME_LENGTH} characters`, [
      { field: "name", issue: "max_length" },
    ]);
  }

  return trimmed;
}

export function validateId(id: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new ValidationError("id must be a valid UUID", [{ field: "id", issue: "invalid_format" }]);
  }
}
