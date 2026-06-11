// mock Prisma, unit test is isolated (no DB calls), and we can control return value for edge cases
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFriend } from "@/lib/actions/friend";

// Mock all prisma module
// vi.mock = Vitest equivalent from jest.mock
vi.mock("@/lib/prisma", () => ({
  prisma: {
    friend: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Import after mock, so we get the mocked version
import { prisma } from "@/lib/prisma";

describe("getFriend", () => {
  beforeEach(() => {
    // reset mock before each test → test isolation, because each test should be independent
    vi.clearAllMocks();
  });

  it("returns null for invalid UUID", async () => {
    const result = await getFriend("not-a-uuid");
    expect(result).toBeNull();
    // Prisma is not called at all — isValidUUID guard
    expect(prisma.friend.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when friend not found", async () => {
    // Mock prisma return null
    vi.mocked(prisma.friend.findUnique).mockResolvedValue(null);

    const result = await getFriend("a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d");
    expect(result).toBeNull();
  });

  it("returns friend with ISO date strings", async () => {
    const mockDate = new Date("2025-01-01T00:00:00Z");
    vi.mocked(prisma.friend.findUnique).mockResolvedValue({
      id: "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
      shareToken: "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e",
      name: "Sarah",
      interests: ["gaming"],
      hobbies: [],
      dislikes: [],
      budgetMin: null,
      budgetMax: null,
      notes: null,
      theme: "soft",
      validUntil: null,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    const result = await getFriend("a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d");
    expect(result).not.toBeNull();
    // Date needs to be serialized to string for client components
    expect(result?.createdAt).toBe("2025-01-01T00:00:00.000Z");
  });
});
