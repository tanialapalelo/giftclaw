"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { analyzeGifts } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import type { FriendProfile } from "@/types";
import { isValidUUID } from "@/lib/utils";
import { taintUniqueValue } from "@/lib/taint";
import { MAX_ATTEMPTS } from "@/lib/constants";
import type { GiftSuggestion } from "@/types";

export async function getGiftSuggestions(friendId: string) {
  if (!isValidUUID(friendId)) return { error: "Invalid ID" };
  return loadGiftSuggestions(friendId);
}

// Receiver-facing variant: resolves the friend by shareToken on the server so
// the play page never needs (or ships) the giver's private friend id
export async function getGiftSuggestionsByShareToken(shareToken: string) {
  if (!isValidUUID(shareToken)) return { error: "Invalid ID" };

  const friend = await prisma.friend.findUnique({
    where: { shareToken },
    select: { id: true },
  });
  if (!friend) return { error: "Friend not found" };
  // Backstop: React refuses to serialize this id to the client while the
  // friend row is alive, so it cannot leak into the play page payload
  taintUniqueValue(
    "Do not pass the giver's private friend id to the receiver.",
    friend,
    friend.id
  );

  return loadGiftSuggestions(friend.id);
}

async function loadGiftSuggestions(friendId: string) {

  // Return cached result if one exists, avoids redundant Gemini calls
  const cached = await prisma.giftSuggestion.findFirst({
    where: { friendId },
    orderBy: { createdAt: "desc" },
  });

  if (cached) {
    return {
      // Prisma stores Json as JsonValue; double-cast through unknown is the safe pattern
      suggestions: cached.suggestions as unknown as GiftSuggestion[],
      modelVersion: cached.modelVersion,
      cached: true,
    };
  }

  // Rate-limit per IP before hitting the Gemini API
  const rateLimit = await checkRateLimit("giftSuggestions");
  if (!rateLimit.success) {
    return {
      error: `Rate limit exceeded. Try again in a minute.`,
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
    };
  }

  // Fetch the friend profile needed to build the Gemini prompt
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
    currency: friend.currency ?? "IDR",
    createdAt: friend.createdAt.toISOString(),
  };

  // Call Gemini, wrapped in try/catch so API errors degrade gracefully
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

    // Persist result so subsequent loads hit the cache instead of Gemini
    await prisma.giftSuggestion.create({
      data: {
        friendId,
        suggestions: result.suggestions,
        modelVersion: "gemini-2.5-flash",
      },
    });

    return {
      suggestions: result.suggestions as GiftSuggestion[],
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
  shareToken,
  sessionId,
  grabIndex,
  giftSnapshot,
}: {
  shareToken: string;
  sessionId: string;
  grabIndex: number;
  giftSnapshot: object;
}) {
  if (!isValidUUID(shareToken) || !isValidUUID(sessionId))
    return { error: "Invalid ID" };

  const rateLimit = await checkRateLimit("saveGameResult");
  if (!rateLimit.success) {
    return { error: "Too many grabs. Try again in a minute." };
  }

  try {
    const friend = await prisma.friend.findUnique({
      where: { shareToken },
      select: { id: true },
    });
    if (!friend) return { error: "Friend not found" };

    return await prisma.$transaction(async (tx) => {
      // Row-lock the friend so a second, near-simultaneous grab (two tabs,
      // or a direct call replaying the same request) waits for this
      // transaction to commit before it re-counts, instead of both
      // transactions reading the same stale count and both passing.
      await tx.$queryRaw`SELECT id FROM friends WHERE id = ${friend.id}::uuid FOR UPDATE`;

      const attemptCount = await tx.gameResult.count({
        where: { friendId: friend.id },
      });
      if (attemptCount >= MAX_ATTEMPTS) {
        return { error: "Attempt limit reached" };
      }

      await tx.gameResult.create({
        data: {
          friendId: friend.id,
          sessionId,
          grabIndex,
          giftSnapshot,
        },
      });
      return { success: true };
    });
  } catch {
    return { error: "Failed to save result" };
  }
}
