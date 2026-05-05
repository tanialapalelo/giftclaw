import { describe, it, expect } from "vitest";
import { isValidUUID } from "@/lib/utils";

describe("isValidUUID", () => {
  it("returns true for valid UUID v4", () => {
    expect(isValidUUID("a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("returns false for random string", () => {
    expect(isValidUUID("random-string")).toBe(false);
  });

  it("returns false for SQL injection attempt", () => {
    expect(isValidUUID("' OR 1=1 --")).toBe(false);
  });

  it("returns false for UUID with wrong format", () => {
    expect(isValidUUID("not-a-uuid-at-all-x")).toBe(false);
  });
});
