// 1st test file to write, because it's pure function with zero dependencies,
// so no need to mock anything, and we can cover all edge cases easily.
// If validations are wrong, then all flows are wrong, so better to catch early.
import { describe, it, expect } from "vitest";
import { friendSchema } from "@/lib/validations";

const baseInput = {
  name: "Sarah",
  interests: ["gaming"],
  hobbies: [],
  dislikes: [],
  budgetMin: null,
  budgetMax: null,
  notes: null,
  theme: "soft" as const,
  _honeypot: "",
};
describe("friendSchema", () => {
  it("accepts valid input", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      budgetMin: 100_000,
      budgetMax: 500_000,
      notes: "Just got promoted",
    });
    expect(result.success).toBe(true);
  });

  // NAME
  it("rejects empty name", () => {
    const result = friendSchema.safeParse({ ...baseInput, name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toBeDefined();
  });

  it("rejects name longer than 50 chars", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("strips HTML tags from name", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      name: "<script>alert(1)</script>Sarah",
    });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("alert(1)Sarah");
  });

  it("trims whitespace from name", () => {
    const result = friendSchema.safeParse({ ...baseInput, name: "  Sarah  " });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Sarah");
  });

  // INTERESTS
  it("rejects empty interests array", () => {
    const result = friendSchema.safeParse({ ...baseInput, interests: [] });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.interests).toBeDefined();
  });

  it("rejects interests with more than 10 items", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      interests: Array(11).fill("tag"),
    });
    expect(result.success).toBe(false);
  });

  // BUDGET
  it("rejects budgetMin greater than budgetMax", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      budgetMin: 500_000,
      budgetMax: 100_000,
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.budgetMin).toBeDefined();
  });

  it("accepts null budget", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      budgetMin: null,
      budgetMax: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined budget", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      budgetMin: undefined,
      budgetMax: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("rejects budget over 100 million", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      budgetMin: 100_000,
      budgetMax: 200_000_000,
    });
    expect(result.success).toBe(false);
  });

  // HONEYPOT
  it("rejects when honeypot is filled", () => {
    const result = friendSchema.safeParse({
      ...baseInput,
      _honeypot: "i am a bot",
    });
    expect(result.success).toBe(false);
  });

  it("accepts when honeypot is empty string", () => {
    const result = friendSchema.safeParse({ ...baseInput, _honeypot: "" });
    expect(result.success).toBe(true);
  });
});
