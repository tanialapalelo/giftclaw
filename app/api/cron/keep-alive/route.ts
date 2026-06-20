import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Vercel Cron hits this endpoint every 5 days to prevent Upstash free-tier
// from pausing the database due to 7-day inactivity.
// Vercel automatically attaches Authorization: Bearer <CRON_SECRET> on every invocation.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = Redis.fromEnv();
  await redis.ping();

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
