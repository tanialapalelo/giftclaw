import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Sliding window: max 5 requests per 60 detik per IP.
// Kenapa sliding window? Lebih adil dari fixed window —
// tidak bisa "gaming" dengan kirim 5 request di detik 59,
// tunggu reset, kirim 5 lagi di detik 01.
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(), // baca UPSTASH_REDIS_REST_URL + TOKEN dari .env
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});
