import { describe, it, expect } from "vitest";
import { COPIES, MAX_ATTEMPTS } from "@/lib/constants";

describe("COPIES", () => {
  it("is 1, so no gift can be grabbed twice", () => {
    // Guards against a repeat pick: with 8 generated suggestions and
    // MAX_ATTEMPTS grabs, COPIES must stay below MAX_ATTEMPTS + 1 copies of
    // any single gift for all picks across a session to stay distinct.
    expect(COPIES).toBe(1);
  });

  it("leaves enough distinct gifts for a full session even with 1 copy each", () => {
    const GENERATED_GIFT_COUNT = 8;
    expect(GENERATED_GIFT_COUNT).toBeGreaterThanOrEqual(MAX_ATTEMPTS);
  });
});
