import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { pingMock, queryRawMock } = vi.hoisted(() => ({
  pingMock: vi.fn(),
  queryRawMock: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({ ping: pingMock }),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}));

import { GET } from "@/app/api/cron/keep-alive/route";

describe("GET /api/cron/keep-alive", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    pingMock.mockResolvedValue("PONG");
    queryRawMock.mockResolvedValue([{ ok: 1 }]);
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("rejects requests without a valid CRON_SECRET", async () => {
    const request = new Request("http://localhost/api/cron/keep-alive");

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(pingMock).not.toHaveBeenCalled();
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it("pings both Redis and Postgres and reports both in the response", async () => {
    const request = new Request("http://localhost/api/cron/keep-alive", {
      headers: { Authorization: "Bearer test-secret" },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(pingMock).toHaveBeenCalledTimes(1);
    expect(queryRawMock).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ ok: true, redis: true, db: true });
    expect(typeof body.ts).toBe("string");
  });

  it("still reports the response even though Postgres failures aren't caught", async () => {
    queryRawMock.mockRejectedValueOnce(new Error("db unreachable"));
    const request = new Request("http://localhost/api/cron/keep-alive", {
      headers: { Authorization: "Bearer test-secret" },
    });

    await expect(GET(request)).rejects.toThrow("db unreachable");
    expect(pingMock).toHaveBeenCalledTimes(1);
  });
});
