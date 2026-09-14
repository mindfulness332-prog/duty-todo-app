import { ValidationError } from "../../../errors/AppError";
import { validateId, validateName } from "../duties.validation";

describe("validateName", () => {
  it("returns the trimmed name for valid input", () => {
    expect(validateName("  Buy groceries  ")).toBe("Buy groceries");
  });

  it("rejects an empty string", () => {
    expect(() => validateName("")).toThrow(ValidationError);
  });

  it("rejects a string that is only whitespace", () => {
    expect(() => validateName("   ")).toThrow(ValidationError);
  });

  it("rejects a missing/non-string value", () => {
    expect(() => validateName(undefined)).toThrow(ValidationError);
    expect(() => validateName(123)).toThrow(ValidationError);
  });

  it("accepts a name exactly at the 200 character limit", () => {
    const name = "a".repeat(200);
    expect(validateName(name)).toBe(name);
  });

  it("rejects a name over the 200 character limit", () => {
    const name = "a".repeat(201);
    expect(() => validateName(name)).toThrow(ValidationError);
  });
});

describe("validateId", () => {
  it("accepts a well-formed UUID", () => {
    expect(() => validateId("123e4567-e89b-12d3-a456-426614174000")).not.toThrow();
  });

  it("rejects a non-UUID string", () => {
    expect(() => validateId("not-a-uuid")).toThrow(ValidationError);
  });

  it("rejects an empty string", () => {
    expect(() => validateId("")).toThrow(ValidationError);
  });
});
