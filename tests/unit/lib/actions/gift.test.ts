// mock Prisma, unit test is isolated (no DB calls), and we can control return value for edge cases
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAX_ATTEMPTS } from "@/lib/constants";

// Mock all prisma module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    friend: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Import after mock, so we get the mocked version
import { prisma } from "@/lib/prisma";
import { saveGameResult } from "@/lib/actions/gift";

const FRIEND_ID = "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
const SHARE_TOKEN = "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e";
const SESSION_ID = "c5f4e3d2-6a7b-4c8d-9e0f-1a2b3c4d5e6f";
const GIFT_SNAPSHOT = { name: "Mug" };

// Shape of the transaction client saveGameResult uses; narrower than
// Prisma's real TransactionClient since these are the only members it calls
type TxMock = {
  $queryRaw: (...args: unknown[]) => Promise<unknown>;
  gameResult: {
    count: () => Promise<number>;
    create: (...args: unknown[]) => Promise<unknown>;
  };
};

// Wires prisma.$transaction to just invoke the callback with a fake tx,
// double-cast through unknown since the mock's shape is narrower than
// Prisma's real (and heavily overloaded) $transaction signature
function mockTransaction(run: (cb: (tx: TxMock) => Promise<unknown>) => Promise<unknown>) {
  vi.mocked(prisma.$transaction).mockImplementation(
    run as unknown as typeof prisma.$transaction
  );
}

describe("saveGameResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // findUnique here only ever selects { id: true }; double-cast through
    // unknown since the mock's type doesn't know about that narrowing
    vi.mocked(prisma.friend.findUnique).mockResolvedValue({
      id: FRIEND_ID,
    } as unknown as Awaited<ReturnType<typeof prisma.friend.findUnique>>);
  });

  it("rejects a grab when the friend already has MAX_ATTEMPTS recorded results", async () => {
    const txMock: TxMock = {
      $queryRaw: vi.fn().mockResolvedValue(undefined),
      gameResult: {
        count: vi.fn().mockResolvedValue(MAX_ATTEMPTS),
        create: vi.fn(),
      },
    };
    mockTransaction((cb) => cb(txMock));

    const result = await saveGameResult({
      shareToken: SHARE_TOKEN,
      sessionId: SESSION_ID,
      grabIndex: MAX_ATTEMPTS + 1,
      giftSnapshot: GIFT_SNAPSHOT,
    });

    expect(result).toEqual({ error: "Attempt limit reached" });
    expect(txMock.gameResult.create).not.toHaveBeenCalled();
  });

  it("saves the grab when the friend is still under MAX_ATTEMPTS", async () => {
    const txMock: TxMock = {
      $queryRaw: vi.fn().mockResolvedValue(undefined),
      gameResult: {
        count: vi.fn().mockResolvedValue(MAX_ATTEMPTS - 1),
        create: vi.fn().mockResolvedValue({}),
      },
    };
    mockTransaction((cb) => cb(txMock));

    const result = await saveGameResult({
      shareToken: SHARE_TOKEN,
      sessionId: SESSION_ID,
      grabIndex: MAX_ATTEMPTS,
      giftSnapshot: GIFT_SNAPSHOT,
    });

    expect(result).toEqual({ success: true });
    expect(txMock.gameResult.create).toHaveBeenCalledWith({
      data: {
        friendId: FRIEND_ID,
        sessionId: SESSION_ID,
        grabIndex: MAX_ATTEMPTS,
        giftSnapshot: GIFT_SNAPSHOT,
      },
    });
  });

  // Simulates the two-tabs race: two grabs for the same friend arrive at
  // (almost) the same time when 2 results already exist. A real Postgres
  // "SELECT ... FOR UPDATE" serializes the two transactions so the second
  // one re-counts only after the first commits; this mock enforces that
  // same one-at-a-time ordering so we can assert the outcome without a
  // real database.
  it("allows only one of two concurrent grabs through when one slot remains", async () => {
    let savedCount = MAX_ATTEMPTS - 1;
    let queue = Promise.resolve();

    mockTransaction((cb) => {
      const run = queue.then(() =>
        cb({
          $queryRaw: vi.fn().mockResolvedValue(undefined),
          gameResult: {
            count: vi.fn().mockImplementation(async () => savedCount),
            create: vi.fn().mockImplementation(async () => {
              savedCount += 1;
              return {};
            }),
          },
        })
      );
      queue = run.then(
        () => undefined,
        () => undefined
      );
      return run;
    });

    const attempt = (grabIndex: number) =>
      saveGameResult({
        shareToken: SHARE_TOKEN,
        sessionId: SESSION_ID,
        grabIndex,
        giftSnapshot: GIFT_SNAPSHOT,
      });

    const [first, second] = await Promise.all([
      attempt(MAX_ATTEMPTS),
      attempt(MAX_ATTEMPTS),
    ]);

    const results = [first, second];
    const succeeded = results.filter((r) => "success" in r);
    const rejected = results.filter((r) => "error" in r);

    expect(succeeded).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(savedCount).toBe(MAX_ATTEMPTS);
  });
});
