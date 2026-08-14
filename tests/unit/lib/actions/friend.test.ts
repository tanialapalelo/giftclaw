// mock Prisma, unit test is isolated (no DB calls), and we can control return value for edge cases
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFriend, updateFriend } from "@/lib/actions/friend";

// Mock all prisma module
// vi.mock = Vitest equivalent from jest.mock
vi.mock("@/lib/prisma", () => ({
  prisma: {
    friend: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    gameResult: {
      count: vi.fn(),
    },
    giftSuggestion: {
      deleteMany: vi.fn(),
    },
  },
}));

// updateFriend calls revalidatePath, which needs a request-scoped Next.js
// context that doesn't exist in a unit test; stub it out
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
    // Prisma is not called at all, isValidUUID guard
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
      currency: "IDR",
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

describe("updateFriend", () => {
  const FRIEND_ID = "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
  const SHARE_TOKEN = "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e";

  // Current stored row, as prisma.friend.findUnique would return it
  const STORED_FRIEND = {
    id: FRIEND_ID,
    shareToken: SHARE_TOKEN,
    name: "Sarah",
    interests: ["gaming", "cooking"],
    hobbies: ["hiking"],
    dislikes: ["spicy food"],
    budgetMin: 100_000,
    budgetMax: 500_000,
    notes: "loves vintage stuff",
    theme: "soft",
    currency: "IDR",
    validUntil: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
  };

  // Submitted form data identical to STORED_FRIEND except for the fields a
  // given test overrides
  function formData(overrides: Record<string, unknown> = {}) {
    return {
      name: STORED_FRIEND.name,
      interests: STORED_FRIEND.interests,
      hobbies: STORED_FRIEND.hobbies,
      dislikes: STORED_FRIEND.dislikes,
      budgetMin: STORED_FRIEND.budgetMin,
      budgetMax: STORED_FRIEND.budgetMax,
      notes: STORED_FRIEND.notes,
      theme: STORED_FRIEND.theme,
      currency: STORED_FRIEND.currency,
      validUntil: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.friend.findUnique).mockResolvedValue(
      STORED_FRIEND as unknown as Awaited<ReturnType<typeof prisma.friend.findUnique>>
    );
    vi.mocked(prisma.friend.update).mockImplementation(
      (async ({ data }: { data: Record<string, unknown> }) => ({
        ...STORED_FRIEND,
        ...data,
      })) as unknown as typeof prisma.friend.update
    );
  });

  it("rejects a gift-relevant field change once the friend has played", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(1);

    const result = await updateFriend(
      FRIEND_ID,
      formData({ budgetMax: 750_000 })
    );

    expect(result).toEqual({
      error:
        "Can't change gift details after your friend has started playing. You can still update the theme or deadline.",
    });
    expect(prisma.friend.update).not.toHaveBeenCalled();
    expect(prisma.giftSuggestion.deleteMany).not.toHaveBeenCalled();
  });

  it("allows theme/deadline-only changes regardless of play count", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(3);

    const result = await updateFriend(
      FRIEND_ID,
      formData({ theme: "bold", validUntil: "2026-12-31" })
    );

    expect("error" in result).toBe(false);
    expect(prisma.friend.update).toHaveBeenCalled();
  });

  it("does not invalidate the gift suggestion cache for a theme/deadline-only edit", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(0);

    await updateFriend(FRIEND_ID, formData({ theme: "cute" }));

    expect(prisma.giftSuggestion.deleteMany).not.toHaveBeenCalled();
  });

  it("allows a gift-relevant change and invalidates the cache before the friend has played", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(0);

    const result = await updateFriend(
      FRIEND_ID,
      formData({ interests: ["gaming", "reading"] })
    );

    expect("error" in result).toBe(false);
    expect(prisma.giftSuggestion.deleteMany).toHaveBeenCalledWith({
      where: { friendId: FRIEND_ID },
    });
  });
});
