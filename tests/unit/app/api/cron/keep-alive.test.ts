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

  it.each([
    ["unset", undefined],
    ["empty", ""],
  ])("fails closed when CRON_SECRET is %s", async (_label, value) => {
    if (value === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = value;

    for (const header of ["Bearer undefined", "Bearer ", "Bearer"]) {
      const response = await GET(
        new Request("http://localhost/api/cron/keep-alive", {
          headers: { Authorization: header },
        }),
      );
      expect(response.status).toBe(401);
    }
    expect(pingMock).not.toHaveBeenCalled();
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret of a different length", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/keep-alive", {
        headers: { Authorization: "Bearer nope" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 503 with per-check results when Postgres fails, still pinging Redis", async () => {
    queryRawMock.mockRejectedValueOnce(new Error("db unreachable"));
    const response = await GET(
      new Request("http://localhost/api/cron/keep-alive", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(pingMock).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ ok: false, redis: true, db: false });
  });

  it("returns 503 with per-check results when Redis fails, still pinging Postgres", async () => {
    pingMock.mockRejectedValueOnce(new Error("redis unreachable"));
    const response = await GET(
      new Request("http://localhost/api/cron/keep-alive", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(queryRawMock).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ ok: false, redis: false, db: true });
  });
});
