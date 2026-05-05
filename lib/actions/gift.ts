"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { analyzeGifts } from "@/lib/gemini";
import { rateLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { FriendProfile } from "@/types";
import { isValidUUID } from "@/lib/utils";

export async function getGiftSuggestions(friendId: string) {
  // 1. cache check
  const cached = await prisma.giftSuggestion.findFirst({
    where: { friendId },
    orderBy: { createdAt: "desc" },
  });

  if (cached) {
    return {
      suggestions: cached.suggestions as any,
      modelVersion: cached.modelVersion,
      cached: true,
    };
  }

  // 2. Rate limit check per IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining } = await rateLimiter.limit(ip);

  if (!success) {
    Sentry.addBreadcrumb({
      category: "rate-limit",
      message: `Rate limit hit by IP: ${ip}`,
      level: "warning",
    });

    return {
      error: `Rate limit exceeded. Try again in a minute.`,
      limit,
      remaining,
    };
  }

  // 3. get friend
  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
  });

  if (!friend) {
    return { error: "Friend not found" };
  }

  const friendProfile: FriendProfile = {
    id: friend.id,
    shareToken: friend.shareToken,
    name: friend.name,
    interests: friend.interests,
    hobbies: friend.hobbies,
    dislikes: friend.dislikes,
    budgetMin: friend.budgetMin,
    budgetMax: friend.budgetMax,
    notes: friend.notes,
    theme: friend.theme,
    createdAt: friend.createdAt.toISOString(),
  };

  // 4. Call Gemini — wrap dengan try/catch + Sentry
  try {
    const start = Date.now();
    const result = await analyzeGifts(friendProfile);
    const duration = Date.now() - start;

    Sentry.addBreadcrumb({
      category: "ai",
      message: `Gemini call completed`,
      data: { duration_ms: duration, friendId, cached: false },
      level: "info",
    });

    // 5. Cache result
    await prisma.giftSuggestion.create({
      data: {
        friendId,
        suggestions: result.suggestions,
        modelVersion: "gemini-2.5-flash",
      },
    });

    return {
      suggestions: result.suggestions,
      modelVersion: "gemini-2.5-flash",
      cached: false,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "getGiftSuggestions" },
      extra: { friendId, friendName: friend.name },
    });

    return { error: "Failed to generate gift suggestions. Please try again." };
  }
}
export async function saveGameResult({
  friendId,
  sessionId,
  grabIndex,
  giftSnapshot,
}: {
  friendId: string;
  sessionId: string;
  grabIndex: number;
  giftSnapshot: object;
}) {
  if (!isValidUUID(friendId) || !isValidUUID(sessionId))
    return { error: "Invalid ID" };

  try {
    await prisma.gameResult.create({
      data: {
        friendId,
        sessionId,
        grabIndex,
        giftSnapshot,
      },
    });
    return { success: true };
  } catch {
    return { error: "Failed to save result" };
  }
}
