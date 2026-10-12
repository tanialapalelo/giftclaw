import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock factories are hoisted above imports, so shared state must be too
const { ratelimitConfigs, limitMock } = vi.hoisted(() => ({
  ratelimitConfigs: [] as Array<Record<string, unknown>>,
  limitMock: vi.fn(),
}));

// Capture each limiter's config instead of talking to Upstash
vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow = vi.fn((tokens: number, window: string) => ({
      tokens,
      window,
    }));
    constructor(config: Record<string, unknown>) {
      ratelimitConfigs.push(config);
    }
    limit = limitMock;
  }
  return { Ratelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => ({})) },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () => new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })
  ),
}));

vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { checkRateLimit } from "@/lib/rate-limit";

describe("rate limiters", () => {
  it("gives every action its own key prefix", () => {
    const prefixes = ratelimitConfigs.map((c) => c.prefix);
    expect(prefixes).toHaveLength(5);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("keeps Upstash analytics off", () => {
    for (const config of ratelimitConfigs) {
      expect(config.analytics).toBe(false);
    }
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keys the limit on the first x-forwarded-for address", async () => {
    limitMock.mockResolvedValue({ success: true, limit: 10, remaining: 9 });

    const result = await checkRateLimit("createFriend");

    expect(result).toEqual({ success: true });
    expect(limitMock).toHaveBeenCalledWith("1.2.3.4");
  });

  it("reports a throttled request", async () => {
    limitMock.mockResolvedValue({ success: false, limit: 10, remaining: 0 });

    const result = await checkRateLimit("createFriend");

    expect(result).toEqual({ success: false, limit: 10, remaining: 0 });
  });

  it("fails open with a log line when Redis is unreachable", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    limitMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await checkRateLimit("saveGameResult");

    expect(result).toEqual({ success: true });
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("failing open for saveGameResult"),
      expect.any(Error)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
