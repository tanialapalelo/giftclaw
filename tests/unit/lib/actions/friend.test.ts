// mock Prisma, unit test is isolated (no DB calls), and we can control return value for edge cases
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFriend,
  getFriend,
  getFriendByShareToken,
  updateFriend,
} from "@/lib/actions/friend";

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
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));

// Rate limiting is covered in rate-limit.test.ts; here every call is allowed
// unless a test says otherwise
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true })),
}));

// updateFriend calls revalidatePath, which needs a request-scoped Next.js
// context that doesn't exist in a unit test; stub it out
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import after mock, so we get the mocked version
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// Run interactive transactions against the same mocked client, so assertions
// on prisma.friend.update etc. still see calls made through `tx`
function passThroughTransaction() {
  vi.mocked(prisma.$transaction).mockImplementation((async (
    cb: (tx: typeof prisma) => Promise<unknown>
  ) => cb(prisma)) as unknown as typeof prisma.$transaction);
}

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
    passThroughTransaction();
    vi.mocked(prisma.friend.findUnique).mockResolvedValue(
      STORED_FRIEND as unknown as Awaited<
        ReturnType<typeof prisma.friend.findUnique>
      >
    );
    vi.mocked(prisma.friend.update).mockImplementation((async ({
      data,
    }: {
      data: Record<string, unknown>;
    }) => ({
      ...STORED_FRIEND,
      ...data,
    })) as unknown as typeof prisma.friend.update);
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

  it("reports regenerated: true when a gift-relevant field changed", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(0);

    const result = await updateFriend(
      FRIEND_ID,
      formData({ interests: ["gaming", "reading"] })
    );

    expect("error" in result).toBe(false);
    expect(result).toMatchObject({ regenerated: true });
  });

  it("reports regenerated: false for a cosmetic-only edit", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(0);

    const result = await updateFriend(FRIEND_ID, formData({ theme: "cute" }));

    expect("error" in result).toBe(false);
    expect(result).toMatchObject({ regenerated: false });
  });

  it("takes the friend row lock inside a transaction before checking plays", async () => {
    vi.mocked(prisma.gameResult.count).mockResolvedValue(0);

    await updateFriend(FRIEND_ID, formData({ interests: ["reading"] }));

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const lockSql = (
      vi.mocked(prisma.$queryRaw).mock.calls[0][0] as unknown as string[]
    ).join("?");
    expect(lockSql).toContain("FOR UPDATE");
    // Lock first, then read, then write
    const lockOrder = vi.mocked(prisma.$queryRaw).mock.invocationCallOrder[0];
    expect(lockOrder).toBeLessThan(
      vi.mocked(prisma.friend.findUnique).mock.invocationCallOrder[0]
    );
    expect(
      vi.mocked(prisma.friend.update).mock.invocationCallOrder[0]
    ).toBeLessThan(
      vi.mocked(prisma.giftSuggestion.deleteMany).mock.invocationCallOrder[0]
    );
  });

  it("returns a field error instead of throwing for an invalid validUntil", async () => {
    const result = await updateFriend(
      FRIEND_ID,
      formData({ validUntil: "not-a-date" })
    );

    expect(result).toEqual({
      error: expect.objectContaining({ validUntil: expect.any(Array) }),
    });
    expect(prisma.friend.update).not.toHaveBeenCalled();
  });

  it("refuses the edit when the update limiter is exhausted", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
    });

    const result = await updateFriend(FRIEND_ID, formData({ theme: "cute" }));

    expect(result).toEqual({ error: "Too many edits. Try again later." });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("createFriend", () => {
  const validInput = {
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
    _honeypot: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
    vi.mocked(prisma.friend.create).mockImplementation((async ({
      data,
    }: {
      data: Record<string, unknown>;
    }) => ({
      ...data,
      id: "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
      shareToken: "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e",
    })) as unknown as typeof prisma.friend.create);
  });

  it("throttles a scripted burst of 25 creates once the limiter runs out", async () => {
    // Stand-in for the real create-friend limiter (10 per hour per IP)
    let used = 0;
    vi.mocked(checkRateLimit).mockImplementation(async () =>
      ++used <= 10
        ? { success: true }
        : { success: false, limit: 10, remaining: 0 }
    );

    const results = await Promise.all(
      Array.from({ length: 25 }, () => createFriend(validInput))
    );

    expect(checkRateLimit).toHaveBeenCalledWith("createFriend");
    expect(results.filter((r) => "id" in r)).toHaveLength(10);
    expect(results.filter((r) => "error" in r)).toHaveLength(15);
    expect(prisma.friend.create).toHaveBeenCalledTimes(10);
  });

  it("returns a field error instead of throwing for an invalid validUntil", async () => {
    const result = await createFriend({
      ...validInput,
      validUntil: "not-a-date",
    });

    expect(result).toEqual({
      error: expect.objectContaining({ validUntil: expect.any(Array) }),
    });
    expect(prisma.friend.create).not.toHaveBeenCalled();
  });

  it("rejects a deadline in the past", async () => {
    const result = await createFriend({
      ...validInput,
      validUntil: "2020-01-01",
    });

    expect(result).toEqual({
      error: { validUntil: ["Deadline can't be in the past"] },
    });
    expect(prisma.friend.create).not.toHaveBeenCalled();
  });

  it("accepts today as a deadline", async () => {
    const today = new Date().toISOString().slice(0, 10);

    const result = await createFriend({ ...validInput, validUntil: today });

    expect("id" in result).toBe(true);
    expect(prisma.friend.create).toHaveBeenCalled();
  });
});

describe("getFriendByShareToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("never selects the giver's private id", async () => {
    vi.mocked(prisma.friend.findUnique).mockResolvedValue(null);

    await getFriendByShareToken("b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e");

    const args = vi.mocked(prisma.friend.findUnique).mock.calls[0][0];
    expect(args.select).toBeDefined();
    expect(args.select).not.toHaveProperty("id");
  });
});
