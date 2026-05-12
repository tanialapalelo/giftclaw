import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Sliding window: max 5 requests per 60 seconds per IP.
// Sliding window is fairer than fixed window — it prevents burst abuse
// (e.g. sending 5 requests at second 59, waiting for reset, then 5 more at second 01).
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(), // reads UPSTASH_REDIS_REST_URL + TOKEN from env
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});
