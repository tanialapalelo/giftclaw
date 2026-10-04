// mock Prisma, unit test is isolated (no DB calls), and we can control return value for edge cases
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAX_ATTEMPTS } from "@/lib/constants";

// Mock all prisma module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    friend: {
      findUnique: vi.fn(),
    },
    giftSuggestion: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Import after mock, so we get the mocked version
import { prisma } from "@/lib/prisma";
import {
  getGiftSuggestionsByShareToken,
  saveGameResult,
} from "@/lib/actions/gift";

const FRIEND_ID = "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
const SHARE_TOKEN = "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e";
const SESSION_ID = "c5f4e3d2-6a7b-4c8d-9e0f-1a2b3c4d5e6f";

// The latest gift_suggestions row, as the server stores it
const SUGGESTIONS = Array.from({ length: 8 }, (_, i) => ({
  name: `Gift ${i}`,
  reason: `Reason ${i}`,
  priceRange: "Rp 100.000",
  category: "practical",
  emoji: "🎁",
}));

type SavedRow = { grabIndex: number; giftSnapshot: unknown };

// Shape of the transaction client saveGameResult uses; narrower than
// Prisma's real TransactionClient since these are the only members it calls
type TxMock = {
  $queryRaw: (...args: unknown[]) => Promise<unknown>;
  giftSuggestion: {
    findFirst: () => Promise<{ suggestions: unknown } | null>;
  };
  gameResult: {
    findMany: () => Promise<{ giftSnapshot: unknown }[]>;
    create: (args: { data: SavedRow }) => Promise<unknown>;
  };
};

// A tiny in-memory stand-in for the two tables saveGameResult touches.
// Every transaction runs one at a time, which is what the real
// "SELECT ... FOR UPDATE" on the friend row guarantees in Postgres.
function useFakeDb({
  suggestions = SUGGESTIONS as unknown,
  saved = [] as SavedRow[],
} = {}) {
  const create = vi.fn(async ({ data }: { data: SavedRow }) => {
    saved.push(data);
    return {};
  });
  let queue = Promise.resolve();

  // Double-cast through unknown since the mock's shape is narrower than
  // Prisma's real (and heavily overloaded) $transaction signature
  const run = (cb: (tx: TxMock) => Promise<unknown>) => {
    const tx: TxMock = {
      $queryRaw: vi.fn().mockResolvedValue(undefined),
      giftSuggestion: {
        findFirst: vi.fn(async () =>
          suggestions === null ? null : { suggestions }
        ),
      },
      gameResult: {
        findMany: vi.fn(async () =>
          saved.map((r) => ({ giftSnapshot: r.giftSnapshot }))
        ),
        create,
      },
    };
    const result = queue.then(() => cb(tx));
    queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
  vi.mocked(prisma.$transaction).mockImplementation(
    run as unknown as typeof prisma.$transaction
  );

  return { saved, create };
}

function mockFriend(validUntil: Date | null = null) {
  // findUnique here only selects { id, validUntil }; double-cast through
  // unknown since the mock's type doesn't know about that narrowing
  vi.mocked(prisma.friend.findUnique).mockResolvedValue({
    id: FRIEND_ID,
    validUntil,
  } as unknown as Awaited<ReturnType<typeof prisma.friend.findUnique>>);
}

const grab = (targetIndex: number) =>
  saveGameResult({
    shareToken: SHARE_TOKEN,
    sessionId: SESSION_ID,
    targetIndex,
  });

// Calls the action the way a hand-crafted POST could: any shape at all
const rawCall = (payload: unknown) =>
  saveGameResult(payload as Parameters<typeof saveGameResult>[0]);

describe("saveGameResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFriend();
  });

  it("snapshots the gift from the stored suggestions and numbers the grab itself", async () => {
    const { saved } = useFakeDb();

    const result = await grab(2);

    expect(result).toEqual({ success: true, grabIndex: 1 });
    expect(saved).toEqual([
      expect.objectContaining({
        friendId: FRIEND_ID,
        sessionId: SESSION_ID,
        grabIndex: 1,
        giftSnapshot: SUGGESTIONS[2],
      }),
    ]);
  });

  it("numbers each grab after the ones already saved for this friend", async () => {
    const { saved } = useFakeDb({
      saved: [{ grabIndex: 1, giftSnapshot: SUGGESTIONS[0] }],
    });

    expect(await grab(5)).toEqual({ success: true, grabIndex: 2 });
    expect(saved[1]).toMatchObject({ grabIndex: 2 });
  });

  it("rejects a forged giftSnapshot instead of storing it", async () => {
    const { create } = useFakeDb();

    const result = await rawCall({
      shareToken: SHARE_TOKEN,
      sessionId: SESSION_ID,
      targetIndex: 0,
      giftSnapshot: { name: "FORGED: a new car", priceRange: "Rp 999.999.999" },
    });

    expect(result).toEqual({ error: "Invalid input" });
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a client-chosen grabIndex", async () => {
    const { create } = useFakeDb();

    const result = await rawCall({
      shareToken: SHARE_TOKEN,
      sessionId: SESSION_ID,
      targetIndex: 0,
      grabIndex: 999,
    });

    expect(result).toEqual({ error: "Invalid input" });
    expect(create).not.toHaveBeenCalled();
  });

  it.each([
    [
      "the old payload shape",
      {
        shareToken: SHARE_TOKEN,
        sessionId: SESSION_ID,
        grabIndex: 1,
        giftSnapshot: {},
      },
    ],
    [
      "a negative index",
      { shareToken: SHARE_TOKEN, sessionId: SESSION_ID, targetIndex: -1 },
    ],
    [
      "a fractional index",
      { shareToken: SHARE_TOKEN, sessionId: SESSION_ID, targetIndex: 1.5 },
    ],
    [
      "a string index",
      { shareToken: SHARE_TOKEN, sessionId: SESSION_ID, targetIndex: "1" },
    ],
    [
      "a bad share token",
      { shareToken: "nope", sessionId: SESSION_ID, targetIndex: 0 },
    ],
    [
      "a bad session id",
      { shareToken: SHARE_TOKEN, sessionId: "nope", targetIndex: 0 },
    ],
    ["no payload", undefined],
  ])("rejects %s before touching the database", async (_label, payload) => {
    useFakeDb();

    expect(await rawCall(payload)).toEqual({ error: "Invalid input" });
    expect(prisma.friend.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an index past the end of the suggestion list (e.g. 999)", async () => {
    const { create } = useFakeDb();

    expect(await grab(999)).toEqual({ error: "Invalid gift" });
    expect(await grab(SUGGESTIONS.length)).toEqual({ error: "Invalid gift" });
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a grab when there are no stored suggestions", async () => {
    const { create } = useFakeDb({ suggestions: null });

    expect(await grab(0)).toEqual({ error: "No gifts to grab" });
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a grab once the link's deadline has passed", async () => {
    mockFriend(new Date("2020-01-01"));
    const { create } = useFakeDb();

    expect(await grab(0)).toEqual({ error: "Link expired" });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects grabbing a gift that was already grabbed for this friend", async () => {
    const { create } = useFakeDb({
      saved: [{ grabIndex: 1, giftSnapshot: SUGGESTIONS[3] }],
    });

    expect(await grab(3)).toEqual({ error: "Gift already grabbed" });
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a grab when the friend already has MAX_ATTEMPTS recorded results", async () => {
    const { create } = useFakeDb({
      saved: SUGGESTIONS.slice(0, MAX_ATTEMPTS).map((g, i) => ({
        grabIndex: i + 1,
        giftSnapshot: g,
      })),
    });

    expect(await grab(7)).toEqual({ error: "Attempt limit reached" });
    expect(create).not.toHaveBeenCalled();
  });

  it("returns an error instead of throwing when the database fails", async () => {
    vi.mocked(prisma.friend.findUnique).mockRejectedValue(new Error("down"));

    expect(await grab(0)).toEqual({ error: "Failed to save result" });
  });

  // Simulates many tabs (or a scripted burst) grabbing at once. The real
  // row lock serializes the transactions; the fake DB does the same, so
  // this checks that the cap and the server-side numbering hold under it.
  it("lets exactly MAX_ATTEMPTS of 12 concurrent grabs through, numbered 1..MAX_ATTEMPTS", async () => {
    const { saved } = useFakeDb();

    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) => grab(i % SUGGESTIONS.length))
    );

    expect(results.filter((r) => "success" in r)).toHaveLength(MAX_ATTEMPTS);
    expect(saved.map((r) => r.grabIndex)).toEqual(
      Array.from({ length: MAX_ATTEMPTS }, (_, i) => i + 1)
    );
    const names = saved.map((r) => (r.giftSnapshot as { name: string }).name);
    expect(new Set(names).size).toBe(MAX_ATTEMPTS);
  });

  it("lets only one of two concurrent grabs of the same gift through", async () => {
    const { saved } = useFakeDb();

    const results = await Promise.all([grab(4), grab(4)]);

    expect(results).toContainEqual({ success: true, grabIndex: 1 });
    expect(results).toContainEqual({ error: "Gift already grabbed" });
    expect(saved).toHaveLength(1);
  });
});

describe("getGiftSuggestionsByShareToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a malformed shareToken without querying", async () => {
    const result = await getGiftSuggestionsByShareToken("not-a-uuid");
    expect(result).toEqual({ error: "Invalid ID" });
    expect(prisma.friend.findUnique).not.toHaveBeenCalled();
  });

  it("returns not found for an unknown shareToken", async () => {
    vi.mocked(prisma.friend.findUnique).mockResolvedValue(null);
    const result = await getGiftSuggestionsByShareToken(SHARE_TOKEN);
    expect(result).toEqual({ error: "Friend not found" });
  });

  it("resolves the friend server-side and returns cached suggestions", async () => {
    vi.mocked(prisma.friend.findUnique).mockResolvedValue({
      id: FRIEND_ID,
    } as unknown as Awaited<ReturnType<typeof prisma.friend.findUnique>>);
    vi.mocked(prisma.giftSuggestion.findFirst).mockResolvedValue({
      suggestions: [GIFT_SNAPSHOT],
      modelVersion: "test",
    } as unknown as Awaited<ReturnType<typeof prisma.giftSuggestion.findFirst>>);

    const result = await getGiftSuggestionsByShareToken(SHARE_TOKEN);

    expect(prisma.friend.findUnique).toHaveBeenCalledWith({
      where: { shareToken: SHARE_TOKEN },
      select: { id: true },
    });
    expect(prisma.giftSuggestion.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { friendId: FRIEND_ID } })
    );
    expect(result).toMatchObject({ suggestions: [GIFT_SNAPSHOT], cached: true });
    // The friend id is only used to look up suggestions, never returned
    expect(JSON.stringify(result)).not.toContain(FRIEND_ID);
  });
});
