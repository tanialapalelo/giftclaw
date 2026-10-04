import { timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Vercel Cron hits this endpoint every 5 days to prevent Upstash Redis and
// Supabase Postgres free-tier from pausing due to inactivity.
// When CRON_SECRET is set in the project env, Vercel sends
// Authorization: Bearer <CRON_SECRET> on every invocation.

function isAuthorized(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  // Fail closed: an unset or empty secret must never match anything,
  // including the literal "Bearer undefined".
  if (!secret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authHeader);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

async function check(name: string, fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch (error) {
    console.error(`[keep-alive] ${name} ping failed`, error);
    return false;
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run both pings independently so one outage still keeps the other alive.
  const [redis, db] = await Promise.all([
    check("redis", () => Redis.fromEnv().ping()),
    check("db", () => prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`),
  ]);
  const ok = redis && db;

  return NextResponse.json(
    { ok, redis, db, ts: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}
