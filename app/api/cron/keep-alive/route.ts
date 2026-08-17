import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Vercel Cron hits this endpoint every 5 days to prevent Upstash Redis and
// Supabase Postgres free-tier from pausing due to inactivity.
// Vercel automatically attaches Authorization: Bearer <CRON_SECRET> on every invocation.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = Redis.fromEnv();
  await redis.ping();

  await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;

  return NextResponse.json({
    ok: true,
    redis: true,
    db: true,
    ts: new Date().toISOString(),
  });
}
