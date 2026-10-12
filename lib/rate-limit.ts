import * as Sentry from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv(); // reads UPSTASH_REDIS_REST_URL + TOKEN from env

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

// One limiter per action, each with its own key prefix so a burst on one
// action (e.g. scripted createFriend calls) can't eat another's budget.
// Sliding window is fairer than fixed window, it prevents burst abuse
// (e.g. sending 5 requests at second 59, waiting for reset, then 5 more at second 01).
// analytics stays off: it adds extra Redis writes per call on the free tier
// and nothing reads the Upstash dashboard.
function limiter(prefix: string, tokens: number, window: Duration) {
  return new Ratelimit({
    redis,
    prefix: `giftclaw:rl:${prefix}`,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
  });
}

export const rateLimiters = {
  // Gemini cache miss: the expensive call
  giftSuggestions: limiter("gift-suggestions", 5, "60 s"),
  createFriend: limiter("create-friend", 10, "1 h"),
  updateFriend: limiter("update-friend", 30, "1 h"),
  saveGameResult: limiter("save-game-result", 20, "60 s"),
  // Also runs on every giver/receiver page render, so keep it generous
  readGameResults: limiter("read-game-results", 60, "60 s"),
} as const;

export type RateLimitedAction = keyof typeof rateLimiters;

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "anonymous"
  );
}

export type RateLimitResult =
  | { success: true }
  | { success: false; limit: number; remaining: number };

// Checks the per-IP limit for one action. Fails open: if Redis is down
// (e.g. Upstash free-tier inactivity pause) the request is allowed so the
// app keeps working, but the failure is logged and sent to Sentry so an
// unprotected window is visible instead of silent.
export async function checkRateLimit(
  action: RateLimitedAction
): Promise<RateLimitResult> {
  const ip = await getClientIp();

  try {
    const { success, limit, remaining } = await rateLimiters[action].limit(ip);
    if (success) return { success: true };

    Sentry.addBreadcrumb({
      category: "rate-limit",
      message: `Rate limit hit on ${action} by IP: ${ip}`,
      level: "warning",
    });
    return { success: false, limit, remaining };
  } catch (redisError) {
    console.error(
      `[rate-limit] failing open for ${action}: limiter unavailable`,
      redisError
    );
    Sentry.captureException(redisError, {
      tags: { action, step: "rate-limit" },
    });
    return { success: true };
  }
}
